import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, Building2 } from 'lucide-react';

const UserPathSelection = () => {
    return (
        <section className="py-16 sm:py-24 px-6 md:px-12 bg-slate-50/50 flex flex-col items-center border-b border-indigo-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 sm:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-indigo-950 mb-4 break-keep">
                        역할에 맞는 맞춤 솔루션을 <br className="sm:hidden" /> 확인하세요.
                    </h2>
                    <p className="text-slate-500 font-medium text-lg break-keep">
                        BizDive는 창업가와 지원기관 모두에게 <br className="sm:hidden" />
                        당면한 문제를 해결할 최적의 도구를 제공합니다.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Founder Path */}
                    <div
                        className="bg-white border border-slate-200 p-10 sm:p-14 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                        <div>
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-8 border border-indigo-100 shadow-sm">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-indigo-950 mb-4 tracking-tight">창업가 / 예비 창업자</h3>
                            <p className="text-slate-500 mb-8 font-medium leading-relaxed text-[15px] sm:text-base break-keep">
                                “성장의 흔적, 데이터로 관리하세요.”<br />
                                일회성 진단에 그치지 않고, 누적된 데이터를 통해 <br className="sm:hidden" />
                                기업의 성장 단계별 궤적과 핵심 경쟁력을 <br className="sm:hidden" />
                                지속적으로 관리하고 향상시키세요.
                            </p>
                        </div>
                        <Link href="/onboarding" prefetch={false} className="w-full">
                            <Button className="w-full mt-6 bg-indigo-900 hover:bg-indigo-800 text-white font-bold h-12 rounded-none transition-colors border border-indigo-900 group-hover:border-indigo-800">
                                7D 기업경영 심층자가진단 시작
                            </Button>
                        </Link>
                        <p className="text-[12px] text-slate-400 mt-4 font-medium text-left leading-relaxed break-keep">
                            * 잠시의 집중과 진솔한 답변으로 기업의 현재를 정확하게 진단해 보세요.
                        </p>
                    </div>

                    {/* Institution Path */}
                    <div
                        className="bg-white border border-slate-200 p-10 sm:p-14 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                        <div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-8 border border-emerald-100 shadow-sm">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">지원기관 / 지원사업 담당자</h3>
                            <p className="text-slate-500 mb-8 font-medium leading-relaxed text-[15px] sm:text-base break-keep">
                                “지원사업 성과관리의 새로운 표준.”<br />
                                지원사업 과제별 맞춤형 정량 지표 산출부터 <br className="sm:hidden" />
                                참여 기업의 성장 데이터 추적까지 통합 관리하세요. <br className="sm:hidden" />
                                <span className="text-indigo-600 font-bold">(※ 지원사업/과제당 과금 모델로 운영)</span>
                            </p>
                        </div>
                        <Link href="https://bizdive.kr/admin/demo" className="mt-auto">
                            <Button variant="outline" className="font-bold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-12 px-6 w-full sm:w-auto mt-4 rounded-none">
                                관리자 데모 체험하기 (PC전용)
                            </Button>
                        </Link>
                        <p className="text-[12px] text-slate-400 mt-3 font-medium">
                            * PC 환경에서의 작업에 최적화되어 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserPathSelection;
