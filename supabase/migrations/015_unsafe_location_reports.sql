-- ============================================================
-- Campus Care — 015_unsafe_location_reports.sql
-- Unsafe location reporting, hotspot aggregation, and safety map schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.unsafe_location_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concern_type TEXT NOT NULL CHECK (
    concern_type IN (
      'poor_lighting',
      'isolated_area',
      'unsafe_pathway',
      'construction_hazard',
      'damaged_surface',
      'animal_concern',
      'suspicious_activity',
      'harassment_concern',
      'security_concern',
      'general_safety',
      'other'
    )
  ),
  description TEXT NOT NULL,
  latitude NUMERIC(10, 7) CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude NUMERIC(10, 7) CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  location_name TEXT NOT NULL,
  unsafe_time TEXT NOT NULL DEFAULT 'always' CHECK (
    unsafe_time IN ('always', 'morning', 'afternoon', 'evening', 'night', 'specific_time')
  ),
  frequency TEXT NOT NULL DEFAULT 'once' CHECK (
    frequency IN ('once', 'occasionally', 'frequently', 'every_day')
  ),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (
    status IN ('reported', 'reviewing', 'acknowledged', 'action_planned', 'resolved', 'closed')
  ),
  photo_path TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_unsafe_loc_status_created ON public.unsafe_location_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unsafe_loc_reported_by ON public.unsafe_location_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_unsafe_loc_concern_type ON public.unsafe_location_reports(concern_type);
CREATE INDEX IF NOT EXISTS idx_unsafe_loc_coords ON public.unsafe_location_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_unsafe_loc_reference_id ON public.unsafe_location_reports(reference_id);
CREATE INDEX IF NOT EXISTS idx_unsafe_loc_assigned_to ON public.unsafe_location_reports(assigned_to);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_unsafe_location_reports_updated ON public.unsafe_location_reports;
CREATE TRIGGER on_unsafe_location_reports_updated
  BEFORE UPDATE ON public.unsafe_location_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.unsafe_location_reports ENABLE ROW LEVEL SECURITY;

-- 1. Reporter can view their own reports
DROP POLICY IF EXISTS "Users can view own unsafe location reports" ON public.unsafe_location_reports;
CREATE POLICY "Users can view own unsafe location reports"
  ON public.unsafe_location_reports
  FOR SELECT
  TO authenticated
  USING (reported_by = auth.uid());

-- 2. Authenticated users can insert their own reports
DROP POLICY IF EXISTS "Users can create unsafe location reports" ON public.unsafe_location_reports;
CREATE POLICY "Users can create unsafe location reports"
  ON public.unsafe_location_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

-- 3. Security staff and Admins can view all operational unsafe location reports
DROP POLICY IF EXISTS "Security and Admins can view all unsafe location reports" ON public.unsafe_location_reports;
CREATE POLICY "Security and Admins can view all unsafe location reports"
  ON public.unsafe_location_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'worker' AND worker_department = 'security'))
    )
  );

-- 4. Security staff and Admins can update reports (status, notes, assignment, resolved_at)
DROP POLICY IF EXISTS "Security and Admins can update unsafe location reports" ON public.unsafe_location_reports;
CREATE POLICY "Security and Admins can update unsafe location reports"
  ON public.unsafe_location_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'worker' AND worker_department = 'security'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'worker' AND worker_department = 'security'))
    )
  );

-- Storage bucket configuration for unsafe location photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('unsafe-location-evidence', 'unsafe-location-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only report submitter or security/admin can access
DROP POLICY IF EXISTS "Upload unsafe location evidence" ON storage.objects;
CREATE POLICY "Upload unsafe location evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'unsafe-location-evidence' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Read unsafe location evidence" ON storage.objects;
CREATE POLICY "Read unsafe location evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'unsafe-location-evidence' AND (
      auth.uid() = owner OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (role = 'admin' OR (role = 'worker' AND worker_department = 'security'))
      )
    )
  );
