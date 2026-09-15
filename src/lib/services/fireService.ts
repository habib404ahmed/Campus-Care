// ============================================================
// Campus Care — Fire Emergency Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  EmergencyIncident,
  FireIncident,
  IncidentAssignment,
  IncidentPriority,
  IncidentStatus,
  FireType,
  PeopleTrappedStatus,
} from '../../types/database';
import { emergencyService } from './emergencyService';

export interface FireEmergencyPayload {
  reported_by: string;
  fire_type: FireType;
  smoke_visible: boolean;
  people_trapped: PeopleTrappedStatus;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
}

export interface FireIncidentWithDetails {
  incident: EmergencyIncident;
  fire: FireIncident;
  assignment?: IncidentAssignment | null;
}

const LOCAL_FIRE_KEY = 'campus_care_demo_fire';

function getLocalFire(): FireIncident[] {
  try {
    const raw = localStorage.getItem(LOCAL_FIRE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFire(items: FireIncident[]) {
  try {
    localStorage.setItem(LOCAL_FIRE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('campus_care_emergency_sync'));
  } catch {
    // localStorage restricted
  }
}

/**
 * Calculates priority based on human life safety rules
 */
export function calculateFirePriority(
  fireType: FireType,
  peopleTrapped: PeopleTrappedStatus,
  smokeVisible: boolean
): IncidentPriority {
  // People trapped or suspected trapped is unconditionally critical
  if (peopleTrapped === 'yes') return 'critical';
  // Active fire, gas leak, or electrical fault carries high priority
  if (fireType === 'fire' || fireType === 'gas' || fireType === 'electrical') return 'high';
  // Visible smoke or smoke observation carries moderate urgency
  if (smokeVisible || fireType === 'smoke') return 'medium';
  return 'low';
}

export const fireService = {
  /**
   * Checks if user already has an active fire emergency
   */
  async getActiveFireEmergency(userId: string): Promise<{
    data: { incident: EmergencyIncident; fire: FireIncident } | null;
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      try {
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        const active = emergencies.find(
          (i) =>
            i.reported_by === userId &&
            i.incident_type === 'fire' &&
            ['pending', 'acknowledged', 'assigned', 'in_progress'].includes(i.status)
        );
        if (!active) return { data: null, error: null };

        const fireRecords = getLocalFire();
        const fire = fireRecords.find((f) => f.emergency_incident_id === active.id) || {
          id: `fire-${active.id}`,
          emergency_incident_id: active.id,
          reported_by: userId,
          fire_type: 'fire',
          smoke_visible: true,
          people_trapped: active.priority === 'critical' ? 'yes' : 'no',
          description: active.description,
          created_at: active.created_at,
          updated_at: active.updated_at,
        };

        return { data: { incident: active, fire }, error: null };
      } catch {
        return { data: null, error: null };
      }
    }

    try {
      const { data: incident, error: incError } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('reported_by', userId)
        .eq('incident_type', 'fire')
        .in('status', ['pending', 'acknowledged', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (incError || !incident) return { data: null, error: incError };

      const { data: fire, error: fireError } = await supabase
        .from('fire_incidents')
        .select('*')
        .eq('emergency_incident_id', incident.id)
        .maybeSingle();

      if (fireError || !fire) {
        const fallbackFire: FireIncident = {
          id: `fire-${incident.id}`,
          emergency_incident_id: incident.id,
          reported_by: userId,
          fire_type: 'fire',
          smoke_visible: true,
          people_trapped: incident.priority === 'critical' ? 'yes' : 'unknown',
          description: incident.description,
          created_at: incident.created_at,
          updated_at: incident.updated_at,
        };
        return { data: { incident: incident as EmergencyIncident, fire: fallbackFire }, error: null };
      }

      return {
        data: {
          incident: incident as EmergencyIncident,
          fire: fire as FireIncident,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to check active fire emergency') };
    }
  },

  /**
   * Submits a new structured Fire Emergency request
   */
  async createFireEmergency(payload: FireEmergencyPayload): Promise<{
    incident: EmergencyIncident | null;
    fire: FireIncident | null;
    error: Error | null;
  }> {
    const priority = calculateFirePriority(
      payload.fire_type,
      payload.people_trapped,
      payload.smoke_visible
    );

    const summary = payload.description
      ? `${payload.fire_type.toUpperCase()} fire alert: ${payload.description}`
      : `${payload.fire_type.toUpperCase()} fire alert reported on campus.`;

    if (!isSupabaseConfigured()) {
      try {
        const incidentId = `fire-inc-${Date.now()}`;
        const now = new Date().toISOString();

        const newIncident: EmergencyIncident = {
          id: incidentId,
          reported_by: payload.reported_by,
          incident_type: 'fire',
          priority,
          status: 'pending',
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          location_name: payload.location_name || (payload.latitude ? 'Location detected' : 'Location unavailable'),
          description: summary,
          created_at: now,
          updated_at: now,
        };

        const newFire: FireIncident = {
          id: `fire-${Date.now()}`,
          emergency_incident_id: incidentId,
          reported_by: payload.reported_by,
          fire_type: payload.fire_type,
          smoke_visible: payload.smoke_visible,
          people_trapped: payload.people_trapped,
          description: payload.description ?? null,
          created_at: now,
          updated_at: now,
        };

        // Save to demo emergencies
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        emergencies.unshift(newIncident);
        localStorage.setItem('campus_care_demo_emergencies', JSON.stringify(emergencies));

        // Save to demo fire store
        const fireRecords = getLocalFire();
        fireRecords.unshift(newFire);
        saveLocalFire(fireRecords);

        return { incident: newIncident, fire: newFire, error: null };
      } catch (err: unknown) {
        return { incident: null, fire: null, error: err instanceof Error ? err : new Error('Demo fire dispatch failed') };
      }
    }

    try {
      // 1. Insert base emergency incident
      const { data: incident, error: incError } = await supabase
        .from('emergency_incidents')
        .insert({
          reported_by: payload.reported_by,
          incident_type: 'fire',
          priority,
          status: 'pending',
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          location_name: payload.location_name || (payload.latitude ? 'Location detected' : 'Location unavailable'),
          description: summary,
        })
        .select()
        .single();

      if (incError || !incident) {
        return { incident: null, fire: null, error: incError };
      }

      // 2. Insert fire incidents extension
      const { data: fire, error: fireError } = await supabase
        .from('fire_incidents')
        .insert({
          emergency_incident_id: incident.id,
          reported_by: payload.reported_by,
          fire_type: payload.fire_type,
          smoke_visible: payload.smoke_visible,
          people_trapped: payload.people_trapped,
          description: payload.description ?? null,
        })
        .select()
        .single();

      if (fireError) {
        console.warn('Fire incident extension insertion failed:', fireError);
      }

      // 3. Notify fire responders & admins
      try {
        const { data: responders } = await supabase
          .from('profiles')
          .select('id')
          .or('role.eq.admin,and(role.eq.worker,worker_department.eq.fire)');

        if (responders && responders.length > 0) {
          const notifications = responders.map((r) => ({
            user_id: r.id,
            title: payload.people_trapped === 'yes' ? '🔥 CRITICAL FIRE EMERGENCY' : '🔥 Fire Emergency Alert',
            message: payload.people_trapped === 'yes'
              ? `CRITICAL: People may be trapped! ${payload.fire_type.toUpperCase()} reported at ${incident.location_name || 'campus'}.`
              : `${payload.fire_type.toUpperCase()} reported at ${incident.location_name || 'campus'}. Immediate fire response requested.`,
            type: 'emergency' as const,
            priority: priority === 'critical' ? ('urgent' as const) : ('high' as const),
            reference_type: 'emergency',
            reference_id: incident.id,
          }));

          await supabase.from('notifications').insert(notifications);
        }
      } catch (notifyErr) {
        console.warn('Fire responder notification dispatch error:', notifyErr);
      }

      return {
        incident: incident as EmergencyIncident,
        fire: fire as FireIncident,
        error: null,
      };
    } catch (err: unknown) {
      return { incident: null, fire: null, error: err instanceof Error ? err : new Error('Fire emergency creation failed') };
    }
  },

  /**
   * Retrieves past & active fire emergencies reported by a user
   */
  async getUserFireEmergencies(userId: string): Promise<{
    data: FireIncidentWithDetails[];
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      try {
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        const userFireIncidents = emergencies.filter(
          (i) => i.reported_by === userId && i.incident_type === 'fire'
        );
        const fireRecords = getLocalFire();

        const result: FireIncidentWithDetails[] = userFireIncidents.map((inc) => {
          const fire = fireRecords.find((f) => f.emergency_incident_id === inc.id) || {
            id: `fire-${inc.id}`,
            emergency_incident_id: inc.id,
            reported_by: userId,
            fire_type: 'fire',
            smoke_visible: true,
            people_trapped: 'unknown',
            description: inc.description,
            created_at: inc.created_at,
            updated_at: inc.updated_at,
          };
          return { incident: inc, fire };
        });

        return { data: result, error: null };
      } catch {
        return { data: [], error: null };
      }
    }

    try {
      const { data: incidents, error: incError } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('reported_by', userId)
        .eq('incident_type', 'fire')
        .order('created_at', { ascending: false });

      if (incError || !incidents) return { data: [], error: incError };

      const incidentIds = incidents.map((i) => i.id);
      const { data: fires } = await supabase
        .from('fire_incidents')
        .select('*')
        .in('emergency_incident_id', incidentIds);

      const fireMap = new Map((fires || []).map((f) => [f.emergency_incident_id, f]));

      const results: FireIncidentWithDetails[] = incidents.map((inc) => ({
        incident: inc as EmergencyIncident,
        fire: (fireMap.get(inc.id) as FireIncident) || {
          id: `fire-${inc.id}`,
          emergency_incident_id: inc.id,
          reported_by: userId,
          fire_type: 'fire',
          smoke_visible: true,
          people_trapped: 'unknown',
          description: inc.description,
          created_at: inc.created_at,
          updated_at: inc.updated_at,
        },
      }));

      return { data: results, error: null };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch user fire history') };
    }
  },

  /**
   * Retrieves active fire incidents with full fire extension details for fire responders
   */
  async getFireIncidentsForWorker(): Promise<{
    data: FireIncidentWithDetails[];
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      try {
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        const active = emergencies.filter(
          (i) =>
            ['pending', 'acknowledged', 'assigned', 'in_progress'].includes(i.status) &&
            (i.incident_type === 'fire' || i.incident_type === 'sos')
        );
        const fireRecords = getLocalFire();

        const results: FireIncidentWithDetails[] = active.map((inc) => {
          const fire = fireRecords.find((f) => f.emergency_incident_id === inc.id) || {
            id: `fire-${inc.id}`,
            emergency_incident_id: inc.id,
            reported_by: inc.reported_by,
            fire_type: 'fire',
            smoke_visible: true,
            people_trapped: inc.priority === 'critical' ? 'yes' : 'no',
            description: inc.description,
            created_at: inc.created_at,
            updated_at: inc.updated_at,
          };
          return { incident: inc, fire };
        });

        return { data: results, error: null };
      } catch {
        return { data: [], error: null };
      }
    }

    try {
      const { data: incidents, error: incError } = await supabase
        .from('emergency_incidents')
        .select('*, reporter:profiles(*)')
        .in('incident_type', ['fire', 'sos'])
        .in('status', ['pending', 'acknowledged', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false });

      if (incError || !incidents) return { data: [], error: incError };

      const incidentIds = incidents.map((i) => i.id);
      const { data: fires } = await supabase
        .from('fire_incidents')
        .select('*')
        .in('emergency_incident_id', incidentIds);

      const fireMap = new Map((fires || []).map((f) => [f.emergency_incident_id, f]));

      const results: FireIncidentWithDetails[] = incidents.map((inc) => ({
        incident: inc as EmergencyIncident,
        fire: (fireMap.get(inc.id) as FireIncident) || {
          id: `fire-${inc.id}`,
          emergency_incident_id: inc.id,
          reported_by: inc.reported_by,
          fire_type: 'fire',
          smoke_visible: true,
          people_trapped: inc.priority === 'critical' ? 'yes' : 'unknown',
          description: inc.description,
          created_at: inc.created_at,
          updated_at: inc.updated_at,
        },
      }));

      return { data: results, error: null };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch worker fire incidents') };
    }
  },

  /**
   * Retrieves single fire incident with full fire details and assignment
   */
  async getFireIncidentDetails(incidentId: string): Promise<{
    data: FireIncidentWithDetails | null;
    error: Error | null;
  }> {
    const { incident, assignment, error } = await emergencyService.getIncidentDetails(incidentId);
    if (error || !incident) return { data: null, error };

    if (!isSupabaseConfigured()) {
      const fireRecords = getLocalFire();
      const fire = fireRecords.find((f) => f.emergency_incident_id === incidentId) || {
        id: `fire-${incident.id}`,
        emergency_incident_id: incident.id,
        reported_by: incident.reported_by,
        fire_type: 'fire',
        smoke_visible: true,
        people_trapped: incident.priority === 'critical' ? 'yes' : 'no',
        description: incident.description,
        created_at: incident.created_at,
        updated_at: incident.updated_at,
      };
      return { data: { incident, fire, assignment }, error: null };
    }

    try {
      const { data: fire } = await supabase
        .from('fire_incidents')
        .select('*')
        .eq('emergency_incident_id', incidentId)
        .maybeSingle();

      const fallbackFire: FireIncident = fire || {
        id: `fire-${incident.id}`,
        emergency_incident_id: incident.id,
        reported_by: incident.reported_by,
        fire_type: 'fire',
        smoke_visible: true,
        people_trapped: incident.priority === 'critical' ? 'yes' : 'unknown',
        description: incident.description,
        created_at: incident.created_at,
        updated_at: incident.updated_at,
      };

      return {
        data: {
          incident,
          fire: fallbackFire,
          assignment,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to fetch fire incident details') };
    }
  },

  /**
   * Fire worker accepts incident dispatch
   */
  async acceptFireEmergency(incidentId: string, workerId: string): Promise<{ error: Error | null }> {
    return emergencyService.acceptIncident({ incident_id: incidentId, worker_id: workerId });
  },

  /**
   * Fire worker starts active response
   */
  async startFireResponse(incidentId: string, _workerId?: string): Promise<{ error: Error | null }> {
    return emergencyService.updateStatus(incidentId, 'in_progress');
  },

  /**
   * Fire worker marks incident resolved
   */
  async resolveFireEmergency(incidentId: string, _workerId?: string, _notes?: string): Promise<{ error: Error | null }> {
    return emergencyService.updateStatus(incidentId, 'resolved');
  },

  /**
   * Update fire emergency state
   */
  async updateStatus(
    incidentId: string,
    nextStatus: IncidentStatus,
    _workerId?: string,
    _notes?: string
  ): Promise<{ error: Error | null }> {
    return emergencyService.updateStatus(incidentId, nextStatus);
  },
};
