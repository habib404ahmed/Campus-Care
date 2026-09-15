// ============================================================
// Campus Care — AuthContext
// ============================================================

import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  AuthContextValue,
  Profile,
  SignInPayload,
  SignUpPayload,
  AuthRole,
} from '../types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Demo profiles for offline/unconfigured testing fallback
const DEMO_PROFILES: Record<string, Profile> = {
  'admin@campuscare.edu': {
    id: 'demo-admin-id',
    email: 'admin@campuscare.edu',
    full_name: 'Dr. Evelyn Reed',
    role: 'admin',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'student@campuscare.edu': {
    id: 'demo-student-id',
    email: 'student@campuscare.edu',
    full_name: 'Alex Rivera',
    role: 'student',
    campus_id: 'STU-2024-8821',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'teacher@campuscare.edu': {
    id: 'demo-teacher-id',
    email: 'teacher@campuscare.edu',
    full_name: 'Prof. David Chen',
    role: 'teacher',
    campus_id: 'TEA-4491',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'faculty@campuscare.edu': {
    id: 'demo-faculty-id',
    email: 'faculty@campuscare.edu',
    full_name: 'Sarah Jenkins',
    role: 'faculty',
    campus_id: 'FAC-1029',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'medical@campuscare.edu': {
    id: 'demo-medical-id',
    email: 'medical@campuscare.edu',
    full_name: 'Nurse Marcus Vance',
    role: 'worker',
    worker_department: 'medical',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'fire@campuscare.edu': {
    id: 'demo-fire-id',
    email: 'fire@campuscare.edu',
    full_name: 'Chief Robert Torres',
    role: 'worker',
    worker_department: 'fire',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'security@campuscare.edu': {
    id: 'demo-security-id',
    email: 'security@campuscare.edu',
    full_name: 'Officer Clara Booth',
    role: 'worker',
    worker_department: 'security',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const LOCAL_STORAGE_DEMO_KEY = 'campus_care_demo_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('Profile fetch warning:', error?.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        // Check for local demo session if Supabase is not configured
        const savedDemo = localStorage.getItem(LOCAL_STORAGE_DEMO_KEY);
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo) as Profile;
            if (isMounted) {
              setProfile(parsed);
              setUser({ id: parsed.id, email: parsed.email } as SupabaseUser);
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
          }
        }
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(p);
          }
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    if (!isSupabaseConfigured()) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        if (isMounted) setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  }, [user, fetchProfile]);

  const signIn = useCallback(async ({ email, password }: SignInPayload) => {
    if (!isSupabaseConfigured()) {
      // Demo authentication fallback
      const normalizedEmail = email.trim().toLowerCase();
      const matched = DEMO_PROFILES[normalizedEmail];
      if (matched) {
        setUser({ id: matched.id, email: matched.email } as SupabaseUser);
        setProfile(matched);
        localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(matched));
        return { error: null, profile: matched };
      }

      // Default generic student profile for any other email during demo
      const fallbackProfile: Profile = {
        id: `demo-${Date.now()}`,
        email: normalizedEmail,
        full_name: normalizedEmail.split('@')[0] || 'Campus User',
        role: 'student',
        campus_id: 'STU-DEMO',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser({ id: fallbackProfile.id, email: fallbackProfile.email } as SupabaseUser);
      setProfile(fallbackProfile);
      localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(fallbackProfile));
      return { error: null, profile: fallbackProfile };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error, profile: null };
      }
      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id);
        setProfile(p);
        return { error: null, profile: p };
      }
      return { error: new Error('User sign-in failed'), profile: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Unexpected sign-in error'), profile: null };
    }
  }, [fetchProfile]);

  const signUp = useCallback(async ({
    email,
    password,
    fullName,
    role,
    campusId,
    phone,
  }: SignUpPayload) => {
    if (!isSupabaseConfigured()) {
      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role: role as AuthRole,
        campus_id: campusId || null,
        phone: phone || null,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser({ id: newProfile.id, email: newProfile.email } as SupabaseUser);
      setProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(newProfile));
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            campus_id: campusId,
            phone,
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Automatically create or update profile record if trigger isn't yet deployed
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          campus_id: campusId || null,
          phone: phone || null,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn('Manual profile upsert notice:', profileError.message);
        }

        const p = await fetchProfile(data.user.id);
        if (p) setProfile(p);
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Signup failed') };
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
    setUser(null);
    setProfile(null);
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
  }, []);

  const value: AuthContextValue = useMemo(() => ({
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user && profile && profile.is_active),
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [user, profile, loading, signIn, signUp, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
