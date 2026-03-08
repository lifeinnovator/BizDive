export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ReportHeaderActions } from '@/components/report/ReportActions'
import ConsultantBanner from '@/components/report/ConsultantBanner'
import { Plus, History, Settings, Layers } from 'lucide-react'
import DiagnosisHistoryList from '@/components/dashboard/DiagnosisHistoryList'
import { STAGE_LABELS, INDUSTRY_LABELS } from '@/data/feedback'


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
                    <Link href="/" className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 hover:opacity-80 transition-opacity">
                        <img src="/BizDive_Logo_Confirm.png" alt="BizDive" className="h-8 sm:h-10 w-auto flex-shrink-0" />
                        <div className="flex flex-col min-w-0 border-l border-gray-200 pl-3">
                            <span className="text-[12px] sm:text-[13px] font-semibold text-gray-500 truncate leading-tight mb-0.5">
                                7D 기업경영 심층자가진단
                            </span>
                            <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium truncate leading-none">
                                {user.email}
                            </span>
                        </div>
                    </Link>
                    <ReportHeaderActions />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero Banner */}
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
                        {(profile?.industry || profile?.stage) && (
                            <div className="flex items-center gap-1.5 mb-5 bg-white/10 w-fit px-3 py-1.5 rounded-full">
                                <Layers size={13} className="text-indigo-200" />
                                <span className="text-[12px] font-semibold text-indigo-100">
                                    {STAGE_LABELS[profile?.stage] || profile?.stage || ''}
                                    {profile?.industry ? ` · ${INDUSTRY_LABELS[profile?.industry] || profile?.industry}` : ''}
                                </span>
                            </div>
                        )}
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

                <DiagnosisHistoryList
                    records={records || []}
                    profileName={profile?.user_name}
                    profileCompany={profile?.company_name}
                />

                {/* Expert Consultation Banner (Bottom) */}
                <ConsultantBanner />

            </main>
        </div>
    )
}
