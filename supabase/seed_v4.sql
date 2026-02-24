-- supabase/seed_v4.sql
-- This script adds mock Projects and Mentoring Memos, and assigns users to projects.

DO $$
DECLARE
    group1_id uuid := '20000000-0000-0000-0000-000000000001'::uuid;
    group2_id uuid := '20000000-0000-0000-0000-000000000002'::uuid;
    project1_id uuid := '30000000-0000-0000-0000-000000000001'::uuid;
    project2_id uuid := '30000000-0000-0000-0000-000000000002'::uuid;
    admin_id uuid := '10000000-0000-0000-0000-000000000000'::uuid; -- Super Admin
    group1_admin_id uuid;
    group2_admin_id uuid;
    company_row RECORD;
    memo_idx int;
BEGIN
    -- Ensure extensions are available
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- ==========================================
    -- 1. Create Projects
    -- ==========================================
    INSERT INTO public.projects (id, group_id, name, year, start_date, end_date, manager_name, status) VALUES 
        (project1_id, group1_id, '2026 스타트업 스케일업 파도타기', 2026, '2026-03-01', '2026-11-30', '김담당 (Accelerator A)', 'active'),
        (project2_id, group2_id, 'C-프로그램 유망기업 발굴전', 2026, '2026-01-15', '2026-08-15', '이매니저 (창업진흥원)', 'active')
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name, status = EXCLUDED.status;

    -- ==========================================
    -- 2. Fetch Group Admins for Memos
    -- ==========================================
    SELECT id INTO group1_admin_id FROM public.profiles WHERE group_id = group1_id AND role = 'group_admin' LIMIT 1;
    SELECT id INTO group2_admin_id FROM public.profiles WHERE group_id = group2_id AND role = 'group_admin' LIMIT 1;

    -- ==========================================
    -- 3. Assign Companies to Projects and Create Memos
    -- ==========================================
    -- All 'user' role companies in group 1 get assigned to project 1
    -- All 'user' role companies in group 2 get assigned to project 2

    FOR company_row IN 
        SELECT id, group_id FROM public.profiles WHERE role = 'user' AND group_id IN (group1_id, group2_id)
    LOOP
        -- Update project_id
        IF company_row.group_id = group1_id THEN
            UPDATE public.profiles SET project_id = project1_id WHERE id = company_row.id;
            
            -- Insert random memo from group admin
            IF random() > 0.5 THEN
                INSERT INTO public.mentoring_memos (company_id, author_id, content)
                VALUES (company_row.id, group1_admin_id, '기업 진단 결과 전반적으로 양호함. HR 쪽 보완 필요.');
            END IF;
        ELSE
            UPDATE public.profiles SET project_id = project2_id WHERE id = company_row.id;
            
            -- Insert random memo
            IF random() > 0.5 THEN
                INSERT INTO public.mentoring_memos (company_id, author_id, content)
                VALUES (company_row.id, group2_admin_id, 'ESG 지표 개선을 위한 추가 멘토링 배정 예정.');
            END IF;
        END IF;

    END LOOP;

END $$;
