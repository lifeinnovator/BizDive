-- [DEBUG & RESTORE SCRIPT]
-- 1. Check if data exists (Should see a number > 0)
SELECT count(*) as total_diagnosis_count FROM public.diagnosis_records;

-- 2. Check your current user status
SELECT id, email, role, group_id FROM public.profiles WHERE email = 'life.innovator@gmail.com';

-- 3. TEMPORARILY DISABLE RLS to confirm data is still there
-- Run this, then refresh your /dashboard.
ALTER TABLE public.diagnosis_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. EMERGENCY RESET POLICIES (Run after confirming data is visible)
-- These are basic policies that should always work.
DROP POLICY IF EXISTS "Super admins can view all diagnosis" ON public.diagnosis_records;
DROP POLICY IF EXISTS "Users can view own diagnosis" ON public.diagnosis_records;
DROP POLICY IF EXISTS "Group admins can view group diagnosis" ON public.diagnosis_records;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Group admins can view group profiles" ON public.profiles;

-- Basic Access
CREATE POLICY "Users can view own diagnosis" ON public.diagnosis_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.diagnosis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;



