import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import DiagnosisRadarChart from '@/components/report/RadarChart'
import { FEEDBACK_DB, getStageInfo } from '@/data/feedback'
import { PrintButton, ExpertRequestButton, ReportHeaderActions } from '@/components/report/ReportActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GrowthAnalysis from '@/components/report/GrowthAnalysis'
import { History, ArrowLeft, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react'
import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'
import ConsultantBanner from '@/components/report/ConsultantBanner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ReportPageProps {
    params: Promise<{ id: string }>
}

export default async function DynamicReportPage({ params }: ReportPageProps) {
    // TEST: Is this page even being reached?
    // return redirect('/login') 

    const { id } = await params
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Fetch record and current user's profile in parallel for security checks
    const [recordRes, currentUserRes] = await Promise.all([
        supabase
            .from('diagnosis_records')
            .select(`
                *,
                profiles (
                    user_name,
                    company_name,
                    stage,
                    industry,
                    group_id
                )
            `)
            .eq('id', id)
            .single(),
        supabase
            .from('profiles')
            .select('role, group_id')
            .eq('id', user.id)
            .single()
    ])

    const { data: record, error } = recordRes
    const { data: currentUserProfile } = currentUserRes

    if (error || !record) {
        // console.error("Report not found:", error)
        // return notFound()
        return (
            <div className="p-20 bg-red-50 text-[10px] font-mono whitespace-pre">
                ERROR: {JSON.stringify(error, null, 2)}
                RECORD FOUND: {String(!!record)}
                USER_ID: {user?.id}
                QUERY_ID: {id}
            </div>
        )
    }

    // Handle profiles join result which can be an array or a single object
    const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;

    // Security check: owner, super_admin, or correct group_admin
    const recordUserId = record.user_id?.toString().toLowerCase();
    const currentUserId = user.id?.toString().toLowerCase();
    const isOwner = recordUserId === currentUserId;
    
    // DEBUG: Always allow and log for now
    if (!isOwner) {
        if (currentUserProfile?.role !== 'super_admin') {
            // For group_admin, check if the record's user belongs to their group
            if (currentUserProfile?.role !== 'group_admin' || profile?.group_id !== currentUserProfile?.group_id) {
                console.log("DEBUG: Access would be denied. Record owner:", record.user_id, "Current user:", user.id);
                // return redirect('/dashboard') // TEMPORARILY DISABLED FOR DEBUGGING
            }
        }
    }

    // 3. Fetch previous record and questions in parallel
    const [previousRes, questions] = await Promise.all([
        supabase
            .from('diagnosis_records')
            .select('*')
            .eq('user_id', record.user_id)
            .lt('created_at', record.created_at)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        getDiagnosisQuestions({
            stage: profile?.stage || 'P', // Provide defaults if profile is missing
            industry: profile?.industry || 'I'
        })
    ])

    const previousRecord = previousRes.data

    const maxScores: Record<string, number> = {}
    questions.forEach(q => {
        const w = q.score_weight || 1
        maxScores[q.dimension] = (maxScores[q.dimension] || 0) + w
    })

    const dimensionScores = record.dimension_scores as Record<string, number>
    const totalScore = record.total_score || 0
    const stageInfo = getStageInfo(totalScore)

    const DIMENSION_KR: Record<string, string> = {
        D1: '시장분석', D2: '문제이해', D3: '해결가치', D4: '실행역량', D5: '기술역량', D6: '수익모델', D7: '성장전략'
    }

    const STAGE_LABELS: Record<string, string> = {
        P: '예비창업', E: '초기창업', V: '벤처/도약', M: '중소/중견'
    }

    const INDUSTRY_LABELS: Record<string, string> = {
        I: 'IT/SaaS', H: '제조/소재/HW', L: '서비스/F&B/로컬', CT: '콘텐츠/IP/지식서비스'
    }

    const profileStageLabel = STAGE_LABELS[profile.stage] || profile.stage
    const profileIndustryLabel = INDUSTRY_LABELS[profile.industry] || profile.industry

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:pb-0">
            {/* DEBUG INFO */}
            <div className="bg-red-50 p-4 border-b border-red-200 text-[10px] font-mono whitespace-pre overflow-auto max-h-40 print:hidden">
                DEBUG: 
                recordUserId:  {recordUserId}
                currentUserId: {currentUserId}
                match:         {String(isOwner)}
                id_from_url:   {id}
                profiles_result: {JSON.stringify(record.profiles, null, 2)}
                role:          {currentUserProfile?.role}
            </div>

            {/* Header - Hidden on Print */}
            <header className="bg-white border-b sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-[17px] font-bold text-gray-900 leading-tight flex items-center gap-2">
                                <img src="/favicon.png" alt="BizDive" className="w-5 h-5 rounded" />
                                상세 진단 결과
                            </h1>
                            <span className="text-xs text-slate-500 font-medium mt-0.5">
                                {record.company_name || profile?.company_name || '회사명 미상'} | {profile?.user_name || '사용자'} | {new Date(record.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <ReportHeaderActions />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">

                {/* Actions Bar - Hidden on Print */}
                <div className="flex justify-end gap-3 mb-6 print:hidden">
                    <PrintButton />
                    <ExpertRequestButton />
                </div>

                {/* Print Only Header */}
                <div className="hidden print:block mb-8 border-b pb-4">
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-2 text-indigo-900">
                            <img src="/favicon.png" alt="BizDive" className="w-5 h-5 rounded" />
                            <span className="font-bold text-sm tracking-tight">BizDive</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">BizDive 기업경영 심층진단 리포트</h1>
                        <p className="text-slate-500 mt-3 font-medium">
                            {record.company_name || profile?.company_name || '회사명 미상'} | {profile?.user_name || '사용자'} | {new Date(record.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-slate-500 mt-1 font-medium text-sm">
                            [ {profileStageLabel} | {profileIndustryLabel} ]
                        </p>
                    </div>
                </div>

                {/* Top Overview Card */}
                <div className="bg-white shadow rounded-xl overflow-hidden mb-8 border border-gray-100 print:mb-4 print:shadow-none print:border">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 print:p-5 text-white">
                        <div className="md:flex md:items-start md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none text-xs">
                                        Stage {record.stage_result}
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

                    <div className="bg-[#0f172a] px-5 sm:px-8 py-8 print:px-5 print:py-5 text-slate-300 print:bg-white print:text-slate-800 border-t print:border-slate-200">
                        <div className="flex items-center gap-2 text-white font-bold text-[16px] mb-6 print:mb-4 print:text-slate-900">
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
                                <hr className="border-slate-700/60 my-5 print:border-slate-200" />
                                <div className="space-y-1.5">
                                    {stageInfo.terms.map((term: string, idx: number) => (
                                        <p key={idx} className="text-[13px] text-slate-400 print:text-slate-500">
                                            {term}
                                        </p>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 print:gap-4 print:grid-cols-1 print:break-inside-avoid">

                    {/* Left Column: Radar Chart & Growth Analysis */}
                    <div className="space-y-8 lg:space-y-10">
                        {/* Radar Chart */}
                        <Card className="shadow-lg border-gray-100/50 rounded-2xl print:shadow-none print:border h-fit overflow-hidden bg-white">
                            <CardHeader className="pb-4 border-b border-gray-50 bg-slate-50/30">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-800">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                                        </div>
                                        <span className="text-xl font-bold tracking-tight">7-Dimension 밸런스</span>
                                    </div>
                                    {previousRecord && (
                                        <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 flex items-center gap-1.5 border border-slate-200">
                                            <History className="w-3.5 h-3.5" />
                                            이전 진단과 비교
                                        </div>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center py-10">
                                <DiagnosisRadarChart
                                    sectionScores={dimensionScores}
                                    previousScores={previousRecord?.dimension_scores as Record<string, number> | undefined}
                                />
                            </CardContent>
                        </Card>

                        {/* Growth Analysis (Left Column) */}
                        {previousRecord && (
                            <GrowthAnalysis
                                current={record}
                                previous={previousRecord}
                                maxScores={maxScores}
                            />
                        )}
                    </div>

                    {/* Right Column: Detailed Feedback List */}
                    <Card className="shadow-lg border-gray-100/50 rounded-2xl print:shadow-none print:border h-fit bg-white print:mt-4">
                        <CardHeader className="pb-5 border-b border-gray-50 bg-slate-50/30 print:pb-4">
                            <CardTitle className="flex items-center gap-2.5 text-slate-800">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-blue-100 text-blue-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                </div>
                                <span className="text-[16px] font-bold tracking-tight">항목별 정밀 분석</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-7">
                            {Object.keys(dimensionScores).sort().map((dim, idx) => {
                                const score = dimensionScores[dim]
                                const maxScore = maxScores[dim] || 15
                                const rawScore = (score / 100) * maxScore

                                let level = 'mid'
                                if (score >= 80) level = 'high'
                                else if (score < 40) level = 'low'

                                const feedback = (FEEDBACK_DB as Record<string, any>)[dim as string]?.[level] || "분석 데이터가 충분하지 않습니다."

                                return (
                                    <div key={dim} className="group print:break-inside-avoid">
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

                <ConsultantBanner />
            </main>
        </div>
    )
}
