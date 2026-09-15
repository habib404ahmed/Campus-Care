-- ============================================================
-- Campus Care — 005_create_security_tables.sql
-- Security reports and unsafe location records for campus safety map
-- ============================================================

-- 1. Security incident reports table
CREATE TABLE IF NOT EXISTS public.security_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (
    category IN ('theft', 'suspicious_activity', 'harassment', 'vandalism', 'trespassing', 'other')
  ),
  description TEXT NOT NULL,
  latitude NUMERIC(10, 7) CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude NUMERIC(10, 7) CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  location_name TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'cancelled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_security_status ON public.security_reports(status);
CREATE INDEX IF NOT EXISTS idx_security_created_at ON public.security_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_reported_by ON public.security_reports(reported_by);

DROP TRIGGER IF EXISTS on_security_reports_updated ON public.security_reports;
CREATE TRIGGER on_security_reports_updated
  BEFORE UPDATE ON public.security_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Unsafe locations table (lighting, isolated spots, hazard markers)
CREATE TABLE IF NOT EXISTS public.unsafe_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (
    category IN ('poor_lighting', 'isolated_area', 'broken_road', 'suspicious_activity', 'unsafe_parking', 'other')
  ),
  description TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location_name TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (
    status IN ('reported', 'under_review', 'verified', 'resolved')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_unsafe_locations_status ON public.unsafe_locations(status);
CREATE INDEX IF NOT EXISTS idx_unsafe_locations_category ON public.unsafe_locations(category);
CREATE INDEX IF NOT EXISTS idx_unsafe_locations_reported_by ON public.unsafe_locations(reported_by);

DROP TRIGGER IF EXISTS on_unsafe_locations_updated ON public.unsafe_locations;
CREATE TRIGGER on_unsafe_locations_updated
  BEFORE UPDATE ON public.unsafe_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
