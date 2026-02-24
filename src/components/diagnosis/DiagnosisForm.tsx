'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Database } from '@/types/database'
import QuestionSection from './QuestionSection'
import { Button } from '@/components/ui/button'
import { CheckCircle2, X } from 'lucide-react'

type Question = Database['public']['Tables']['questions']['Row']

export interface ProfileData {
    email?: string;
    user_name?: string;
    name?: string;
    company_name?: string;
    stage?: string;
    industry?: string;
    user_title?: string;
    [key: string]: unknown;
}

interface DiagnosisFormProps {
    questions: Question[]
    userId: string
    profile: ProfileData
    isGuest?: boolean
    round?: number
    projectId?: string | null
}

export default function DiagnosisForm({
    questions,
    userId,
    profile,
    isGuest = false,
    round = 1,
    projectId = null
}: DiagnosisFormProps) {
    const router = useRouter()
    const [answers, setAnswers] = useState<Record<string, boolean>>({})

    const searchParams = useSearchParams()

    // Group questions by dimension
    const sections = useMemo(() => {
        const groups: Record<string, Question[]> = {}
        questions.forEach(q => {
            if (!groups[q.dimension]) groups[q.dimension] = []
            groups[q.dimension].push(q)
        })

        // Ensure order D1..D7
        const sectionOrder = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']
        return sectionOrder.map(key => ({
            id: key,
            title: getDimensionTitle(key),
            desc: getDimensionDesc(key),
            maxScore: groups[key]?.reduce((sum, q) => sum + (q.score_weight || 1), 0) || 0,
            questions: groups[key] || []
        })).filter(s => s.questions.length > 0)
    }, [questions])

    // Calculate scores
    const { totalScore, sectionScores, sectionEarnedScores, sectionMaxScores } = useMemo(() => {
        const calculatedSectionScores: Record<string, number> = {}
        const earnedScores: Record<string, number> = {}
        const maxScores: Record<string, number> = {}
        let scoreSum = 0

        sections.forEach(sec => {
            let sectionEarned = 0
            let sectionTotal = 0

            // Map questions to { weight, checked } for utility
            const items = sec.questions.map((q, idx) => {
                const questionKey = `${sec.id}_${idx}`
                const weight = q.score_weight || 1
                const checked = answers[questionKey] === true
                return { weight, checked }
            })

            items.forEach(item => {
                sectionTotal += item.weight
                if (item.checked) {
                    sectionEarned += item.weight
                }
            })

            // Section Score for Radar Chart (0-100%)
            calculatedSectionScores[sec.id] = sectionTotal > 0
                ? (sectionEarned / sectionTotal) * 100
                : 0

            // Raw Scores for Detailed Breakdown
            earnedScores[sec.id] = sectionEarned
            maxScores[sec.id] = sectionTotal

            // Total Score for Result (Sum of all Earned Weights)
            scoreSum += sectionEarned
        })

        return {
            totalScore: scoreSum,
            sectionScores: calculatedSectionScores,
            sectionEarnedScores: earnedScores,
            sectionMaxScores: maxScores
        }
    }, [answers, sections])

    const handleAnswerChange = (questionId: string, checked: boolean) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: checked,
        }))
    }

    const handleViewReport = () => {
        if (totalScore === 0) {
            alert('최소 1개 이상의 문항에 응답해주세요.')
            return
        }

        // Save diagnosis data to sessionStorage for the preview page
        const previewData = {
            answers,
            totalScore,
            sectionScores,
            sectionMaxScores,
            profile,
            isGuest,
            userId,
            round,
            projectId,
        }
        sessionStorage.setItem('bizdive_report_preview', JSON.stringify(previewData))
        router.push('/report/preview')
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    return (
        <div className="min-h-screen bg-slate-50/50">

            {/* Focus Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/favicon.png" alt="BizDive" className="w-8 h-8 rounded-xl shadow-sm" />
                        <div>
                            <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">
                                BizDive - 7D 기업경영 심층자가진단
                            </h1>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                <span>{profile.company_name}</span>
                                <span className="opacity-30">|</span>
                                <span>{profile.user_name || profile.name}</span>
                                <span className="opacity-30">|</span>
                                <span>{dateStr}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (confirm('진단을 중단하고 메인으로 돌아가시겠습니까? 입력 중인 내용은 저장되지 않습니다.')) {
                                    router.push('/')
                                }
                            }}
                            className="rounded-xl hover:bg-slate-100"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-12 pb-32">
                <div className="space-y-12">
                    {/* 진단 안내 */}
                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">진단 안내</h2>
                        <p className="text-slate-600 text-[14px] leading-relaxed mb-3">
                            본 기업현황 자가진단은 서비스 디자인 방법론(Double Diamond)과 PSST 사업계획 방법론, 전략컨설팅 프레임워크 방법론 등을 융합하여 설계된 고도화된 경영 진단 도구입니다. 시장 기회 탐색부터 사업성 검증까지 7가지 핵심 영역을 입체적으로 정밀 분석합니다.
                        </p>
                        <p className="text-slate-600 text-[14px] leading-relaxed mb-6">
                            이를 통해 기업은 현재의 성장 단계를 명확히 인지하고, 다음 단계로 도약하기 위한 구체적인 실행 전략을 수립할 수 있습니다.
                        </p>
                        <div className="flex flex-wrap justify-between items-center text-[13px] text-slate-500 border-t border-slate-200 pt-4">
                            <span className="font-semibold">※ 총 {questions.length}문항 (100점 만점)</span>
                            <span className="text-slate-400">(항목 중요도에 따라 1.0~2.0점 배점 자동 적용)</span>
                        </div>
                    </div>

                    {/* Questions Grouped by Sections */}
                    <div className="space-y-16">
                        {sections.map((section, idx) => (
                            <div key={section.id} className="animate-fade-in">
                                <QuestionSection
                                    section={section}
                                    sectionIndex={idx}
                                    answers={answers}
                                    onAnswerChange={handleAnswerChange}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Completion Action */}
                    <div className="pt-12 border-t border-slate-200">
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10 max-w-md mx-auto">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4 backdrop-blur-sm border border-white/10">
                                    <CheckCircle2 size={24} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 tracking-tight">진단 체크를 완료하셨나요?</h3>
                                <p className="text-slate-400 text-sm font-medium opacity-90 mb-5 leading-relaxed">
                                    진솔한 의견이 특별한 기업진단을 제공합니다.<br />
                                    7D 심층 분석 리포트를 확인하세요.
                                </p>
                                <Button
                                    onClick={handleViewReport}
                                    disabled={Object.keys(answers).length === 0}
                                    className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-black/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={20} />
                                        심층 진단 리포트 확인하기
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


// Helpers for Dimension Info (Mock/Static for now)
function getDimensionTitle(key: string) {
    const titles: Record<string, string> = {
        D1: '시장분석 (Market Analysis)',
        D2: '문제이해 (Problem)',
        D3: '해결가치 (Solution)',
        D4: '실행역량 (ExecutionContext)',
        D5: '기술역량 (Tech/Product)',
        D6: '수익모델 (Business Model)',
        D7: '성장전략 (Growth Strategy)'
    }
    return titles[key] || key
}

function getDimensionDesc(key: string) {
    const descs: Record<string, string> = {
        D1: '시장 규모와 성장성을 분석합니다.',
        D2: '타겟 고객과 문제 정의의 명확성을 점검합니다.',
        D3: '경쟁사 대비 핵심 경쟁력을 진단합니다.',
        D4: '팀 구성과 실행 역량을 평가합니다.',
        D5: '제품/서비스 개발 및 기술 안정성을 확인합니다.',
        D6: '비즈니스 모델과 수익 구조를 분석합니다.',
        D7: '시장 확장 및 스케일업 가능성을 예측합니다.'
    }
    return descs[key] || ''
}
