-- supabase/migrations/20260224_revert_cms_suggestions.sql

-- 1. Drop the suggestions table
DROP TABLE IF EXISTS public.question_suggestions;

-- 2. Strictly restrict the questions table to Super Admin only
-- First, drop existing policies
DROP POLICY IF EXISTS "Super admins can manage all questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.questions;

-- Create Super Admin only policy
CREATE POLICY "Super admins can manage all questions" ON public.questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- Ensure RLS is enabled
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;



