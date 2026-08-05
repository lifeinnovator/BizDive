'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Database } from '@/types/database'
import QuestionSection from './QuestionSection'
import { Button } from '@/components/ui/button'
import { CheckCircle2, X } from 'lucide-react'
import { STAGE_UNIT_SCORES, computeSectionScore, getGrade, type Stage, type Dimension } from '@/lib/scoring-utils'
import type { CampaignDiagnosisContext, CampaignQuestion } from '@/lib/campaign-diagnosis'

type Question = Database['public']['Tables']['questions']['Row'] | CampaignQuestion

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
    campaignContext?: CampaignDiagnosisContext | null
}

export default function DiagnosisForm({
    questions,
    userId,
    profile,
    isGuest = false,
    round = 1,
    projectId = null,
    campaignContext = null
}: DiagnosisFormProps) {
    const router = useRouter()
    const [answers, setAnswers] = useState<Record<string, boolean>>({})
    const [currentStep, setCurrentStep] = useState(0)
    const [draftReady, setDraftReady] = useState(false)

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

    const draftKey = useMemo(
        () => `bizdive_diagnosis_draft:${userId || profile.email || 'guest'}:${campaignContext?.assignmentId || projectId || 'individual'}:${round}`,
        [campaignContext?.assignmentId, profile.email, projectId, round, userId]
    )

    useEffect(() => {
        try {
            const savedDraft = sessionStorage.getItem(draftKey)
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft) as { answers?: Record<string, unknown>; currentStep?: number }
                const restoredAnswers = Object.fromEntries(
                    Object.entries(parsed.answers || {}).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
                )
                setAnswers(restoredAnswers)
                if (Number.isInteger(parsed.currentStep) && sections.length > 0) {
                    setCurrentStep(Math.min(Math.max(parsed.currentStep || 0, 0), sections.length - 1))
                }
            }
        } catch {
            sessionStorage.removeItem(draftKey)
        } finally {
            setDraftReady(true)
        }
    }, [draftKey, sections.length])

    useEffect(() => {
        if (!draftReady) return
        sessionStorage.setItem(draftKey, JSON.stringify({ answers, currentStep }))
    }, [answers, currentStep, draftKey, draftReady])

    // Calculate scores
    const { totalScore, sectionScores, sectionMaxScores } = useMemo(() => {
        const calculatedSectionScores: Record<string, number> = {}
        const earnedScores: Record<string, number> = {}
        const maxScores: Record<string, number> = {}
        let scoreSum = 0

        const userStage = ((profile?.stage as string) || 'P') as Stage
        const unitScores = STAGE_UNIT_SCORES[userStage] || STAGE_UNIT_SCORES['P']

        sections.forEach(sec => {
            const unitScore = unitScores[sec.id as Dimension] || 1.0

            // Map questions to { points, checked } for utility
            const items = sec.questions.map((q) => {
                const questionKey = q.id
                const checked = answers[questionKey] === true
                return { points: campaignContext ? q.score_weight : unitScore, checked }
            })

            const result = computeSectionScore(items)

            // Section Score for Radar Chart (0-100%)
            calculatedSectionScores[sec.id] = result.score

            // Raw Scores for Detailed Breakdown
            earnedScores[sec.id] = result.earned
            maxScores[sec.id] = result.total

            // Total Score for Result (Sum of all Earned Points)
            scoreSum += result.earned
        })

        return {
            totalScore: Math.round(scoreSum * 10) / 10,
            sectionScores: calculatedSectionScores,
            sectionMaxScores: maxScores
        }
    }, [answers, sections, profile, campaignContext])

    const handleAnswerChange = (questionId: string, checked: boolean) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: checked,
        }))
    }

    const handleNextStep = () => {
        if (currentStep < sections.length - 1) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleViewReport = async () => {
        if (!campaignContext && totalScore === 0) {
            alert('최소 1개 이상의 문항에 응답해주세요.')
            return
        }

        let newRecordId: string | null = null;
        try {
            if (campaignContext) {
                const response = await fetch('/api/diagnosis/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assignmentId: campaignContext.assignmentId, responses: answers }),
                })
                const payload = await response.json()
                if (!response.ok) throw new Error(payload.error || '진단을 저장하지 못했습니다.')
                newRecordId = payload.recordId
                const previewData = {
                    answers: payload.normalizedResponses,
                    totalScore: payload.totalScore,
                    sectionScores: payload.dimensionScores,
                    sectionMaxScores: payload.dimensionMaxScores,
                    profile, isGuest, userId, round, projectId, recordId: newRecordId,
                    campaignId: campaignContext.campaignId,
                    templateVersionId: campaignContext.templateVersionId,
                }
                sessionStorage.setItem('bizdive_report_preview', JSON.stringify(previewData))
                sessionStorage.removeItem(draftKey)
                router.push('/report/preview')
                return
            }
            const { createClient } = await import('@/lib/supabase');
            const supabase = createClient();
            
            const stageResult = getGrade(totalScore);

            const { data: recordData, error } = await supabase.from('diagnosis_records').insert({
                user_id: !isGuest && userId ? userId : null,
                responses: answers,
                total_score: totalScore,
                dimension_scores: sectionScores,
                stage_result: stageResult,
                round: round,
                project_id: projectId,
                guest_name: isGuest ? profile.user_name || profile.name : null,
                guest_email: isGuest ? profile.email : null,
                guest_company: isGuest ? profile.company_name : null,
                guest_stage: isGuest ? profile.stage : null,
                guest_industry: isGuest ? profile.industry : null
            }).select('id').single();

            if (!error && recordData) {
                newRecordId = recordData.id;
            } else if (error) {
                console.error("Auto-save error:", error);
            }
        } catch (err) {
            console.error("Failed to auto-save diagnosis:", err);
            if (campaignContext) {
                alert(err instanceof Error ? err.message : '진단을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.')
                return
            }
        }

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
            recordId: newRecordId 
        }
        sessionStorage.setItem('bizdive_report_preview', JSON.stringify(previewData))
        sessionStorage.removeItem(draftKey)
        router.push('/report/preview')
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const currentSection = sections[currentStep]
    const isLastStep = currentStep === sections.length - 1

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">

            {/* Focus Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity">
                        <img src="/BizDive_Logo_Confirm.png" alt="BizDive" className="h-8 sm:h-10 w-auto flex-shrink-0" />
                        <div className="border-l border-slate-200 pl-3 sm:pl-4 min-w-0">
                            <h1 className="text-[13px] sm:text-[14px] font-bold text-slate-700 tracking-tight mb-0.5 truncate">
                                7D 기업경영 심층자가진단
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
                                <span>{profile.company_name}</span>
                                <span className="opacity-30">|</span>
                                <span>{profile.user_name || profile.name}</span>
                                <span className="opacity-30 hidden sm:inline">|</span>
                                <span className="hidden sm:inline">{dateStr}</span>
                            </div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (confirm('진단을 중단하고 메인으로 돌아가시겠습니까? 진행 내용은 현재 브라우저 탭에 임시 저장됩니다.')) {
                                    router.push('/')
                                }
                            }}
                            className="rounded-xl hover:bg-slate-100"
                            aria-label="진단을 중단하고 메인으로 돌아가기"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Progress Indicator */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <p className="mb-3 text-center text-[11px] font-medium text-slate-400" aria-live="polite">
                        진행 내용이 현재 브라우저에 자동 저장됩니다.
                    </p>
                    <div className="flex items-center justify-between gap-2">
                        {sections.map((sec, idx) => (
                            <div key={sec.id} className="flex-1 flex flex-col items-center gap-2">
                                <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                                    idx < currentStep ? 'bg-indigo-600' :
                                    idx === currentStep ? 'bg-indigo-500' : 'bg-slate-200'
                                }`} />
                                <span className={`text-[10px] font-bold ${
                                    idx <= currentStep ? 'text-indigo-600' : 'text-slate-400'
                                }`}>
                                    {sec.id}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 pb-32">
                {campaignContext && (
                    <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{campaignContext.assessmentType === 'expert' ? '진단위원 진단' : '프로젝트 자가진단'} · {campaignContext.round}회차</p>
                        <p className="mt-1 font-semibold text-slate-900">{campaignContext.campaignName}</p>
                    </div>
                )}
                <div className="space-y-8 animate-fade-in-up" key={currentStep}>
                        {/* Chapter Title */}
                        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-soft">
                            <div className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                Chapter {currentStep + 1} of {sections.length}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                                {currentSection.title}
                            </h2>
                            <p className="text-slate-500 text-base leading-relaxed">
                                {currentSection.desc}
                            </p>
                        </div>

                        {/* Questions */}
                        <div>
                            <QuestionSection
                                section={currentSection}
                                sectionIndex={currentStep}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                            />
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex items-center justify-between pt-8">
                            <Button
                                variant="outline"
                                onClick={handlePrevStep}
                                disabled={currentStep === 0}
                                className="rounded-xl px-6 py-6 font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                이전 단계
                            </Button>

                            {!isLastStep ? (
                                <Button
                                    onClick={handleNextStep}
                                    className="rounded-xl px-8 py-6 bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-200"
                                >
                                    다음 단계로
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleViewReport}
                                    disabled={Object.keys(answers).length === 0}
                                    className="rounded-xl px-8 py-6 bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={20} />
                                        진단 완료 & 리포트 확인
                                    </div>
                                </Button>
                            )}
                        </div>
                </div>
            </main>
        </div>
    )
}


// Helpers for Dimension Info (Mock/Static for now)
function getDimensionTitle(key: string) {
    const titles: Record<string, string> = {
        D1: '시장 기회',
        D2: '문제 정의',
        D3: '해결 가치',
        D4: '실행 역량',
        D5: '기술/구현',
        D6: '비즈니스 모델',
        D7: '성장 전략'
    }
    return titles[key] || key
}

function getDimensionDesc(key: string) {
    const descs: Record<string, string> = {
        D1: '시장의 크기와 트렌드, 외부 환경 기회를 분석하는 첫 번째 단계',
        D2: '고객이 겪는 실제 불편함과 해결 과제를 정의하는 핵심 단계',
        D3: '우리만이 제공할 수 있는 독보적인 가치(UVP)를 설계하는 단계',
        D4: '팀의 구성, 전문성, 실행 의지 등 인적 자원을 평가하는 단계',
        D5: '솔루션을 실제로 만들어낼 수 있는 기술적 실체와 공정을 점검하는 단계',
        D6: '수익 구조, 가격 전략 등 경제적 지속 가능성을 확인하는 단계',
        D7: '확장성, 마케팅 로드맵, 그리고 ESG 기반의 지속성을 평가하는 단계'
    }
    return descs[key] || ''
}
