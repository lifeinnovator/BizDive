'use client'

import React from 'react'
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ComparativeChartProps {
    data: any[]
    title?: string
    description?: string
    roundLabel1?: string
    roundLabel2?: string
}

export default function ComparativeChart({
    data,
    title = "차수별 진단 결과 비교",
    description = "전체 참여 기업의 차수별 성장 추이를 비교합니다.",
    roundLabel1 = "1차 진단",
    roundLabel2 = "2차 진단"
}: ComparativeChartProps) {
    return (
        <Card className="border-slate-100 shadow-sm">
            <CardHeader pb-2>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                    {title}
                </CardTitle>
                <CardDescription className="font-medium">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="category"
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar
                                name={roundLabel1}
                                dataKey="prev"
                                stroke="#cbd5e1"
                                fill="#f1f5f9"
                                fillOpacity={0.6}
                            />
                            <Radar
                                name={roundLabel2}
                                dataKey="current"
                                stroke="#4f46e5"
                                fill="#818cf8"
                                fillOpacity={0.4}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px',
                                    fontWeight: 700
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 700 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
