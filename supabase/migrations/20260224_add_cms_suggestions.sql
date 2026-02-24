-- supabase/migrations/20260224_add_cms_suggestions.sql

-- 1. Create Question Suggestions Table
CREATE TABLE IF NOT EXISTS public.question_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_suggestion TEXT,
    weight_suggestion FLOAT,
    rationale_suggestion TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.question_suggestions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Super Admins: Can see and manage all suggestions
CREATE POLICY "Super admins can manage all suggestions" ON public.question_suggestions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'super_admin'
        )
    );

-- Group Admins: Can create suggestions and view their own
CREATE POLICY "Group admins can create suggestions" ON public.question_suggestions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'group_admin'
        )
    );

CREATE POLICY "Group admins can view own suggestions" ON public.question_suggestions
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- 4. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_suggestions_updated_at
    BEFORE UPDATE ON public.question_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();



