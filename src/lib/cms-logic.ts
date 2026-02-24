import { createClient } from './supabase'

export interface Question {
    id: string
    content: string
    dimension: string
    category: string
    display_order: number
    score_weight: number
    mapping_code?: string
    rationale?: string
}

export async function fetchAllQuestions() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('dimension', { ascending: true })
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching questions:', error)
        throw error
    }
    return data
}

export async function updateQuestionDirect(id: string, updates: Partial<Question>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating question:', error)
        throw error
    }
    return data
}
