
import React from 'react';
import { getStageInfo } from '@/data/feedback';

interface DiagnosisDetailProps {
    totalScore: number;
}

const DiagnosisDetail: React.FC<DiagnosisDetailProps> = ({ totalScore }) => {
    if (totalScore === 0) {
        return (
            <div className="text-center py-8 text-slate-400 animate-fade-in">
                <span className="text-2xl mb-3 block animate-pulse-soft">👈</span>
                <p className="text-sm">
                    좌측의 체크리스트를 클릭하면<br />실시간 정밀 진단이 시작됩니다.
                </p>
            </div>
        );
    }

    const stageInfo = getStageInfo(totalScore);

    if (!stageInfo) return null;

    return (
        <div className="animate-fade-in space-y-4">
            <div>
                <strong className="text-indigo-400 block mb-1 font-bold text-sm">현황 진단</strong>
                <p className="text-slate-300 text-sm leading-relaxed text-justify font-light">
                    {stageInfo.diagnosis}
                </p>
            </div>

            <div>
                <strong className="text-emerald-400 block mb-1 font-bold text-sm">전문가 제언</strong>
                <p className="text-slate-300 text-sm leading-relaxed text-justify font-light">
                    {stageInfo.suggestion}
                </p>
            </div>

            <div className="border-t border-slate-700 pt-3 mt-4">
                {stageInfo.terms?.map((term: string, idx: number) => (
                    <span key={idx} className="block text-xs text-slate-500 leading-relaxed mb-1">
                        {term}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default DiagnosisDetail;
