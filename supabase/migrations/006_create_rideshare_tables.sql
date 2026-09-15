-- ============================================================
-- Campus Care — 006_create_rideshare_tables.sql
-- Peer campus rideshare postings and passenger ride requests
-- ============================================================

-- 1. Rides table
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_latitude NUMERIC(10, 7) CHECK (origin_latitude IS NULL OR (origin_latitude BETWEEN -90 AND 90)),
  origin_longitude NUMERIC(10, 7) CHECK (origin_longitude IS NULL OR (origin_longitude BETWEEN -180 AND 180)),
  destination_latitude NUMERIC(10, 7) CHECK (destination_latitude IS NULL OR (destination_latitude BETWEEN -90 AND 90)),
  destination_longitude NUMERIC(10, 7) CHECK (destination_longitude IS NULL OR (destination_longitude BETWEEN -180 AND 180)),
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 1 CHECK (available_seats >= 0),
  vehicle_type TEXT,
  cost_sharing TEXT,
  meeting_point TEXT,
  safety_notes TEXT,
  is_verified_creator BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'full', 'started', 'completed', 'cancelled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_departure ON public.rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_created_by ON public.rides(created_by);

DROP TRIGGER IF EXISTS on_rides_updated ON public.rides;
CREATE TRIGGER on_rides_updated
  BEFORE UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Ride requests table
CREATE TABLE IF NOT EXISTS public.ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')
  ),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ride_requests_ride ON public.ride_requests(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_requester ON public.ride_requests(requester_id);

-- Enforce rule: A user cannot request the same ride multiple times while an active request exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_ride_request
  ON public.ride_requests(ride_id, requester_id)
  WHERE status IN ('pending', 'accepted');

DROP TRIGGER IF EXISTS on_ride_requests_updated ON public.ride_requests;
CREATE TRIGGER on_ride_requests_updated
  BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Automatic seat counter management trigger
CREATE OR REPLACE FUNCTION public.handle_ride_seat_adjustment()
RETURNS TRIGGER AS $$
DECLARE
  current_seats INTEGER;
BEGIN
  -- When request becomes accepted: decrement seat
  IF (TG_OP = 'UPDATE' AND OLD.status <> 'accepted' AND NEW.status = 'accepted') THEN
    SELECT available_seats INTO current_seats FROM public.rides WHERE id = NEW.ride_id FOR UPDATE;
    IF current_seats <= 0 THEN
      RAISE EXCEPTION 'No available seats remaining on this ride.';
    END IF;

    UPDATE public.rides
    SET available_seats = available_seats - 1,
        status = CASE WHEN available_seats - 1 = 0 THEN 'full' ELSE status END,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.ride_id;

  -- When an accepted request is cancelled or rejected: release seat
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status IN ('cancelled', 'rejected')) THEN
    UPDATE public.rides
    SET available_seats = available_seats + 1,
        status = CASE WHEN status = 'full' THEN 'open' ELSE status END,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.ride_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ride_request_status_change ON public.ride_requests;
CREATE TRIGGER on_ride_request_status_change
  AFTER UPDATE OF status ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ride_seat_adjustment();
