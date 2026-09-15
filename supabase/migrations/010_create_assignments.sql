-- ============================================================
-- Campus Care — 010_create_assignments.sql
-- Incident worker assignment tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS public.incident_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (
    status IN ('assigned', 'accepted', 'in_progress', 'completed', 'declined')
  ),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assignments_incident ON public.incident_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON public.incident_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.incident_assignments(status);
