// ============================================================
// Campus Care — In-App Notifications Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type { CampusNotification } from '../../types/database';

export const notificationService = {
  /**
   * Fetches user's notification feed
   */
  async getUserNotifications(user_id: string): Promise<{ data: CampusNotification[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      return { data: (data as CampusNotification[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch notifications') };
    }
  },

  /**
   * Marks a specific notification as read
   */
  async markAsRead(notification_id: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to mark notification as read') };
    }
  },

  /**
   * Marks all notifications for a user as read
   */
  async markAllAsRead(user_id: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user_id)
        .eq('is_read', false);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to mark all notifications as read') };
    }
  },
};
