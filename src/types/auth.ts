// ============================================================
// Campus Care — Authentication & Authorization Types
// ============================================================

import type { User as SupabaseUser } from '@supabase/supabase-js';

export const APP_ROLES = ['admin', 'student', 'teacher', 'faculty', 'worker'] as const;
export type AuthRole = (typeof APP_ROLES)[number];

export const WORKER_DEPARTMENTS = ['medical', 'fire', 'security'] as const;
export type WorkerDepartment = (typeof WORKER_DEPARTMENTS)[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: AuthRole;
  worker_department?: WorkerDepartment | null;
  campus_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher' | 'faculty';
  campusId?: string;
  phone?: string;
}

export interface AuthContextValue {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: SignInPayload) => Promise<{ error: Error | null; profile?: Profile | null }>;
  signUp: (payload: SignUpPayload) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
