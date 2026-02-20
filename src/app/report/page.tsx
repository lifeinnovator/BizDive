import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DiagnosisRadarChart from '@/components/report/RadarChart'
import { FEEDBACK_DB, getStageInfo } from '@/data/feedback'
import { PrintButton, ExpertRequestButton, ReportHeaderActions } from '@/components/report/ReportActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GrowthAnalysis from '@/components/report/GrowthAnalysis'
import { History } from 'lucide-react'
import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'
import ConsultantBanner from '@/components/report/ConsultantBanner'

export default async function ReportPage({ searchParams }: { searchParams: { id?: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // Fetch Profile for Stage/Industry info needed for weights
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return redirect('/onboarding')

    let record;
    let previousRecord = null;

    if (searchParams.id) {
        // Fetch specific record
        const { data } = await supabase
            .from('diagnosis_records')
            .select('*')
            .eq('id', searchParams.id)
            .eq('user_id', user.id)
            .single()
        record = data;

        // Fetch previous record (record created strictly before the current one)
        if (record) {
            const { data: prevData } = await supabase
                .from('diagnosis_records')
                .select('*')
                .eq('user_id', user.id)
                .lt('created_at', record.created_at) // Specifically older than current
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle() // Use maybeSingle to avoid error if null
            previousRecord = prevData
        }

    } else {
        // Fetch latest diagnosis
        const { data } = await supabase
            .from('diagnosis_records')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(2) // Fetch top 2

        if (data && data.length > 0) {
            record = data[0];
            previousRecord = data.length > 1 ? data[1] : null;
        }
    }

    if (!record) {
        return redirect('/diagnosis')
    }

    // Calculate Max Scores based on current profile Stage/Industry
    // NOTE: This assumes the historical record used the SAME stage/industry weights.
    // If the user changed stage, this "Raw Score" recalculation might be slightly off for old records,
    // but it's the best approximation we have without storing max_scores in DB.
    const questions = await getDiagnosisQuestions({
        stage: profile.stage,
        industry: profile.industry
    })

    const maxScores: Record<string, number> = {}
    questions.forEach(q => {
        const w = q.score_weight || 1 // default to 1 if null
        maxScores[q.dimension] = (maxScores[q.dimension] || 0) + w
    })

    const dimensionScores = record.dimension_scores as Record<string, number>
    const totalScore = record.total_score || 0
    const stageInfo = getStageInfo(totalScore)

    const DIMENSION_KR: Record<string, string> = {
        D1: '시장분석',
        D2: '문제이해',
        D3: '해결가치',
        D4: '실행역량',
        D5: '기술역량',
        D6: '수익모델',
        D7: '성장전략'
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:pb-0">
            {/* Header - Hidden on Print */}
            <header className="bg-white border-b sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/favicon.png" alt="BizDive" className="w-8 h-8 rounded" />
                        <h1 className="text-lg font-bold text-gray-900">
                            BizDive Diagnosis Report
                        </h1>
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
                <div className="hidden print:block text-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold">BizDive 기업경영 심층자가진단 리포트</h1>
                    <p className="text-gray-500 mt-2">{record.company_name} | {new Date().toLocaleDateString()}</p>
                </div>

                {/* Top Overview Card */}
                <div className="bg-white shadow rounded-xl overflow-hidden mb-8 border border-gray-100 print:shadow-none print:border">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
                        <div className="md:flex md:items-start md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                                        Stage {record.stage_result}
                                    </Badge>
                                    <h2 className="text-3xl font-bold tracking-tight">
                                        {stageInfo.stageName}
                                    </h2>
                                </div>
                                <p className="text-slate-300 max-w-2xl text-lg opacity-90">
                                    {stageInfo.shortDesc}
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 text-right">
                                <span className="block text-sm text-slate-400 font-medium uppercase tracking-wider">Total Score</span>
                                <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-5xl font-extrabold text-white tracking-tight">{Math.round(totalScore)}</span>
                                    <span className="text-xl text-slate-400 font-medium">/ 100</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6">
                        <div className="mb-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-600 rounded-full inline-block"></span>
                                진단 결과 요약 (Diagnosis)
                            </h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {stageInfo.diagnosis}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-600 rounded-full inline-block"></span>
                                전략적 제언 (Suggestion)
                            </h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {stageInfo.suggestion}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 print:grid-cols-1 print:break-inside-avoid">

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

                        {/* Growth Analysis (Moved to Left Column) */}
                        {previousRecord && (
                            <GrowthAnalysis
                                current={record}
                                previous={previousRecord}
                                maxScores={maxScores}
                            />
                        )}
                    </div>

                    {/* Right Column: Detailed Feedback List */}
                    <Card className="shadow-lg border-gray-100/50 rounded-2xl print:shadow-none print:border print:break-before-page h-fit bg-white">
                        <CardHeader className="pb-6 border-b border-gray-50 bg-slate-50/30">
                            <CardTitle className="flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-blue-100 text-blue-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight">항목별 정밀 분석</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            {Object.keys(dimensionScores).sort().map((dim, idx) => {
                                const score = dimensionScores[dim] // 0-100 score
                                const maxScore = maxScores[dim] || 15 // Fallback if weight not found
                                const rawScore = (score / 100) * maxScore

                                /* Grade Logic: simple text based logic, aligned with previous feedback helpers */
                                let level = 'mid'
                                if (score >= 80) level = 'high'
                                else if (score < 40) level = 'low'

                                const feedback = (FEEDBACK_DB as any)[dim as string]?.[level] || "분석 데이터가 충분하지 않습니다."

                                return (
                                    <div key={dim} className="group">
                                        {/* Header: Title & Score */}
                                        <div className="flex justify-between items-end mb-3">
                                            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <span className="text-indigo-600 font-bold text-sm">{idx + 1}.</span>
                                                {DIMENSION_KR[dim] || dim}
                                            </h4>
                                            <div className="text-right">
                                                <span className="text-2xl font-extrabold text-slate-800">
                                                    {rawScore.toFixed(1)}
                                                </span>
                                                <span className="text-gray-400 font-medium text-sm ml-1">/ {maxScore}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar (Visual UX) */}
                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-5 border border-gray-100">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm bg-amber-400"
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>

                                        {/* Feedback Box */}
                                        <div className="relative bg-amber-50/60 border border-amber-200 rounded-xl p-5 flex gap-4 text-[15px] text-slate-700 leading-7 hover:bg-amber-50 hover:shadow-sm transition-all">
                                            <div className="flex-shrink-0 mt-0.5 text-amber-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
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
