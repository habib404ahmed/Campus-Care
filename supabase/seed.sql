-- ============================================================
-- Campus Care — seed.sql
-- Development Seed Data & Campus Locations
-- ============================================================

-- ── 1. Seed Campus Locations (Safe Points & Landmarks) ────────

INSERT INTO public.campus_locations (name, description, building, floor, latitude, longitude, location_type, is_active)
VALUES
  (
    'Central Safety & Security HQ',
    'Main 24/7 campus security dispatch and surveillance control center.',
    'Administration Tower',
    'Ground Floor',
    37.7749290,
    -122.4194160,
    'security_post',
    true
  ),
  (
    'Student Health & Urgent Care Clinic',
    'Campus outpatient medical clinic, first aid, and ambulance bay.',
    'Wellness Center',
    '1st Floor',
    37.7754000,
    -122.4182000,
    'medical_center',
    true
  ),
  (
    'Campus Fire Safety Station',
    'Emergency fire response and disaster management station.',
    'Operations Annex',
    'Ground Floor',
    37.7738000,
    -122.4205000,
    'fire_station',
    true
  ),
  (
    'Main University Library',
    'Central campus library with late-night study lounges and blue-light station.',
    'Library Complex',
    'Floors 1-4',
    37.7761000,
    -122.4173000,
    'library',
    true
  ),
  (
    'North Campus Gate & Shuttle Stop',
    'Main northern pedestrian entrance and rideshare pickup zone.',
    'North Gatehouse',
    'Exterior',
    37.7772000,
    -122.4168000,
    'gate',
    true
  ),
  (
    'South Campus Gate & Parking Plaza',
    'Primary vehicular entrance with monitored boom barrier.',
    'South Gatehouse',
    'Exterior',
    37.7725000,
    -122.4218000,
    'parking',
    true
  ),
  (
    'Student Union Canteen & Hub',
    'Dining hall and community gathering area with automated AED.',
    'Student Union',
    'Ground Floor',
    37.7745000,
    -122.4188000,
    'canteen',
    true
  ),
  (
    'Athletic Pavilion & Sports Complex',
    'Indoor stadium, outdoor fields, and perimeter running track.',
    'Recreation Center',
    'Ground Floor',
    37.7731000,
    -122.4175000,
    'sports_ground',
    true
  )
ON CONFLICT DO NOTHING;


-- ── 2. User Setup Guide (Auth & Profiles) ──────────────────────

-- Supabase users must be created through Supabase Auth (Dashboard or API).
-- Once created, you can assign them test roles using the template queries below:

/*
UPDATE public.profiles
SET role = 'admin', is_verified = true
WHERE email = 'admin@campuscare.edu';

UPDATE public.profiles
SET role = 'worker', worker_department = 'medical', is_verified = true
WHERE email = 'medical@campuscare.edu';

UPDATE public.profiles
SET role = 'worker', worker_department = 'fire', is_verified = true
WHERE email = 'fire@campuscare.edu';

UPDATE public.profiles
SET role = 'worker', worker_department = 'security', is_verified = true
WHERE email = 'security@campuscare.edu';

UPDATE public.profiles
SET role = 'student', campus_id = 'STU-2024-8821', is_verified = true
WHERE email = 'student@campuscare.edu';

UPDATE public.profiles
SET role = 'teacher', campus_id = 'TEA-4491', is_verified = true
WHERE email = 'teacher@campuscare.edu';

UPDATE public.profiles
SET role = 'faculty', campus_id = 'FAC-1029', is_verified = true
WHERE email = 'faculty@campuscare.edu';
*/
