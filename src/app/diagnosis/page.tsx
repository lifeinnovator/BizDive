import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DiagnosisWrapper from '@/components/diagnosis/DiagnosisWrapper'
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
        const campaignContext = projectId ? await getCampaignDiagnosisContext(user.id, projectId, round) : null

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
        if (projectId) {
            const nextPath = `/diagnosis?projectId=${encodeURIComponent(projectId)}&round=${encodeURIComponent(round)}`
            return redirect(`/login?next=${encodeURIComponent(nextPath)}`)
        }

        // GUEST FLOW
        return (
            <DiagnosisWrapper isGuest={true} />
        )
    }
}
