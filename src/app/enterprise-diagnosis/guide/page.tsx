import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSearch,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '기업진단 사용 안내',
  description: '사업별·회차별 BizDive 기업진단을 진행하고 결과를 확인하는 방법',
}

const steps = [
  {
    icon: Building2,
    title: '기업과 사업 확인',
    description: '기업진단 목록에서 소속 기업, 사업명과 진단 대상을 확인합니다.',
  },
  {
    icon: Clock3,
    title: '회차와 기간 확인',
    description: '1차, 2차 등의 회차와 회차별 진단명, 제출 기한을 확인합니다.',
  },
  {
    icon: ClipboardCheck,
    title: '문항 응답',
    description: '각 문항의 평가기준을 읽고 현재 기업 상태에 가장 가까운 수준을 선택합니다.',
  },
  {
    icon: CheckCircle2,
    title: '제출·결과 확인',
    description: '마지막 단계에서 진단을 완료하고 제출 완료 목록에서 점수와 결과를 확인합니다.',
  },
]

export default function EnterpriseDiagnosisGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:py-12">
      <article className="mx-auto max-w-5xl space-y-7 text-slate-700">
        <header className="relative overflow-hidden rounded-3xl bg-indigo-950 px-6 py-8 text-white md:px-10 md:py-11">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-indigo-800/50" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">BizDive user guide</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">기업진단 사용 안내</h1>
            <p className="mt-3 text-sm leading-7 text-indigo-100">운영기관이 배정한 사업별 기업진단을 회차에 맞춰 진행하고, 제출 결과를 확인하는 방법입니다.</p>
            <Link href="/enterprise-diagnosis" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-950 transition hover:bg-indigo-50">
              <ArrowLeft className="h-4 w-4" /> 내 기업진단으로 이동
            </Link>
          </div>
        </header>

        <section aria-labelledby="steps-title">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">How it works</p>
          <h2 id="steps-title" className="mt-1 text-xl font-bold text-slate-950">진단 진행 순서</h2>
          <ol className="mt-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="border-b border-slate-100 p-5 last:border-0 md:border-r lg:border-b-0">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Icon className="h-5 w-5" /></span>
                  <span className="text-xs font-black tracking-widest text-indigo-400">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3"><FileSearch className="h-5 w-5 text-indigo-600" /><h2 className="font-bold text-slate-950">목록을 읽는 방법</h2></div>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="font-bold text-slate-900">[사업명] 기업진단</dt><dd className="mt-1 text-xs leading-5 text-slate-500">참여 중인 사업에 맞게 구성된 진단입니다. 다른 사업의 진단과 문항·배점이 다를 수 있습니다.</dd></div>
              <div><dt className="font-bold text-slate-900">1차 · 신청평가</dt><dd className="mt-1 text-xs leading-5 text-slate-500">숫자는 진단 회차이며, 뒤의 이름은 운영기관이 정한 해당 회차의 목적입니다.</dd></div>
              <div><dt className="font-bold text-slate-900">진행할 진단 / 제출 완료</dt><dd className="mt-1 text-xs leading-5 text-slate-500">응답이 필요한 진단과 이미 제출한 결과를 구분합니다.</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-700" /><h2 className="font-bold text-slate-950">제출 전에 확인하세요</h2></div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />모든 문항을 실제 현재 상태를 기준으로 응답했는지 확인합니다.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />진행 중 응답은 현재 브라우저에 임시 저장됩니다. 다른 브라우저나 기기에는 이어지지 않습니다.</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />제출을 완료한 같은 기업·회차의 진단은 다시 제출할 수 없습니다.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6 text-white md:p-8">
          <div className="flex items-start gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-bold">진단이 보이지 않거나 시작되지 않나요?</h2><p className="mt-2 text-sm leading-6 text-slate-300">아직 운영기관이 진단을 시작하지 않았거나, 진단 기간이 아니거나, 계정이 대상 기업에 연결되지 않았을 수 있습니다. 사업명과 소속 기업을 적어 해당 사업 운영기관에 확인을 요청하세요.</p></div></div>
        </section>
      </article>
    </main>
  )
}
