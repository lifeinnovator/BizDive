import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { createClient } from '@/lib/supabase-server'
import { adminDb } from '@/lib/firebase-server'

type RouteContext = { params: Promise<{ sessionId: string }> }

export async function PUT(request: Request, context: RouteContext) {
  try {
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: '멘토링 서비스를 사용할 수 없습니다.' }, { status: 503 })
    const { sessionId } = await context.params
    const body = await request.json() as { menteeContent?: unknown; institutionContent?: unknown; menteeVisible?: unknown }
    const menteeContent = typeof body.menteeContent === 'string' && body.menteeContent.trim() ? body.menteeContent.trim().slice(0, 10000) : null
    const institutionContent = typeof body.institutionContent === 'string' && body.institutionContent.trim() ? body.institutionContent.trim().slice(0, 10000) : null
    if ((!menteeContent && !institutionContent) || typeof body.menteeVisible !== 'boolean') return NextResponse.json({ error: '기업용 또는 기관용 기록과 기업 공개 여부를 입력해주세요.' }, { status: 400 })
    const sessionRef = adminDb.collection('mentoring_sessions').doc(sessionId) as FirebaseFirestore.DocumentReference
    const logRef = adminDb.collection('mentoring_logs').doc(sessionId) as FirebaseFirestore.DocumentReference
    await adminDb.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const [session, existing] = await Promise.all([transaction.get(sessionRef), transaction.get(logRef)])
      if (!session.exists || session.data()?.mentor_user_id !== user.id) throw new Error('SESSION_FORBIDDEN')
      if (!['scheduled', 'completed'].includes(session.data()?.status)) throw new Error('SESSION_NOT_WRITABLE')
      transaction.set(logRef, { id: sessionId, session_id: sessionId, engagement_id: session.data()?.engagement_id, project_id: session.data()?.project_id, group_id: session.data()?.group_id ?? null, company_id: session.data()?.company_id, mentor_user_id: user.id, mentee_content: menteeContent, institution_content: institutionContent, mentee_visible: body.menteeVisible, institution_visible: true, created_at: existing.exists ? existing.data()?.created_at : FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() }, { merge: true })
      transaction.update(sessionRef, { status: 'completed', completed_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() })
      transaction.create(adminDb.collection('audit_logs').doc(), { action: existing.exists ? 'mentoring_log.updated' : 'mentoring_log.created', actor_id: user.id, target_id: sessionId, changes: { project_id: session.data()?.project_id, engagement_id: session.data()?.engagement_id, mentee_visible: body.menteeVisible }, created_at: FieldValue.serverTimestamp() })
    })
    return NextResponse.json({ log: { id: sessionId, mentee_visible: body.menteeVisible }, session: { id: sessionId, status: 'completed' } })
  } catch (error) {
    if (error instanceof Error && error.message === 'SESSION_FORBIDDEN') return NextResponse.json({ error: '배정된 멘토만 일지를 작성할 수 있습니다.' }, { status: 403 })
    if (error instanceof Error && error.message === 'SESSION_NOT_WRITABLE') return NextResponse.json({ error: '일지를 작성할 수 없는 일정 상태입니다.' }, { status: 409 })
    console.error('Mentoring log failed:', error)
    return NextResponse.json({ error: '멘토링 일지를 저장하지 못했습니다.' }, { status: 500 })
  }
}
