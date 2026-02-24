
DO $$
DECLARE
    admin_id uuid;
    user_email text := 'admin@bizdive.com';
BEGIN
    SELECT id INTO admin_id FROM auth.users WHERE email = user_email;

    IF admin_id IS NULL THEN
        admin_id := '10000000-0000-0000-0000-000000000000'::uuid;
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, phone_confirmed_at)
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
            now(),
            false,
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
END $$;
