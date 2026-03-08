import { Database } from '@/types/database'

type Question = Database['public']['Tables']['questions']['Row']

// Stage-based scoring configuration (from approved spreadsheet)
// Unit Score (points per question) / Total Points (max per dimension)
export const STAGE_UNIT_SCORES: Record<string, Record<string, number>> = {
    P: { D1: 2.0, D2: 2.5, D3: 1.5, D4: 1.0, D5: 1.0, D6: 1.0, D7: 1.0 },
    E: { D1: 1.5, D2: 1.5, D3: 2.5, D4: 1.5, D5: 1.0, D6: 1.0, D7: 1.5 },
    V: { D1: 1.0, D2: 1.0, D3: 1.5, D4: 2.0, D5: 1.5, D6: 1.5, D7: 2.5 },
    M: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.5, D5: 2.5, D6: 2.0, D7: 1.0 }
}

export const STAGE_MAX_SCORES: Record<string, Record<string, number>> = {
    P: { D1: 20, D2: 25, D3: 15, D4: 10, D5: 10, D6: 10, D7: 10 },
    E: { D1: 15, D2: 15, D3: 25, D4: 15, D5: 10, D6: 10, D7: 15 },
    V: { D1: 10, D2: 10, D3: 15, D4: 20, D5: 15, D6: 15, D7: 25 },
    M: { D1: 10, D2: 10, D3: 10, D4: 15, D5: 25, D6: 20, D7: 10 }
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
 * Helper to compute single dimension score given points and boolean status
 */
export function computeSectionScore(items: { points: number, checked: boolean }[]): {
    earned: number
    total: number
    score: number
} {
    let earned = 0
    let total = 0

    items.forEach(item => {
        total += item.points
        if (item.checked) {
            earned += item.points
        }
    })

    const score = total === 0 ? 0 : Math.round((earned / total) * 1000) / 10
    return { earned, total, score }
}



export function getGrade(score: number): string {
    if (score >= GRADE_THRESHOLDS.S) return 'S'
    if (score >= GRADE_THRESHOLDS.A) return 'A'
    if (score >= GRADE_THRESHOLDS.B) return 'B'
    if (score >= GRADE_THRESHOLDS.C) return 'C'
    return 'D'
}
