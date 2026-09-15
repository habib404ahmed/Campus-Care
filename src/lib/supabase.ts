// ============================================================
// Campus Care — Supabase Client Setup
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.trim() !== '' &&
    SUPABASE_ANON_KEY.trim() !== '' &&
    !SUPABASE_URL.includes('your-project')
  );
};

// Use placeholder credentials when not configured so app doesn't crash at startup
const validUrl = isSupabaseConfigured() ? SUPABASE_URL : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
