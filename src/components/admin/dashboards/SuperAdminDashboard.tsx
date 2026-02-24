'use client'

import React from 'react'
import {
    Users,
    Building2,
    History,
    Target,
    TrendingUp,
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminRadarChart from '@/components/admin/AdminRadarChart'
import ScoreIndicator from '@/components/admin/ScoreIndicator'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface SuperAdminDashboardProps {
    stats: {
        totalUsers: number
        totalRecords: number
        avgScore: number
        totalGroups: number
        industryDistribution: any[]
        recentActivities: any[]
    }
}

const MOCK_RADAR_DATA = [
    { dimension: 'D1', full_name: '시장 분석', score: 82 },
    { dimension: 'D2', full_name: '문제 정의', score: 75 },
    { dimension: 'D3', full_name: '해결 가치', score: 68 },
    { dimension: 'D4', full_name: '실행 역량', score: 88 },
    { dimension: 'D5', full_name: '기술 역량', score: 85 },
    { dimension: 'D6', full_name: '수익 모델', score: 78 },
    { dimension: 'D7', full_name: '성장 전략', score: 80 },
]

export default function SuperAdminDashboard({ stats }: SuperAdminDashboardProps) {
    const INDUSTRY_DATA = stats.industryDistribution.length > 0 ? stats.industryDistribution : [
        { name: 'IT/SaaS', count: 0, color: '#4f46e5' },
        { name: '제조/HW', count: 0, color: '#10b981' },
        { name: '로컬/F&B', count: 0, color: '#f59e0b' },
        { name: '콘텐츠', count: 0, color: '#ec4899' },
    ]
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { name: '전체 사용자', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', delta: '+8%' },
                    { name: '등록 기관/그룹', value: stats.totalGroups, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', delta: '+2' },
                    { name: '누적 진단건수', value: stats.totalRecords, icon: History, color: 'text-amber-600', bg: 'bg-amber-50', delta: '+15%' },
                    { name: '플랫폼 평균 점수', value: stats.avgScore, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', delta: '+1.2' },
                ].map((item) => (
                    <Card key={item.name} className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={24} className={item.color} />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-400 capitalize">{item.name}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</h3>
                                        <span className="text-[10px] font-black text-emerald-500 flex items-center">
                                            <ArrowUpRight size={10} /> {item.delta}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Radar Analysis */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-600" />
                                플랫폼 전체 역량 지표
                            </CardTitle>
                            <p className="text-xs text-slate-400 mt-1 font-medium italic underline underline-offset-4 decoration-indigo-200">전체 762개 진단 항목에 기반한 표준화 지수</p>
                        </div>
                        <ScoreIndicator score={stats.avgScore} />
                    </CardHeader>
                    <CardContent className="p-10 flex items-center justify-center min-h-[400px]">
                        <AdminRadarChart data={MOCK_RADAR_DATA} />
                    </CardContent>
                </Card>

                {/* Industry Distribution */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <LayoutDashboard size={20} className="text-emerald-600" />
                            산업군별 분포
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={INDUSTRY_DATA} layout="vertical" margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                        {INDUSTRY_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-3">
                            {INDUSTRY_DATA.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 font-bold">{item.count}개사</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-800">최근 플랫폼 전역 활동</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 hover:bg-indigo-50">전체 보기</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {stats.recentActivities.length > 0 ? stats.recentActivities.map((item, idx) => (
                                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <LayoutDashboard size={18} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-800 truncate">{item.company}</p>
                                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 opacity-70 bg-indigo-50 border-indigo-100 text-indigo-600 font-bold">{item.group}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.event} (점수: {item.score}pt)</p>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{item.time}</span>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-400 font-medium text-sm italic">최근 활동이 없습니다.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-800">시스템 연동 현황</CardTitle>
                        <Badge className="bg-emerald-500 text-white border-none font-bold">Healty (99.9%)</Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {[
                                { name: 'Supabase Database', status: 'Operational', latency: '42ms', color: 'bg-emerald-500' },
                                { name: 'Vercel Deployment', status: 'Operational', latency: '124ms', color: 'bg-emerald-500' },
                                { name: 'Resend API (Mailer)', status: 'Operational', latency: '210ms', color: 'bg-emerald-500' },
                                { name: 'Recharts Rendering', status: 'Operational', latency: '15ms', color: 'bg-emerald-500' },
                            ].map((s) => (
                                <div key={s.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${s.color} animate-pulse`} />
                                        <span className="text-sm font-bold text-slate-700">{s.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-slate-400">{s.latency}</span>
                                        <span className="text-xs font-bold text-indigo-600">{s.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
