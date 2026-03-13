"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, Rocket, Building2 } from 'lucide-react';

const NavigationBar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        const checkUser = async () => {
            const { createClient } = await import('@/lib/supabase');
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile) setUserRole(profile.role);
            }
        };
        checkUser();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'}`}
        >
            <div className="container mx-auto px-2 md:px-4 flex justify-between items-center max-w-7xl">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/BizDive_Logo_Confirm.png"
                        alt="BizDive"
                        className="h-10 sm:h-12 w-auto"
                    />
                </Link>
                <div className="flex items-center gap-3 sm:gap-6">
                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard" className="text-[13px] sm:text-[15px] font-bold text-slate-500 hover:text-indigo-900 transition-colors">
                                나의 대시보드
                            </Link>
                            {userRole === 'super_admin' && (
                                <a href="https://admin.bizdive.kr/ops" className="text-[13px] sm:text-[15px] font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
                                    운영 관리
                                </a>
                            )}
                            {userRole === 'group_admin' && (
                                <a href="https://bizdive.kr/admin/demo" className="text-[13px] sm:text-[15px] font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
                                    기관 관리
                                </a>
                            )}
                        </>
                    ) : (
                        <Link href="/login" className="text-[13px] sm:text-[15px] font-bold text-slate-500 hover:text-indigo-900 transition-colors">
                            회원로그인
                        </Link>
                    )}
                    <Link href="/onboarding">
                        <Button className="rounded-none bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-4 sm:px-7 h-9 sm:h-11 text-[13px] sm:text-base tracking-tight">
                            무료 진단 시작
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
};

