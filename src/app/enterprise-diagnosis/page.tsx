import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, CheckCircle2, ClipboardCheck, Clock3 } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { listEnterpriseDiagnoses } from '@/lib/campaign-diagnosis'

export const dynamic = 'force-dynamic'

const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value)) : null

export default async function EnterpriseDiagnosisPage() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return redirect(`/login?next=${encodeURIComponent('/enterprise-diagnosis')}`)
  const diagnoses = await listEnterpriseDiagnoses(user.id)
  const pending = diagnoses.filter((item) => item.status === 'pending')
  const completed = diagnoses.filter((item) => item.status === 'submitted')

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold text-indigo-600">MY BIZDIVE</p><h1 className="mt-1 text-3xl font-black text-slate-900">기업진단</h1><p className="mt-2 text-sm text-slate-500">참여 사업별 진단을 회차별로 진행하고 이전 결과를 확인합니다.</p></div>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">대시보드로 돌아가기</Link>
        </header>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><ClipboardCheck className="h-5 w-5 text-indigo-600" /> 진행할 진단 <span className="text-sm text-slate-400">{pending.length}</span></h2>
          {!pending.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">현재 진행할 기업진단이 없습니다.</div> : pending.map((item) => (
            <article key={item.assignmentId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between">
              <div><p className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Building2 className="h-4 w-4" />{item.projectName}</p><h3 className="mt-2 text-lg font-bold text-slate-900">{item.diagnosisTitle}</h3><p className="mt-1 text-sm font-semibold text-indigo-600">{item.round}차{item.roundTitle ? ` · ${item.roundTitle}` : ''}</p>{item.closesAt && <p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{dateLabel(item.closesAt)}까지</p>}</div>
              {item.available ? <Link href={`/diagnosis?projectId=${encodeURIComponent(item.projectId)}&round=${item.round}&assignmentId=${encodeURIComponent(item.assignmentId)}`} className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 sm:mt-0">진단 시작하기</Link> : <span className="mt-4 inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 sm:mt-0">진단 기간 아님</span>}
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> 제출 완료 <span className="text-sm text-slate-400">{completed.length}</span></h2>
          {!completed.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">아직 제출한 기업진단이 없습니다.</div> : completed.map((item) => (
            <article key={item.assignmentId} className="rounded-2xl border border-slate-200 bg-white p-5 sm:flex sm:items-center sm:justify-between"><div><p className="text-xs font-semibold text-slate-400">{item.projectName}</p><h3 className="mt-2 font-bold text-slate-900">{item.diagnosisTitle}</h3><p className="mt-1 text-sm text-slate-500">{item.round}차{item.roundTitle ? ` · ${item.roundTitle}` : ''}</p></div><div className="mt-3 text-left sm:mt-0 sm:text-right"><p className="text-xs text-slate-400">총점</p><p className="text-xl font-black text-emerald-600">{item.totalScore ?? '-'}점</p>{item.recordId && <Link href={`/report/${encodeURIComponent(item.recordId)}`} className="mt-1 block text-xs font-semibold text-indigo-600">결과 보기</Link>}</div></article>
          ))}
        </section>
      </div>
    </main>
  )
}
