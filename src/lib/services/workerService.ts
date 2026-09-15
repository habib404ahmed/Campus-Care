// ============================================================
// Campus Care — Worker Availability & Dispatch Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  WorkerStatusRecord,
  WorkerDutyStatus,
  IncidentAssignment,
  AssignmentStatus,
} from '../../types/database';
import type { WorkerDepartment } from '../../types/auth';

export const workerService = {
  /**
   * Fetches current status of a worker
   */
  async getStatus(worker_id: string): Promise<{ data: WorkerStatusRecord | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return {
        data: {
          id: `mock-ws-${worker_id}`,
          worker_id,
          department: 'security',
          status: 'on_duty',
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    try {
      const { data, error } = await supabase
        .from('worker_status')
        .select('*')
        .eq('worker_id', worker_id)
        .single();

      return { data: data as WorkerStatusRecord, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to get worker status') };
    }
  },

  /**
   * Updates or registers on-duty / availability status
   */
  async updateStatus(
    worker_id: string,
    department: WorkerDepartment,
    status: WorkerDutyStatus
  ): Promise<{ data: WorkerStatusRecord | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return {
        data: {
          id: `mock-ws-${worker_id}`,
          worker_id,
          department,
          status,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    try {
      const { data, error } = await supabase
        .from('worker_status')
        .upsert(
          {
            worker_id,
            department,
            status,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: 'worker_id' }
        )
        .select()
        .single();

      return { data: data as WorkerStatusRecord, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update worker status') };
    }
  },

  /**
   * Fetches incident assignments for a worker
   */
  async getWorkerAssignments(worker_id: string): Promise<{ data: IncidentAssignment[]; error: Error | null }> {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('incident_assignments')
        .select('*, incident:emergency_incidents(*)')
        .eq('worker_id', worker_id)
        .order('assigned_at', { ascending: false });

      return { data: (data as IncidentAssignment[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch worker assignments') };
    }
  },

  /**
   * Worker accepts, progresses, or completes an assigned emergency
   */
  async updateAssignmentStatus(
    assignment_id: string,
    status: AssignmentStatus
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    try {
      const updates: { status: AssignmentStatus; accepted_at?: string; completed_at?: string } = { status };
      if (status === 'accepted') {
        updates.accepted_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('incident_assignments')
        .update(updates)
        .eq('id', assignment_id);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update assignment status') };
    }
  },
};
