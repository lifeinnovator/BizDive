
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

    // 1. Fetch Stage-Specific Questions (Includes previous Common questions merged)
    // Category: 'stage', Mapping: profile.stage
    const { data: stageQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'stage')
        .eq('mapping_code', profile.stage!)

    // 2. Fetch Industry-Specific Questions 
    // Category: 'industry', Mapping: STAGE_INDUSTRY (e.g. P_I)
    // Because industry weights now depend on stage.
    const stageIndustryCode = `${profile.stage}_${profile.industry}`;

    const { data: industryQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'industry')
        .eq('mapping_code', stageIndustryCode)

    // 3. Fetch ESG Questions (Category: 'esg', Mapping: profile.stage) 
    const { data: esgQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'esg')
        .eq('mapping_code', profile.stage!)

    // Combine and Sort
    // Sort by Dimension D1 -> D7, then by Display Order 1 -> 10
    const allQuestions = [
        ...(stageQuestions || []), // Note: seed_v3 puts Common into 'stage' cat with order 1-3
        ...(industryQuestions || []),
        ...(esgQuestions || []),
    ]

    return allQuestions.sort((a, b) => {
        if (a.dimension < b.dimension) return -1
        if (a.dimension > b.dimension) return 1
        return (a.display_order || 0) - (b.display_order || 0)
    })
}
