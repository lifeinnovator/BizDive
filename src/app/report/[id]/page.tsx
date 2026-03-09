export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { FEEDBACK_DB, getStageInfo, ITEMIZED_DIMENSION_KR } from '@/data/feedback'
import { PrintButton, ExpertRequestButton, ReportHeaderActions } from '@/components/report/ReportActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GrowthAnalysis from '@/components/report/GrowthAnalysis'
import { History, ArrowLeft, CheckCircle2, TrendingUp, HelpCircle, MessageSquare, Target, Layers, Info, Trophy, Wrench } from 'lucide-react'
import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'
import ConsultantBanner from '@/components/report/ConsultantBanner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DiagnosisRadarChart from '@/components/report/RadarChart'
import { STAGE_UNIT_SCORES, STAGE_MAX_SCORES } from '@/lib/scoring-utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ReportPageProps {
    params: Promise<{ id: string }>
}

export default async function DynamicReportPage({ params }: ReportPageProps) {
    try {
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
        const { data: currentUserProfile, error: profileError } = currentUserRes

        if (error || !record) {
            console.error("Report not found:", error)
            return notFound()
        }

        if (profileError || !currentUserProfile) {
            console.error("Profile fetch error:", profileError)
            return redirect(`/dashboard?error=profile_not_found&user_id=${user.id}`)
        }

        // Handle profiles join result which can be an array or a single object
        const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;

        // Security check: owner, super_admin, or correct group_admin
        const recordUserId = record.user_id?.toString().toLowerCase();
        const currentUserId = user.id?.toString().toLowerCase();
        const isOwner = recordUserId === currentUserId;

        // DEBUG LOGS for Vercel
        console.log(`[AUTH_DEBUG] record_id: ${id}`);
        console.log(`[AUTH_DEBUG] user.id: ${currentUserId}`);
        console.log(`[AUTH_DEBUG] record.user_id: ${recordUserId}`);
        console.log(`[AUTH_DEBUG] isOwner: ${isOwner}`);
        console.log(`[AUTH_DEBUG] currentUserProfile.role: ${currentUserProfile?.role}`);

        if (!isOwner) {
            if (currentUserProfile?.role !== 'super_admin') {
                if (currentUserProfile?.role !== 'group_admin' || profile?.group_id !== currentUserProfile?.group_id) {
                    console.error("[AUTH_ERROR] Access Denied. Redirecting to /dashboard.", {
                        currentUserId,
                        recordUserId,
                        currentUserRole: currentUserProfile?.role,
                        profileGroupId: profile?.group_id,
                        currentUserGroupId: currentUserProfile?.group_id
                    });
                    return redirect(`/dashboard?error=access_denied&uid=${currentUserId}&oid=${recordUserId}`)
                }
            }
        }

        // 3. Fetch previous record, questions, and mentoring memos in parallel
        const [previousRes, questions, memosRes] = await Promise.all([
            supabase
                .from('diagnosis_records')
                .select('*')
                .eq('user_id', record.user_id)
                .lt('created_at', record.created_at)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
            getDiagnosisQuestions({
                stage: profile?.stage || 'P',
                industry: profile?.industry || 'I'
            }),
            supabase
                .from('mentoring_memos')
                .select(`
                    *,
                    profiles:author_id (
                        user_name,
                        user_title
                    )
                `)
                .eq('company_id', record.user_id)
                .order('created_at', { ascending: false })
        ])

        const previousRecord = previousRes.data

        const maxScores: Record<string, number> = {}
        questions.forEach(q => {
            const w = q.score_weight || 1
            maxScores[q.dimension] = (maxScores[q.dimension] || 0) + w
        })

        const dimensionScores = record.dimension_scores as Record<string, number>
        const totalScore = record.total_score || 0
        const stageInfo = getStageInfo(totalScore, dimensionScores)

        const getProgressBarColor = (score: number) => {
            if (score >= 80) return 'bg-emerald-500'
            if (score >= 60) return 'bg-amber-400'
            return 'bg-rose-500'
        }

        const getStatusIcon = (score: number) => {
            if (score >= 80) return <Trophy size={14} className="text-emerald-500 shrink-0" />
            if (score >= 60) return <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
            return <Wrench size={14} className="text-rose-400 shrink-0" />
        }

        const DIMENSION_KR: Record<string, string> = {
            D1: '경영전략/리더십',
            D2: '비즈니스 모델',
            D4: '조직/인사',
            D3: '마케팅/영업',
            D5: '기술/R&D',
            D6: '재무/자금',
            D7: '경영/ESG'
        }

        const STAGE_LABELS: Record<string, string> = {
            P: '예비창업', E: '초기창업', V: '벤처/도약', M: '중소/중견'
        }

        const INDUSTRY_LABELS: Record<string, string> = {
            I: 'IT/SaaS', H: '제조/소재/HW', L: '서비스/F&B/로컬', CT: '콘텐츠/IP/지식서비스'
        }

        const profileStageLabel = STAGE_LABELS[profile?.stage] || profile?.stage || '미설정'
        const profileIndustryLabel = INDUSTRY_LABELS[profile?.industry] || profile?.industry || '미설정'

        return (
            <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:pb-0">
                {/* Header - Hidden on Print */}
                <header className="bg-white border-b sticky top-0 z-50 print:hidden">
                    <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </Link>
                            <Link href="/" className="flex flex-col hover:opacity-80 transition-opacity">
                                <h1 className="text-[16px] sm:text-[17px] font-bold text-gray-900 leading-tight flex items-center gap-2 sm:gap-3">
                                    <img src="/BizDive_Logo_Confirm.png" alt="BizDive" className="h-6 sm:h-8 w-auto" />
                                    <span className="border-l border-gray-300 pl-2 sm:pl-3">상세 진단 결과</span>
                                </h1>
                                <span className="text-xs text-slate-500 font-medium mt-0.5">
                                    {record.company_name || profile?.company_name || '회사명 미상'} | {profile?.user_name || '사용자'} | {new Date(record.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </Link>
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
                            <img src="/BizDive_Logo_Confirm.png" alt="BizDive" className="h-5 w-auto" />
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

                    {/* Tabs Section */}
                    <Tabs defaultValue="report" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-slate-100 p-1 rounded-xl">
                            <TabsTrigger value="report" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 text-[14px] font-bold">
                                상세 리포트
                            </TabsTrigger>
                            <TabsTrigger value="memos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 text-[14px] font-bold">
                                멘토링 메모
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="report" className="mt-0 space-y-8">
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

                                    {/* Company Overall Analysis (Mirroring Admin) */}
                                    <Card className="shadow-lg border-gray-100/50 rounded-2xl print:shadow-none print:border h-fit overflow-hidden bg-white">
                                        <CardHeader className="pb-4 border-b border-gray-50 bg-slate-50/30">
                                            <CardTitle className="flex items-center gap-3 text-slate-800 text-xl font-bold tracking-tight">
                                                <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
                                                    <Target size={20} />
                                                </div>
                                                기업 종합 분석
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            {/* Comprehensive analysis order: 1, 2, 4, 3, 5, 6, 7 */}
                                            {['D1', 'D2', 'D4', 'D3', 'D5', 'D6', 'D7'].map(key => {
                                                const score = dimensionScores[key] || 0
                                                const stage = profile?.stage || 'P'
                                                const maxScore = STAGE_MAX_SCORES[stage]?.[key] || 15
                                                const actualPoint = (score / 100) * maxScore
                                                
                                                return (
                                                    <div key={key} className="space-y-1.5 group">
                                                        <div className="flex items-center justify-between text-[13px]">
                                                            <span className="font-bold text-slate-600 flex items-center gap-2">
                                                                {getStatusIcon(score)} {DIMENSION_KR[key]}
                                                            </span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-lg font-black text-slate-900">
                                                                    {actualPoint.toFixed(1)}
                                                                </span>
                                                                <span className="text-slate-400 text-xs font-bold">/ {maxScore.toFixed(1)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(score)} shadow-sm`}
                                                                style={{ width: `${score}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column: Detailed Feedback List */}
                                <Card className="shadow-lg border-gray-100/50 rounded-2xl print:shadow-none print:border h-fit bg-white border-t border-slate-100">
                                    <CardHeader className="pb-5 border-b border-gray-50 bg-slate-50/30 print:pb-4">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-slate-800">
                                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-blue-100 text-blue-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                                </div>
                                                <span className="text-[16px] font-bold tracking-tight">항목별 정밀 분석</span>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-7">
                                        {/* Itemized analysis order: 1, 2, 3, 4, 5, 6, 7 */}
                                        {['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map((dim, idx) => {
                                            const score = dimensionScores[dim] || 0
                                            const stage = profile?.stage || 'P'
                                            const maxScore = STAGE_MAX_SCORES[stage]?.[dim] || 15
                                            const rawScore = (score / 100) * maxScore

                                            let level: 'low' | 'mid' | 'high' = 'mid'
                                            if (score >= 80) level = 'high'
                                            else if (score < 40) level = 'low'

                                            const feedback = (FEEDBACK_DB as Record<string, any>)[dim as string]?.[level] || "분석 데이터가 충분하지 않습니다."

                                            return (
                                                <div key={dim} className="space-y-3 group print:break-inside-avoid">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center text-[11px] shrink-0">{idx + 1}</span>
                                                            {ITEMIZED_DIMENSION_KR[dim]}
                                                        </h4>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-[12px] font-black text-indigo-600">
                                                                {rawScore.toFixed(1)}
                                                            </span>
                                                            <span className="text-slate-400 text-[10px] font-bold">/ {maxScore.toFixed(1)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(score)} shadow-sm`}
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>

                                                    {/* Feedback Box */}
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[12px] text-slate-600 leading-relaxed flex gap-3 group-hover:bg-white transition-colors">
                                                        <span className="text-amber-500 shrink-0 mt-0.5">💡</span>
                                                        <p className="font-medium">{feedback}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Growth Analysis (Bottom) */}
                            {previousRecord && (
                                <div className="mt-8">
                                    <GrowthAnalysis
                                        current={record}
                                        previous={previousRecord}
                                        maxScores={maxScores}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="memos" className="mt-0">
                            <Card className="shadow-lg border-gray-100 shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="pb-5 border-b border-gray-50 bg-slate-50/50">
                                    <CardTitle className="flex items-center gap-3 text-slate-800">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100 text-emerald-600">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold tracking-tight block">멘토링 기록 및 메모</span>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">컨설턴트가 작성한 피드백을 확인하실 수 있습니다.</p>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {memosRes.data && memosRes.data.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {memosRes.data.map((memo: any) => (
                                                <div key={memo.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                                {memo.profiles?.user_name?.[0] || 'C'}
                                                            </div>
                                                            <div>
                                                                <p className="text-[14px] font-bold text-slate-900">{memo.profiles?.user_name || '컨설턴트'}</p>
                                                                <p className="text-[11px] text-slate-400 font-medium">{memo.profiles?.user_title || '전문 멘토'}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[12px] text-slate-400 font-medium">
                                                            {new Date(memo.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="bg-white border border-slate-200 rounded-xl p-5 text-[14px] text-slate-700 leading-relaxed shadow-sm">
                                                        {memo.content.split('\n').map((line: string, i: number) => (
                                                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                <MessageSquare className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h4 className="text-slate-900 font-bold mb-1">작성된 메모가 없습니다</h4>
                                            <p className="text-slate-500 text-sm">컨설턴트의 전문적인 멘토링이 진행되면 이곳에 기록됩니다.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <ConsultantBanner />
                </main>
            </div>
        )
    } catch (err: any) {
        return (
            <div style={{ padding: '40px', fontFamily: 'monospace', fontSize: '12px', background: '#fff0f0' }}>
                <h1 style={{ color: 'red' }}>RENDER ERROR CAUGHT</h1>
                <pre>{err?.message}</pre>
                <pre>{err?.stack}</pre>
            </div>
        )
    }
}
