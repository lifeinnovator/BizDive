-- Migration: Add round column to diagnosis_records
-- Date: 2026-02-24

ALTER TABLE public.diagnosis_records 
ADD COLUMN IF NOT EXISTS round INTEGER DEFAULT 1;

-- Also add project_id directly to diagnosis_records for performance and easier filtering
ALTER TABLE public.diagnosis_records
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.diagnosis_records.round IS 'ÏßÑÎã® Ï∞®Ïàò (1Ï∞? 2Ï∞? 3Ï∞???';
COMMENT ON COLUMN public.diagnosis_records.project_id IS '?¥Îãπ ÏßÑÎã®???òÌñâ???ÑÎ°ú?ùÌä∏ ID';