const Hero = () => {
    return (
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-6 md:px-12 bg-white flex flex-col items-center justify-center text-center min-h-[70vh] sm:min-h-[75vh] selection:bg-indigo-900 selection:text-white border-b border-indigo-50">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-5xl mx-auto w-full"
            >
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-tight border border-indigo-100 flex items-center gap-2 shadow-sm">
                        <img src="/favicon.png" alt="" className="w-4 h-4 opacity-80" />
                        BizDive - 7D 기업경영 심층자가진단
                    </span>
                </div>
                <h1 className="text-[36px] sm:text-[48px] lg:text-[76px] font-extrabold tracking-tighter text-indigo-950 leading-[1.2] sm:leading-[1.1] mb-6 sm:mb-8 break-keep">
                    직관을 넘어, <br />
                    데이터로 증명하는 <br />
                    비즈니스 경쟁력
                </h1>
                <p className="text-[17px] sm:text-xl text-slate-600 font-medium tracking-tight mb-4 max-w-3xl mx-auto leading-relaxed break-keep">
                    본 기업경영 자가진단은 <br className="md:hidden" />
                    서비스 디자인 방법론(Double Diamond)과 <br className="md:hidden" />
                    PSST 사업계획 방법론, 전략컨설팅 <br className="md:hidden" />
                    프레임워크 방법론 등을 융합하여 설계된 <br className="md:hidden" />
                    고도화된 경영 진단 도구입니다.
                    <br />
                    시장 기회 탐색부터 사업성 검증까지 <br className="md:hidden" />
                    7가지 핵심 영역을 입체적으로 <br className="md:hidden" />
                    정밀 분석합니다.
                </p>
                <p className="text-base sm:text-lg text-slate-500 font-medium tracking-tight mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed break-keep">
                    기업은 현재의 성장 단계를 명확히 인지하고, <br />
                    다음 단계로 도약하기 위한 구체적인 실행 전략을 수립할 수 있습니다.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/onboarding" className="w-full sm:w-auto">
                        <Button className="h-14 px-10 rounded-none bg-indigo-900 hover:bg-indigo-800 text-white text-[17px] font-bold w-full sm:w-auto flex items-center gap-2 group transition-all shadow-md">
                            무료 진단 시작하기
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

const UserPathSelection = () => {
    return (
        <section className="py-16 sm:py-24 px-6 md:px-12 bg-slate-50/50 flex flex-col items-center border-b border-indigo-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 sm:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-indigo-950 mb-4 break-keep">
                        역할에 맞는 맞춤 솔루션을 <br className="sm:hidden" /> 확인하세요.
                    </h2>
                    <p className="text-slate-500 font-medium text-lg break-keep">
                        BizDive는 기업가와 지원 기관 모두에게 <br className="sm:hidden" />
                        당면한 문제를 해결할 최적의 도구를 제공합니다.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Founder Path */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white border border-slate-200 p-10 sm:p-14 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                        <div>
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-8 border border-indigo-100 shadow-sm">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-indigo-950 mb-4 tracking-tight">기업가 / 예비 창업자</h3>
                            <p className="text-slate-500 mb-8 font-medium leading-relaxed text-[15px] sm:text-base break-keep">
                                "성장의 흔적, 데이터로 관리하세요."<br />
                                일회성 진단에 그치지 않고, 누적된 데이터를 통해 <br className="sm:hidden" />
                                기업의 성장 단계별 궤적과 핵심 경쟁력을 <br className="sm:hidden" />
                                지속적으로 관리하고 향상시키세요.
                            </p>
                        </div>
                        <Link href="/onboarding" className="w-full">
                            <Button className="w-full mt-6 bg-indigo-900 hover:bg-indigo-800 text-white font-bold h-12 rounded-none transition-colors border border-indigo-900 group-hover:border-indigo-800">
                                7D 기업경영 심층자가진단 시작
                            </Button>
                        </Link>
                        <p className="text-[12px] text-slate-400 mt-4 font-medium text-left leading-relaxed break-keep">
                            * 잠시의 집중과 진솔한 답변으로 기업의 현재를 정확하게 진단해 보세요.
                        </p>
                    </motion.div>

                    {/* Institution Path */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white border border-slate-200 p-10 sm:p-14 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                        <div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-8 border border-emerald-100 shadow-sm">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">기관 / 지원사업 담당자</h3>
                            <p className="text-slate-500 mb-8 font-medium leading-relaxed text-[15px] sm:text-base break-keep">
                                "지원사업 성과관리의 새로운 표준."<br />
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
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

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
                            비즈니스의 입체적 진단이 필요한 기업가
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-indigo-950 mb-6 sm:mb-8 leading-tight break-keep">
                        아이디어의 현주소, <br />
                        가장 빠르고 냉정하게.
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl break-keep">
                        복잡한 텍스트 심사나 피칭 전에, <br className="sm:hidden" />
                        BizDive의 입체적 진단 모델을 통해 <br className="sm:hidden" />
                        시장에서의 실제 생존 가능성을 테스트하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: '7D 핵심 지표 해부', desc: '시장성, 경쟁력, 수익성 등 7가지 다각도 관점에서 비즈니스 모델을 파편부터 결합까지 검증합니다.' },
                        { step: '02', title: '등급 산출 알고리즘', desc: '직관적이고 치밀하게 짜인 로직을 바탕으로 현재 수준을 정확하게 계산된 점수와 등급으로 반환합니다.' },
                        { step: '03', title: '누적 성장 궤적 관리', desc: '진단 결과를 축적하여 기업의 성장 단계별 변화를 한눈에 파악하고, 다음 단계 도약을 위한 지속적인 경영 제언을 제공합니다.' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-indigo-50/30 p-10 sm:p-12 border border-indigo-100/50 transition-colors hover:bg-white hover:shadow-xl hover:border-transparent group"
                        >
                            <span className="text-[40px] font-light text-indigo-200 mb-8 block font-mono group-hover:text-indigo-600 transition-colors">{item.step}</span>
                            <h4 className="text-[22px] font-extrabold tracking-tight text-indigo-950 mb-4">{item.title}</h4>
                            <p className="text-[16px] text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const InstitutionExperience = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={targetRef} className="bg-slate-950 text-white relative h-[300vh]">
            <div className="sticky top-0 h-screen flex flex-col md:flex-row items-start md:items-center justify-start md:justify-center overflow-hidden px-6 md:px-12 max-w-7xl mx-auto">

                {/* Text Content Left */}
                <div className="w-full md:w-5/12 z-10 py-12 sm:py-20 relative h-[400px] flex flex-col justify-start md:justify-center">
                    {/* Fixed Header */}
                    <div className="absolute top-0 left-0 pt-24 sm:pt-10">
                        <div className="flex flex-col items-start gap-1 sm:gap-4 mb-8 sm:mb-8">
                            <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[13px] font-bold tracking-[0.1em] uppercase shadow-sm">
                                For Institutions
                            </span>
                            <span className="text-[14px] sm:text-base font-bold text-slate-400">
                                데이터 기반의 스마트한 지원 체계가 필요한 기관
                            </span>
                        </div>
                    </div>

                    {/* Phase 01: Emerald */}
                    <motion.div
                        style={{
                            opacity: useTransform(scrollYProgress, [0, 0.1, 0.25], [1, 1, 0]),
                            y: useTransform(scrollYProgress, [0, 0.1, 0.25], [200, 200, 180])
                        }}
                        className="absolute inset-x-0"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <span className="text-emerald-500 font-mono text-xl font-bold mt-1">01</span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-white break-keep">지원사업 효과의<br />정량적 지표화.</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md pl-9 break-keep">
                            지원사업 전후의 기업 경영 상황 변화를 <br className="sm:hidden" />
                            객관적인 점수로 비교 분석합니다. <br className="sm:hidden" />
                            이를 통해 지원사업의 실제 성과를 <br className="sm:hidden" />
                            정량적 지표로 명확하게 제시할 수 있습니다.
                        </p>
                    </motion.div>

                    {/* Phase 02: Sky */}
                    <motion.div
                        style={{
                            opacity: useTransform(scrollYProgress, [0.3, 0.45, 0.6], [0, 1, 0]),
                            y: useTransform(scrollYProgress, [0.3, 0.45, 0.6], [220, 200, 180])
                        }}
                        className="absolute inset-x-0 pointer-events-none"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <span className="text-sky-400 font-mono text-xl font-bold mt-1">02</span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-white">단계별 진단과<br />맞춤형 보완 가이드.</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md pl-9">
                            차수별 연속 진단을 통해 개별 기업의 핵심 경쟁 요인과 부족한 부분을 도출하고, 이를 즉각 보완할 수 있는 실질적인 가이드를 제공합니다.
                        </p>
                    </motion.div>

                    {/* Phase 03: Indigo */}
                    <motion.div
                        style={{
                            opacity: useTransform(scrollYProgress, [0.65, 0.8, 1], [0, 1, 1]),
                            y: useTransform(scrollYProgress, [0.65, 0.8, 1], [220, 200, 200])
                        }}
                        className="absolute inset-x-0 pointer-events-none"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <span className="text-indigo-400 font-mono text-xl font-bold mt-1">03</span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-white">지원사업별 <br />간편한 통합 관리.</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md pl-9">
                            다수의 지원사업과 참가 기업들의 진단 및 실행 현황을 하나의 대시보드에서 쉽게 관리하세요. 수백 개의 수합된 엑셀 파일은 더 이상 필요 없습니다.
                        </p>
                    </motion.div>
                </div>

                {/* Dashboard Mockup Right - Simplified for Mobile */}
                <div className="hidden md:flex w-full md:w-7/12 h-1/2 md:h-full items-center justify-end relative">
                    <motion.div
                        style={{
                            y: useTransform(scrollYProgress, [0, 1], [150, -150]),
                        }}
                        className="w-full aspect-square md:aspect-auto md:h-[600px] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
                    >
                        {/* Mockup Header */}
                        <div className="h-10 bg-slate-800 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="ml-4 h-4 w-40 bg-slate-700 rounded-full" />
                        </div>
                        {/* Mockup Content */}
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="h-24 bg-slate-800 rounded-xl animate-pulse" />
                                <div className="h-24 bg-slate-800 rounded-xl animate-pulse delay-75" />
                            </div>

                            {/* Mockup Table */}
                            <div className="bg-slate-950 border border-slate-800 p-8">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 text-xs font-bold text-slate-500 tracking-wider">
                                    <div className="w-1/2">COMPANY INFO</div>
                                    <div className="w-1/4 text-right">SCORE</div>
                                    <div className="w-1/4 text-right">STATUS</div>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { name: '테크스타트업 (주)', email: 'ceo@techstartup.co', score: 86, s: '완료' },
                                        { name: '로컬크리에이터랩', email: 'hello@localcreator.kr', score: 72, s: '완료' },
                                        { name: '에코이노베이션', email: 'contact@ecoinno.com', score: '-', s: '미응답' },
                                        { name: '핀테크코리아', email: 'admin@fintechkr.io', score: 92, s: '완료' },
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="w-1/2 flex items-center gap-4">
                                                <div className="w-4 h-4 rounded-sm border border-slate-700 bg-slate-900"></div>
                                                <div>
                                                    <div className="text-slate-300 font-bold">{row.name}</div>
                                                    <div className="text-slate-600 font-mono text-xs mt-0.5">{row.email}</div>
                                                </div>
                                            </div>
                                            <div className="w-1/4 text-right font-mono text-slate-300 text-base">{row.score}</div>
                                            <div className="w-1/4 text-right">
                                                <span className={`text-[11px] px-2 py-1 font-bold ${row.s === '완료' ? 'bg-slate-800 text-slate-300' : 'bg-red-900/30 text-red-500'}`}>
                                                    {row.s}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hovering Data Points */}
                        <motion.div
                            style={{ y: useTransform(scrollYProgress, [0, 1], [-20, 20]) }}
                            className="absolute top-20 right-10 bg-emerald-500 p-4 rounded-xl shadow-lg shadow-emerald-500/20"
                        >
                            <span className="text-white font-bold text-2xl">94.2%</span>
                            <span className="block text-emerald-100 text-[10px] uppercase tracking-wider font-bold">Accuracy</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const BannerSection = () => {
    return (
        <section className="bg-white py-8 sm:py-12 px-6 md:px-12 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#1e1b4b] text-white rounded-none p-10 sm:p-16 text-center shadow-2xl shadow-indigo-900/10">
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-4 tracking-tighter break-keep text-white">
                        우리 기업의 성장 통증, <br /> 혼자 고민하지 마세요.
                    </h2>
                    <p className="text-indigo-200/90 mb-8 sm:mb-10 text-base md:text-lg font-medium opacity-80 break-keep">
                        진단 결과를 바탕으로 전문 컨설턴트가 <br className="sm:hidden" />
                        1:1 맞춤 솔루션을 제안해 드립니다. <br className="sm:hidden" />
                        <span className="font-bold text-emerald-400">(베타 기간 무료)</span>
                    </p>
                    <Link href="/consultation/apply">
                        <Button
                            className="font-bold text-indigo-900 bg-white hover:bg-slate-100 px-8 h-14 text-[16px] rounded-none shadow-sm w-full sm:w-auto"
                        >
                            전문가 매칭 신청하기
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};


const Footer = () => {
    return (
        <footer className="bg-white py-16 px-2 md:px-4 border-t border-slate-200">
            <div className="flex flex-col items-start gap-1">
                <Link href="/" className="mb-2">
                    <img
                        src="/BizDive_Logo_Confirm.png"
                        alt="BizDive"
                        className="h-9 sm:h-11 w-auto"
                    />
                </Link>
                <p className="text-[12px] text-slate-500 font-medium tracking-wide whitespace-nowrap">
                    © 2026 Cube Inspiration Group., Co., Ltd. All rights reserved.
                </p>
                <div className="flex gap-4 text-[13px] text-slate-400 mt-1 font-normal">
                    <Link href="/about" className="hover:text-indigo-900 transition-colors">서비스 정보</Link>
                    <Link href="/terms" className="hover:text-indigo-900 transition-colors">이용약관</Link>
                    <Link href="/privacy" className="hover:text-indigo-900 transition-colors">개인정보처리방침</Link>
                </div>
            </div>
        </footer>
    );
};

export default function LandingClient() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-900 selection:text-white">
            <NavigationBar />
            <main>
                <Hero />
                <UserPathSelection />
                <FounderExperience />
                <InstitutionExperience />
                <BannerSection />
            </main>
            <Footer />
        </div>
    );
}
