// ============================================================
// Campus Care — Mock Data
// Used for UI demonstration only. Replace with Supabase queries in Phase 2.
// ============================================================

import type {
  Incident,
  Notification,
  RideRequest,
  LostFoundItem,
  AdminStats,
  WorkerStats,
  CampusStatus,
} from '../types';

export const mockCampusStatus: CampusStatus = {
  overall: 'safe',
  activeEmergencies: 0,
  message: 'Campus is currently safe. No active emergencies.',
  lastUpdated: new Date().toISOString(),
};

export const mockAdminStats: AdminStats = {
  activeEmergencies: 3,
  securityReports: 7,
  unsafeLocations: 4,
  lostFoundItems: 12,
  activeRides: 18,
  workersAvailable: 24,
};

export const mockWorkerStats: Record<string, WorkerStats> = {
  medical: { active: 2, pending: 4, resolvedToday: 8, totalAssigned: 14 },
  fire: { active: 1, pending: 2, resolvedToday: 3, totalAssigned: 6 },
  security: { active: 3, pending: 5, resolvedToday: 12, totalAssigned: 20 },
};

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    type: 'medical',
    status: 'active',
    severity: 'high',
    title: 'Student Collapsed — Building A',
    description: 'Student reported unconscious near the main entrance of Building A.',
    location: 'Building A, Main Entrance',
    reportedBy: 'John Doe',
    assignedTo: 'Medical Team Alpha',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-002',
    type: 'security',
    status: 'pending',
    severity: 'medium',
    title: 'Suspicious Activity — Parking Lot C',
    description: 'Unknown person loitering around vehicles in Parking Lot C.',
    location: 'Parking Lot C',
    reportedBy: 'Jane Smith',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-003',
    type: 'unsafe_location',
    status: 'active',
    severity: 'medium',
    title: 'Broken Lighting — Path to Library',
    description: 'Multiple street lights are out along the path to the main library, creating a safety hazard.',
    location: 'Library Walkway',
    reportedBy: 'Alice Johnson',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-004',
    type: 'fire',
    status: 'resolved',
    severity: 'critical',
    title: 'Fire Alarm — Chemistry Lab',
    description: 'Fire alarm triggered in Chemistry Lab B. Cause: minor smoke from experiment. All clear.',
    location: 'Science Block, Lab B',
    reportedBy: 'Prof. Williams',
    assignedTo: 'Fire Team 1',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-005',
    type: 'sos',
    status: 'active',
    severity: 'critical',
    title: 'SOS Activated — Dormitory Block D',
    description: 'SOS signal received from Room 204, Dormitory D.',
    location: 'Dormitory D, Room 204',
    reportedBy: 'System',
    assignedTo: 'Security + Medical',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'emergency',
    title: 'SOS Alert Activated',
    message: 'An SOS signal was received from Dormitory D, Room 204. Response team dispatched.',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    relatedIncidentId: 'INC-005',
  },
  {
    id: 'NOTIF-002',
    type: 'warning',
    title: 'Unsafe Location Reported',
    message: 'Multiple lights are out on the Library Walkway. Please use alternative routes after dark.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedIncidentId: 'INC-003',
  },
  {
    id: 'NOTIF-003',
    type: 'info',
    title: 'Campus RideShare Available',
    message: '3 rides are available going to the South Residence area. Book now!',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'NOTIF-004',
    type: 'success',
    title: 'Fire Alert Resolved',
    message: 'The fire alarm in Chemistry Lab B has been cleared. Campus status is back to safe.',
    isRead: true,
    createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    relatedIncidentId: 'INC-004',
  },
  {
    id: 'NOTIF-005',
    type: 'info',
    title: 'Lost Item Found',
    message: 'A blue backpack matching your report has been found near the Cafeteria.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockRides: RideRequest[] = [
  {
    id: 'RIDE-001',
    requestedBy: 'Emma Wilson',
    from: 'Main Library',
    to: 'North Residence',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'RIDE-002',
    requestedBy: 'Carlos Rivera',
    from: 'Engineering Building',
    to: 'South Gate',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'RIDE-003',
    requestedBy: 'Priya Sharma',
    from: 'Student Center',
    to: 'Sports Complex',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockLostFoundItems: LostFoundItem[] = [
  {
    id: 'LF-001',
    type: 'lost',
    title: 'Blue Backpack',
    description: 'Navy blue Jansport backpack with laptop and notebooks inside. Lost near the library.',
    location: 'Main Library Area',
    category: 'Bags',
    reportedBy: 'Aisha Mohamed',
    status: 'open',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'LF-002',
    type: 'found',
    title: 'Student ID Card',
    description: 'Found a student ID card belonging to someone from Engineering faculty.',
    location: 'Cafeteria, Table 5',
    category: 'Documents',
    reportedBy: 'Daniel Kim',
    status: 'open',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'LF-003',
    type: 'lost',
    title: 'Car Keys — Honda',
    description: 'Honda car keys with a red keychain, lost somewhere in Parking Lot B.',
    location: 'Parking Lot B',
    category: 'Keys',
    reportedBy: 'Sarah Thompson',
    status: 'matched',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to format relative time
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
