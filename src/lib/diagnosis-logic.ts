
import { createClient } from './supabase-server'
import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface DiagnosisCriteria {
    stage: string | null
    industry: string | null
}

export async function getDiagnosisQuestions(profile: DiagnosisCriteria): Promise<Question[]> {
    const supabase = await createClient()

    // Combine queries into a single call using .or() with filters
    const stageIndustryCode = `${profile.stage}_${profile.industry}`;

    const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .or(`and(category.eq.stage,mapping_code.eq.${profile.stage}),and(category.eq.industry,mapping_code.eq.${stageIndustryCode}),and(category.eq.esg,mapping_code.eq.${profile.stage})`)

    if (error) {
        console.error("Error fetching questions:", error)
        return []
    }

    if (!allQuestions) return []

    return allQuestions.sort((a, b) => {
        if (a.dimension < b.dimension) return -1
        if (a.dimension > b.dimension) return 1
        return (a.display_order || 0) - (b.display_order || 0)
    })
}
