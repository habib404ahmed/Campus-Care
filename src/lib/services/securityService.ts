// ============================================================
// Campus Care — Security & Unsafe Locations Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  SecurityReport,
  SecurityCategory,
  UnsafeLocation,
  UnsafeCategory,
  UnsafeSeverity,
  UnsafeStatus,
  IncidentPriority,
  IncidentStatus,
} from '../../types/database';

export const securityService = {
  /**
   * Submits a new security report
   */
  async createReport(payload: {
    reported_by: string;
    category: SecurityCategory;
    description: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    priority?: IncidentPriority;
  }): Promise<{ data: SecurityReport | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockReport: SecurityReport = {
        id: `mock-sec-${Date.now()}`,
        reported_by: payload.reported_by,
        category: payload.category,
        description: payload.description,
        latitude: payload.latitude,
        longitude: payload.longitude,
        location_name: payload.location_name,
        priority: payload.priority || 'medium',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: mockReport, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('security_reports')
        .insert({
          reported_by: payload.reported_by,
          category: payload.category,
          description: payload.description,
          latitude: payload.latitude,
          longitude: payload.longitude,
          location_name: payload.location_name,
          priority: payload.priority || 'medium',
          status: 'pending',
        })
        .select()
        .single();

      return { data: data as SecurityReport, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create security report') };
    }
  },

  /**
   * Fetches security reports (filtered by RLS based on role)
   */
  async getReports(): Promise<{ data: SecurityReport[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('security_reports')
        .select('*, reporter:profiles(*)')
        .order('created_at', { ascending: false });

      return { data: (data as SecurityReport[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch security reports') };
    }
  },

  /**
   * Updates status of a security report (Security workers / Admin)
   */
  async updateReportStatus(id: string, status: IncidentStatus): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    try {
      const updates: { status: IncidentStatus; resolved_at?: string } = { status };
      if (status === 'resolved' || status === 'cancelled') {
        updates.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase.from('security_reports').update(updates).eq('id', id);
      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update report status') };
    }
  },

  /**
   * Reports an unsafe spot / hazard marker
   */
  async reportUnsafeLocation(payload: {
    reported_by: string;
    category: UnsafeCategory;
    description: string;
    latitude: number;
    longitude: number;
    location_name: string;
    severity?: UnsafeSeverity;
  }): Promise<{ data: UnsafeLocation | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockUnsafe: UnsafeLocation = {
        id: `mock-unsafe-${Date.now()}`,
        reported_by: payload.reported_by,
        category: payload.category,
        description: payload.description,
        latitude: payload.latitude,
        longitude: payload.longitude,
        location_name: payload.location_name,
        severity: payload.severity || 'medium',
        status: 'reported',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: mockUnsafe, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('unsafe_locations')
        .insert({
          reported_by: payload.reported_by,
          category: payload.category,
          description: payload.description,
          latitude: payload.latitude,
          longitude: payload.longitude,
          location_name: payload.location_name,
          severity: payload.severity || 'medium',
          status: 'reported',
        })
        .select()
        .single();

      return { data: data as UnsafeLocation, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to report unsafe location') };
    }
  },

  /**
   * Fetches unsafe locations for map rendering
   */
  async getUnsafeLocations(): Promise<{ data: UnsafeLocation[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('unsafe_locations')
        .select('*')
        .order('created_at', { ascending: false });

      return { data: (data as UnsafeLocation[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch unsafe locations') };
    }
  },

  /**
   * Moderates unsafe location status (verified, resolved, etc.)
   */
  async updateUnsafeLocationStatus(id: string, status: UnsafeStatus): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    try {
      const updates: { status: UnsafeStatus; resolved_at?: string } = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase.from('unsafe_locations').update(updates).eq('id', id);
      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update unsafe location status') };
    }
  },
};
