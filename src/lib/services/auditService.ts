// ============================================================
// Campus Care — Audit Logs Service (Security & Admin)
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type { AuditLog } from '../../types/database';

export const auditService = {
  /**
   * Logs a security or administrative action
   */
  async logEvent(payload: {
    actor_id?: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      const { error } = await supabase.from('audit_logs').insert({
        actor_id: payload.actor_id,
        action: payload.action,
        entity_type: payload.entity_type,
        entity_id: payload.entity_id,
        metadata: payload.metadata || {},
      });

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to record audit log') };
    }
  },

  /**
   * Fetches audit logs (Administrator only)
   */
  async getLogs(limit: number = 50): Promise<{ data: AuditLog[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, actor:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: (data as AuditLog[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch audit logs') };
    }
  },
};
