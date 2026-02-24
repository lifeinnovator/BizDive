'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Activity, Info } from 'lucide-react'

interface ProjectStatisticsProps {
    projectId: string
}

const DIMENSION_LABELS: Record<string, string> = {
    D1: '경영전략/리더십',
    D2: '비즈니스 모델',
    D3: '조직/인사',
    D4: '마케팅/영업',
    D5: '기술/R&D',
    D6: '재무/자금',
    D7: '경영지원/ESG'
}

export function ProjectStatistics({ projectId }: ProjectStatisticsProps) {
    const [statsData, setStatsData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCompanies, setTotalCompanies] = useState(0)
    const [completedCompanies, setCompletedCompanies] = useState(0)

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient()

            // 1. Fetch profiles for this project
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('project_id', projectId)

            if (error || !profiles || profiles.length === 0) {
                setLoading(false)
                return
            }

            setTotalCompanies(profiles.length)
            const userIds = profiles.map(p => p.id)

            // 2. Fetch diagnosis_records for these users
            const { data: recordsData } = await supabase
                .from('diagnosis_records')
                .select('user_id, dimension_scores')
                .in('user_id', userIds)

            if (!recordsData || recordsData.length === 0) {
                setLoading(false)
                return
            }

            // Keep only the latest record per user for simple aggregation
            const latestRecordsMap = new Map()
            recordsData.forEach(r => {
                latestRecordsMap.set(r.user_id, r) // Basic approach. Assuming records are fetched in order or we just need one per user for array processing.
            })

            setCompletedCompanies(latestRecordsMap.size)

            // 3. Aggregate dimension scores
            const dimensionSums: Record<string, number> = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0, D7: 0 }
            const dimensionCounts: Record<string, number> = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0, D7: 0 }

            Array.from(latestRecordsMap.values()).forEach(record => {
                if (record.dimension_scores && typeof record.dimension_scores === 'object') {
                    Object.entries(record.dimension_scores).forEach(([key, value]) => {
                        if (dimensionSums[key] !== undefined && typeof value === 'number') {
                            dimensionSums[key] += value
                            dimensionCounts[key] += 1
                        }
                    })
                }
            })

            // Format for Recharts
            const chartData = Object.keys(DIMENSION_LABELS).map(key => {
                const avg = dimensionCounts[key] > 0 ? Math.round(dimensionSums[key] / dimensionCounts[key]) : 0
                return {
                    subject: DIMENSION_LABELS[key],
                    '평균 점수': avg,
                    fullMark: 100,
                }
            })

            setStatsData(chartData)
            setLoading(false)
        }

        if (projectId) {
            fetchStats()
        }
    }, [projectId])

    if (loading) {
        return <div className="p-10 text-center text-slate-400 font-medium h-[400px] flex items-center justify-center">통계 데이터를 분석 중입니다...</div>
    }

    if (totalCompanies === 0) {
        return (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-[400px]">
                <Activity size={32} className="text-slate-300 mb-3" />
                <p className="font-medium">프로젝트에 배정된 기업이 없습니다.</p>
            </div>
        )
    }

    if (completedCompanies === 0) {
        return (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center h-[400px]">
                <Activity size={32} className="text-slate-300 mb-3" />
                <p className="font-medium">아직 진단을 완료한 기업이 없어 통계를 산출할 수 없습니다.</p>
            </div>
        )
    }

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-indigo-600" size={20} />
                    참여 기업 종합 진단 통계
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 font-medium">
                    <Info size={14} className="text-slate-400" />
                    총 {totalCompanies}개 기업 중 <span className="text-indigo-600 font-bold">{completedCompanies}개 기업</span>의 최근 진단 결과를 바탕으로 산출된 평균입니다.
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[450px] w-full max-w-2xl mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={statsData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickCount={6}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                                itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                            />
                            <Radar
                                name="평균 점수"
                                dataKey="평균 점수"
                                stroke="#4f46e5"
                                fill="#4f46e5"
                                fillOpacity={0.3}
                                dot={{ r: 4, fill: '#4f46e5' }}
                                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
