import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DiagnosisWrapper from '@/components/diagnosis/DiagnosisWrapper'
import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'

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

        // 3. Fetch Questions
        const questions = await getDiagnosisQuestions({
            stage: typeof profile.stage === 'string' ? profile.stage : null,
            industry: typeof profile.industry === 'string' ? profile.industry : null,
        })

        return (
            <DiagnosisWrapper
                initialQuestions={questions}
                user={user}
                profile={profile}
                isGuest={false}
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
