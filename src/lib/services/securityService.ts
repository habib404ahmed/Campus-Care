// ============================================================
// Campus Care — Security & Unsafe Locations Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { notificationService } from './notificationService';
import type {
  SecurityReport,
  SecurityCategory,
  SecurityStatus,
  SecurityPriority,
  UnsafeLocation,
  UnsafeCategory,
  UnsafeSeverity,
  UnsafeStatus,
} from '../../types/database';
import type { Profile } from '../../types/auth';

const LOCAL_STORAGE_KEY = 'campus_care_demo_security_reports';

function createAnonymousProfile(createdAt: string, updatedAt: string): Profile {
  return {
    id: 'anonymous',
    full_name: 'Anonymous Reporter',
    email: 'hidden@campus.care',
    phone: 'Hidden',
    role: 'student',
    worker_department: null,
    campus_id: null,
    avatar_url: null,
    is_active: true,
    is_verified: true,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function getLocalReports(): SecurityReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: SecurityReport[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('campus_care_security_sync'));
  } catch (err) {
    console.error('Failed to persist local security reports:', err);
  }
}

/**
 * Calculates controlled priority for security reports
 * Immediate danger always sets priority to critical
 */
export function calculateSecurityPriority(
  category: SecurityCategory,
  immediateDanger: boolean
): SecurityPriority {
  if (immediateDanger) return 'critical';
  if (category === 'threatening_behavior' || category === 'unauthorized_access') return 'high';
  if (category === 'suspicious_activity' || category === 'harassment' || category === 'theft') return 'medium';
  return 'low';
}

export interface CreateSecurityReportPayload {
  reported_by: string;
  category: SecurityCategory;
  description: string;
  incident_time?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  immediate_danger?: boolean;
  anonymous_report?: boolean;
  contact_allowed?: boolean;
  evidence_url?: string | null;
}

