"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
                                신청부터 성과보고까지 연결된 운영 체계가 필요한 지원기관
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
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-white break-keep">신청과 참여를<br />명확하게 구분.</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md pl-9 break-keep">
                            신청기업을 검토하고 승인된 기업을 참여기업으로 전환합니다. 신청 단계 진단부터 이후 사업 단계까지 같은 기업의 이력을 연결합니다.
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
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-white">진단에서 멘토링까지<br />하나의 지원 흐름.</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md pl-9">
                            자가진단과 진단위원 결과를 비교하고 필요한 분야의 멘토풀, 기업 선택, 일정과 멘토링 일지를 하나의 흐름으로 관리합니다.
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
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-white">사업 효과를 보여주는<br />성과와 보고.</h2>
                        </div>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md pl-9">
                            참여율, 진단 점수 변화, 멘토링 실행 이력을 성과지표로 관리하고 최종 사업 보고에 활용할 수 있는 보고서 초안을 만듭니다.
                        </p>
                        <a href="https://admin.bizdive.kr" className="ml-9 mt-6 inline-flex rounded-lg border border-indigo-400/40 px-4 py-2.5 text-sm font-bold text-indigo-200 transition hover:bg-indigo-500/10 hover:text-white pointer-events-auto">기관용 운영 솔루션 보기 →</a>
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

export default InstitutionExperience;
