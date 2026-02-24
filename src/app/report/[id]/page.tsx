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
    const { id } = await params
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Fetch the specific diagnosis record
    const { data: record, error } = await supabase
        .from('diagnosis_records')
        .select(`
            *,
            profiles!diagnosis_records_user_id_fkey (
                user_name,
                company_name,
                stage,
                industry,
                group_id
            )
        `)
        .eq('id', id)
        .single()

    if (error || !record) {
        console.error("Report not found:", error)
        return notFound()
    }

    // Security check: only the owner or admins should see this
    // (In a real app, check role or user_id)
    if (record.user_id !== user.id) {
        // Potential check for group_admin or super_admin here
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'super_admin') {
            // For group_admin, check if the record's user belongs to their group
            const { data: recordUser } = await supabase.from('profiles').select('group_id').eq('id', record.user_id).single()
            const { data: adminProfile } = await supabase.from('profiles').select('group_id').eq('id', user.id).single()

            if (profile?.role !== 'group_admin' || recordUser?.group_id !== adminProfile?.group_id) {
                return redirect('/dashboard')
            }
        }
    }

    const profile = record.profiles;

    // 3. Fetch previous record
    const { data: previousRecord } = await supabase
        .from('diagnosis_records')
        .select('*')
        .eq('user_id', record.user_id)
        .lt('created_at', record.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    // 4. Calculate Max Scores
    const questions = await getDiagnosisQuestions({
        stage: profile.stage,
        industry: profile.industry
    })

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
        <div className="min-h-screen bg-slate-50 pb-12 print:bg-white print:pb-0">
            {/* Nav Header */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-[17px] font-bold text-slate-900 leading-tight flex items-center gap-2">
                                <img src="/favicon.png" alt="BizDive" className="w-5 h-5 rounded" />
                                심층 진단 리포트
                            </h1>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                                Report ID: {id.slice(0, 8)} • {new Date(record.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <ReportHeaderActions />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">

                {/* Print Meta Information */}
                <div className="hidden print:block mb-10 border-b pb-6 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">BizDive 기업경영 심층 진단 리포트</h1>
                    <p className="text-slate-500 font-semibold">{profile.company_name} | {profile.user_name} | {new Date(record.created_at).toLocaleString()}</p>
                </div>

                {/* Main Content Grid */}
                <div className="space-y-8">
                    {/* Summary Hero Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <Card className="xl:col-span-2 border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <CardContent className="p-10 relative z-10">
                                {/* Header Row */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-slate-700 text-white border-none font-black px-3 py-1 rounded-full text-[11px]">Stage {record.stage_result}</Badge>
                                        <Badge variant="outline" className="border-slate-700 text-slate-300 font-bold px-3 py-1 rounded-full text-[11px]">{profileStageLabel} | {profileIndustryLabel}</Badge>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">TOTAL SCORE</span>
                                        <div className="flex items-baseline justify-end gap-1">
                                            <span className="text-5xl font-black text-white">{totalScore.toFixed(1)}</span>
                                            <span className="text-xl text-slate-500 font-bold ml-1">/ 100.0</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Title Section */}
                                <div className="mb-12">
                                    <h2 className="text-4xl font-black tracking-tight mb-4">{stageInfo.stageName}</h2>
                                    <p className="text-slate-400 text-lg font-bold leading-relaxed">{stageInfo.shortDesc}</p>
                                </div>

                                <div className="border-t border-white/5 my-10" />

                                {/* Detailed Results Section */}
                                <div className="space-y-10">
                                    <h3 className="flex items-center gap-2 text-white font-black text-lg">
                                        <CheckCircle2 size={20} className="text-indigo-400" /> 상세 진단 결과
                                    </h3>

                                    <div className="space-y-8 max-w-5xl">
                                        <div className="space-y-3">
                                            <h4 className="text-indigo-400 font-black text-[15px] uppercase tracking-wider">현황 진단</h4>
                                            <p className="text-slate-200 text-[15px] leading-relaxed font-medium">{stageInfo.diagnosis}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-emerald-400 font-black text-[15px] uppercase tracking-wider">전문가 제언</h4>
                                            <p className="text-slate-200 text-[15px] leading-relaxed font-medium">{stageInfo.suggestion}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Terminology Section */}
                                {stageInfo.terms && stageInfo.terms.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-white/5">
                                        <div className="space-y-2">
                                            {stageInfo.terms.map((term: string, idx: number) => (
                                                <p key={idx} className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                                    * {term}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Radar Chart Section */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                                        <HelpCircle size={18} />
                                    </div>
                                    7-Dimension 밸런스
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex items-center justify-center min-h-[350px]">
                                <DiagnosisRadarChart
                                    sectionScores={dimensionScores}
                                    previousScores={previousRecord?.dimension_scores as any}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Detailed Breakdown */}
                        <Card className="xl:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    항목별 정밀 분석
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-10">
                                {Object.keys(dimensionScores).sort().map((dim, idx) => {
                                    const score = dimensionScores[dim]
                                    const maxScore = maxScores[dim] || 15
                                    const rawScore = (score / 100) * maxScore

                                    let level: 'high' | 'mid' | 'low' = 'mid'
                                    if (score >= 80) level = 'high'
                                    else if (score < 40) level = 'low'

                                    const feedback = (FEEDBACK_DB as any)[dim]?.[level] || "분석 대기 중"

                                    return (
                                        <div key={dim} className="group transition-all">
                                            <div className="flex justify-between items-end mb-3">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Dimension 0{idx + 1}</span>
                                                    <h4 className="text-lg font-bold text-slate-900">{DIMENSION_KR[dim] || dim}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-slate-900">{rawScore.toFixed(1)}</span>
                                                    <span className="text-slate-400 text-sm font-semibold ml-1">/ {maxScore}</span>
                                                </div>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 flex shadow-inner">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-sm"
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                            <div className="mt-4 bg-slate-50/80 border border-slate-100 p-5 rounded-2xl flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                </div>
                                                <p className="text-slate-600 text-sm font-medium leading-relaxed">{feedback}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        {/* Sidebar: Growth & Tools */}
                        <div className="space-y-8">
                            {previousRecord && (
                                <GrowthAnalysis
                                    current={record}
                                    previous={previousRecord}
                                    maxScores={maxScores}
                                />
                            )}

                            <ConsultantBanner />

                            {/* Action Card */}
                            <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-100 p-8 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold mb-3">데이터를 더 깊이 있게 분석하고 싶으신가요?</h4>
                                    <p className="text-indigo-100 text-sm font-semibold opacity-80 mb-6 leading-relaxed">
                                        전문 컨설턴트와의 1:1 디브리핑을 통해 우리 기업만의 맞춤형 스케일업 로드맵을 설계할 수 있습니다.
                                    </p>
                                    <Button className="w-full bg-white text-indigo-600 hover:bg-slate-50 font-bold h-12 rounded-xl border-none shadow-lg outline-none">
                                        전문가 멘토링 신청하기
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
