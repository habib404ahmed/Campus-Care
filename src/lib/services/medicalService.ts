// ============================================================
// Campus Care — Medical Emergency Database Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  EmergencyIncident,
  MedicalIncident,
  IncidentAssignment,
  IncidentPriority,
  IncidentStatus,
} from '../../types/database';
import { emergencyService } from './emergencyService';

export interface MedicalEmergencyPayload {
  reported_by: string;
  symptoms?: string | null;
  injury_description?: string | null;
  severity: IncidentPriority;
  needs_ambulance: boolean;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
}

export interface MedicalIncidentWithDetails {
  incident: EmergencyIncident;
  medical: MedicalIncident;
  assignment?: IncidentAssignment | null;
}

const LOCAL_MEDICAL_KEY = 'campus_care_demo_medical';

function getLocalMedical(): MedicalIncident[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDICAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMedical(items: MedicalIncident[]) {
  try {
    localStorage.setItem(LOCAL_MEDICAL_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('campus_care_emergency_sync'));
  } catch {
    // localStorage restricted
  }
}

export const medicalService = {
  /**
   * Checks if user already has an active medical emergency
   */
  async getActiveMedicalEmergency(userId: string): Promise<{
    data: { incident: EmergencyIncident; medical: MedicalIncident } | null;
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      try {
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        const active = emergencies.find(
          (i) =>
            i.reported_by === userId &&
            i.incident_type === 'medical' &&
            ['pending', 'acknowledged', 'assigned', 'in_progress'].includes(i.status)
        );
        if (!active) return { data: null, error: null };

        const medicals = getLocalMedical();
        const med = medicals.find((m) => m.emergency_incident_id === active.id) || {
          id: `med-${active.id}`,
          emergency_incident_id: active.id,
          reported_by: userId,
          symptoms: active.description,
          severity: active.priority,
          needs_ambulance: false,
          created_at: active.created_at,
          updated_at: active.updated_at,
        };

        return { data: { incident: active, medical: med }, error: null };
      } catch {
        return { data: null, error: null };
      }
    }

    try {
      const { data: incident, error: incError } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('reported_by', userId)
        .eq('incident_type', 'medical')
        .in('status', ['pending', 'acknowledged', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (incError || !incident) return { data: null, error: incError };

      const { data: medical, error: medError } = await supabase
        .from('medical_incidents')
        .select('*')
        .eq('emergency_incident_id', incident.id)
        .maybeSingle();

      if (medError || !medical) {
        // Construct fallback medical record if not present
        const fallbackMed: MedicalIncident = {
          id: `med-${incident.id}`,
          emergency_incident_id: incident.id,
          reported_by: userId,
          symptoms: incident.description,
          severity: incident.priority,
          needs_ambulance: false,
          created_at: incident.created_at,
          updated_at: incident.updated_at,
        };
        return { data: { incident: incident as EmergencyIncident, medical: fallbackMed }, error: null };
      }

      return {
        data: {
          incident: incident as EmergencyIncident,
          medical: medical as MedicalIncident,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to check active medical emergency') };
    }
  },

  /**
   * Submits a new structured Medical Emergency request
   */
  async createMedicalEmergency(payload: MedicalEmergencyPayload): Promise<{
    incident: EmergencyIncident | null;
    medical: MedicalIncident | null;
    error: Error | null;
  }> {
    // 1. Guard against duplicate active medical emergency
    const { data: activeExisting } = await this.getActiveMedicalEmergency(payload.reported_by);
    if (activeExisting) {
      return {
        incident: activeExisting.incident,
        medical: activeExisting.medical,
        error: new Error('ACTIVE_MEDICAL_EXISTS'),
      };
    }

    // 2. Delegate creation through emergencyService
    const res = await emergencyService.reportMedicalEmergency({
      reported_by: payload.reported_by,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      location_name: payload.location_name || (payload.latitude ? 'GPS Location Detected' : 'Location Unavailable'),
      description: payload.symptoms || 'Medical assistance requested.',
      symptoms: payload.symptoms || null,
      injury_description: payload.injury_description || null,
      severity: payload.severity,
      needs_ambulance: payload.needs_ambulance,
    });

    if (!isSupabaseConfigured() && res.medical) {
      const local = getLocalMedical();
      saveLocalMedical([res.medical, ...local]);
    }

    return res;
  },

  /**
   * Fetches full medical emergency history for reporting user
   */
  async getUserMedicalHistory(userId: string): Promise<{
    data: MedicalIncidentWithDetails[];
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      try {
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        const userMedicals = emergencies.filter(
          (i) => i.reported_by === userId && i.incident_type === 'medical'
        );
        const medRecords = getLocalMedical();

        const result: MedicalIncidentWithDetails[] = userMedicals.map((inc) => {
          const med = medRecords.find((m) => m.emergency_incident_id === inc.id) || {
            id: `med-${inc.id}`,
            emergency_incident_id: inc.id,
            reported_by: userId,
            symptoms: inc.description,
            severity: inc.priority,
            needs_ambulance: false,
            created_at: inc.created_at,
            updated_at: inc.updated_at,
          };
          return { incident: inc, medical: med };
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
        .eq('incident_type', 'medical')
        .order('created_at', { ascending: false });

      if (incError || !incidents) return { data: [], error: incError };

      const incidentIds = incidents.map((i) => i.id);
      const { data: medicals } = await supabase
        .from('medical_incidents')
        .select('*')
        .in('emergency_incident_id', incidentIds);

      const medicalMap = new Map((medicals || []).map((m) => [m.emergency_incident_id, m]));

      const results: MedicalIncidentWithDetails[] = incidents.map((inc) => ({
        incident: inc as EmergencyIncident,
        medical: (medicalMap.get(inc.id) as MedicalIncident) || {
          id: `med-${inc.id}`,
          emergency_incident_id: inc.id,
          reported_by: userId,
          symptoms: inc.description,
          severity: inc.priority,
          needs_ambulance: false,
          created_at: inc.created_at,
          updated_at: inc.updated_at,
        },
      }));

      return { data: results, error: null };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch user medical history') };
    }
  },

  /**
   * Retrieves active medical incidents with full medical extension details for medical responders
   */
  async getMedicalIncidentsForWorker(): Promise<{
    data: MedicalIncidentWithDetails[];
    error: Error | null;
  }> {
    if (!isSupabaseConfigured()) {
      try {
        const emergenciesRaw = localStorage.getItem('campus_care_demo_emergencies');
        const emergencies: EmergencyIncident[] = emergenciesRaw ? JSON.parse(emergenciesRaw) : [];
        const active = emergencies.filter(
          (i) =>
            ['pending', 'acknowledged', 'assigned', 'in_progress'].includes(i.status) &&
            (i.incident_type === 'medical' || i.incident_type === 'sos')
        );
        const medRecords = getLocalMedical();

        const results: MedicalIncidentWithDetails[] = active.map((inc) => {
          const med = medRecords.find((m) => m.emergency_incident_id === inc.id) || {
            id: `med-${inc.id}`,
            emergency_incident_id: inc.id,
            reported_by: inc.reported_by,
            symptoms: inc.description,
            severity: inc.priority,
            needs_ambulance: inc.incident_type === 'sos',
            created_at: inc.created_at,
            updated_at: inc.updated_at,
          };
          return { incident: inc, medical: med };
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
        .in('incident_type', ['medical', 'sos'])
        .in('status', ['pending', 'acknowledged', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false });

      if (incError || !incidents) return { data: [], error: incError };

      const incidentIds = incidents.map((i) => i.id);
      const { data: medicals } = await supabase
        .from('medical_incidents')
        .select('*')
        .in('emergency_incident_id', incidentIds);

      const medicalMap = new Map((medicals || []).map((m) => [m.emergency_incident_id, m]));

      const results: MedicalIncidentWithDetails[] = incidents.map((inc) => ({
        incident: inc as EmergencyIncident,
        medical: (medicalMap.get(inc.id) as MedicalIncident) || {
          id: `med-${inc.id}`,
          emergency_incident_id: inc.id,
          reported_by: inc.reported_by,
          symptoms: inc.description,
          severity: inc.priority,
          needs_ambulance: inc.incident_type === 'sos',
          created_at: inc.created_at,
          updated_at: inc.updated_at,
        },
      }));

      return { data: results, error: null };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch worker medical incidents') };
    }
  },

  /**
   * Retrieves single medical incident with full medical details and assignment
   */
  async getMedicalIncidentDetails(incidentId: string): Promise<{
    data: MedicalIncidentWithDetails | null;
    error: Error | null;
  }> {
    const { incident, assignment, error } = await emergencyService.getIncidentDetails(incidentId);
    if (error || !incident) return { data: null, error };

    if (!isSupabaseConfigured()) {
      const medRecords = getLocalMedical();
      const med = medRecords.find((m) => m.emergency_incident_id === incidentId) || {
        id: `med-${incident.id}`,
        emergency_incident_id: incident.id,
        reported_by: incident.reported_by,
        symptoms: incident.description,
        severity: incident.priority,
        needs_ambulance: incident.incident_type === 'sos',
        created_at: incident.created_at,
        updated_at: incident.updated_at,
      };
      return { data: { incident, medical: med, assignment }, error: null };
    }

    try {
      const { data: medical } = await supabase
        .from('medical_incidents')
        .select('*')
        .eq('emergency_incident_id', incidentId)
        .maybeSingle();

      const finalMedical: MedicalIncident = (medical as MedicalIncident) || {
        id: `med-${incident.id}`,
        emergency_incident_id: incident.id,
        reported_by: incident.reported_by,
        symptoms: incident.description,
        severity: incident.priority,
        needs_ambulance: incident.incident_type === 'sos',
        created_at: incident.created_at,
        updated_at: incident.updated_at,
      };

      return { data: { incident, medical: finalMedical, assignment }, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to get medical incident details') };
    }
  },

  /**
   * Medical worker accepts emergency
   */
  async acceptMedicalEmergency(payload: { incident_id: string; worker_id: string }): Promise<{ error: Error | null }> {
    return emergencyService.acceptIncident(payload);
  },

  /**
   * Updates medical emergency status
   */
  async updateStatus(incidentId: string, status: IncidentStatus): Promise<{ error: Error | null }> {
    return emergencyService.updateStatus(incidentId, status);
  },
};
