import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { createClient } from '@/lib/supabase-server'
import { adminDb } from '@/lib/firebase-server'

function serialize(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(serialize)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]))
  return value
}

export async function GET() {
  try {
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    if (!adminDb) return NextResponse.json({ error: '멘토링 서비스를 사용할 수 없습니다.' }, { status: 503 })
    const [mentorEngagements, memberships] = await Promise.all([
      adminDb.collection('mentoring_engagements').where('mentor_user_id', '==', user.id).get(),
      adminDb.collection('company_memberships').where('user_id', '==', user.id).get(),
    ])
    const companyIds = [...new Set(memberships.docs.filter((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().active !== false).map((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().company_id).filter((value: unknown): value is string => typeof value === 'string'))]
    const companyEngagementResults = await Promise.all(companyIds.map((companyId) => adminDb.collection('mentoring_engagements').where('company_id', '==', companyId).get()))
    const engagementMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>()
    for (const document of [...mentorEngagements.docs, ...companyEngagementResults.flatMap((snapshot) => snapshot.docs)]) engagementMap.set(document.id, document)
    const engagements = [...engagementMap.values()]
    const sessionResults = await Promise.all(engagements.map((engagement) => adminDb.collection('mentoring_sessions').where('engagement_id', '==', engagement.id).get()))
    const sessions = sessionResults.flatMap((snapshot) => snapshot.docs)
    const logs = sessions.length ? await adminDb.getAll(...sessions.map((session) => adminDb.collection('mentoring_logs').doc(session.id))) : []
    const logBySession = new Map<string, Record<string, unknown>>(logs.filter((document: FirebaseFirestore.DocumentSnapshot) => document.exists).map((document: FirebaseFirestore.DocumentSnapshot) => [document.id, document.data() as Record<string, unknown>]))
    return NextResponse.json({
      engagements: engagements.map((document) => serialize({ id: document.id, ...document.data(), viewer_role: document.data().mentor_user_id === user.id ? 'mentor' : 'company' })),
      sessions: sessions.map((document) => {
        const data = document.data()
        const isMentor = data.mentor_user_id === user.id
        const log = logBySession.get(document.id)
        const visibleLog = !log ? null : isMentor ? log : log.mentee_visible === true ? { mentee_content: log.mentee_content, mentee_visible: true, updated_at: log.updated_at } : { mentee_visible: false }
        return serialize({ id: document.id, ...data, viewer_role: isMentor ? 'mentor' : 'company', log: visibleLog })
      }),
    })
  } catch (error) {
    console.error('Mentoring workspace failed:', error)
    return NextResponse.json({ error: '멘토링 작업공간을 불러오지 못했습니다.' }, { status: 500 })
  }
}
