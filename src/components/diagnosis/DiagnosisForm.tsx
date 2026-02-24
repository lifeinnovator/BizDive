'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'
import QuestionSection from './QuestionSection'
import RadarChart from '../report/RadarChart'
import CategoryBreakdown from './CategoryBreakdown'
import DiagnosisDetail from './DiagnosisDetail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Radar, CheckCircle2, ArrowLeft, X, Mail, Lock, Phone, User } from 'lucide-react'
import { getStageInfo } from '@/data/feedback'
import { getGrade } from '@/lib/scoring-utils'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'

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
    const [isSaving, setIsSaving] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)

    // Registration Form State
    const [regPassword, setRegPassword] = useState('')
    const [regContact, setRegContact] = useState('')
    const [regLoading, setRegLoading] = useState(false)
    const [regError, setRegError] = useState<string | null>(null)

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

    const stageInfo = getStageInfo(totalScore)

    const handleAnswerChange = (questionId: string, checked: boolean) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: checked,
        }))
    }

    const handleSaveClick = () => {
        if (totalScore === 0) {
            alert('최소 1개 이상의 문항에 응답해주세요.')
            return
        }

        if (isGuest) {
            setShowRegisterModal(true)
        } else {
            handleSaveResult(userId)
        }
    }

    const handleRegisterAndSave = async () => {
        if (!regPassword || regPassword.length < 6) {
            setRegError('비밀번호는 6자 이상이어야 합니다.')
            return
        }
        if (!regContact) {
            setRegError('연락처를 입력해주세요.')
            return
        }

        setRegLoading(true)
        setRegError(null)
        const supabase = createClient()

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: profile.email || '',
                password: regPassword,
                options: {
                    data: {
                        display_name: profile.user_name,
                        contact: regContact
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('회원가입 실패 (User creation failed)')

            // 2. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: profile.email,
                    user_name: profile.user_name,
                    company_name: profile.company_name,
                    stage: profile.stage,
                    industry: profile.industry,
                    user_title: profile.user_title,
                    updated_at: new Date().toISOString()
                })

            if (profileError) throw profileError

            // 3. Save Diagnosis Result
            await handleSaveResult(authData.user.id)

            // Clear session guest data
            sessionStorage.removeItem('bizdive_guest')

        } catch (error: unknown) {
            console.error('Registration/Save Error:', error)

            if (error instanceof Error && error.message.includes('already registered')) {
                setRegError('이미 가입된 이메일입니다. 로그인 후 이용해주세요.')
            } else {
                setRegError(error instanceof Error ? error.message : '가입 및 저장 중 오류가 발생했습니다.')
            }
            setRegLoading(false)
        }
    }

    const handleSaveResult = async (targetUserId: string) => {
        setIsSaving(true)
        const supabase = createClient()

        try {
            const stageResult = getGrade(totalScore)

            const { data: newDiagnosis, error } = await supabase
                .from('diagnosis_records')
                .insert({
                    user_id: targetUserId,
                    responses: answers,
                    total_score: totalScore,
                    dimension_scores: sectionScores,
                    stage_result: stageResult,
                    round: round,
                    project_id: projectId
                })
                .select('id')
                .single()

            if (error) throw error

            router.push(`/report/${newDiagnosis.id}`)
        } catch (error) {
            console.error('Error saving result:', error)
            alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
            // If failed during register-save, restore loading state
            if (isGuest) setRegLoading(false)
        } finally {
            setIsSaving(false)
        }
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    // Calculate progress
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Focus Mode Progress Bar (Sticky) */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-[60] print:hidden">
                <div
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Registration Modal for Guest */}
            <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">진단 결과 저장 및 리포트 발급</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            진단 결과를 영구 저장하고 맞춤형 성장 리포트를 확인하기 위해<br />
                            비밀번호와 연락처를 설정해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-slate-50 p-5 rounded-2xl space-y-3 text-sm border border-slate-100">
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="font-bold">성함</span>
                                <span className="font-black text-slate-900">{profile.user_name}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="font-bold">이메일</span>
                                <span className="font-black text-slate-900">{profile.email}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="font-bold">기업명</span>
                                <span className="font-black text-slate-900">{profile.company_name}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">비밀번호 설정</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="6자 이상 입력"
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">연락처</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="010-0000-0000"
                                    className="pl-11 h-12 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
                                    value={regContact}
                                    onChange={(e) => setRegContact(e.target.value)}
                                />
                            </div>
                        </div>

                        {regError && (
                            <div className="text-destructive text-xs font-bold bg-destructive/5 p-3 rounded-xl flex items-center gap-2 border border-destructive/10">
                                <X className="h-4 w-4" />
                                {regError}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowRegisterModal(false)} className="rounded-xl font-bold">취소</Button>
                        <Button
                            onClick={handleRegisterAndSave}
                            disabled={regLoading}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold h-11 px-6 shadow-lg shadow-slate-200"
                        >
                            {regLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    저장 중...
                                </>
                            ) : '회원가입 및 결과 확인'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Focus Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/favicon.png" alt="BizDive" className="w-8 h-8 rounded-xl shadow-sm" />
                        <div>
                            <h1 className="text-base font-black text-slate-900 tracking-tight">
                                7D 기업경영 심층자가진단
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>{profile.company_name}</span>
                                <span className="opacity-30">|</span>
                                <span>{profile.user_name || profile.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PROGRESS</span>
                            <span className="text-sm font-black text-indigo-600">{Math.round(progressPercentage)}% <span className="text-slate-300 font-bold ml-0.5">({answeredCount}/{totalQuestions})</span></span>
                        </div>
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
                    {/* Intro Card */}
                    <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                                <Radar size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">비즈니스의 본질을 꿰뚫는 7가지 입체 진단</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed text-justify">
                                BizDive의 7D 프레임워크는 시장 기회 탐색부터 사업성 검증까지 전 과정을 정밀 분석합니다.
                                솔직하고 객관적인 답변은 기업의 현재 위치를 정확히 파악하고, 다음 단계(Scale-up)로 도약하기 위한 가장 강력한 무기가 됩니다.
                                <br /><br />
                                <span className="text-indigo-600 font-bold italic">※ 총 {questions.length}개 문항 • 예상 소요 시간 5~10분</span>
                            </p>
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
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10 max-w-md mx-auto">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/10">
                                    <CheckCircle2 size={32} className="text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 tracking-tight">모든 진단 항목에 응답하셨습니다</h3>
                                <p className="text-slate-400 text-sm font-medium opacity-90 mb-8 leading-relaxed">
                                    {answeredCount < totalQuestions
                                        ? (
                                            <>
                                                7가지 항목의 자가진단 항목에 답변을 완료하셨습니다.<br />
                                                데이터의 정확도를 위해 모든 문항을 확인해 주세요.
                                            </>
                                        )
                                        : '제공해주신 데이터를 정밀하게 분석하여, 우리 기업의 현재 위치와 맞춤형 성장 전략이 담긴 리포트를 생성합니다.'}
                                </p>
                                <Button
                                    onClick={handleSaveClick}
                                    disabled={isSaving || answeredCount === 0}
                                    className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-black/10"
                                >
                                    {isSaving ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            데이터 분석 및 리포트 생성 중...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Save size={20} />
                                            심층 진단 리포트 확인하기
                                        </div>
                                    )}
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
