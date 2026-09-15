-- ============================================================
-- Campus Care — 001_create_profiles.sql
-- Profiles table and auth trigger
-- ============================================================

-- 1. Create profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'worker', 'student', 'teacher', 'faculty')),
  worker_department TEXT CHECK (
    (role = 'worker' AND worker_department IN ('medical', 'fire', 'security')) OR
    (role <> 'worker' AND worker_department IS NULL)
  ),
  campus_id TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Index for quick role/department queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_worker_dept ON public.profiles(worker_department);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Auth trigger: Auto-populate profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_dept TEXT;
  user_campus_id TEXT;
  user_phone TEXT;
BEGIN
  -- Extract user metadata passed from client signup
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_dept := NEW.raw_user_meta_data->>'worker_department';
  user_campus_id := NEW.raw_user_meta_data->>'campus_id';
  user_phone := NEW.raw_user_meta_data->>'phone';

  -- Enforce default safety: newly registered public users cannot self-assign 'admin' or 'worker'
  IF user_role NOT IN ('student', 'teacher', 'faculty', 'worker', 'admin') THEN
    user_role := 'student';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    worker_department,
    campus_id,
    phone,
    is_active,
    is_verified
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    user_dept,
    user_campus_id,
    user_phone,
    true,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
