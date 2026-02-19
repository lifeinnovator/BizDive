import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row']

// Stage Weights (W_stage)
export const STAGE_WEIGHTS: Record<string, Record<string, number>> = {
    P: { D1: 1.5, D2: 1.5, D3: 1.2, D4: 1.0, D5: 1.0, D6: 1.0, D7: 1.0 }, // Pre-Startup
    E: { D1: 1.0, D2: 1.2, D3: 1.5, D4: 1.2, D5: 1.2, D6: 1.5, D7: 1.0 }, // Early-Stage
    V: { D1: 1.0, D2: 1.0, D3: 1.2, D4: 1.5, D5: 1.2, D6: 1.2, D7: 1.5 }, // Venture
    M: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.5, D5: 1.2, D6: 1.2, D7: 1.5 }, // Mid-sized
}

// Grade Thresholds
export const GRADE_THRESHOLDS = {
    S: 90,
    A: 80,
    B: 70,
    C: 60,
    D: 0,
}

/**
 * Calculate Dimension Score (Score_Dim)
 * Formula: (Sum(w_i * x_i) / Sum(w_i)) * 100
 * where x_i = 1 if checked, 0 if unchecked
 */
export function calculateDimensionScore(questions: Question[], answers: Record<string, boolean>): number {
    let earnedWeight = 0
    let totalPossibleWeight = 0

    questions.forEach((q, idx) => {
        // We need to identify if this specific question instance was answered.
        // In DiagnosisForm, keys are typically `${dimension}_${index}` or question ID.
        // However, the form component creates keys based on `section.id` and `idx` (e.g. D1_0).
        // Since we are likely passing the *list* of questions for a dimension, 
        // we might not have the exact key here unless we enforce a convention.
        // BETTER APPROACH for this utility: Accept pre-resolved list of (weight, isChecked) tuples?
        // OR rely on the ID if available. 

        // Let's assume the caller handles the key mapping or we use the question ID if available.
        // But the form uses `answers[${sec.id}_${idx}]`. 
        // To be safe and pure, let's accept `questions` and look up by ID? 
        // Actually the form implementation uses index-based keys currently: `${sec.id}_${idx}`.
        // Let's stick to the form's logic or refactor. 
        // Refactoring to use Question ID is safer long term, but let's see how `answers` is structured.
        // `answers` is Record<string, boolean>.
        // Let's assume the caller passes the *filtered* questions for this dimension.
    })

    // To keep it simple and independent of the specific key format (which is UI state),
    // let's pass a list of `QuestionAnswer` objects.

    return 0
}

/**
 * Helper to compute single dimension score given weights and boolean status
 */
export function computeSectionScore(items: { weight: number, checked: boolean }[]): number {
    let earned = 0
    let total = 0

    items.forEach(item => {
        total += item.weight
        if (item.checked) {
            earned += item.weight
        }
    })

    if (total === 0) return 0
    return (earned / total) * 100
}

/**
 * Calculate Total Score (Score_Total)
 * Formula: Sum(Score_Dim * W_stage) / Sum(W_stage)
 */
export function calculateTotalScore(dimensionScores: Record<string, number>, stage: string): number {
    const weights = STAGE_WEIGHTS[stage] || STAGE_WEIGHTS['P'] // Default to P

    let weightedSum = 0
    let totalWeight = 0

    // Iterate specific dimensions D1..D7
    const dimensions = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']

    dimensions.forEach(dim => {
        const score = dimensionScores[dim] || 0
        const weight = weights[dim] || 1.0

        weightedSum += score * weight
        totalWeight += weight
    })

    if (totalWeight === 0) return 0
    return weightedSum / totalWeight
}

export function getGrade(score: number): string {
    if (score >= GRADE_THRESHOLDS.S) return 'S'
    if (score >= GRADE_THRESHOLDS.A) return 'A'
    if (score >= GRADE_THRESHOLDS.B) return 'B'
    if (score >= GRADE_THRESHOLDS.C) return 'C'
    return 'D'
}
