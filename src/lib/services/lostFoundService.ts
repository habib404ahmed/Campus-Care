// ============================================================
// Campus Care — Lost & Found Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  LostFoundItem,
  LostFoundItemType,
  LostFoundStatus,
  LostFoundLocationUpdate,
} from '../../types/database';

export const lostFoundService = {
  /**
   * Reports a lost or found item
   */
  async reportItem(payload: {
    reported_by: string;
    item_type: LostFoundItemType;
    title: string;
    description: string;
    status: LostFoundStatus;
    last_seen_location: string;
    last_seen_latitude?: number | null;
    last_seen_longitude?: number | null;
    image_url?: string | null;
    contact_preference?: string | null;
  }): Promise<{ data: LostFoundItem | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockItem: LostFoundItem = {
        id: `mock-item-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: mockItem, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('lost_found_items')
        .insert(payload)
        .select()
        .single();

      return { data: data as LostFoundItem, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to report item') };
    }
  },

  /**
   * Fetches active lost/found items
   */
  async getItems(statusFilter?: LostFoundStatus): Promise<{ data: LostFoundItem[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      let query = supabase
        .from('lost_found_items')
        .select('*, reporter:profiles(*)');

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      } else {
        query = query.in('status', ['lost', 'found']);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data: (data as LostFoundItem[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch items') };
    }
  },

  /**
   * Posts a location sighting/update for a lost item
   */
  async addLocationUpdate(payload: {
    item_id: string;
    updated_by: string;
    location_name: string;
    latitude?: number | null;
    longitude?: number | null;
    notes?: string | null;
  }): Promise<{ data: LostFoundLocationUpdate | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockUpdate: LostFoundLocationUpdate = {
        id: `mock-loc-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      return { data: mockUpdate, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('lost_found_location_updates')
        .insert(payload)
        .select()
        .single();

      return { data: data as LostFoundLocationUpdate, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to add location update') };
    }
  },

  /**
   * Fetches location sighting history for an item
   */
  async getItemLocationUpdates(item_id: string): Promise<{ data: LostFoundLocationUpdate[]; error: Error | null }> {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('lost_found_location_updates')
        .select('*, updater:profiles(*)')
        .eq('item_id', item_id)
        .order('created_at', { ascending: false });

      return { data: (data as LostFoundLocationUpdate[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch location updates') };
    }
  },
};
