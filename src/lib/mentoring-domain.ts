export const DIMENSION_MENTORING_FIELDS: Record<string, { code: string; label: string }> = {
  D1: { code: 'market_customer', label: '시장·고객 검증' }, D2: { code: 'problem_definition', label: '문제 정의' },
  D3: { code: 'value_proposition', label: '가치제안·BM 설계' }, D4: { code: 'team_operations', label: '팀·운영 역량' },
  D5: { code: 'product_technology', label: '제품·기술 구현' }, D6: { code: 'business_finance', label: '사업모델·재무' },
  D7: { code: 'growth_esg', label: '성장전략·ESG' },
}
export const MENTORING_REQUEST_STATUSES = ['requested', 'accepted', 'declined', 'cancelled', 'completed'] as const

export function numericDimensions(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1])))
}

export function deriveMentoringNeeds(records: Array<Record<string, unknown>>) {
  return Object.entries(DIMENSION_MENTORING_FIELDS).flatMap(([dimension, field]) => {
    const scores = records.map((record) => numericDimensions(record.dimension_scores)[dimension]).filter((value): value is number => typeof value === 'number')
    if (!scores.length) return []
    const score = Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10
    return [{ dimension, score, ...field }]
  }).sort((a, b) => a.score - b.score).slice(0, 3)
}
