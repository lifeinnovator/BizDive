'use client';

import React from 'react';
import { 
    Users, 
    Briefcase, 
    ClipboardCheck, 
    LineChart, 
    TrendingUp, 
    ArrowUpRight,
    Building2,
    Calendar,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Mock Data for Demo
const MOCK_STATS = [
    { name: '관리 기업 수', value: '142', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: '진행 중인 사업', value: '3', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: '전체 진단 건수', value: '128', icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: '기관 전체 평균', value: '68.4', icon: LineChart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const RECENT_ACTIVITIES = [
    { company: '그로스랩', time: '방금 전', score: 72, status: '제출 완료' },
    { company: '에이아이테크', time: '2시간 전', score: 65, status: '제출 완료' },
    { company: '블루오션벤처스', time: '5시간 전', score: 81, status: '제출 완료' },
    { company: '스마트솔루션즈', time: '1일 전', score: 59, status: '제출 완료' },
    { company: '넥스트스텝', time: '2일 전', score: 77, status: '제출 완료' },
];

const PROJECT_STATS = [
    { name: '2026 스타트업 스케일업 지원사업', count: 42, avg: 72.5 },
    { name: '지역 소상공인 디지털 전환 컨설팅', count: 35, avg: 64.2 },
    { name: 'ICT 융합 글로벌 진출 지원 프로그램', count: 51, avg: 68.9 },
];

export default function AdminDemoDashboard() {
    return (
        <div className="space-y-8 pb-10">
            {/* Demo Notice Banner */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm"
            >
                <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="text-amber-600" size={20} />
                </div>
                <div>
                    <h4 className="text-[14px] font-bold text-amber-900">관리자 데모 모드 (Mockup)</h4>
                    <p className="text-[12px] text-amber-800/80 mt-1 leading-relaxed">
                        현재 보고 계신 데이터는 시각적 체험을 위한 가상 데이터입니다. <br className="hidden md:block" />
                        실제 프로젝트 생성 및 데이터 관리가 필요하시면 정식 관리자 계정으로 로그인해 주시기 바랍니다.
                    </p>
                </div>
            </motion.div>

            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">대시보드 개요</h2>
                    <p className="text-[14px] text-slate-400 font-medium mt-1">우리 기관의 기업 경영 진단 현황을 한눈에 파악하세요.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 text-[13px] font-bold border-slate-200 text-slate-600 rounded-xl">
                        <Calendar size={14} className="mr-2" />
                        2026년 상반기
                    </Button>
                    <Button className="h-10 text-[13px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100">
                        리포트 내보내기
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_STATS.map((stat, i) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="flex items-center text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={10} className="mr-0.5" />
                                12%
                            </span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-400">{stat.name}</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Distribution Chart Mockup */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50 pb-6 pt-7 px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-indigo-600" />
                                    기관 소속 기업 역량 분포
                                </CardTitle>
                                <p className="text-xs text-slate-400 mt-1 font-medium italic">
                                    * 플랫폼 전체 평균(백마크)과 우리 기업들의 점수 차이를 나타냅니다.
                                </p>
                            </div>
                            <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px] font-bold px-3 py-1">
                                평균 68.4점
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[380px] bg-white flex items-center justify-center relative">
                        {/* High Fidelity Radar Chart Visual Placeholder */}
                        <div className="w-full h-full relative">
                            {/* Decorative Radial Grid Lines */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <div className="w-full h-full border border-slate-900 rounded-full scale-[0.2]"></div>
                                <div className="absolute w-full h-full border border-slate-900 rounded-full scale-[0.4]"></div>
                                <div className="absolute w-full h-full border border-slate-900 rounded-full scale-[0.6]"></div>
                                <div className="absolute w-full h-full border border-slate-900 rounded-full scale-[0.8]"></div>
                                <div className="absolute w-full h-full border border-slate-900 rounded-full scale-[1.0]"></div>
                            </div>

                            {/* Center Logo Background */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                                <Building2 size={120} className="text-indigo-900" />
                            </div>

                            {/* Dimensions Text labels around the radar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">D1: 시장 분석</div>
                            <div className="absolute top-1/4 right-0 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">D2: 문제 정의</div>
                            <div className="absolute bottom-1/4 right-0 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">D3: 해결 가치</div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">D4: 실행 역량</div>
                            <div className="absolute bottom-1/4 left-0 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">D5: 기술 성숙</div>
                            <div className="absolute top-1/4 left-0 text-[11px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">D6: 수익 모델</div>
                            
                            {/* Visual Hint about the chart */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-[14px] font-bold text-indigo-950/20 uppercase tracking-widest select-none">
                                    Radar Chart Interactive Mockup
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities Panel */}
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
                    <CardHeader className="bg-white border-b border-slate-50 pb-5 pt-6 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black text-slate-800">실시간 진단 현황</CardTitle>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="divide-y divide-slate-50">
                            {RECENT_ACTIVITIES.map((activity, i) => (
                                <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <h5 className="text-[13px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                {activity.company}
                                            </h5>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[9px] font-bold bg-white text-slate-400 border-none px-0">제출완료</Badge>
                                                <span className="text-[10px] text-indigo-400 font-bold">• 점수: {activity.score}점</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400 shrink-0">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                        <Button variant="ghost" className="w-full h-10 text-[12px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all">
                            전체 내역 보기
                            <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Programs/Projects Summary Table */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 pb-5 pt-6 px-8">
                    <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-600" />
                        참여 사업별 요약 리포트
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Project Name</th>
                                <th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Progress</th>
                                <th className="px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic text-right">Avg Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {PROJECT_STATS.map((project, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 transition-colors cursor-pointer group">
                                    <td className="px-8 py-5">
                                        <span className="text-[14px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                            {project.name}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-600 rounded-full" 
                                                    style={{ width: `${(project.count / 60) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">{project.count}건 / 60</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="text-[16px] font-black text-slate-800">{project.avg}</span>
                                            <span className="text-[10px] font-bold text-slate-300">PT</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
