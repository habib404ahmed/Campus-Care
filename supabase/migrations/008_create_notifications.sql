-- ============================================================
-- Campus Care — 008_create_notifications.sql
-- Recipient-specific in-app notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('emergency', 'security', 'ride', 'lost_found', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_type TEXT CHECK (
    reference_type IN ('emergency', 'security_report', 'unsafe_location', 'ride', 'ride_request', 'lost_found', 'system')
    OR reference_type IS NULL
  ),
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
