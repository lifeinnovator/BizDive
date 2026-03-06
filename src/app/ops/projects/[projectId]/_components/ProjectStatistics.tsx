'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { Users, FileText, TrendingUp, Presentation, AlertCircle } from 'lucide-react'
import ComparativeChart from '@/components/admin/ComparativeChart'

interface ProjectStatisticsProps {
    projectId: string
    projectRound?: number
}

// Mock Data for Demonstration
const MOCK_GROWTH_DATA = [
    { category: 'D1 경영전략', round1: 65, round2: 78 },
    { category: 'D2 제품/서비스', round1: 70, round2: 85 },
    { category: 'D3 비즈니스모델', round1: 55, round2: 68 },
    { category: 'D4 마케팅/영업', round1: 60, round2: 72 },
    { category: 'D5 조직/인사', round1: 50, round2: 65 },
    { category: 'D6 재무/투자', round1: 45, round2: 80 },
    { category: 'D7 리스크관리', round1: 50, round2: 74 }
]

const MOCK_TOTAL_SCORE_TREND = [
    { company: '알파 테크놀로지', before: 55, after: 74 },
    { company: '베타 솔루션즈', before: 62, after: 81 },
    { company: '감마 랩스', before: 48, after: 68 },
    { company: '델타 이노베이션', before: 71, after: 88 },
    { company: '엡실론 AI', before: 45, after: 72 }
]

export default function ProjectStatistics({ projectId, projectRound = 1 }: ProjectStatisticsProps) {
    const [stats, setStats] = useState({
        totalParticipants: 0,
        completedCount: 0,
        avgScore: 0,
        bizDiveAvg: 72.5,
        comparisonData: [] as any[],
        topGainers: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch real stats from Supabase
        const fetchStats = async () => {
            const supabase = createClient()

            // 1. Get total participants
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId)

            // 2. Get diagnosis records for these participants
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id')
                .eq('project_id', projectId)

            let completed = 0;
            let sumScore = 0;

            if (profiles && profiles.length > 0) {
                const userIds = profiles.map((p: any) => p.id)
                const { data: records } = await supabase
                    .from('diagnosis_records')
                    .select('id, total_score')
                    .in('user_id', userIds)
                    .eq('project_id', projectId)
                    .eq('round', projectRound)

                if (records && records.length > 0) {
                    completed = records.length;
                    sumScore = records.reduce((acc: number, curr: any) => acc + (curr.total_score || 0), 0);
                }
            }

            // 3. Fetch data for Radar Comparison (Group Avg by Dimension)
            const getGroupAvgByDimension = async (roundNum: number) => {
                const { data } = await supabase
                    .from('diagnosis_records')
                    .select('dimension_scores')
                    .eq('project_id', projectId)
                    .eq('round', roundNum)

                if (!data || data.length === 0) return null

                const dimensionKeys = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']
                const totals: Record<string, number> = {}
                dimensionKeys.forEach(k => totals[k] = 0)

                data.forEach(r => {
                    const scores = r.dimension_scores as any
                    dimensionKeys.forEach(k => {
                        totals[k] += scores[k] || 0
                    })
                })

                const avgs: Record<string, number> = {}
                dimensionKeys.forEach(k => {
                    avgs[k] = Math.round((totals[k] / data.length) * 10) / 10
                })
                return avgs
            }

            const currentAvgs = await getGroupAvgByDimension(projectRound)
            const prevAvgs = projectRound > 1 ? await getGroupAvgByDimension(projectRound - 1) : null

            const dimensionLabels: Record<string, string> = {
                D1: '시장분석', D2: '문제이해', D3: '해결가치', D4: '실행역량', D5: '기술역량', D6: '수익모델', D7: '성장전략'
            }

            const comparisonData = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map(k => ({
                category: dimensionLabels[k],
                current: currentAvgs ? currentAvgs[k] : 0,
                prev: prevAvgs ? prevAvgs[k] : 0
            }))

            setStats(prevStats => ({
                ...prevStats, // Keep existing bizDiveAvg
                totalParticipants: totalUsers || 0,
                completedCount: completed,
                avgScore: completed > 0 ? Math.round((sumScore / completed) * 10) / 10 : 0,
                comparisonData,
                topGainers: [] // Future implementation: can sort by improvement
            }))

            setLoading(false)
        }

        if (projectId) {
            fetchStats()
        }
    }, [projectId, projectRound])

    if (loading) {
        return <div className="p-10 text-center text-slate-400 font-medium">통계 데이터를 불러오는 중...</div>
    }

    const completionRate = stats.totalParticipants > 0
        ? Math.round((stats.completedCount / stats.totalParticipants) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Top Cards: Magic Dashboard Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Users size={64} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-bold text-slate-500">참여 기업 수</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-2xl font-bold text-slate-900">{stats.totalParticipants}개사</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">현재 기수에 등록된 전체 기업</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FileText size={64} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-bold text-slate-500">진단 완료율 (신호등 UI)</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${completionRate >= 80 ? 'text-emerald-500' : completionRate >= 50 ? 'text-amber-500' : 'text-rose-500'}`} />
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">{completionRate}%</span>
                            <Badge variant="outline" className={`font-bold ${completionRate >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : completionRate >= 50 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                {stats.completedCount} / {stats.totalParticipants} 제출
                            </Badge>
                        </div>
                        <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${completionRate >= 80 ? 'bg-emerald-500' : completionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingUp size={64} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-bold text-slate-500">우리 사업 평균 점수</CardTitle>
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-2xl font-bold text-slate-900">{stats.avgScore} <span className="text-sm font-medium text-slate-500">pt</span></div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{projectRound}차 진단 결과 기준</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden relative bg-indigo-50/30">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Presentation size={64} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-bold text-indigo-700">전체 평균 (Benchmark)</CardTitle>
                        <Presentation className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">{stats.bizDiveAvg} <span className="text-sm font-medium text-slate-500">pt</span></span>
                        </div>
                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                            전체 사업 대비 {stats.avgScore > stats.bizDiveAvg ? `+${(stats.avgScore - stats.bizDiveAvg).toFixed(1)}점 높음` : `${(stats.avgScore - stats.bizDiveAvg).toFixed(1)}점 낮음`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Section: Charts */}
            <div className="grid gap-6 md:grid-cols-1">
                <ComparativeChart
                    data={stats.comparisonData.length > 0 ? stats.comparisonData : MOCK_GROWTH_DATA}
                    title={`${projectRound}차 진단 결과 분석`}
                    roundLabel1={projectRound > 1 ? `${projectRound - 1}차 진단` : "벤치마크"}
                    roundLabel2={`${projectRound}차 진단`}
                />

                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                            주요 우수 기업 스코어 변동
                        </CardTitle>
                        <CardDescription className="font-medium">
                            성장 폭이 가장 큰 참여 기업 TOP 5의 총점 변화 라인 차트입니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_TOTAL_SCORE_TREND} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="company" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                                    <Line type="monotone" name="1차 점수" dataKey="before" stroke="#94a3b8" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" name="2차 점수" dataKey="after" stroke="#10b981" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center text-xs font-medium text-slate-400 mt-4 pb-10">
                * 상세 지표 라인 차트와 레이다 차트는 데이터가 충분히 누적되었을 때 실시간으로 정확히 반영됩니다. (현재 시연용 Mock 데이터 적용됨)
            </div>
        </div>
    )
}
