'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'

type ScoreLevel = 'High' | 'Mid' | 'Low'

interface ScoreIndicatorProps {
    score: number
    showIcon?: boolean
    showText?: boolean
    className?: string
}

export default function ScoreIndicator({ score, showIcon = true, showText = true, className = '' }: ScoreIndicatorProps) {
    let level: ScoreLevel = 'Low'
    let label = '주의 (Low)'
    let icon = '🚨'
    let colorClass = 'text-rose-600'
    let bgClass = 'bg-rose-50'
    let borderClass = 'border-rose-100'

    if (score >= 80) {
        level = 'High'
        label = '탁월 (High)'
        icon = '🏆'
        colorClass = 'text-emerald-600'
        bgClass = 'bg-emerald-50'
        borderClass = 'border-emerald-100'
    } else if (score >= 50) {
        level = 'Mid'
        label = '성장 (Mid)'
        icon = '🔧'
        colorClass = 'text-amber-600'
        bgClass = 'bg-amber-50'
        borderClass = 'border-amber-100'
    }

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border font-bold text-xs ${bgClass} ${colorClass} ${borderClass} ${className}`}>
            {showIcon && <span className="text-sm leading-none">{icon}</span>}
            {showText && <span>{label}</span>}
            <span className="opacity-60 ml-1">{score.toFixed(1)}점</span>
        </div>
    )
}
