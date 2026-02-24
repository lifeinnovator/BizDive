
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table is managed by Supabase Auth, so we create a public profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT,
  stage TEXT CHECK (stage IN ('P', 'E', 'V', 'M')), -- Pre-Startup, Early-Stage, Venture/Scale-up, Mid-sized
  industry TEXT CHECK (industry IN ('I', 'H', 'L', 'CT')), -- IT, Hardware, Local, Content
  user_name TEXT,
  user_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Questions Master Table
-- This table stores all 762+ questions from the Excel files
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY, -- e.g., 'D1-C-001'
  dimension TEXT NOT NULL CHECK (dimension IN ('D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7')),
  content TEXT NOT NULL,
  score_weight FLOAT DEFAULT 1.0,
  rationale TEXT,
  category TEXT NOT NULL CHECK (category IN ('common', 'stage', 'industry', 'esg')),
  mapping_code TEXT, -- 'P', 'E', 'I', 'H' or NULL for common
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Diagnosis Records (To store results)
CREATE TABLE IF NOT EXISTS public.diagnosis_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- Stores the answers { "q_id": score }
  total_score FLOAT,
  dimension_scores JSONB, -- { "D1": 80, "D2": 60 ... }
  stage_result TEXT, -- S, A, B, C, D
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_records ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions: Everyone can read questions (public reference)
CREATE POLICY "Everyone can read questions" ON public.questions
  FOR SELECT USING (true);

-- Allow authenticated users to insert questions (For Seeding Purpose - In prod, restrict to admin)
CREATE POLICY "Authenticated can insert questions" ON public.questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Diagnosis Records: Users can insert and view their own records
CREATE POLICY "Users can insert own diagnosis" ON public.diagnosis_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnosis" ON public.diagnosis_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnosis" ON public.diagnosis_records
  FOR DELETE USING (auth.uid() = user_id);



