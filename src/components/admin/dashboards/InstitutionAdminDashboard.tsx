'use client'

import React from 'react'
import {
    Users,
    Briefcase,
    ClipboardCheck,
    LineChart,
    ChevronRight,
    Building2,
    Calendar,
    Mail,
    CheckCircle2,
    Circle,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminRadarChart from '@/components/admin/AdminRadarChart'
import ScoreIndicator from '@/components/admin/ScoreIndicator'
import Link from 'next/link'

interface InstitutionAdminDashboardProps {
    profile: any
    stats: {
        totalUsers: number
        totalRecords: number
        avgScore: number
        totalProjects: number
        recentActivities: any[]
    }
}

const COMPARISON_DATA = [
    { dimension: 'D1', full_name: '시장 분석', score: 0, benchmark: 70 },
    { dimension: 'D2', full_name: '문제 정의', score: 0, benchmark: 70 },
    { dimension: 'D3', full_name: '해결 가치', score: 0, benchmark: 70 },
    { dimension: 'D4', full_name: '실행 역량', score: 0, benchmark: 70 },
    { dimension: 'D5', full_name: '기술 역량', score: 0, benchmark: 70 },
    { dimension: 'D6', full_name: '수익 모델', score: 0, benchmark: 70 },
    { dimension: 'D7', full_name: '성장 전략', score: 0, benchmark: 70 },
]

export default function InstitutionAdminDashboard({ profile, stats }: InstitutionAdminDashboardProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Institution Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-indigo-600 text-white border-none font-bold">기관 관리자</Badge>
                        <span className="text-slate-400 font-bold text-sm">|</span>
                        <span className="text-slate-500 font-bold text-sm italic">{profile?.group_name || '소속 기관 정보 없음'}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        반갑습니다, <span className="text-indigo-600">{profile?.user_name || '매니저'}</span>님!
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        현재 운영중인 프로젝트와 기업들의 성장 지표를 한눈에 확인하세요.
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Link href="/admin/projects">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-6 h-12 rounded-xl shadow-lg shadow-slate-200">
                            신규 프로젝트 생성
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { name: '관리 기업', value: stats.totalUsers, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { name: '진행 프로젝트', value: stats.totalProjects, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { name: '제출된 진단', value: stats.totalRecords, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { name: '그룹 평균 점수', value: stats.avgScore, icon: LineChart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((item) => (
                    <Card key={item.name} className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 mb-1">{item.name}</p>
                                    <h3 className="text-2xl font-black text-slate-900">{item.value}</h3>
                                </div>
                                <div className={`p-4 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={26} className={item.color} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Comparative Analysis */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-600" />
                                우리 기관 기업 분포 분석
                            </CardTitle>
                            <p className="text-xs text-slate-400 mt-1 font-medium">플랫폼 전체 평균(Benchmark) 대비 우리 기관 기업들의 강점/약점</p>
                        </div>
                        <ScoreIndicator score={stats.avgScore} />
                    </CardHeader>
                    <CardContent className="p-10 flex items-center justify-center min-h-[400px]">
                        {/* Note: AdminRadarChart needs update to handle benchmark, using standard for now */}
                        <AdminRadarChart data={COMPARISON_DATA} />
                    </CardContent>
                </Card>

                {/* Recent Activity in My Group */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800">최근 소속 기업 활동</CardTitle>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">Live</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {stats.recentActivities.length > 0 ? stats.recentActivities.map((item, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm font-bold text-slate-800 truncate flex-grow group-hover:text-indigo-600 transition-colors">
                                            {item.company}
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="text-[10px] py-0 px-1.5 bg-slate-50 text-slate-500 border-slate-200 font-medium">진단 완료</Badge>
                                        <span className="text-xs text-slate-500 font-medium shrink-0">• 점수: {item.score}pt</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-400 font-medium text-sm italic">최근 활동이 없습니다.</div>
                            )}
                        </div>
                        <div className="p-4">
                            <Button variant="ghost" className="w-full text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 h-11 border border-transparent hover:border-indigo-100 rounded-xl transition-all">
                                모든 활동 내역 보기 <ChevronRight size={14} className="ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-100 p-8 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                            <Mail size={24} className="text-white" />
                        </div>
                        <h4 className="text-xl font-black mb-3">미제출 기업 독려가 필요한가요?</h4>
                        <p className="text-indigo-100 text-sm leading-relaxed font-bold opacity-80">
                            현재 진행중인 프로젝트에서 8개 기업이 아직 진단을 완료하지 않았습니다. 알림 메일을 일괄 발송하여 참여율을 높여보세요.
                        </p>
                    </div>
                    <Button className="mt-8 bg-white text-indigo-600 hover:bg-indigo-50 border-none font-black h-12 text-base rounded-xl">
                        독려 대상 확인하기
                    </Button>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-white p-6 border-l-4 border-l-indigo-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <CheckCircle2 className="text-indigo-600" size={24} />
                            </div>
                            <h5 className="font-bold text-slate-800">진단 신뢰도 점검</h5>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            소속 기업들의 진단 답변 일관성이 전반적으로 높게 유지되고 있습니다. 데이터 기반의 객관적 분석이 가능합니다.
                        </p>
                    </Card>

                    <Card className="border-none shadow-sm bg-white p-6 border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <ArrowUpRight className="text-emerald-600" size={24} />
                            </div>
                            <h5 className="font-bold text-slate-800">주요 성장 차원</h5>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            우리 기관 기업들은 '실행 역량' 부문에서 플랫폼 상위 15%에 달하는 높은 성과를 보여주고 있습니다.
                        </p>
                    </Card>

                    <Card className="border-none shadow-sm bg-white p-6 border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <Circle className="text-amber-600" size={24} />
                            </div>
                            <h5 className="font-bold text-slate-800">보완 필요 차원</h5>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            '수익 모델' 정교화 부문의 점수가 상대적으로 낮습니다. 관련 특강이나 멘토링 프로그램 연계를 추천합니다.
                        </p>
                    </Card>

                    <Card className="border-none shadow-sm bg-white p-6 border-l-4 border-l-slate-400">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-100 rounded-xl">
                                <Users className="text-slate-600" size={24} />
                            </div>
                            <h5 className="font-bold text-slate-800">최근 졸업 기업</h5>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            지난 분기 우수 성장 기업 3개사의 리포트를 참고하여 차기 사업 기획의 벤치마크로 활용해 보세요.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
