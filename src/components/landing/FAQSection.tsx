import { faqs } from '@/data/faqs'

const FAQSection = () => (
  <section className="border-b border-indigo-50 bg-slate-50/30 px-6 py-20 sm:py-28 md:px-12">
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center sm:mb-16">
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-indigo-600">FAQ</span>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tighter text-indigo-950 md:text-4xl">자주 묻는 질문</h2>
        <p className="mx-auto max-w-2xl text-base font-medium text-slate-500 sm:text-lg">BizDive 서비스 이용에 대해 궁금한 점을 확인해 보세요.</p>
      </div>
      <div className="space-y-3">
        {faqs.map((item, index) => {
          const tagClass = item.seg === '창업가' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : item.seg === '지원기관' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
          return (
            <details key={`${item.seg}-${item.q}`} className="group overflow-hidden rounded-xl border border-slate-100 bg-white open:border-indigo-200 open:shadow-sm">
              <summary className="flex min-h-16 cursor-pointer list-none items-start gap-4 p-5 text-left marker:hidden">
                <span className="w-6 shrink-0 pt-1.5 font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {item.updated && <span className="rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">수정됨</span>}
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tagClass}`}>{item.seg}</span>
                  </div>
                  <h3 className="text-[15px] font-bold leading-snug text-slate-900 sm:text-base">{item.q}</h3>
                </div>
                <span aria-hidden="true" className="mt-1 text-xl text-slate-300 transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="ml-10 border-t border-slate-50 px-5 pb-6 pt-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 sm:text-[15px]">{item.a}</p>
                <div className="mt-4 flex flex-wrap gap-2">{item.kw.map((keyword) => <span key={keyword} className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-400">#{keyword}</span>)}</div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  </section>
)

export default FAQSection
