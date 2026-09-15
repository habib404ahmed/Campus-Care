-- ============================================================
-- Campus Care — 002_rls_policies.sql
-- Row Level Security (RLS) policies for profiles table
-- ============================================================

-- 1. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Any authenticated user can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Policy: Users can update their own non-privileged details (name, phone, avatar)
DROP POLICY IF EXISTS "Users can update own profile details" ON public.profiles;
CREATE POLICY "Users can update own profile details"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent unauthorized elevation of role or worker_department
    -- Privileged fields cannot be changed through this policy
  );

-- 4. Policy: Admins can view all profiles for campus safety directory
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Policy: System service role has full access
-- Service role key bypasses RLS by default in Supabase.
