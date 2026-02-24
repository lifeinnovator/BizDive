-- Migration: Expand Project Management for B2B SaaS
-- Date: 2026-02-24

-- 1. Add round and sponsor_agency to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS round INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sponsor_agency TEXT;

-- 2. Verify or update RLS for projects
-- Ensure Group Admins only see their own group's projects. 
-- (This policy was already added in the previous migration, but we recreate to ensure safety)
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

-- 3. Prepare for Magic Links
-- Add magic_link_token to profiles or create a separate table if tracking is complex.
-- For now, let's add magic_link_token to public.profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS magic_link_token UUID DEFAULT uuid_generate_v4();

-- Add index for fast magic link lookups
CREATE INDEX IF NOT EXISTS idx_profiles_magic_link ON public.profiles(magic_link_token);

-- Update RLS for profiles so magic link queries can run
-- (Depending on how magical links are verified, this might be bypassed using `service_role` in the API, which is safer.
-- We will use the service_role key in the backend API to verify magic links, so no changes to RLS are strictly required for unauthenticated users accessing magic links.)



