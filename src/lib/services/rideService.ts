// ============================================================
// Campus Care — Rideshare Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type { Ride, RideRequest, RideRequestStatus } from '../../types/database';

export const rideService = {
  /**
   * Posts a new ride offer
   */
  async createRide(payload: {
    created_by: string;
    origin: string;
    destination: string;
    departure_time: string;
    available_seats: number;
    origin_latitude?: number | null;
    origin_longitude?: number | null;
    destination_latitude?: number | null;
    destination_longitude?: number | null;
    vehicle_type?: string | null;
    cost_sharing?: string | null;
    meeting_point?: string | null;
    safety_notes?: string | null;
    notes?: string | null;
  }): Promise<{ data: Ride | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockRide: Ride = {
        id: `mock-ride-${Date.now()}`,
        created_by: payload.created_by,
        origin: payload.origin,
        destination: payload.destination,
        departure_time: payload.departure_time,
        available_seats: payload.available_seats,
        vehicle_type: payload.vehicle_type,
        cost_sharing: payload.cost_sharing,
        meeting_point: payload.meeting_point,
        safety_notes: payload.safety_notes,
        notes: payload.notes,
        is_verified_creator: true,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: mockRide, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('rides')
        .insert({
          ...payload,
          status: 'open',
        })
        .select()
        .single();

      return { data: data as Ride, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create ride') };
    }
  },

  /**
   * Lists available active rides
   */
  async getActiveRides(): Promise<{ data: Ride[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*, creator:profiles(*)')
        .in('status', ['open', 'full'])
        .order('departure_time', { ascending: true });

      return { data: (data as Ride[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch rides') };
    }
  },

  /**
   * Submits a passenger ride request
   */
  async requestRide(payload: {
    ride_id: string;
    requester_id: string;
    message?: string | null;
  }): Promise<{ data: RideRequest | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockReq: RideRequest = {
        id: `mock-req-${Date.now()}`,
        ride_id: payload.ride_id,
        requester_id: payload.requester_id,
        message: payload.message,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: mockReq, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .insert({
          ride_id: payload.ride_id,
          requester_id: payload.requester_id,
          message: payload.message,
          status: 'pending',
        })
        .select()
        .single();

      return { data: data as RideRequest, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to request ride') };
    }
  },

  /**
   * Fetches requests for a specific ride (for the ride driver)
   */
  async getRideRequests(ride_id: string): Promise<{ data: RideRequest[]; error: Error | null }> {
    if (!isSupabaseConfigured()) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*, requester:profiles(*)')
        .eq('ride_id', ride_id)
        .order('created_at', { ascending: false });

      return { data: (data as RideRequest[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch ride requests') };
    }
  },

  /**
   * Updates passenger request status (accept, reject, cancel)
   */
  async updateRequestStatus(
    request_id: string,
    status: RideRequestStatus
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    try {
      const { error } = await supabase
        .from('ride_requests')
        .update({ status })
        .eq('id', request_id);

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update ride request status') };
    }
  },
};
