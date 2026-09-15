-- ============================================================
-- Campus Care — 007_create_lost_found_tables.sql
-- Lost & Found item registry and community location updates
-- ============================================================

-- 1. Lost and found items table
CREATE TABLE IF NOT EXISTS public.lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (
    item_type IN ('phone', 'wallet', 'id_card', 'bag', 'laptop', 'keys', 'book', 'clothing', 'other')
  ),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (
    status IN ('lost', 'found', 'claimed', 'resolved')
  ),
  last_seen_location TEXT NOT NULL,
  last_seen_latitude NUMERIC(10, 7) CHECK (last_seen_latitude IS NULL OR (last_seen_latitude BETWEEN -90 AND 90)),
  last_seen_longitude NUMERIC(10, 7) CHECK (last_seen_longitude IS NULL OR (last_seen_longitude BETWEEN -180 AND 180)),
  image_url TEXT,
  contact_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lost_found_status ON public.lost_found_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_created_at ON public.lost_found_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_found_reported_by ON public.lost_found_items(reported_by);

DROP TRIGGER IF EXISTS on_lost_found_updated ON public.lost_found_items;
CREATE TRIGGER on_lost_found_updated
  BEFORE UPDATE ON public.lost_found_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Community location updates table (manual sightings)
CREATE TABLE IF NOT EXISTS public.lost_found_location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude NUMERIC(10, 7) CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  location_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lost_found_updates_item ON public.lost_found_location_updates(item_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_updates_by ON public.lost_found_location_updates(updated_by);
