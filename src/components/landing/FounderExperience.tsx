const FounderExperience = () => {
    return (
        <section className="py-20 sm:py-32 bg-white px-6 md:px-12 border-b border-indigo-50">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 sm:mb-24 md:w-2/3">
                    <div className="flex flex-col items-start gap-1 sm:gap-4 mb-6 sm:mb-8">
                        <span className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[13px] font-bold tracking-[0.1em] uppercase shadow-sm">
                            For Founders
                        </span>
                        <span className="text-[14px] sm:text-base font-bold text-slate-500">
                            진단 결과를 실제 성장 행동으로 연결하려는 기업
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-indigo-950 mb-6 sm:mb-8 leading-tight break-keep">
                        현재를 진단하고,<br />
                        다음 지원을 선택합니다.
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl break-keep">
                        한 번의 점수보다 단계별 변화가 중요합니다. 자가진단과 전문가 의견을 비교하고, 부족한 분야에 필요한 멘토링을 이어가세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: '우리 기업 자가진단', desc: '시장성, 경쟁력, 수익성 등 7가지 관점에서 현재 상태와 보완이 필요한 영역을 확인합니다.' },
                        { step: '02', title: '전문가 관점과 비교', desc: '같은 기준으로 진행한 진단위원 결과와 자가진단의 차이를 비교해 인식의 간극을 발견합니다.' },
                        { step: '03', title: '멘토링과 변화 기록', desc: '필요 분야의 멘토를 선택하고, 사업 단계별 진단과 지원 이력을 통해 변화 과정을 확인합니다.' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-indigo-50/30 p-10 sm:p-12 border border-indigo-100/50 transition-colors hover:bg-white hover:shadow-xl hover:border-transparent group"
                        >
                            <span className="text-[40px] font-light text-indigo-200 mb-8 block font-mono group-hover:text-indigo-600 transition-colors">{item.step}</span>
                            <h4 className="text-[22px] font-extrabold tracking-tight text-indigo-950 mb-4">{item.title}</h4>
                            <p className="text-[16px] text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FounderExperience;
