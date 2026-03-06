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
        projectStats?: any[]
    }
    isDemo?: boolean
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

export default function InstitutionAdminDashboard({ profile, stats, isDemo = false }: InstitutionAdminDashboardProps) {
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
                    <Link href={isDemo ? "/admin/demo/projects" : "/admin/projects"}>
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

            {/* Project Stats (지원사업별 통계) */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-600" />
                            지원사업별 진단 통계
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider h-14">지원사업명</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider h-14">제출된 진단(건)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider h-14 text-right">평균 점수</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.projectStats && stats.projectStats.length > 0 ? (
                                        stats.projectStats.map((project: any) => (
                                            <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 text-sm">{project.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3">
                                                        {project.recordCount}건
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-sm font-black text-slate-900">{project.avgScore}</span>
                                                        <span className="text-xs text-slate-400">pt</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium text-sm italic">
                                                등록된 지원사업 또는 제출된 진단 내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
