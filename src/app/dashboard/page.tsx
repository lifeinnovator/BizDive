import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReportHeaderActions } from '@/components/report/ReportActions'
import ConsultantBanner from '@/components/report/ConsultantBanner'
import { Plus, History, ChevronRight, User, Building, Calendar, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getStageInfo } from '@/data/feedback' // Assuming this helper exists and can handle score->stage mapping
import DeleteRecordButton from '@/components/dashboard/DeleteRecordButton'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // Fetch profile and diagnosis history in parallel
    const [profileRes, recordsRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
        supabase
            .from('diagnosis_records')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
    ])

    const profile = profileRes.data
    const records = recordsRes.data

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
                        <img src="/favicon.png" alt="BizDive" className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-[15.5px] sm:text-[18px] font-bold text-gray-900 leading-tight truncate">
                                BizDive - 7D 기업경영 심층자가진단
                            </h1>
                            <span className="text-[11.5px] sm:text-[13px] text-gray-500 font-medium truncate">
                                {user.email}
                            </span>
                        </div>
                    </div>
                    <ReportHeaderActions />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero Banner - Legacy Style */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-10 shadow-lg mb-8 text-white">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-[21px] sm:text-[25px] font-bold mb-3 leading-tight break-keep">
                            비즈니스 성장의 여정, 데이터로 시작하세요.
                        </h2>
                        <p className="text-indigo-100 text-[14px] mb-6 max-w-[600px] leading-relaxed opacity-90 tracking-[-0.02em] break-keep">
                            7가지 핵심 차원을 통해 기업의 현재 상태를 입체적으로 분석하고,<br />
                            다음 단계로 나아가기 위한 구체적인 전략을 발견할 수 있습니다.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/diagnosis">
                                <Button className="h-10 px-5 text-sm bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none shadow-sm rounded-lg">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    새 진단 시작하기
                                </Button>
                            </Link>
                            <Link href="/onboarding">
                                <Button variant="outline" className="h-10 px-5 text-sm bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white rounded-lg">
                                    <Settings className="mr-1.5 h-4 w-4" />
                                    기업 정보 관리
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-800">진단 이력</h3>
                </div>

                <div className="space-y-5">
                    {records && records.length > 0 ? (
                        records.map((record: { id: string; total_score: number; created_at: string; stage_result: string; company_name?: string; }) => {
                            const stageInfo = getStageInfo(record.total_score)
                            const d = new Date(record.created_at)
                            const date = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

                            return (
                                <Link href={`/report/${record.id}`} key={record.id} className="block group">
                                    <Card className="hover:shadow-md transition-all duration-200 border-gray-200 overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex items-center h-[88px]">
                                                {/* Score Section - Compact */}
                                                <div className={`w-[88px] h-full flex flex-col items-center justify-center border-r border-gray-100 bg-gray-50 group-hover:bg-indigo-50/30 transition-colors`}>
                                                    <span className={`text-[22px] font-bold tracking-tight ${record.total_score >= 80 ? 'text-green-600' :
                                                        record.total_score >= 50 ? 'text-indigo-600' : 'text-rose-500'
                                                        }`}>
                                                        {record.total_score.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-0.5">점</span>
                                                    </span>
                                                    <span className={`mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${record.total_score >= 80 ? 'bg-green-100 text-green-700' :
                                                        record.total_score >= 50 ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        Stage {record.stage_result}
                                                    </span>
                                                </div>

                                                {/* Content Section - Compact */}
                                                <div className="flex-grow px-4 py-2 flex justify-between items-center">
                                                    <div>
                                                        <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-0.5">
                                                            {stageInfo.stageName}
                                                        </h4>
                                                        <p className="text-gray-500 text-[11px] line-clamp-1 mb-1.5">
                                                            {stageInfo.shortDesc}
                                                        </p>

                                                        {/* Metadata Row */}
                                                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <Building className="h-3 w-3" />
                                                                <span className="max-w-[80px] truncate">{record.company_name || profile?.company_name || '회사명 미상'}</span>
                                                            </div>
                                                            <div className="w-px h-2 bg-gray-300"></div>
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                <span className="max-w-[60px] truncate">{profile?.user_name || '사용자'}</span>
                                                            </div>
                                                            <div className="w-px h-2 bg-gray-300"></div>
                                                            <span>{date}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-center shrink-0 ml-2 sm:ml-4 gap-2">
                                                        <DeleteRecordButton recordId={record.id} />
                                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-colors hidden sm:block" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
                                <Plus className="h-10 w-10 text-indigo-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 진행된 진단이 없습니다</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                우리 기업의 현재 상태가 궁금하신가요? <br />
                                7가지 차원의 정밀 진단을 시작해보세요.
                            </p>
                            <Link href="/diagnosis">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto rounded-xl text-lg shadow-lg shadow-indigo-200">
                                    첫 진단 시작하기
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Expert Consultation Banner (Bottom) */}
                <ConsultantBanner />

            </main>
        </div>
    )
}
