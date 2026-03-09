
import React from 'react';
import { FEEDBACK_DB } from '@/data/feedback';
import { AlertTriangle, Wrench, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
    sectionScores: Record<string, number>; // Percentage 0-100
    earnedScores: Record<string, number>;  // Raw Earned
    maxScores: Record<string, number>;     // Raw Max
    totalScore: number;
}

const SECTIONS = [
    { id: 'D1', title: '경영전략/리더십', maxScore: 100 },
    { id: 'D2', title: '비즈니스 모델', maxScore: 100 },
    { id: 'D4', title: '조직/인사', maxScore: 100 },
    { id: 'D3', title: '마케팅/영업', maxScore: 100 },
    { id: 'D5', title: '기술/R&D', maxScore: 100 },
    { id: 'D6', title: '재무/자금', maxScore: 100 },
    { id: 'D7', title: '경영/ESG', maxScore: 100 },
];

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ sectionScores, earnedScores, maxScores, totalScore }) => {
    if (totalScore === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/30">
                <div className="text-muted-foreground text-4xl mb-3">📊</div>
                <p className="text-sm text-muted-foreground font-medium">데이터 대기 중...</p>
                <p className="text-xs text-muted-foreground mt-1">
                    좌측 문항에 응답하시면<br />자동으로 분석됩니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {SECTIONS.map((sec) => {
                const sScore = sectionScores[sec.id] || 0; // % used for color logic
                const earned = earnedScores[sec.id] || 0;
                const max = maxScores[sec.id] || sec.maxScore; // Fallback to 100 if missing
                const percent = max > 0 ? (earned / max) * 100 : 0;

                let zoneClass: string;
                let barColor: string;
                let Icon: typeof AlertTriangle;
                let msg: string;

                // Thresholds based on percentage (0-100)
                if (sScore <= 33) {
                    zoneClass = 'bg-rose-50 border-rose-100 text-rose-700';
                    barColor = 'bg-rose-500';
                    Icon = AlertTriangle;
                    msg = FEEDBACK_DB[sec.id]?.low || "분석 중...";
                } else if (sScore <= 66) {
                    zoneClass = 'bg-amber-50 border-amber-100 text-amber-700';
                    barColor = 'bg-amber-500';
                    Icon = Wrench;
                    msg = FEEDBACK_DB[sec.id]?.mid || "분석 중...";
                } else {
                    zoneClass = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                    barColor = 'bg-emerald-500';
                    Icon = Crown;
                    msg = FEEDBACK_DB[sec.id]?.high || "분석 중...";
                }

                return (
                    <div key={sec.id} className="animate-fade-in group">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm text-gray-800">
                                {sec.title.split('(')[0]}
                            </h4>
                            <span className="font-bold text-sm text-gray-600">
                                {earned.toFixed(1)} <span className="text-gray-400 font-normal text-xs">/ {max}</span>
                            </span>
                        </div>

                        {/* Progress Bar - Thinner */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={cn(barColor, "h-1.5 rounded-full transition-all duration-500")}
                                style={{ width: `${percent}%` }}
                            />
                        </div>

                        {/* Feedback Box - Compact & One-line optimized */}
                        <div className={cn("rounded-md px-3 py-2 text-xs font-medium flex items-start gap-2 border", zoneClass)}>
                            <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-70" />
                            <span className="break-keep leading-relaxed">{msg}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryBreakdown;
