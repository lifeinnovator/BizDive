import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DiagnosisWrapper from '@/components/diagnosis/DiagnosisWrapper'
import Link from 'next/link'
import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'
import { getCampaignDiagnosisContext } from '@/lib/campaign-diagnosis'

type DiagnosisPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DiagnosisPage({ searchParams }: DiagnosisPageProps) {
    const supabase = await createClient()
    const params = await searchParams

    // 1. Check Auth (Do NOT redirect if null, enable Guest mode)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // AUTH USER FLOW
        // 2. Fetch Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!profile || !profile.stage) {
            // Profile incomplete?
            return redirect('/onboarding')
        }

        const projectId = typeof params.projectId === 'string' ? params.projectId : null
        const parsedRound = typeof params.round === 'string' ? Number.parseInt(params.round, 10) : 1
        const round = Number.isInteger(parsedRound) && parsedRound > 0 ? parsedRound : 1
        const assignmentId = typeof params.assignmentId === 'string' ? params.assignmentId : null
        const campaignContext = projectId ? await getCampaignDiagnosisContext(user.id, projectId, round, assignmentId) : null
        if (projectId && !campaignContext) {
            return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-900">기업진단을 시작할 수 없습니다</h1><p className="mt-3 text-sm leading-6 text-slate-500">본인 기업에 배정된 진행 중 진단인지, 이미 제출한 진단인지 확인해주세요.</p><Link href="/enterprise-diagnosis" className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">기업진단 목록으로</Link></div></main>
        }

        // 3. Fetch Questions
        const questions = campaignContext?.questions ?? await getDiagnosisQuestions({
            stage: typeof profile.stage === 'string' ? profile.stage : null,
            industry: typeof profile.industry === 'string' ? profile.industry : null,
        })

        return (
            <DiagnosisWrapper
                initialQuestions={questions}
                user={user}
                profile={campaignContext ? { ...profile, company_name: campaignContext.companyName } : profile}
                isGuest={false}
                campaignContext={campaignContext}
            />
        )
    } else {
        const projectId = typeof params.projectId === 'string' ? params.projectId : null
        const round = typeof params.round === 'string' ? params.round : '1'
        const assignmentId = typeof params.assignmentId === 'string' ? params.assignmentId : ''
        if (projectId) {
            const nextPath = `/diagnosis?projectId=${encodeURIComponent(projectId)}&round=${encodeURIComponent(round)}${assignmentId ? `&assignmentId=${encodeURIComponent(assignmentId)}` : ''}`
            return redirect(`/login?next=${encodeURIComponent(nextPath)}`)
        }

        // GUEST FLOW
        return (
            <DiagnosisWrapper isGuest={true} />
        )
    }
}
