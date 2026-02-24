'use client'

import React from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts'

interface AdminRadarChartProps {
    data: {
        dimension: string
        full_name: string
        score: number
    }[]
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-1">{data.full_name}</p>
                <p className="text-sm font-black text-indigo-600">{data.score.toFixed(1)}점</p>
            </div>
        )
    }
    return null
}

export default function AdminRadarChart({ data }: AdminRadarChartProps) {
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                    />
                    <Radar
                        name="종합 점수"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fill="#4f46e5"
                        fillOpacity={0.15}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
