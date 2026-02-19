import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DiagnosisWrapper from '@/components/diagnosis/DiagnosisWrapper'
import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'

export default async function DiagnosisPage() {
    const supabase = await createClient()

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
        const questions = await getDiagnosisQuestions(profile)

        return (
            <DiagnosisWrapper
                initialQuestions={questions}
                user={user}
                profile={profile}
                isGuest={false}
            />
        )
    } else {
        // GUEST FLOW
        return (
            <DiagnosisWrapper isGuest={true} />
        )
    }
}
