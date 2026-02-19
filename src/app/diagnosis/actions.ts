'use server'

import { getDiagnosisQuestions } from '@/lib/diagnosis-logic'
import { Database } from '@/types/database'

export async function getGuestQuestions(stage: string, industry: string) {
    try {
        const questions = await getDiagnosisQuestions({ stage, industry })
        return { data: questions, error: null }
    } catch (error) {
        console.error('Error fetching guest questions:', error)
        return { data: null, error: 'Failed to fetch questions' }
    }
}
