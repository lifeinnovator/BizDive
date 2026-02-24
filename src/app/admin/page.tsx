'use client'

import React, { useEffect, useState } from 'react'
import {
    Users,
    History,
    Target,
    TrendingUp,
    Download,
    Printer,
    Building2,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminRadarChart from '@/components/admin/AdminRadarChart'
import ScoreIndicator from '@/components/admin/ScoreIndicator'
import { createClient } from '@/lib/supabase'

const mockRadarData = [
    { dimension: 'D1', full_name: '시장 분석 및 기회 탐색', score: 85 },
    { dimension: 'D2', full_name: '사업 모델 및 전략', score: 65 },
    { dimension: 'D3', full_name: '제품 및 서비스 경쟁력', score: 45 },
    { dimension: 'D4', full_name: '마케팅 및 영업 역량', score: 72 },
    { dimension: 'D5', full_name: '조직 및 인적 자원', score: 58 },
    { dimension: 'D6', full_name: '재무 관리 및 자금 조달', score: 90 },
    { dimension: 'D7', full_name: 'ESG 및 지속 가능 경영', score: 38 },
]

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalRecords: 0,
        avgScore: 0,
        totalGroups: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient()

            // 1. Get current user profile
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setUserProfile(profile)

            // 2. Fetch Stats with RBAC Filtering
            let usersQuery = supabase.from('profiles').select('id', { count: 'exact', head: true })
            let recordsQuery = supabase.from('diagnosis_records').select('id, total_score')
            let groupsQuery = supabase.from('groups').select('id', { count: 'exact', head: true })

            // Apply filters if not super_admin (Institutional Admin Data Isolation)
            if (profile?.role === 'group_admin' && profile.group_id) {
                usersQuery = usersQuery.eq('group_id', profile.group_id)

                // Fetch user IDs in the group first for record filtering
                const { data: groupUsers } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('group_id', profile.group_id)

                const userIds = groupUsers?.map(u => u.id) || []
                if (userIds.length > 0) {
                    recordsQuery = recordsQuery.in('user_id', userIds)
                } else {
                    recordsQuery = recordsQuery.eq('user_id', '00000000-0000-0000-0000-000000000000') // No users, no records
                }
            }

            const [usersRes, recordsRes, groupsRes] = await Promise.all([
                usersQuery,
                recordsQuery,
                profile?.role === 'super_admin' ? groupsQuery : Promise.resolve({ count: 1 })
            ])

            const totalRecords = recordsRes.data?.length || 0
            const avgScore = totalRecords > 0
                ? (recordsRes.data as any[]).reduce((acc, curr) => acc + (curr.total_score || 0), 0) / totalRecords
                : 0

            setDashboardStats({
                totalUsers: usersRes.count || 0,
                totalRecords: totalRecords,
                avgScore: Math.round(avgScore * 10) / 10,
                totalGroups: profile?.role === 'super_admin' ? (groupsRes.count || 0) : 1
            })
            setLoading(false)
        }
        fetchStats()
    }, [])

    const stats = [
        { name: '전체 가입자', value: dashboardStats.totalUsers.toLocaleString(), delta: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: '진단 완료건', value: dashboardStats.totalRecords.toLocaleString(), delta: '+24%', icon: History, iconColor: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: '평균 진단 점수', value: dashboardStats.avgScore.toFixed(1), delta: '+2.4', icon: Target, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: '활성 그룹(기관)', value: dashboardStats.totalGroups.toLocaleString(), delta: '+2', icon: Building2, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    return (
        <div className="space-y-8 print:space-y-4 print:p-0">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:border-none">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">시스템 종합 현황</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm italic">BizDive 서비스의 주요 운영 지표 및 성과를 분석합니다.</p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                    <Button variant="outline" className="gap-2 text-slate-600 border-slate-200 bg-white hover:bg-slate-50 shadow-sm">
                        <Download size={16} />
                        CSV 내보내기
                    </Button>
                    <Button
                        className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                        onClick={() => window.print()}
                    >
                        <Printer size={16} />
                        PDF 리포트 출력
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
                        <CardContent className="p-6 print:p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 mb-1">{stat.name}</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                            {loading ? '...' : stat.value}
                                        </h3>
                                        <span className={`text-[11px] font-bold flex items-center ${stat.delta.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                            {stat.delta.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {stat.delta}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-2xl transition-colors duration-300 ${stat.bg} group-hover:scale-110`}>
                                    <stat.icon size={26} className={stat.iconColor || stat.color} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radar Chart Card */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden print:shadow-none print:border print:border-slate-100">
                    <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-600" />
                                7대 차원 종합 점수 분석
                            </CardTitle>
                            <p className="text-xs text-slate-400 mt-1 font-medium">전체 진단 데이터 기준 차원별 평균 성숙도</p>
                        </div>
                        <div className="hidden sm:block">
                            <ScoreIndicator score={dashboardStats.avgScore} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 flex items-center justify-center min-h-[450px] print:min-h-[400px]">
                        {loading ? (
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-64 h-64 bg-slate-100 rounded-full"></div>
                                <div className="mt-4 h-4 w-32 bg-slate-100 rounded"></div>
                            </div>
                        ) : (
                            <AdminRadarChart data={mockRadarData} />
                        )}
                    </CardContent>
                </Card>

                {/* Action List / Stats Break-down */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white print:shadow-none print:border print:border-slate-100">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-base font-bold text-slate-800">최근 주요 성과</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {[
                                    { name: '테크스타즈 그룹', action: '진단 완료', time: '10분 전', score: 82.4 },
                                    { name: '김민수 대표', action: '신규 가입', time: '25분 전', score: 0 },
                                    { name: '디브릿지 액셀러레이터', action: '그룹 생성', time: '1시간 전', score: 0 },
                                    { name: '에이비씨 코퍼레이션', action: '진단 완료', time: '2시간 전', score: 45.2 },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            {item.score > 0 ? <History size={20} /> : <Calendar size={20} />}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                {item.action} • {item.time}
                                            </p>
                                        </div>
                                        {item.score > 0 && (
                                            <div className="text-right shrink-0">
                                                <ScoreIndicator score={item.score} showText={false} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="p-4">
                                <Button variant="ghost" className="w-full text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all gap-2">
                                    이력 더보기 <ChevronRight size={14} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips / Info */}
                    <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200 p-6 print:hidden">
                        <h4 className="font-bold text-base mb-2">💡 전문가 가이드</h4>
                        <p className="text-indigo-100 text-xs leading-relaxed font-medium">
                            현재 '시장 분석 및 기회 탐색' 분야가 상위 10% 기업 대비 높은 수준을 보이고 있습니다.
                            반면 'ESG 경영' 실천이 상대적으로 부족한 상태입니다.
                        </p>
                        <Button className="mt-4 w-full bg-white text-indigo-600 font-bold hover:bg-indigo-50 border-none">
                            리포트 상세보기
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Styled Print Header (Only visible on Print) */}
            <div className="hidden print:block fixed top-0 w-full text-center border-b pb-4 mb-8">
                <h2 className="text-xl font-bold text-slate-900">BizDive 창업/성장 종합 분석 리포트</h2>
                <p className="text-xs text-slate-500 mt-1">출력 일시: {new Date().toLocaleString('ko-KR')}</p>
            </div>

            <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          aside, header {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .ml-64, .ml-16 {
            margin-left: 0 !important;
          }
          .Card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #f1f5f9 !important;
          }
        }
      `}</style>
        </div>
    )
}
