-- Migration: Add Project Management Tables
-- Date: 2026-02-23

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER,
  start_date DATE,
  end_date DATE,
  manager_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'planned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add project_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- 3. Create mentoring_memos table
CREATE TABLE IF NOT EXISTS public.mentoring_memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all projects
DROP POLICY IF EXISTS "Super admins can manage all projects" ON public.projects;
CREATE POLICY "Super admins can manage all projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Group admins can manage projects in their group
DROP POLICY IF EXISTS "Group admins can manage their group projects" ON public.projects;
CREATE POLICY "Group admins can manage their group projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'group_admin' 
      AND p.group_id = public.projects.group_id
    )
  );

-- Users (companies) can view the project they belong to
DROP POLICY IF EXISTS "Users can view their own project" ON public.projects;
CREATE POLICY "Users can view their own project" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.project_id = public.projects.id
    )
  );

-- 5. RLS for mentoring_memos
ALTER TABLE public.mentoring_memos ENABLE ROW LEVEL SECURITY;

-- Super admins can view/manage all memos
DROP POLICY IF EXISTS "Super admins can manage all memos" ON public.mentoring_memos;
CREATE POLICY "Super admins can manage all memos" ON public.mentoring_memos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Group admins can view/manage memos for companies in their group
DROP POLICY IF EXISTS "Group admins can manage memos in their group" ON public.mentoring_memos;
CREATE POLICY "Group admins can manage memos in their group" ON public.mentoring_memos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profiles company ON company.group_id = p.group_id
      WHERE p.id = auth.uid() 
      AND p.role = 'group_admin' 
      AND company.id = public.mentoring_memos.company_id
    )
  );

-- Company users are generally not allowed to view memos written about them (for internal notes)
-- If we want them to view, we can add a policy here. For now, hidden from users.
