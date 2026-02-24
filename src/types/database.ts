
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
                    role: 'super_admin' | 'group_admin' | 'user'
                    group_id: string | null
                    project_id: string | null
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
                    role?: 'super_admin' | 'group_admin' | 'user'
                    group_id?: string | null
                    project_id?: string | null
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
                    role?: 'super_admin' | 'group_admin' | 'user'
                    group_id?: string | null
                    project_id?: string | null
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
            groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    group_id: string | null
                    name: string
                    year: number | null
                    start_date: string | null
                    end_date: string | null
                    manager_name: string | null
                    status: 'active' | 'completed' | 'planned' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    group_id?: string | null
                    name: string
                    year?: number | null
                    start_date?: string | null
                    end_date?: string | null
                    manager_name?: string | null
                    status?: 'active' | 'completed' | 'planned' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    group_id?: string | null
                    name?: string
                    year?: number | null
                    start_date?: string | null
                    end_date?: string | null
                    manager_name?: string | null
                    status?: 'active' | 'completed' | 'planned' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            mentoring_memos: {
                Row: {
                    id: string
                    company_id: string | null
                    author_id: string | null
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    author_id?: string | null
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string | null
                    author_id?: string | null
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
