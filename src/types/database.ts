// ============================================================
// Campus Care — Database Schema TypeScript Definitions
// ============================================================

import type { WorkerDepartment, Profile } from './auth';

// ── Shared Literals & Enums ───────────────────────────────────

export type LocationType =
  | 'building'
  | 'gate'
  | 'parking'
  | 'library'
  | 'canteen'
  | 'medical_center'
  | 'fire_station'
  | 'security_post'
  | 'sports_ground'
  | 'other';

export type IncidentType = 'sos' | 'medical' | 'fire' | 'security' | 'other';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus =
  | 'pending'
  | 'acknowledged'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'cancelled';

export type FireType = 'fire' | 'smoke' | 'gas' | 'electrical' | 'other';
export type PeopleTrappedStatus = 'unknown' | 'yes' | 'no';

export type SecurityCategory =
  | 'theft'
  | 'suspicious_activity'
  | 'harassment'
  | 'vandalism'
  | 'trespassing'
  | 'other';

export type UnsafeCategory =
  | 'poor_lighting'
  | 'isolated_area'
  | 'broken_road'
  | 'suspicious_activity'
  | 'unsafe_parking'
  | 'other';

export type UnsafeSeverity = 'low' | 'medium' | 'high';
export type UnsafeStatus = 'reported' | 'under_review' | 'verified' | 'resolved';

export type RideStatus = 'open' | 'full' | 'started' | 'completed' | 'cancelled';
export type RideRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export type LostFoundItemType =
  | 'phone'
  | 'wallet'
  | 'id_card'
  | 'bag'
  | 'laptop'
  | 'keys'
  | 'book'
  | 'clothing'
  | 'other';

export type LostFoundStatus = 'lost' | 'found' | 'claimed' | 'resolved';

export type NotificationType = 'emergency' | 'security' | 'ride' | 'lost_found' | 'system';
export type NotificationReferenceType =
  | 'emergency'
  | 'security_report'
  | 'unsafe_location'
  | 'ride'
  | 'ride_request'
  | 'lost_found'
  | 'system';

export type WorkerDutyStatus = 'online' | 'offline' | 'on_duty' | 'busy';
export type AssignmentStatus = 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'declined';


// ── Table Entity Interfaces ───────────────────────────────────

export interface CampusLocation {
  id: string;
  name: string;
  description?: string | null;
  building?: string | null;
  floor?: string | null;
  latitude: number;
  longitude: number;
  location_type: LocationType;
  is_active: boolean;
  created_at: string;
}

export interface EmergencyIncident {
  id: string;
  reported_by: string;
  incident_type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  reporter?: Profile;
}

export interface MedicalIncident {
  id: string;
  emergency_incident_id: string;
  reported_by: string;
  symptoms?: string | null;
  injury_description?: string | null;
  severity: IncidentPriority;
  needs_ambulance: boolean;
  created_at: string;
  updated_at: string;
}

export interface FireIncident {
  id: string;
  emergency_incident_id: string;
  reported_by: string;
  fire_type: FireType;
  smoke_visible: boolean;
  people_trapped: PeopleTrappedStatus;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecurityReport {
  id: string;
  reported_by: string;
  category: SecurityCategory;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  priority: IncidentPriority;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  reporter?: Profile;
}

export interface UnsafeLocation {
  id: string;
  reported_by: string;
  category: UnsafeCategory;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  severity: UnsafeSeverity;
  status: UnsafeStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  reporter?: Profile;
}

export interface Ride {
  id: string;
  created_by: string;
  origin: string;
  destination: string;
  origin_latitude?: number | null;
  origin_longitude?: number | null;
  destination_latitude?: number | null;
  destination_longitude?: number | null;
  departure_time: string;
  available_seats: number;
  vehicle_type?: string | null;
  cost_sharing?: string | null;
  meeting_point?: string | null;
  safety_notes?: string | null;
  is_verified_creator: boolean;
  notes?: string | null;
  status: RideStatus;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface RideRequest {
  id: string;
  ride_id: string;
  requester_id: string;
  status: RideRequestStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  ride?: Ride;
}

export interface LostFoundItem {
  id: string;
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
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  reporter?: Profile;
}

export interface LostFoundLocationUpdate {
  id: string;
  item_id: string;
  updated_by: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name: string;
  notes?: string | null;
  created_at: string;
  updater?: Profile;
}

export interface CampusNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_type?: NotificationReferenceType | null;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface WorkerStatusRecord {
  id: string;
  worker_id: string;
  department: WorkerDepartment;
  status: WorkerDutyStatus;
  last_seen_at: string;
  updated_at: string;
  worker?: Profile;
}

export interface IncidentAssignment {
  id: string;
  incident_id: string;
  worker_id: string;
  assigned_by?: string | null;
  status: AssignmentStatus;
  assigned_at: string;
  accepted_at?: string | null;
  completed_at?: string | null;
  worker?: Profile;
  incident?: EmergencyIncident;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile;
}


// ── Supabase Database Mapping ─────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      campus_locations: {
        Row: CampusLocation;
        Insert: Omit<CampusLocation, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CampusLocation, 'id'>>;
      };
      emergency_incidents: {
        Row: EmergencyIncident;
        Insert: Omit<EmergencyIncident, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EmergencyIncident, 'id'>>;
      };
      medical_incidents: {
        Row: MedicalIncident;
        Insert: Omit<MedicalIncident, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MedicalIncident, 'id'>>;
      };
      fire_incidents: {
        Row: FireIncident;
        Insert: Omit<FireIncident, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<FireIncident, 'id'>>;
      };
      security_reports: {
        Row: SecurityReport;
        Insert: Omit<SecurityReport, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SecurityReport, 'id'>>;
      };
      unsafe_locations: {
        Row: UnsafeLocation;
        Insert: Omit<UnsafeLocation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UnsafeLocation, 'id'>>;
      };
      rides: {
        Row: Ride;
        Insert: Omit<Ride, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Ride, 'id'>>;
      };
      ride_requests: {
        Row: RideRequest;
        Insert: Omit<RideRequest, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RideRequest, 'id'>>;
      };
      lost_found_items: {
        Row: LostFoundItem;
        Insert: Omit<LostFoundItem, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<LostFoundItem, 'id'>>;
      };
      lost_found_location_updates: {
        Row: LostFoundLocationUpdate;
        Insert: Omit<LostFoundLocationUpdate, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<LostFoundLocationUpdate, 'id'>>;
      };
      notifications: {
        Row: CampusNotification;
        Insert: Omit<CampusNotification, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CampusNotification, 'id'>>;
      };
      worker_status: {
        Row: WorkerStatusRecord;
        Insert: Omit<WorkerStatusRecord, 'id' | 'last_seen_at' | 'updated_at'> & {
          id?: string;
          last_seen_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WorkerStatusRecord, 'id'>>;
      };
      incident_assignments: {
        Row: IncidentAssignment;
        Insert: Omit<IncidentAssignment, 'id' | 'assigned_at'> & {
          id?: string;
          assigned_at?: string;
        };
        Update: Partial<Omit<IncidentAssignment, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
