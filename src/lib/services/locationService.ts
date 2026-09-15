// ============================================================
// Campus Care — Campus Locations & Landmarks Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type { CampusLocation, LocationType } from '../../types/database';

export const locationService = {
  /**
   * Fetches campus locations and points of interest for map rendering
   */
  async getLocations(typeFilter?: LocationType): Promise<{ data: CampusLocation[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      let query = supabase
        .from('campus_locations')
        .select('*')
        .eq('is_active', true);

      if (typeFilter) {
        query = query.eq('location_type', typeFilter);
      }

      const { data, error } = await query.order('name', { ascending: true });
      return { data: (data as CampusLocation[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch campus locations') };
    }
  },
};
