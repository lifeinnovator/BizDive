import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { createClient } from '@/lib/supabase-server'
import { adminDb } from '@/lib/firebase-server'
import { scoreCampaignDiagnosis } from '@/lib/campaign-diagnosis'
import { getGrade } from '@/lib/scoring-utils'

type SubmitBody = { assignmentId?: unknown; responses?: unknown }

export async function POST(request: Request) {
  try {
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: '진단 저장 서비스를 사용할 수 없습니다.' }, { status: 503 })
    const body = await request.json() as SubmitBody
    const assignmentId = typeof body.assignmentId === 'string' ? body.assignmentId.trim() : ''
    if (!assignmentId || !body.responses || typeof body.responses !== 'object' || Array.isArray(body.responses)) {
      return NextResponse.json({ error: '진단 응답 형식이 올바르지 않습니다.' }, { status: 400 })
    }

    const assignmentRef = adminDb.collection('diagnosis_assignments').doc(assignmentId) as FirebaseFirestore.DocumentReference
    const assignmentSnapshot = await assignmentRef.get()
    if (!assignmentSnapshot.exists) return NextResponse.json({ error: '진단 배정을 찾을 수 없습니다.' }, { status: 404 })
    const assignment = assignmentSnapshot.data()!
    const memberships = await adminDb.collection('company_memberships').where('user_id', '==', user.id).get()
    const isCompanyMember = memberships.docs.some((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().company_id === assignment.company_id && doc.data().active !== false)
    if (!isCompanyMember || assignment.assessment_type !== 'self') return NextResponse.json({ error: '이 진단을 제출할 권한이 없습니다.' }, { status: 403 })

    const campaignRef = adminDb.collection('diagnosis_campaigns').doc(assignment.campaign_id) as FirebaseFirestore.DocumentReference
    const versionRef = adminDb.collection('diagnosis_template_versions').doc(assignment.template_version_id) as FirebaseFirestore.DocumentReference
    const recordRef = adminDb.collection('diagnosis_records').doc()
    const submittedScore = await adminDb.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const [freshAssignment, campaignSnapshot, versionSnapshot] = await Promise.all([
        transaction.get(assignmentRef),
        transaction.get(campaignRef),
        transaction.get(versionRef),
      ])
      if (!freshAssignment.exists || freshAssignment.data()?.status !== 'pending') throw new Error('ASSIGNMENT_ALREADY_SUBMITTED')
      if (!campaignSnapshot.exists || !versionSnapshot.exists) throw new Error('DIAGNOSIS_CONFIGURATION_MISSING')
      const campaign = campaignSnapshot.data()!
      const version = versionSnapshot.data()!
      const now = Date.now()
      if (campaign.status !== 'open' || campaign.opens_at?.toMillis?.() > now || campaign.closes_at?.toMillis?.() < now) throw new Error('CAMPAIGN_NOT_OPEN')
      const score = scoreCampaignDiagnosis(version.question_snapshots, version.scoring_model, body.responses)
      if (!score) throw new Error('INVALID_SCORING_CONFIGURATION')
      transaction.create(recordRef, {
        id: recordRef.id,
        user_id: user.id,
        respondent_user_id: user.id,
        project_id: assignment.project_id,
        group_id: assignment.group_id ?? null,
        company_id: assignment.company_id,
        application_id: assignment.application_id ?? null,
        participation_id: assignment.participation_id ?? null,
        campaign_id: assignment.campaign_id,
        assignment_id: assignmentId,
        template_id: assignment.template_id,
        template_version_id: assignment.template_version_id,
        assessment_type: assignment.assessment_type,
        round: Number(campaign.round),
        responses: score.normalizedResponses,
        total_score: score.totalScore,
        dimension_scores: score.dimensionScores,
        dimension_earned_scores: score.dimensionEarnedScores,
        dimension_max_scores: score.dimensionMaxScores,
        stage_result: getGrade(score.totalScore),
        scoring_model_type: version.scoring_model.type,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      })
      transaction.update(assignmentRef, {
        status: 'submitted',
        submitted_at: FieldValue.serverTimestamp(),
        submitted_by: user.id,
        diagnosis_record_id: recordRef.id,
        updated_at: FieldValue.serverTimestamp(),
      })
      transaction.create(adminDb.collection('audit_logs').doc(), {
        action: 'diagnosis_assignment.submitted',
        actor_id: user.id,
        target_id: assignmentId,
        changes: {
          project_id: assignment.project_id,
          company_id: assignment.company_id,
          campaign_id: assignment.campaign_id,
          diagnosis_record_id: recordRef.id,
        },
        created_at: FieldValue.serverTimestamp(),
      })
      return score
    })
    return NextResponse.json({ recordId: recordRef.id, ...submittedScore })
  } catch (error) {
    if (error instanceof Error && error.message === 'ASSIGNMENT_ALREADY_SUBMITTED') {
      return NextResponse.json({ error: '이미 제출된 진단입니다.' }, { status: 409 })
    }
    if (error instanceof Error && ['DIAGNOSIS_CONFIGURATION_MISSING', 'CAMPAIGN_NOT_OPEN', 'INVALID_SCORING_CONFIGURATION'].includes(error.message)) {
      return NextResponse.json({ error: '현재 제출할 수 없는 진단입니다.' }, { status: 409 })
    }
    console.error('Campaign diagnosis submission failed:', error)
    return NextResponse.json({ error: '진단 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
