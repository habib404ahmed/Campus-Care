// ============================================================
// Campus Care — Environment Variable Helpers
// All config accessed through typed helpers — never hard-code secrets.
// ============================================================

/**
 * App metadata
 */
export const APP_NAME = 'Campus Care';
export const APP_TAGLINE = 'Your Campus. Your Safety. Your Community.';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';

/**
 * Supabase (Phase 2)
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
 * Never put real values here.
 */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Map provider (Phase 2+)
 * Set VITE_MAP_API_KEY in your .env file.
 */
export const MAP_API_KEY: string = import.meta.env.VITE_MAP_API_KEY ?? '';
export const MAP_PROVIDER: string = import.meta.env.VITE_MAP_PROVIDER ?? 'google';

/**
 * Feature flags
 */
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
