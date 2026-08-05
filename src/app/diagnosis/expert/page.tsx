import Link from 'next/link'
import { redirect } from 'next/navigation'
import DiagnosisWrapper from '@/components/diagnosis/DiagnosisWrapper'
import { createClient } from '@/lib/supabase-server'
import { getExpertDiagnosisContext } from '@/lib/campaign-diagnosis'

type ExpertDiagnosisPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ExpertDiagnosisPage({ searchParams }: ExpertDiagnosisPageProps) {
  const params = await searchParams
  const assignmentId = typeof params.assignmentId === 'string' ? params.assignmentId : ''
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    const nextPath = `/diagnosis/expert?assignmentId=${encodeURIComponent(assignmentId)}`
    return redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }
  const context = await getExpertDiagnosisContext(user.id, assignmentId)
  if (!context) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-900">진단 배정을 확인할 수 없습니다</h1><p className="mt-3 text-sm leading-6 text-slate-500">본인에게 배정된 진행 중 진단인지, 이미 제출한 진단인지 확인해주세요.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">대시보드로 이동</Link></div></main>
  }
  const { data: profile } = await client.from('profiles').select('*').eq('id', user.id).single()
  const expertProfile = { ...(profile || {}), company_name: context.companyName, stage: profile?.stage || 'P' }
  return <DiagnosisWrapper initialQuestions={context.questions} user={user} profile={expertProfile} isGuest={false} campaignContext={context} />
}
