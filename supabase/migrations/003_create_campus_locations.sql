-- ============================================================
-- Campus Care — 003_create_campus_locations.sql
-- Master table for known campus points of interest & safety posts
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campus_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  building TEXT,
  floor TEXT,
  latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location_type TEXT NOT NULL CHECK (
    location_type IN (
      'building',
      'gate',
      'parking',
      'library',
      'canteen',
      'medical_center',
      'fire_station',
      'security_post',
      'sports_ground',
      'other'
    )
  ),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for location lookup
CREATE INDEX IF NOT EXISTS idx_campus_locations_type ON public.campus_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_campus_locations_active ON public.campus_locations(is_active);
