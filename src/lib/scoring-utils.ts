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



export function getGrade(score: number): string {
    if (score >= GRADE_THRESHOLDS.S) return 'S'
    if (score >= GRADE_THRESHOLDS.A) return 'A'
    if (score >= GRADE_THRESHOLDS.B) return 'B'
    if (score >= GRADE_THRESHOLDS.C) return 'C'
    return 'D'
}
