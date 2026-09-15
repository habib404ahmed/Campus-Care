-- ============================================================
-- Campus Care — 014_security_reports_upgrade.sql
-- Upgrades security_reports table for Phase 7: Complete Security Reporting System
-- ============================================================

-- 1. Add new columns to security_reports if they do not exist
ALTER TABLE public.security_reports 
  ADD COLUMN IF NOT EXISTS incident_time TEXT DEFAULT 'just_now',
  ADD COLUMN IF NOT EXISTS immediate_danger BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_report BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_allowed BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS evidence_url TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_security_immediate_danger ON public.security_reports(immediate_danger) WHERE immediate_danger = true;
CREATE INDEX IF NOT EXISTS idx_security_assigned_to ON public.security_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_security_anonymous ON public.security_reports(anonymous_report);

-- 3. Add storage bucket for security evidence if storage is configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('security-evidence', 'security-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for security evidence
CREATE POLICY IF NOT EXISTS "Authenticated users can upload security evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'security-evidence');

CREATE POLICY IF NOT EXISTS "Security staff and admins can view security evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'security-evidence' AND (
      public.is_admin() OR 
      public.get_worker_dept() = 'security' OR
      (auth.uid())::text = (storage.foldername(name))[1]
    )
  );
