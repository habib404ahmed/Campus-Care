// ============================================================
// Campus Care — Shared TypeScript Types
// ============================================================

export type UserRole =
  | 'admin'
  | 'student'
  | 'teacher'
  | 'faculty'
  | 'medical'
  | 'fire'
  | 'security';

export type CampusUserRole = 'student' | 'teacher' | 'faculty';
export type WorkerRole = 'medical' | 'fire' | 'security';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
}

export type IncidentType =
  | 'sos'
  | 'medical'
  | 'fire'
  | 'security'
  | 'unsafe_location';

export type IncidentStatus = 'active' | 'pending' | 'resolved' | 'closed';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CampusStatus {
  overall: 'safe' | 'caution' | 'emergency';
  activeEmergencies: number;
  message: string;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedIncidentId?: string;
}

export interface RideRequest {
  id: string;
  requestedBy: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  createdAt: string;
}

export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  category: string;
  imageUrl?: string;
  reportedBy: string;
  status: 'open' | 'matched' | 'claimed' | 'closed';
  createdAt: string;
}

export interface WorkerStats {
  active: number;
  pending: number;
  resolvedToday: number;
  totalAssigned: number;
}

export interface AdminStats {
  activeEmergencies: number;
  securityReports: number;
  unsafeLocations: number;
  lostFoundItems: number;
  activeRides: number;
  workersAvailable: number;
}

export interface MapLegendItem {
  color: string;
  emoji: string;
  label: string;
  description: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
}

export interface FeatureCardData {
  emoji: string;
  title: string;
  description: string;
  color: string;
}

export interface StatCardData {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}
