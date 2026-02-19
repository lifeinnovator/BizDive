
import { createClient } from './supabase'

const SAMPLE_QUESTIONS = [
    // D1. Market (Common)
    { id: 'D1-C-001', dimension: 'D1', category: 'common', content: '우리가 가장 먼저 진입하여 점유할 거점 시장(SOM)이 명확히 정의되어 있다.' },
    { id: 'D1-C-002', dimension: 'D1', category: 'common', content: '막연한 추측이 아닌, 통계 데이터 등 근거를 통해 시장 규모를 산출했다.' },
    { id: 'D1-C-003', dimension: 'D1', category: 'common', content: '기술/사회적 트렌드 변화에 비추어 볼 때, 지금이 사업 적기임을 설명할 수 있다.' },

    // D1. Market (Stage - Pre-Startup)
    { id: 'D1-S-P-001', dimension: 'D1', category: 'stage', mapping_code: 'P', content: '초기 시장 진입을 위한 구체적인 전략(Go-to-Market)이 수립되어 있다.' },

    // D1. Market (Industry - IT)
    { id: 'D1-I-I-001', dimension: 'D1', category: 'industry', mapping_code: 'I', content: '기존 대안 대비 최소 2배 이상의 효율성이나 가치를 제공한다.' },

    // D2. Problem (Common)
    { id: 'D2-C-001', dimension: 'D2', category: 'common', content: '고객들의 불편함을 초등학생도 이해할 수 있게 한 문장으로 정의했다.' },

    // ... more questions would go here
]

export async function seedQuestions() {
    const supabase = createClient()

    // Note: This is client-side seeding for demo purposes. 
    // In production, this should be a server-side admin script.
    for (const q of SAMPLE_QUESTIONS) {
        const { error } = await supabase
            .from('questions')
            .upsert(q, { onConflict: 'id' })

        if (error) console.error('Error seeding question:', q.id, error)
        else console.log('Seeded question:', q.id)
    }
}
