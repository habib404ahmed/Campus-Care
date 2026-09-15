-- ============================================================
-- Campus Care — 013_realtime_setup.sql
-- Publication configuration for Supabase Realtime event streaming
-- ============================================================

-- Ensure the supabase_realtime publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add real-time enabled tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_location_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.unsafe_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.worker_status;
