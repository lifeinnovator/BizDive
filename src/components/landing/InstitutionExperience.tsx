const phases = [
    { step: '01', title: '신청과 참여를 명확하게 구분.', description: '신청기업을 검토하고 승인된 기업을 참여기업으로 전환합니다. 신청 단계 진단부터 이후 사업 단계까지 같은 기업의 이력을 연결합니다.', accent: 'text-emerald-400' },
    { step: '02', title: '진단에서 멘토링까지 하나의 지원 흐름.', description: '자가진단과 진단위원 결과를 비교하고 필요한 분야의 멘토풀, 기업 선택, 일정과 멘토링 일지를 하나의 흐름으로 관리합니다.', accent: 'text-sky-400' },
    { step: '03', title: '사업 효과를 보여주는 성과와 보고.', description: '참여율, 진단 점수 변화, 멘토링 실행 이력을 성과지표로 관리하고 최종 사업 보고에 활용할 수 있는 보고서 초안을 만듭니다.', accent: 'text-indigo-400' },
]

const InstitutionExperience = () => (
    <section className="bg-slate-950 px-6 py-20 text-white sm:py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start gap-1 sm:gap-4">
                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-emerald-400">For Institutions</span>
                <span className="text-sm font-bold text-slate-400 sm:text-base">신청부터 성과보고까지 연결된 운영 체계가 필요한 지원기관</span>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
                {phases.map((phase) => (
                    <article key={phase.step} className="border border-slate-800 bg-slate-900 p-7 sm:p-9">
                        <span className={`font-mono text-lg font-bold ${phase.accent}`}>{phase.step}</span>
                        <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">{phase.title}</h2>
                        <p className="mt-5 text-base font-medium leading-7 text-slate-400">{phase.description}</p>
                    </article>
                ))}
            </div>
            <a href="https://admin.bizdive.kr" className="mt-8 inline-flex min-h-11 items-center border border-indigo-400/40 px-5 py-3 text-sm font-bold text-indigo-200 transition hover:bg-indigo-500/10 hover:text-white">기관용 운영 솔루션 보기 →</a>
        </div>
    </section>
)

export default InstitutionExperience
