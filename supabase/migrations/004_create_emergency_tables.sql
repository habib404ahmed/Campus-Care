-- ============================================================
-- Campus Care — 004_create_emergency_tables.sql
-- Central emergency incidents (SOS) + medical and fire extensions
-- ============================================================

-- 1. Central emergency incidents table
CREATE TABLE IF NOT EXISTS public.emergency_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('sos', 'medical', 'fire', 'security', 'other')),
  priority TEXT NOT NULL DEFAULT 'critical' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'cancelled')
  ),
  latitude NUMERIC(10, 7) CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude NUMERIC(10, 7) CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  location_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

-- Indexes for emergency incidents
CREATE INDEX IF NOT EXISTS idx_emergency_status ON public.emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_emergency_type ON public.emergency_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_emergency_created_at ON public.emergency_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_reported_by ON public.emergency_incidents(reported_by);

-- Trigger for emergency updated_at
DROP TRIGGER IF EXISTS on_emergency_updated ON public.emergency_incidents;
CREATE TRIGGER on_emergency_updated
  BEFORE UPDATE ON public.emergency_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Medical incidents extension table
CREATE TABLE IF NOT EXISTS public.medical_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symptoms TEXT,
  injury_description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  needs_ambulance BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_medical_incident_rel ON public.medical_incidents(emergency_incident_id);
CREATE INDEX IF NOT EXISTS idx_medical_reported_by ON public.medical_incidents(reported_by);

DROP TRIGGER IF EXISTS on_medical_updated ON public.medical_incidents;
CREATE TRIGGER on_medical_updated
  BEFORE UPDATE ON public.medical_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Fire incidents extension table
CREATE TABLE IF NOT EXISTS public.fire_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_incident_id UUID NOT NULL REFERENCES public.emergency_incidents(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fire_type TEXT NOT NULL DEFAULT 'fire' CHECK (fire_type IN ('fire', 'smoke', 'gas', 'electrical', 'other')),
  smoke_visible BOOLEAN NOT NULL DEFAULT false,
  people_trapped TEXT NOT NULL DEFAULT 'unknown' CHECK (people_trapped IN ('unknown', 'yes', 'no')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fire_incident_rel ON public.fire_incidents(emergency_incident_id);
CREATE INDEX IF NOT EXISTS idx_fire_reported_by ON public.fire_incidents(reported_by);

DROP TRIGGER IF EXISTS on_fire_updated ON public.fire_incidents;
CREATE TRIGGER on_fire_updated
  BEFORE UPDATE ON public.fire_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
