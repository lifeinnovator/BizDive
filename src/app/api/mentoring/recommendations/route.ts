import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { createClient } from '@/lib/supabase-server'
import { adminDb } from '@/lib/firebase-server'
import { deriveMentoringNeeds, DIMENSION_MENTORING_FIELDS } from '@/lib/mentoring-domain'
import { assertProjectFeature, ProductAccessError } from '@/lib/product-package'

async function participantContext(userId: string, projectId: string) {
  if (!adminDb) return null
  const memberships = await adminDb.collection('company_memberships').where('user_id', '==', userId).get()
  const companyIds = new Set(memberships.docs.filter((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().active !== false).map((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().company_id))
  const participations = await adminDb.collection('project_participations').where('project_id', '==', projectId).get()
  const participation = participations.docs.find((document: FirebaseFirestore.QueryDocumentSnapshot) => companyIds.has(document.data().company_id) && document.data().status === 'active')
  if (!participation) return null
  const project = await adminDb.collection('projects').doc(projectId).get()
  if (!project.exists) return null
  return { companyId: participation.data().company_id as string, participationId: participation.id, groupId: project.data()?.group_id ?? null }
}

async function authenticatedUser() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function GET(request: Request) {
  try {
    const user = await authenticatedUser()
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: '멘토링 서비스를 사용할 수 없습니다.' }, { status: 503 })
    const projectId = new URL(request.url).searchParams.get('projectId')?.trim() || ''
    const context = projectId ? await participantContext(user.id, projectId) : null
    if (!context) return NextResponse.json({ error: '이 사업의 참여기업 회원만 멘토를 선택할 수 있습니다.' }, { status: 403 })
    await assertProjectFeature(projectId, 'mentoring')
    const [recordSnapshot, mentorSnapshot, engagementSnapshot] = await Promise.all([
      adminDb.collection('diagnosis_records').where('project_id', '==', projectId).get(),
      adminDb.collection('mentor_profiles').get(),
      adminDb.collection('mentoring_engagements').where('project_id', '==', projectId).get(),
    ])
    const records: Array<Record<string, unknown>> = recordSnapshot.docs.map((document: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: document.id, ...document.data() })).filter((record: Record<string, unknown>) => record.company_id === context.companyId && ['self', 'expert'].includes(String(record.assessment_type)))
    const needs = deriveMentoringNeeds(records)
    const requestedCodes = new Set(needs.map((need) => need.code))
    const activeEngagements = engagementSnapshot.docs.filter((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().company_id === context.companyId && ['requested', 'accepted'].includes(document.data().status)).map((document: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: document.id, ...document.data() }))
    const mentors = mentorSnapshot.docs.map((document: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: document.id, ...document.data() }))
      .filter((mentor: Record<string, unknown>) => mentor.active === true && (mentor.scope === 'global' || (mentor.scope === 'institution' && mentor.group_id === context.groupId)) && Array.isArray(mentor.specialty_codes) && mentor.specialty_codes.some((code: string) => requestedCodes.has(code)))
      .map((mentor: Record<string, unknown>) => ({ id: mentor.id, display_name: mentor.display_name, headline: mentor.headline || null, specialty_codes: mentor.specialty_codes, requested: activeEngagements.some((engagement: Record<string, unknown>) => engagement.mentor_user_id === mentor.id) }))
    return NextResponse.json({ projectId, companyId: context.companyId, participationId: context.participationId, needs, mentors, activeEngagements })
  } catch (error) {
    if (error instanceof ProductAccessError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Mentor recommendation failed:', error)
    return NextResponse.json({ error: '멘토 추천을 불러오지 못했습니다.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser()
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: '멘토링 서비스를 사용할 수 없습니다.' }, { status: 503 })
    const body = await request.json() as { projectId?: unknown; mentorId?: unknown; requestedCodes?: unknown; message?: unknown }
    const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : ''
    const mentorId = typeof body.mentorId === 'string' ? body.mentorId.trim() : ''
    const context = projectId ? await participantContext(user.id, projectId) : null
    if (!context) return NextResponse.json({ error: '이 사업의 참여기업 회원만 요청할 수 있습니다.' }, { status: 403 })
    await assertProjectFeature(projectId, 'mentoring', { write: true })
    const requestedCodes = Array.isArray(body.requestedCodes) ? [...new Set(body.requestedCodes.filter((value): value is string => typeof value === 'string' && Object.values(DIMENSION_MENTORING_FIELDS).some((field) => field.code === value)))] : []
    if (!mentorId || !requestedCodes.length) return NextResponse.json({ error: '멘토와 멘토링 분야를 선택해주세요.' }, { status: 400 })
    const diagnosisSnapshot = await adminDb.collection('diagnosis_records').where('project_id', '==', projectId).get()
    const diagnosisRecords: Array<Record<string, unknown>> = diagnosisSnapshot.docs.map((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data()).filter((record: Record<string, unknown>) => record.company_id === context.companyId && ['self', 'expert'].includes(String(record.assessment_type)))
    const recommendedCodes = new Set(deriveMentoringNeeds(diagnosisRecords).map((need) => need.code))
    if (!requestedCodes.every((code) => recommendedCodes.has(code))) return NextResponse.json({ error: '진단 결과에서 추천된 분야만 요청할 수 있습니다.' }, { status: 400 })
    const mentorRef = adminDb.collection('mentor_profiles').doc(mentorId) as FirebaseFirestore.DocumentReference
    const engagementRef = adminDb.collection('mentoring_engagements').doc()
    const lockRef = adminDb.collection('mentoring_engagement_locks').doc(`${projectId}_${context.companyId}_${mentorId}`) as FirebaseFirestore.DocumentReference
    const message = typeof body.message === 'string' && body.message.trim() ? body.message.trim().slice(0, 1000) : null
    await adminDb.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const [mentor, lock] = await Promise.all([transaction.get(mentorRef), transaction.get(lockRef)])
      if (!mentor.exists || mentor.data()?.active !== true || !(mentor.data()?.scope === 'global' || (mentor.data()?.scope === 'institution' && mentor.data()?.group_id === context.groupId)) || !requestedCodes.some((code) => mentor.data()?.specialty_codes?.includes(code))) throw new Error('MENTOR_NOT_AVAILABLE')
      if (lock.exists) throw new Error('ENGAGEMENT_ALREADY_ACTIVE')
      transaction.create(engagementRef, { id: engagementRef.id, project_id: projectId, group_id: context.groupId, company_id: context.companyId, participation_id: context.participationId, mentor_user_id: mentorId, requested_by: user.id, requested_specialty_codes: requestedCodes, request_message: message, status: 'requested', created_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() })
      transaction.create(lockRef, { id: lockRef.id, engagement_id: engagementRef.id, project_id: projectId, company_id: context.companyId, mentor_user_id: mentorId, created_at: FieldValue.serverTimestamp() })
      transaction.create(adminDb.collection('audit_logs').doc(), { action: 'mentoring_engagement.requested', actor_id: user.id, target_id: engagementRef.id, changes: { project_id: projectId, company_id: context.companyId, mentor_user_id: mentorId, requested_specialty_codes: requestedCodes }, created_at: FieldValue.serverTimestamp() })
    })
    return NextResponse.json({ engagement: { id: engagementRef.id, status: 'requested' } }, { status: 201 })
  } catch (error) {
    if (error instanceof ProductAccessError) return NextResponse.json({ error: error.message }, { status: error.status })
    if (error instanceof Error && error.message === 'ENGAGEMENT_ALREADY_ACTIVE') return NextResponse.json({ error: '이미 진행 중인 멘토 요청이 있습니다.' }, { status: 409 })
    if (error instanceof Error && error.message === 'MENTOR_NOT_AVAILABLE') return NextResponse.json({ error: '선택할 수 없는 멘토입니다.' }, { status: 400 })
    console.error('Mentoring request failed:', error)
    return NextResponse.json({ error: '멘토링 요청을 저장하지 못했습니다.' }, { status: 500 })
  }
}