export const securityService = {
  /**
   * Helper to calculate priority
   */
  calculateSecurityPriority,

  /**
   * Submits a new security report
   */
  async createSecurityReport(
    payload: CreateSecurityReportPayload
  ): Promise<{ data: SecurityReport | null; referenceId: string; error: Error | null }> {
    const immediateDanger = payload.immediate_danger ?? false;
    const priority = calculateSecurityPriority(payload.category, immediateDanger);
    const incidentTime = payload.incident_time || 'just_now';
    const anonymous = payload.anonymous_report ?? false;
    const contactAllowed = payload.contact_allowed ?? true;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `CC-SEC-${randomSuffix}`;

    if (!isSupabaseConfigured()) {
      const mockReport: SecurityReport = {
        id: `sec-${Date.now()}-${randomSuffix}`,
        reported_by: payload.reported_by,
        category: payload.category,
        description: payload.description,
        incident_time: incidentTime,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_name: payload.location_name || 'Campus Grounds',
        immediate_danger: immediateDanger,
        anonymous_report: anonymous,
        contact_allowed: contactAllowed,
        evidence_url: payload.evidence_url ?? null,
        priority,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const existing = getLocalReports();
      saveLocalReports([mockReport, ...existing]);

      // Trigger simulated dispatch notification to security
      try {
        await notificationService.createNotification({
          user_id: 'security-dispatch-team',
          title: immediateDanger ? '🚨 High Priority Security Report' : '🛡️ New Security Report',
          message: immediateDanger
            ? 'An immediate safety concern has been reported.'
            : 'A new campus security report requires review.',
          type: 'security',
          reference_id: mockReport.id,
          reference_type: 'security_report',
        });
      } catch {
        // notification non-blocking
      }

      return { data: mockReport, referenceId, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('security_reports')
        .insert({
          reported_by: payload.reported_by,
          category: payload.category,
          description: payload.description,
          incident_time: incidentTime,
          latitude: payload.latitude,
          longitude: payload.longitude,
          location_name: payload.location_name,
          immediate_danger: immediateDanger,
          anonymous_report: anonymous,
          contact_allowed: contactAllowed,
          evidence_url: payload.evidence_url,
          priority,
          status: 'pending',
        })
        .select()
        .single();

      if (error || !data) {
        return { data: null, referenceId, error };
      }

      // Notify security dispatch
      try {
        await notificationService.createNotification({
          user_id: 'security-dispatch-team',
          title: immediateDanger ? '🚨 High Priority Security Report' : '🛡️ New Security Report',
          message: immediateDanger
            ? 'An immediate safety concern has been reported.'
            : 'A new campus security report requires review.',
          type: 'security',
          reference_id: data.id,
          reference_type: 'security_report',
        });
      } catch {
        // notification non-blocking
      }

      return { data: data as SecurityReport, referenceId, error: null };
    } catch (err: unknown) {
      return {
        data: null,
        referenceId,
        error: err instanceof Error ? err : new Error('Failed to create security report'),
      };
    }
  },

  /**
   * Alias for backward compatibility
   */
  async createReport(payload: {
    reported_by: string;
    category: SecurityCategory;
    description: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    priority?: SecurityPriority;
  }) {
    return this.createSecurityReport({
      ...payload,
      immediate_danger: payload.priority === 'critical',
    });
  },

  /**
   * Fetches single security report with reporter details (masks anonymous reports for standard workers)
   */
  async getSecurityReport(
    id: string,
    viewerRole?: string,
    viewerId?: string
  ): Promise<{ data: SecurityReport | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const reports = getLocalReports();
      const report = reports.find((r) => r.id === id) || null;
      if (!report) return { data: null, error: new Error('Report not found') };

      // Apply anonymity mask if viewer is worker (not admin or original author)
      if (report.anonymous_report && viewerRole !== 'admin' && viewerId !== report.reported_by) {
        return {
          data: {
            ...report,
            reporter: createAnonymousProfile(report.created_at, report.updated_at),
          },
          error: null,
        };
      }

      return { data: report, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('security_reports')
        .select('*, reporter:profiles(*), assigned_worker:assigned_to(*)')
        .eq('id', id)
        .single();

      if (error || !data) return { data: null, error };

      const report = data as SecurityReport;
      if (report.anonymous_report && viewerRole !== 'admin' && viewerId !== report.reported_by) {
        report.reporter = createAnonymousProfile(report.created_at, report.updated_at);
      }

      return { data: report, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to fetch security report') };
    }
  },

  /**
   * Fetches reports submitted by specific user
   */
  async getUserSecurityReports(
    userId: string
  ): Promise<{ data: SecurityReport[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const reports = getLocalReports();
      const userReports = reports.filter((r) => r.reported_by === userId);
      return { data: userReports, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('security_reports')
        .select('*, reporter:profiles(*), assigned_worker:assigned_to(*)')
        .eq('reported_by', userId)
        .order('created_at', { ascending: false });

      return { data: (data as SecurityReport[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch user security reports') };
    }
  },

  /**
   * Fetches security reports for security workers and admins
   * Anonymizes reporter identity for reports submitted anonymously
   */
  async getSecurityReportsForWorker(
    isAdmin: boolean = false
  ): Promise<{ data: SecurityReport[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const reports = getLocalReports();
      const processed: SecurityReport[] = reports.map((r) => {
        if (r.anonymous_report && !isAdmin) {
          return {
            ...r,
            reporter: createAnonymousProfile(r.created_at, r.updated_at),
          };
        }
        return r;
      });
      return { data: processed, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('security_reports')
        .select('*, reporter:profiles(*), assigned_worker:assigned_to(*)')
        .order('created_at', { ascending: false });

      if (error || !data) return { data: [], error };

      const processed: SecurityReport[] = (data as SecurityReport[]).map((r) => {
        if (r.anonymous_report && !isAdmin) {
          return {
            ...r,
            reporter: createAnonymousProfile(r.created_at, r.updated_at),
          };
        }
        return r;
      });

      return { data: processed, error: null };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch worker security reports') };
    }
  },

  /**
   * Alias for backward compatibility
   */
  async getReports() {
    return this.getSecurityReportsForWorker(true);
  },

  /**
   * Security worker accepts a security report
   */
  async acceptSecurityReport(
    id: string,
    workerId: string
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const reports = getLocalReports();
      const updated = reports.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'assigned' as SecurityStatus,
              assigned_to: workerId,
              updated_at: new Date().toISOString(),
            }
          : r
      );
      saveLocalReports(updated);
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('security_reports')
        .update({
          status: 'assigned',
          assigned_to: workerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to accept security report') };
    }
  },

  /**
   * Security worker starts active investigation
   */
  async startInvestigation(
    id: string,
    _workerId?: string
  ): Promise<{ error: Error | null }> {
    return this.updateSecurityReport(id, 'investigating');
  },

  /**
   * Updates status of a security report
   */
  async updateSecurityReport(
    id: string,
    status: SecurityStatus,
    notes?: string
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const reports = getLocalReports();
      const updated = reports.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              notes: notes ?? r.notes,
              updated_at: new Date().toISOString(),
              resolved_at: ['resolved', 'closed', 'cancelled'].includes(status)
                ? new Date().toISOString()
                : r.resolved_at,
            }
          : r
      );
      saveLocalReports(updated);
      return { error: null };
    }

    try {
      const updates: {
        status: SecurityStatus;
        notes?: string;
        updated_at: string;
        resolved_at?: string;
      } = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (notes !== undefined) updates.notes = notes;
      if (['resolved', 'closed', 'cancelled'].includes(status)) {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('security_reports')
        .update(updates)
        .eq('id', id);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update security report status') };
    }
  },

  /**
   * Alias for backward compatibility
   */
  async updateReportStatus(id: string, status: any) {
    return this.updateSecurityReport(id, status);
  },

  /**
   * Resolves a security report
   */
  async resolveSecurityReport(
    id: string,
    _workerId?: string,
    notes?: string
  ): Promise<{ error: Error | null }> {
    return this.updateSecurityReport(id, 'resolved', notes);
  },

  /**
   * Closes a resolved security report
   */
  async closeSecurityReport(
    id: string,
    _workerId?: string,
    notes?: string
  ): Promise<{ error: Error | null }> {
    return this.updateSecurityReport(id, 'closed', notes);
  },

  /**
   * Reporter cancels their pending security report
   */
  async cancelSecurityReport(
    id: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const reports = getLocalReports();
      const updated = reports.map((r) =>
        r.id === id && r.reported_by === userId
          ? { ...r, status: 'cancelled' as SecurityStatus, updated_at: new Date().toISOString() }
          : r
      );
      saveLocalReports(updated);
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('security_reports')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('reported_by', userId);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to cancel security report') };
    }
  },

  // ── Unsafe Locations Methods (Preserved) ───────────────────────────

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
