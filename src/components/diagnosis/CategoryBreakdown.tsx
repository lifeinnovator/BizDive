
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
    { id: 'D1', title: 'D1. 시장분석 (Market Analysis)', maxScore: 100 },
    { id: 'D2', title: 'D2. 문제이해 (Problem)', maxScore: 100 },
    { id: 'D3', title: 'D3. 해결가치 (Solution)', maxScore: 100 },
    { id: 'D4', title: 'D4. 실행역량 (Execution)', maxScore: 100 },
    { id: 'D5', title: 'D5. 기술역량 (Tech)', maxScore: 100 },
    { id: 'D6', title: 'D6. 수익모델 (BM)', maxScore: 100 },
    { id: 'D7', title: 'D7. 성장전략 (Growth Strategy)', maxScore: 100 },
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
        <div className="space-y-5">
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
                    zoneClass = 'zone-red';
                    barColor = 'bg-rose-500';
                    Icon = AlertTriangle;
                    msg = FEEDBACK_DB[sec.id]?.low || "분석 중...";
                } else if (sScore <= 66) {
                    zoneClass = 'zone-yellow';
                    barColor = 'bg-amber-500';
                    Icon = Wrench;
                    msg = FEEDBACK_DB[sec.id]?.mid || "분석 중...";
                } else {
                    zoneClass = 'zone-green';
                    barColor = 'bg-emerald-500';
                    Icon = Crown;
                    msg = FEEDBACK_DB[sec.id]?.high || "분석 중...";
                }

                return (
                    <div key={sec.id} className="animate-fade-in">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-bold text-foreground">
                                {sec.title.split('(')[0]}
                            </span>
                            <span className="font-bold text-muted-foreground">
                                {earned.toFixed(1)}{' '}
                                <span className="text-muted-foreground/50 font-normal">/ {max}</span>
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className={cn(barColor, "h-1.5 rounded-full transition-all duration-500")}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <div className={cn("rounded-lg p-3 text-xs leading-relaxed flex gap-2", zoneClass)}>
                            <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>{msg}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryBreakdown;
