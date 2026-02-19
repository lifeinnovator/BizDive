
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    company_name: string | null
                    stage: 'P' | 'E' | 'V' | 'M' | null
                    industry: 'I' | 'H' | 'L' | 'CT' | null
                    user_name: string | null
                    user_title: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    company_name?: string | null
                    stage?: 'P' | 'E' | 'V' | 'M' | null
                    industry?: 'I' | 'H' | 'L' | 'CT' | null
                    user_name?: string | null
                    user_title?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    company_name?: string | null
                    stage?: 'P' | 'E' | 'V' | 'M' | null
                    industry?: 'I' | 'H' | 'L' | 'CT' | null
                    user_name?: string | null
                    user_title?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            questions: {
                Row: {
                    id: string
                    dimension: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7'
                    content: string
                    score_weight: number
                    rationale: string | null
                    category: 'common' | 'stage' | 'industry' | 'esg'
                    mapping_code: string | null
                    caption: string | null
                    display_order: number
                    created_at: string
                }
                Insert: {
                    id: string
                    dimension: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7'
                    content: string
                    score_weight?: number
                    rationale?: string | null
                    category: 'common' | 'stage' | 'industry' | 'esg'
                    mapping_code?: string | null
                    caption?: string | null
                    display_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    dimension?: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7'
                    content?: string
                    score_weight?: number
                    rationale?: string | null
                    category?: 'common' | 'stage' | 'industry' | 'esg'
                    mapping_code?: string | null
                    created_at?: string
                }
            }
            diagnosis_records: {
                Row: {
                    id: string
                    user_id: string
                    responses: Json
                    total_score: number | null
                    dimension_scores: Json | null
                    stage_result: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    responses: Json
                    total_score?: number | null
                    dimension_scores?: Json | null
                    stage_result?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    responses?: Json
                    total_score?: number | null
                    dimension_scores?: Json | null
                    stage_result?: string | null
                    created_at?: string
                }
            }
        }
    }
}
