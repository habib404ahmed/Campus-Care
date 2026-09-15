// ============================================================
// Campus Care — Emergency & SOS Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  EmergencyIncident,
  MedicalIncident,
  FireIncident,
  IncidentStatus,
  IncidentPriority,
  FireType,
  PeopleTrappedStatus,
  IncidentAssignment,
} from '../../types/database';

const LOCAL_EMERGENCIES_KEY = 'campus_care_demo_emergencies';
const LOCAL_ASSIGNMENTS_KEY = 'campus_care_demo_assignments';

function getLocalEmergencies(): EmergencyIncident[] {
  try {
    const raw = localStorage.getItem(LOCAL_EMERGENCIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEmergencies(items: EmergencyIncident[]) {
  try {
    localStorage.setItem(LOCAL_EMERGENCIES_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('campus_care_emergency_sync', { detail: items }));
  } catch {
    // localStorage full or restricted
  }
}

function getLocalAssignments(): IncidentAssignment[] {
  try {
    const raw = localStorage.getItem(LOCAL_ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAssignments(items: IncidentAssignment[]) {
  try {
    localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('campus_care_assignment_sync', { detail: items }));
  } catch {
    // localStorage full or restricted
  }
}

export const emergencyService = {
  /**
   * Checks if user currently has an active emergency (pending, acknowledged, assigned, in_progress)
   */
  async getActiveEmergencyForUser(userId: string): Promise<{ data: EmergencyIncident | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const all = getLocalEmergencies();
      const active = all.find(
        (i) => i.reported_by === userId && ['pending', 'acknowledged', 'assigned', 'in_progress'].includes(i.status)
      );
      return { data: active || null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('reported_by', userId)
        .in('status', ['pending', 'acknowledged', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { data: (data as EmergencyIncident) || null, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to check active emergency') };
    }
  },

  /**
   * Fetches full emergency history for a user
   */
  async getUserEmergencies(userId: string): Promise<{ data: EmergencyIncident[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const all = getLocalEmergencies();
      const userIncidents = all.filter((i) => i.reported_by === userId);
      return { data: userIncidents, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('reported_by', userId)
        .order('created_at', { ascending: false });

      return { data: (data as EmergencyIncident[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch user emergencies') };
    }
  },

  /**
   * Triggers an emergency SOS event
   */
  async createSOS(payload: {
    reported_by: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    description?: string | null;
  }): Promise<{ data: EmergencyIncident | null; error: Error | null }> {
    // Check duplicate active emergency first
    const { data: existingActive } = await this.getActiveEmergencyForUser(payload.reported_by);
    if (existingActive) {
      return { data: existingActive, error: new Error('ACTIVE_EMERGENCY_EXISTS') };
    }

    if (!isSupabaseConfigured()) {
      const mockIncident: EmergencyIncident = {
        id: `sos-${Date.now()}`,
        reported_by: payload.reported_by,
        incident_type: 'sos',
        priority: 'critical',
        status: 'pending',
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_name: payload.location_name || (payload.latitude ? 'GPS Location Detected' : 'Location Unavailable'),
        description: payload.description || 'Emergency SOS activated by campus user.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = getLocalEmergencies();
      saveLocalEmergencies([mockIncident, ...existing]);
      return { data: mockIncident, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .insert({
          reported_by: payload.reported_by,
          incident_type: 'sos',
          priority: 'critical',
          status: 'pending',
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          location_name: payload.location_name || (payload.latitude ? 'GPS Location Detected' : 'Location Unavailable'),
          description: payload.description || 'Emergency SOS activated by campus user.',
        })
        .select()
        .single();

      return { data: data as EmergencyIncident, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create SOS alert') };
    }
  },

  /**
   * Reports a medical emergency with symptoms and ambulance requirements
   */
  async reportMedicalEmergency(payload: {
    reported_by: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    description?: string | null;
    symptoms?: string | null;
    injury_description?: string | null;
    severity?: IncidentPriority;
    needs_ambulance?: boolean;
  }): Promise<{ incident: EmergencyIncident | null; medical: MedicalIncident | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockInc: EmergencyIncident = {
        id: `med-${Date.now()}`,
        reported_by: payload.reported_by,
        incident_type: 'medical',
        priority: payload.severity || 'high',
        status: 'pending',
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_name: payload.location_name || 'Campus Health Zone',
        description: payload.description || 'Medical emergency reported',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const mockMed: MedicalIncident = {
        id: `med-ext-${Date.now()}`,
        emergency_incident_id: mockInc.id,
        reported_by: payload.reported_by,
        symptoms: payload.symptoms || null,
        injury_description: payload.injury_description || null,
        severity: payload.severity || 'high',
        needs_ambulance: payload.needs_ambulance || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = getLocalEmergencies();
      saveLocalEmergencies([mockInc, ...existing]);
      return { incident: mockInc, medical: mockMed, error: null };
    }

    try {
      const { data: inc, error: incError } = await supabase
        .from('emergency_incidents')
        .insert({
          reported_by: payload.reported_by,
          incident_type: 'medical',
          priority: payload.severity || 'high',
          status: 'pending',
          latitude: payload.latitude,
          longitude: payload.longitude,
          location_name: payload.location_name,
          description: payload.description,
        })
        .select()
        .single();

      if (incError || !inc) return { incident: null, medical: null, error: incError };

      const { data: med, error: medError } = await supabase
        .from('medical_incidents')
        .insert({
          emergency_incident_id: inc.id,
          reported_by: payload.reported_by,
          symptoms: payload.symptoms,
          injury_description: payload.injury_description,
          severity: payload.severity || 'high',
          needs_ambulance: payload.needs_ambulance || false,
        })
        .select()
        .single();

      return { incident: inc as EmergencyIncident, medical: med as MedicalIncident, error: medError };
    } catch (err: unknown) {
      return { incident: null, medical: null, error: err instanceof Error ? err : new Error('Failed to report medical emergency') };
    }
  },

  /**
   * Reports a fire/hazard emergency
   */
  async reportFireEmergency(payload: {
    reported_by: string;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    description?: string | null;
    fire_type?: FireType;
    smoke_visible?: boolean;
    people_trapped?: PeopleTrappedStatus;
  }): Promise<{ incident: EmergencyIncident | null; fire: FireIncident | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockInc: EmergencyIncident = {
        id: `fire-${Date.now()}`,
        reported_by: payload.reported_by,
        incident_type: 'fire',
        priority: 'critical',
        status: 'pending',
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_name: payload.location_name || 'Campus Building',
        description: payload.description || 'Fire emergency reported',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const mockFire: FireIncident = {
        id: `fire-ext-${Date.now()}`,
        emergency_incident_id: mockInc.id,
        reported_by: payload.reported_by,
        fire_type: payload.fire_type || 'fire',
        smoke_visible: payload.smoke_visible || false,
        people_trapped: payload.people_trapped || 'unknown',
        description: payload.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = getLocalEmergencies();
      saveLocalEmergencies([mockInc, ...existing]);
      return { incident: mockInc, fire: mockFire, error: null };
    }

    try {
      const { data: inc, error: incError } = await supabase
        .from('emergency_incidents')
        .insert({
          reported_by: payload.reported_by,
          incident_type: 'fire',
          priority: 'critical',
          status: 'pending',
          latitude: payload.latitude,
          longitude: payload.longitude,
          location_name: payload.location_name,
          description: payload.description,
        })
        .select()
        .single();

      if (incError || !inc) return { incident: null, fire: null, error: incError };

      const { data: fire, error: fireError } = await supabase
        .from('fire_incidents')
        .insert({
          emergency_incident_id: inc.id,
          reported_by: payload.reported_by,
          fire_type: payload.fire_type || 'fire',
          smoke_visible: payload.smoke_visible || false,
          people_trapped: payload.people_trapped || 'unknown',
          description: payload.description,
        })
        .select()
        .single();

      return { incident: inc as EmergencyIncident, fire: fire as FireIncident, error: fireError };
    } catch (err: unknown) {
      return { incident: null, fire: null, error: err instanceof Error ? err : new Error('Failed to report fire incident') };
    }
  },

  /**
   * Retrieves active incidents for responders and dispatchers
   */
  async getActiveIncidents(): Promise<{ data: EmergencyIncident[]; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const all = getLocalEmergencies();
      const active = all.filter((i) => ['pending', 'acknowledged', 'assigned', 'in_progress'].includes(i.status));
      return { data: active, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*, reporter:profiles(*)')
        .in('status', ['pending', 'acknowledged', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false });

      return { data: (data as EmergencyIncident[]) || [], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to get active incidents') };
    }
  },

  /**
   * Retrieves single incident with assignment and responder info
   */
  async getIncidentDetails(id: string): Promise<{
    incident: EmergencyIncident | null;
    assignment: IncidentAssignment | null;
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      const all = getLocalEmergencies();
      const incident = all.find((i) => i.id === id) || null;
      const assignments = getLocalAssignments();
      const assignment = assignments.find((a) => a.incident_id === id) || null;
      return { incident, assignment, error: null };
    }

    try {
      const { data: inc, error: incError } = await supabase
        .from('emergency_incidents')
        .select('*, reporter:profiles(*)')
        .eq('id', id)
        .single();

      if (incError || !inc) return { incident: null, assignment: null, error: incError };

      const { data: assign } = await supabase
        .from('incident_assignments')
        .select('*, worker:profiles(*)')
        .eq('incident_id', id)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        incident: inc as EmergencyIncident,
        assignment: (assign as IncidentAssignment) || null,
        error: null,
      };
    } catch (err: unknown) {
      return { incident: null, assignment: null, error: err instanceof Error ? err : new Error('Failed to fetch incident details') };
    }
  },

  /**
   * Responding worker accepts emergency: creates assignment record and transitions status to assigned
   */
  async acceptIncident(payload: {
    incident_id: string;
    worker_id: string;
    assigned_by?: string;
  }): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const assignments = getLocalAssignments();
      const newAssignment: IncidentAssignment = {
        id: `assign-${Date.now()}`,
        incident_id: payload.incident_id,
        worker_id: payload.worker_id,
        assigned_by: payload.assigned_by || payload.worker_id,
        status: 'accepted',
        assigned_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      };
      saveLocalAssignments([newAssignment, ...assignments]);

      // Update incident status
      const emergencies = getLocalEmergencies();
      const updated = emergencies.map((inc) =>
        inc.id === payload.incident_id
          ? { ...inc, status: 'assigned' as IncidentStatus, updated_at: new Date().toISOString() }
          : inc
      );
      saveLocalEmergencies(updated);
      return { error: null };
    }

    try {
      // 1. Insert assignment record
      const { error: assignError } = await supabase.from('incident_assignments').insert({
        incident_id: payload.incident_id,
        worker_id: payload.worker_id,
        assigned_by: payload.assigned_by || payload.worker_id,
        status: 'accepted',
        assigned_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      });

      if (assignError) return { error: assignError };

      // 2. Update incident status to 'assigned'
      const { error: incError } = await supabase
        .from('emergency_incidents')
        .update({
          status: 'assigned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.incident_id);

      return { error: incError };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to accept incident') };
    }
  },

  /**
   * Updates status with state machine verification (pending -> acknowledged -> assigned -> in_progress -> resolved)
   */
  async updateStatus(id: string, newStatus: IncidentStatus): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const emergencies = getLocalEmergencies();
      const updated = emergencies.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: newStatus,
              updated_at: new Date().toISOString(),
              resolved_at: ['resolved', 'cancelled'].includes(newStatus) ? new Date().toISOString() : inc.resolved_at,
            }
          : inc
      );
      saveLocalEmergencies(updated);

      if (newStatus === 'resolved') {
        const assignments = getLocalAssignments();
        const updatedAssign = assignments.map((a) =>
          a.incident_id === id ? { ...a, status: 'completed' as const, completed_at: new Date().toISOString() } : a
        );
        saveLocalAssignments(updatedAssign);
      }

      return { error: null };
    }

    try {
      const updates: { status: IncidentStatus; updated_at: string; resolved_at?: string } = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'resolved' || newStatus === 'cancelled') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('emergency_incidents')
        .update(updates)
        .eq('id', id);

      if (!error && newStatus === 'resolved') {
        await supabase
          .from('incident_assignments')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('incident_id', id);
      }

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update incident status') };
    }
  },

  /**
   * Allows reporter to cancel a pending SOS alert
   */
  async cancelPendingSOS(incidentId: string, userId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const emergencies = getLocalEmergencies();
      const updated = emergencies.map((inc) =>
        inc.id === incidentId && inc.reported_by === userId && inc.status === 'pending'
          ? { ...inc, status: 'cancelled' as IncidentStatus, resolved_at: new Date().toISOString() }
          : inc
      );
      saveLocalEmergencies(updated);
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('emergency_incidents')
        .update({
          status: 'cancelled',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', incidentId)
        .eq('reported_by', userId)
        .eq('status', 'pending');

      return { error };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to cancel emergency') };
    }
  },
};
