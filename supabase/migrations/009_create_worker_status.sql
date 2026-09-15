-- ============================================================
-- Campus Care — 009_create_worker_status.sql
-- Worker availability and duty status tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS public.worker_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN ('medical', 'fire', 'security')),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'on_duty', 'busy')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_worker_status_dept ON public.worker_status(department);
CREATE INDEX IF NOT EXISTS idx_worker_status_status ON public.worker_status(status);

DROP TRIGGER IF EXISTS on_worker_status_updated ON public.worker_status;
CREATE TRIGGER on_worker_status_updated
  BEFORE UPDATE ON public.worker_status
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
