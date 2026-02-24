'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DiagnosisRadarChart from '@/components/report/RadarChart'
import { FEEDBACK_DB, getStageInfo } from '@/data/feedback'
import { getGrade } from '@/lib/scoring-utils'
import { CheckCircle2, HelpCircle, ArrowLeft, Save, Loader2, Lock, Phone, X, User, Mail, Building2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'

interface PreviewData {
    answers: Record<string, boolean>
    totalScore: number
    sectionScores: Record<string, number>
    sectionMaxScores: Record<string, number>
    profile: {
        email?: string
        user_name?: string
        company_name?: string
        stage?: string
        industry?: string
        user_title?: string
        [key: string]: unknown
    }
    isGuest: boolean
    userId: string
    round: number
    projectId: string | null
}

const DIMENSION_KR: Record<string, string> = {
    D1: '시장분석', D2: '문제이해', D3: '해결가치', D4: '실행역량', D5: '기술역량', D6: '수익모델', D7: '성장전략'
}

const STAGE_LABELS: Record<string, string> = {
    P: '예비창업', E: '초기창업', V: '벤처/도약', M: '중소/중견'
}

const INDUSTRY_LABELS: Record<string, string> = {
    I: 'IT/SaaS', H: '제조/소재/HW', L: '서비스/F&B/로컬', CT: '콘텐츠/IP/지식서비스'
}

export default function ReportPreviewPage() {
    const router = useRouter()
    const [data, setData] = useState<PreviewData | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Registration modal state (for guest users)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [regPassword, setRegPassword] = useState('')
    const [regContact, setRegContact] = useState('')
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regCompany, setRegCompany] = useState('')
    const [regLoading, setRegLoading] = useState(false)
    const [regError, setRegError] = useState<string | null>(null)

    useEffect(() => {
        const stored = sessionStorage.getItem('bizdive_report_preview')
        if (!stored) {
            router.replace('/diagnosis')
            return
        }
        setData(JSON.parse(stored))
    }, [router])

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-slate-500 font-medium">리포트를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    const { totalScore, sectionScores, sectionMaxScores, profile, isGuest, userId, answers, round, projectId } = data
    const stageInfo = getStageInfo(totalScore)
    const profileStageLabel = STAGE_LABELS[profile.stage || ''] || profile.stage || ''
    const profileIndustryLabel = INDUSTRY_LABELS[profile.industry || ''] || profile.industry || ''

    // Save result to DB (for logged-in users)
    const handleSaveResult = async (targetUserId: string) => {
        setIsSaving(true)
        const supabase = createClient()

        try {
            const stageResult = getGrade(totalScore)

            const { error } = await supabase
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

            if (error) throw error

            // Clean up sessionStorage
            sessionStorage.removeItem('bizdive_report_preview')
            router.push('/dashboard')
        } catch (error) {
            console.error('Error saving result:', error)
            alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
        } finally {
            setIsSaving(false)
        }
    }

    // Register guest and save
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
            const finalName = regName || profile.user_name || ''
            const finalEmail = regEmail || profile.email || ''
            const finalCompany = regCompany || profile.company_name || ''

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: finalEmail,
                password: regPassword,
                options: {
                    data: {
                        display_name: finalName,
                        contact: regContact
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('회원가입 실패 (User creation failed)')

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: finalEmail,
                    user_name: finalName,
                    company_name: finalCompany,
                    stage: profile.stage,
                    industry: profile.industry,
                    user_title: profile.user_title,
                    updated_at: new Date().toISOString()
                })

            if (profileError) throw profileError

            await handleSaveResult(authData.user.id)
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

    const handleSaveClick = () => {
        if (isGuest) {
            // Initialize editable fields with current profile values
            setRegName(profile.user_name || '')
            setRegEmail(profile.email || '')
            setRegCompany(profile.company_name || '')
            setShowRegisterModal(true)
        } else {
            handleSaveResult(userId)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12 print:bg-white print:pb-0">
            {/* Nav Header — identical to report/[id]/page.tsx */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[17px] font-bold text-slate-900 leading-tight flex items-center gap-2">
                                <img src="/favicon.png" alt="BizDive" className="w-5 h-5 rounded" />
                                BizDive - 상세 진단 결과
                            </h1>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {profile.company_name} | {profile.user_name} | {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Registration Modal for Guest */}
            <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">진단 결과 저장 및 회원가입</DialogTitle>
                        <DialogDescription className="text-xs font-normal text-slate-500">
                            진단 결과를 저장하고 대시보드에서 관리하기 위해 정보를 확인해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">성함</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="성함을 입력해주세요"
                                        className="pl-10 h-10 rounded-lg border-slate-200 text-sm font-medium"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">이메일</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="이메일 주소"
                                        className="pl-10 h-10 rounded-lg border-slate-200 text-sm font-medium"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">기업명</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="기업명을 입력해주세요"
                                        className="pl-10 h-10 rounded-lg border-slate-200 text-sm font-medium"
                                        value={regCompany}
                                        onChange={(e) => setRegCompany(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-2">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">비밀번호 설정</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="6자 이상 입력"
                                        className="pl-10 h-10 rounded-lg border-slate-200 text-sm font-medium"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">연락처</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="010-0000-0000"
                                        className="pl-10 h-10 rounded-lg border-slate-200 text-sm font-medium"
                                        value={regContact}
                                        onChange={(e) => setRegContact(e.target.value)}
                                    />
                                </div>
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
                        <Button variant="ghost" onClick={() => setShowRegisterModal(false)} className="rounded-xl font-medium">취소</Button>
                        <Button
                            onClick={handleRegisterAndSave}
                            disabled={regLoading}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-semibold h-11 px-6 shadow-lg shadow-slate-200"
                        >
                            {regLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    저장 중...
                                </>
                            ) : '회원가입 및 결과 저장'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">

                {/* Top Overview Card — exact copy from deployed version */}
                <div className="bg-white shadow rounded-xl overflow-hidden mb-8 border border-gray-100">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
                        <div className="md:flex md:items-start md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none text-xs">
                                        Stage {getGrade(totalScore)}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs">
                                        {profileStageLabel} | {profileIndustryLabel}
                                    </Badge>
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight mb-2">
                                    {stageInfo.stageName}
                                </h2>
                                <p className="text-slate-300 max-w-2xl text-[15px] opacity-90">
                                    {stageInfo.shortDesc}
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 text-right">
                                <span className="block text-xs text-slate-400 font-medium uppercase tracking-wider">Total Score</span>
                                <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-4xl font-extrabold text-white tracking-tight">{totalScore.toFixed(1)}</span>
                                    <span className="text-lg text-slate-400 font-medium">/ 100.0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] px-5 sm:px-8 py-8 text-slate-300 border-t">
                        <div className="flex items-center gap-2 text-white font-bold text-[16px] mb-6">
                            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                            상세 진단 결과
                        </div>

                        <div className="mb-6">
                            <h3 className="text-[14.5px] font-semibold text-indigo-400 mb-2">
                                현황 진단
                            </h3>
                            <p className="leading-relaxed text-[14px]">
                                {stageInfo.diagnosis}
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-[14.5px] font-semibold text-emerald-400 mb-2">
                                전문가 제언
                            </h3>
                            <p className="leading-relaxed text-[14px]">
                                {stageInfo.suggestion}
                            </p>
                        </div>

                        {stageInfo.terms && stageInfo.terms.length > 0 && (
                            <>
                                <hr className="border-slate-700/60 my-5" />
                                <div className="space-y-1.5">
                                    {stageInfo.terms.map((term: string, idx: number) => (
                                        <p key={idx} className="text-[13px] text-slate-400">
                                            {term}
                                        </p>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Left Column: Radar Chart */}
                    <div className="space-y-8 lg:space-y-10">
                        {/* Radar Chart */}
                        <Card className="shadow-lg border-gray-100/50 rounded-2xl h-fit overflow-hidden bg-white">
                            <CardHeader className="pb-4 border-b border-gray-50 bg-slate-50/30">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-800">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                                        </div>
                                        <span className="text-xl font-bold tracking-tight">7-Dimension 밸런스</span>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center py-10">
                                <DiagnosisRadarChart sectionScores={sectionScores} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Detailed Feedback List */}
                    <Card className="shadow-lg border-gray-100/50 rounded-2xl h-fit bg-white">
                        <CardHeader className="pb-5 border-b border-gray-50 bg-slate-50/30">
                            <CardTitle className="flex items-center gap-2.5 text-slate-800">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-blue-100 text-blue-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                </div>
                                <span className="text-[16px] font-bold tracking-tight">항목별 정밀 분석</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-7">
                            {Object.keys(sectionScores).sort().map((dim, idx) => {
                                const score = sectionScores[dim]
                                const maxScore = sectionMaxScores[dim] || 15
                                const rawScore = (score / 100) * maxScore

                                let level: 'high' | 'mid' | 'low' = 'mid'
                                if (score >= 80) level = 'high'
                                else if (score < 40) level = 'low'

                                const feedback = (FEEDBACK_DB as Record<string, Record<string, string>>)[dim]?.[level] || "분석 데이터가 충분하지 않습니다."

                                return (
                                    <div key={dim} className="group">
                                        {/* Header: Title & Score */}
                                        <div className="flex justify-between items-end mb-2.5">
                                            <h4 className="text-[14.5px] font-bold text-gray-900 flex items-center gap-2">
                                                <span className="text-indigo-600 font-bold text-[13px]">{idx + 1}.</span>
                                                {DIMENSION_KR[dim] || dim}
                                            </h4>
                                            <div className="text-right">
                                                <span className="text-[18px] font-extrabold text-slate-800">
                                                    {rawScore.toFixed(1)}
                                                </span>
                                                <span className="text-gray-400 font-medium text-[12.5px] ml-1">/ {maxScore}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3 border border-gray-100">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm bg-amber-400"
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>

                                        {/* Feedback Box */}
                                        <div className="relative bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 sm:p-4 flex gap-3.5 text-[13.5px] text-slate-700 leading-relaxed hover:bg-amber-50 hover:shadow-sm transition-all">
                                            <div className="flex-shrink-0 mt-0.5 text-amber-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                            </div>
                                            <p className="font-medium opacity-90">{feedback}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom CTA Banner — preview-specific */}
                <div className="mt-8">
                    <div className="bg-slate-900 rounded-2xl p-8 text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-3 tracking-tight">진단이 완료되었습니다</h3>
                            <p className="text-slate-300 text-sm mb-6 opacity-90 font-medium">
                                결과를 저장하여 대시보드에서 진단 이력을 관리하고,<br />
                                성장 추이를 추적할 수 있습니다.
                            </p>
                            <Button
                                onClick={handleSaveClick}
                                disabled={isSaving}
                                className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-11 px-8 rounded-xl border-none shadow-lg text-sm"
                            >
                                {isSaving ? "저장 중..." : "진단 결과 저장하기"}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
