-- supabase/seed_v3.sql
-- This script sets up a Super Admin, test groups, test users, and related diagnosis data.
-- It is designed to be fully idempotent (can be run multiple times safely).

DO $$
DECLARE
    admin_id uuid;
    group1_id uuid := '20000000-0000-0000-0000-000000000001'::uuid;
    group2_id uuid := '20000000-0000-0000-0000-000000000002'::uuid;
    user_idx int;
    user_id_val uuid;
    group_id_val uuid;
    record_idx int;
    role_val text;
    user_email text;
BEGIN
    -- Ensure extensions are available
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- ==========================================
    -- 1. Create 2 Test Groups (Institutions)
    -- ==========================================
    INSERT INTO public.groups (id, name, description) VALUES 
        (group1_id, '스타트업 액셀러레이터 A', '초기 스타트업 지원을 위한 1기 교육 프로그램'),
        (group2_id, '창업진흥원 C-프로그램', '지역 중소기업 성장 촉진 관리기관')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 2. Create/Update Super Admin Account
    -- ==========================================
    user_email := 'admin@bizdive.com';
    SELECT id INTO admin_id FROM auth.users WHERE email = user_email;

    IF admin_id IS NULL THEN
        admin_id := '10000000-0000-0000-0000-000000000000'::uuid;
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (
            admin_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            user_email, 
            crypt('1234321', gen_salt('bf')), 
            now(), 
            '{"provider":"email","providers":["email"]}'::jsonb, 
            '{"name": "최고관리자"}'::jsonb, 
            now(), 
            now()
        );
    ELSE
        UPDATE auth.users SET encrypted_password = crypt('1234321', gen_salt('bf')) WHERE id = admin_id;
    END IF;

    -- Ensure Public Profile for Admin
    INSERT INTO public.profiles (id, email, role, user_name, company_name)
    VALUES (admin_id, user_email, 'super_admin', '최고관리자', 'BizDive')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'super_admin', user_name = '최고관리자', company_name = 'BizDive';

    -- ==========================================
    -- 3. Create 20 Test Companies and Records
    -- ==========================================
    FOR user_idx IN 1..20 LOOP
        user_email := 'company' || user_idx || '_test@example.com';
        role_val := 'user';
        
        -- Assign half to Group 1, half to Group 2
        IF user_idx <= 10 THEN
            group_id_val := group1_id;
            IF user_idx = 1 THEN role_val := 'group_admin'; END IF; 
        ELSE
            group_id_val := group2_id;
            IF user_idx = 11 THEN role_val := 'group_admin'; END IF;
        END IF;

        -- Check if user exists
        SELECT id INTO user_id_val FROM auth.users WHERE email = user_email;

        IF user_id_val IS NULL THEN
            user_id_val := gen_random_uuid();
            -- A. Create Auth User
            INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
            VALUES (
                user_id_val, 
                '00000000-0000-0000-0000-000000000000', 
                'authenticated', 
                'authenticated', 
                user_email, 
                crypt('test1234', gen_salt('bf')), 
                now(), 
                '{"provider":"email","providers":["email"]}'::jsonb, 
                ('{"name": "테스트 참가 기업 ' || user_idx || '"}')::jsonb, 
                now(), 
                now()
            );
        END IF;
            
        -- B. Ensure public.profile exists and is updated
        INSERT INTO public.profiles (id, email, group_id, role, user_name, company_name)
        VALUES (
            user_id_val,
            user_email,
            group_id_val,
            role_val,
            CASE WHEN role_val = 'group_admin' THEN '기관 담당자 (테스트)' ELSE '참가 기업 담당자' END,
            CASE WHEN role_val = 'group_admin' THEN '테스트 기관그룹' ELSE '테스트 참가 기업 ' || user_idx END
        )
        ON CONFLICT (id) DO UPDATE 
        SET group_id = EXCLUDED.group_id, 
            role = EXCLUDED.role,
            user_name = EXCLUDED.user_name,
            company_name = EXCLUDED.company_name;

        -- C. Create random diagnosis tests (if standard user)
        IF role_val = 'user' THEN
            -- Only create records if none exist or to reach a target count for demo
            IF NOT EXISTS (SELECT 1 FROM public.diagnosis_records WHERE user_id = user_id_val) THEN
                FOR record_idx IN 1..((random() * 2)::int + 1) LOOP
                    INSERT INTO public.diagnosis_records (user_id, total_score, responses, dimension_scores, created_at)
                    VALUES (
                        user_id_val, 
                        floor(random() * 40 + 60), 
                        '{"D1-C-001": 5, "D2-S-005": 4}'::jsonb, 
                        ('{"D1": ' || floor(random() * 20 + 80) || ', "D2": ' || floor(random() * 30 + 70) || ', "D4": ' || floor(random() * 40 + 60) || '}')::jsonb,
                        now() - (random() * 20 || ' days')::interval 
                    );
                END LOOP;
            END IF;
        END IF;
    END LOOP;

END $$;
