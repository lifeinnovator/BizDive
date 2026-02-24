-- Migration: Add RBAC and Group Management
-- Date: 2026-02-23

-- 1. Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'group_admin', 'user')),
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

-- 3. Update RLS policies for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Everyone can view groups (required for onboarding/mapping)
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON public.groups;
CREATE POLICY "Groups are viewable by everyone" ON public.groups
  FOR SELECT USING (true);

-- Only super_admin can manage groups
DROP POLICY IF EXISTS "Super admins can manage groups" ON public.groups;
CREATE POLICY "Super admins can manage groups" ON public.groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- 4. Update RLS policies for profiles (Admin access)
-- Super Admin can view all profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Group Admin can view profiles in their group
DROP POLICY IF EXISTS "Group admins can view group profiles" ON public.profiles;
CREATE POLICY "Group admins can view group profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() 
      AND p.role = 'group_admin' 
      AND p.group_id = public.profiles.group_id
    )
  );

-- Users can view their own profiles (Essential for app to function)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Update RLS policies for diagnosis_records (Admin access)
-- Super Admin can view all records
DROP POLICY IF EXISTS "Super admins can view all diagnosis" ON public.diagnosis_records;
CREATE POLICY "Super admins can view all diagnosis" ON public.diagnosis_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Group Admin can view records for users in their group
DROP POLICY IF EXISTS "Group admins can view group diagnosis" ON public.diagnosis_records;
CREATE POLICY "Group admins can view group diagnosis" ON public.diagnosis_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      JOIN public.profiles AS u ON p.group_id = u.group_id
      WHERE p.id = auth.uid() 
      AND p.role = 'group_admin' 
      AND u.id = public.diagnosis_records.user_id
    )
  );

-- Users can view their own diagnosis (Essential for dashboard)
DROP POLICY IF EXISTS "Users can view own diagnosis" ON public.diagnosis_records;
CREATE POLICY "Users can view own diagnosis" ON public.diagnosis_records
  FOR SELECT USING (auth.uid() = user_id);
