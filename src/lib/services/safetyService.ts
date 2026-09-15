// ============================================================
// Campus Care — Campus Safety Map & Unsafe Location Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../supabase';
import { notificationService } from './notificationService';
import type {
  UnsafeLocationReport,
  UnsafeLocationPayload,
  SafetyConcernType,
  SafetyFrequency,
  SafetyTimeOption,
  SafetySeverity,
  SafetyStatus,
  SafetyHotspot,
  SafetyMapFilter,
} from '../../types/database';

const LOCAL_STORAGE_KEY = 'campus_care_demo_unsafe_locations';

export const CAMPUS_LOCATIONS = [
  { name: 'Hostel Area', lat: 12.9708, lng: 77.5935 },
  { name: 'Library Entrance & Plaza', lat: 12.9730, lng: 77.5940 },
  { name: 'Academic Building North', lat: 12.9724, lng: 77.5952 },
  { name: 'Main Gate & Perimeter', lat: 12.9716, lng: 77.5946 },
  { name: 'Cafeteria Walkway', lat: 12.9720, lng: 77.5938 },
  { name: 'South Parking Lot', lat: 12.9710, lng: 77.5955 },
  { name: 'Sports Ground Corridor', lat: 12.9735, lng: 77.5960 },
  { name: 'Science Laboratory Complex', lat: 12.9728, lng: 77.5948 },
  { name: 'Auditorium Backstage Lane', lat: 12.9718, lng: 77.5962 },
  { name: 'Admin Building Quad', lat: 12.9722, lng: 77.5942 },
  { name: 'Other Campus Area', lat: 12.9725, lng: 77.5945 },
];

/**
 * Calculates deterministic severity based on concern, frequency, and time
 */
export function calculateSafetySeverity(
  concern: SafetyConcernType,
  frequency: SafetyFrequency,
  time: SafetyTimeOption
): SafetySeverity {
  if (concern === 'harassment_concern' || concern === 'suspicious_activity') {
    if (frequency === 'frequently' || frequency === 'every_day') return 'critical';
    return 'high';
  }
  if (concern === 'construction_hazard' || concern === 'security_concern') {
    if (frequency === 'every_day') return 'high';
    return 'medium';
  }
  if (concern === 'poor_lighting' || concern === 'isolated_area' || concern === 'unsafe_pathway') {
    if (time === 'night' && (frequency === 'frequently' || frequency === 'every_day')) {
      return 'high';
    }
    if (time === 'night' || frequency === 'frequently') {
      return 'medium';
    }
    return 'low';
  }
  if (frequency === 'frequently' || frequency === 'every_day') return 'medium';
  return 'low';
}

/**
 * Initial demo data to showcase hotspot aggregation immediately
 */
function getInitialDemoReports(): UnsafeLocationReport[] {
  const now = new Date();
  const hAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

  return [
    {
      id: 'demo-unsafe-1',
      reference_id: '#CC-LOC-1014',
      reported_by: 'student-demo-1',
      concern_type: 'poor_lighting',
      description: 'Streetlights near the hostel rear entrance have been flickering and completely off after 8 PM.',
      latitude: 12.9708,
      longitude: 77.5935,
      location_name: 'Hostel Area',
      unsafe_time: 'night',
      frequency: 'every_day',
      severity: 'high',
      status: 'reviewing',
      created_at: hAgo(2),
      updated_at: hAgo(1),
      notes: 'Security night patrol logged light failure. Facilities notified.',
    },
    {
      id: 'demo-unsafe-2',
      reference_id: '#CC-LOC-1029',
      reported_by: 'student-demo-2',
      concern_type: 'poor_lighting',
      description: 'Very dark pathway behind boys hostel leading to canteen. Can barely see sidewalk.',
      latitude: 12.9709,
      longitude: 77.5936,
      location_name: 'Hostel Area',
      unsafe_time: 'night',
      frequency: 'frequently',
      severity: 'medium',
      status: 'acknowledged',
      created_at: hAgo(5),
      updated_at: hAgo(3),
    },
    {
      id: 'demo-unsafe-3',
      reference_id: '#CC-LOC-1055',
      reported_by: 'teacher-demo-1',
      concern_type: 'isolated_area',
      description: 'Corridor behind old auditorium has no foot traffic after 6 PM, lock on fire door broken.',
      latitude: 12.9718,
      longitude: 77.5962,
      location_name: 'Auditorium Backstage Lane',
      unsafe_time: 'evening',
      frequency: 'occasionally',
      severity: 'medium',
      status: 'reported',
      created_at: hAgo(12),
      updated_at: hAgo(12),
    },
    {
      id: 'demo-unsafe-4',
      reference_id: '#CC-LOC-1088',
      reported_by: 'student-demo-3',
      concern_type: 'construction_hazard',
      description: 'Uncovered trench with exposed rebar across the pathway to the Sports Ground.',
      latitude: 12.9735,
      longitude: 77.5960,
      location_name: 'Sports Ground Corridor',
      unsafe_time: 'always',
      frequency: 'every_day',
      severity: 'high',
      status: 'action_planned',
      created_at: hAgo(24),
      updated_at: hAgo(10),
      notes: 'Safety cones and warning tape dispatched.',
    },
  ];
}

function getLocalReports(): UnsafeLocationReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoReports();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialDemoReports();
  }
}

function saveLocalReports(reports: UnsafeLocationReport[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('campus_care_unsafe_location_sync'));
  } catch (err) {
    console.error('Failed to persist local unsafe reports:', err);
  }
}

/**
 * Clusters reports within a privacy radius (~75-100m) into anonymized Hotspots
 */
export function aggregateReportsIntoHotspots(
  reports: UnsafeLocationReport[],
  filters?: SafetyMapFilter
): SafetyHotspot[] {
  // Filter active concerns (exclude closed and fully resolved older than 7 days)
  const activeReports = reports.filter((r) => {
    if (r.status === 'closed') return false;
    if (filters?.category && filters.category !== 'all' && r.concern_type !== filters.category) {
      return false;
    }
    if (filters?.time && filters.time !== 'all') {
      if (filters.time === 'night') {
        if (r.unsafe_time !== 'night' && r.unsafe_time !== 'evening' && r.unsafe_time !== 'always') return false;
      } else if (filters.time === 'day') {
        if (r.unsafe_time === 'night') return false;
      }
    }
    if (filters?.severity && filters.severity !== 'all' && r.severity !== filters.severity) {
      return false;
    }
    return true;
  });

  const clusters: Array<{
    lat: number;
    lng: number;
    locationName: string;
    items: UnsafeLocationReport[];
  }> = [];

  const DISTANCE_THRESHOLD = 0.001; // approx 100 meters

  for (const report of activeReports) {
    let lat = report.latitude;
    let lng = report.longitude;

    // Fallback to campus coordinates if GPS was not provided
    if (!lat || !lng) {
      const matchedCampusLoc = CAMPUS_LOCATIONS.find(
        (c) => c.name.toLowerCase() === report.location_name.toLowerCase()
      ) || CAMPUS_LOCATIONS[0];
      lat = matchedCampusLoc.lat;
      lng = matchedCampusLoc.lng;
    }

    let foundCluster = false;
    for (const cluster of clusters) {
      const dist = Math.sqrt(Math.pow(cluster.lat - lat, 2) + Math.pow(cluster.lng - lng, 2));
      const sameName = cluster.locationName.toLowerCase() === report.location_name.toLowerCase();

      if (dist < DISTANCE_THRESHOLD || sameName) {
        cluster.items.push(report);
        // Gradually adjust center with weighted average
        cluster.lat = (cluster.lat * (cluster.items.length - 1) + lat) / cluster.items.length;
        cluster.lng = (cluster.lng * (cluster.items.length - 1) + lng) / cluster.items.length;
        foundCluster = true;
        break;
      }
    }

    if (!foundCluster) {
      clusters.push({
        lat,
        lng,
        locationName: report.location_name,
        items: [report],
      });
    }
  }

  // Convert clusters into privacy-safe hotspots
  return clusters.map((c, index) => {
    // 1. Calculate dominant category
    const categoryCounts: Record<string, number> = {};
    const timeCounts = { night: 0, day: 0, always: 0 };
    let maxCount = 0;
    let dominantCategory: SafetyConcernType = 'general_safety';

    let hasCritical = false;
    let hasHigh = false;
    let hasMedium = false;

    let latestTimestamp = c.items[0].created_at;

    for (const item of c.items) {
      categoryCounts[item.concern_type] = (categoryCounts[item.concern_type] || 0) + 1;
      if (categoryCounts[item.concern_type] > maxCount) {
        maxCount = categoryCounts[item.concern_type];
        dominantCategory = item.concern_type;
      }

      if (item.unsafe_time === 'night' || item.unsafe_time === 'evening') {
        timeCounts.night += 1;
      } else if (item.unsafe_time === 'always') {
        timeCounts.always += 1;
      } else {
        timeCounts.day += 1;
      }

      if (item.severity === 'critical') hasCritical = true;
      if (item.severity === 'high') hasHigh = true;
      if (item.severity === 'medium') hasMedium = true;

      if (new Date(item.created_at) > new Date(latestTimestamp)) {
        latestTimestamp = item.created_at;
      }
    }

    // 2. Calculate safety concern score
    let score = c.items.length * 10;
    if (hasCritical) score += 30;
    if (hasHigh) score += 20;
    if (hasMedium) score += 10;
    if (timeCounts.night > 1) score += 15;

    let concernLevel: SafetySeverity = 'low';
    if (score >= 45 || c.items.length >= 4 || hasCritical) {
      concernLevel = 'critical';
    } else if (score >= 28 || c.items.length >= 2 || hasHigh) {
      concernLevel = 'high';
    } else if (score >= 15 || hasMedium) {
      concernLevel = 'medium';
    }

    // 3. Privacy generalization: round coordinates to 4 decimal places (~11m blur)
    const generalizedLat = Math.round(c.lat * 10000) / 10000;
    const generalizedLng = Math.round(c.lng * 10000) / 10000;

    return {
      id: `hotspot-${index + 1}-${c.locationName.replace(/\s+/g, '-').toLowerCase()}`,
      latitude: generalizedLat,
      longitude: generalizedLng,
      location_name: c.locationName,
      report_count: c.items.length,
      dominant_category: dominantCategory,
      concern_level: concernLevel,
      score,
      last_reported_at: latestTimestamp,
      time_concerns: timeCounts,
      reports_preview: c.items.map((it) => ({
        id: it.id,
        reference_id: it.reference_id,
        concern_type: it.concern_type,
        created_at: it.created_at,
      })),
    };
  });
}

export const safetyService = {
  /**
   * Submits a new unsafe location report
   */
  async createUnsafeLocationReport(
    payload: UnsafeLocationPayload
  ): Promise<{ data: UnsafeLocationReport | null; error: Error | null }> {
    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `#CC-LOC-${refNumber}`;
    const severity = calculateSafetySeverity(payload.concern_type, payload.frequency, payload.unsafe_time);

    const newReport: UnsafeLocationReport = {
      id: `unsafe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference_id: referenceId,
      reported_by: payload.reported_by,
      concern_type: payload.concern_type,
      description: payload.description,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      location_name: payload.location_name,
      unsafe_time: payload.unsafe_time,
      frequency: payload.frequency,
      severity,
      status: 'reported',
      photo_path: payload.photo_path ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('unsafe_location_reports')
          .insert({
            reference_id: referenceId,
            reported_by: payload.reported_by,
            concern_type: payload.concern_type,
            description: payload.description,
            latitude: payload.latitude ?? null,
            longitude: payload.longitude ?? null,
            location_name: payload.location_name,
            unsafe_time: payload.unsafe_time,
            frequency: payload.frequency,
            severity,
            status: 'reported',
            photo_path: payload.photo_path ?? null,
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert failed, saving to local state:', error);
          const current = getLocalReports();
          saveLocalReports([newReport, ...current]);
        } else if (data) {
          // Notify security team
          await notificationService.createNotification({
            user_id: payload.reported_by,
            title: '📍 Campus Safety Report Received',
            message: `Your report for "${payload.location_name}" (${referenceId}) has been registered with campus safety.`,
            type: 'security',
            reference_id: data.id,
            reference_type: 'unsafe_location',
          });

          return { data: data as unknown as UnsafeLocationReport, error: null };
        }
      } catch (err) {
        console.warn('Supabase connection exception, falling back to local:', err);
        const current = getLocalReports();
        saveLocalReports([newReport, ...current]);
      }
    } else {
      const current = getLocalReports();
      saveLocalReports([newReport, ...current]);
    }

    return { data: newReport, error: null };
  },

  /**
   * Fetches privacy-safe aggregated hotspots for the public safety map
   */
  async getSafetyHotspots(
    filters?: SafetyMapFilter
  ): Promise<{ data: SafetyHotspot[]; error: Error | null }> {
    let reports: UnsafeLocationReport[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('unsafe_location_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          reports = data as unknown as UnsafeLocationReport[];
        } else {
          reports = getLocalReports();
        }
      } catch {
        reports = getLocalReports();
      }
    } else {
      reports = getLocalReports();
    }

    const hotspots = aggregateReportsIntoHotspots(reports, filters);
    return { data: hotspots, error: null };
  },

  /**
   * Alias for getSafetyHotspots
   */
  async getSafetyMapData(
    filters?: SafetyMapFilter
  ): Promise<{ data: SafetyHotspot[]; error: Error | null }> {
    return this.getSafetyHotspots(filters);
  },

  /**
   * Fetches user's own reports with full individual details
   */
  async getUserUnsafeLocationReports(
    userId: string
  ): Promise<{ data: UnsafeLocationReport[]; error: Error | null }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('unsafe_location_reports')
          .select('*')
          .eq('reported_by', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { data: data as unknown as UnsafeLocationReport[], error: null };
        }
      } catch (err) {
        console.warn('Failed to load user reports from Supabase:', err);
      }
    }

    const local = getLocalReports().filter((r) => r.reported_by === userId);
    return { data: local, error: null };
  },

  /**
   * Fetches reports for authorized security personnel and administrators
   */
  async getReportsForAuthorizedStaff(options?: {
    status?: SafetyStatus | 'all';
    concern?: SafetyConcernType | 'all';
    search?: string;
  }): Promise<{ data: UnsafeLocationReport[]; error: Error | null }> {
    let list: UnsafeLocationReport[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('unsafe_location_reports')
          .select('*, reporter:profiles!reported_by(*)')
          .order('created_at', { ascending: false });

        if (options?.status && options.status !== 'all') {
          query = query.eq('status', options.status);
        }
        if (options?.concern && options.concern !== 'all') {
          query = query.eq('concern_type', options.concern);
        }

        const { data, error } = await query;
        if (!error && data) {
          list = data as unknown as UnsafeLocationReport[];
        } else {
          list = getLocalReports();
        }
      } catch {
        list = getLocalReports();
      }
    } else {
      list = getLocalReports();
    }

    // Apply local in-memory search if provided
    if (options?.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.reference_id.toLowerCase().includes(q) ||
          r.location_name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    return { data: list, error: null };
  },

  /**
   * Fetches single report details
   */
  async getUnsafeLocationReport(
    id: string
  ): Promise<{ data: UnsafeLocationReport | null; error: Error | null }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('unsafe_location_reports')
          .select('*, reporter:profiles!reported_by(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          return { data: data as unknown as UnsafeLocationReport, error: null };
        }
      } catch {
        // fallback
      }
    }

    const item = getLocalReports().find((r) => r.id === id) || null;
    return { data: item, error: null };
  },

  /**
   * Transitions report to reviewing
   */
  async reviewSafetyReport(
    id: string,
    workerId: string
  ): Promise<{ error: Error | null }> {
    return this.updateSafetyReport(id, {
      status: 'reviewing',
      assigned_to: workerId,
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Transitions report to acknowledged
   */
  async acknowledgeSafetyReport(
    id: string,
    workerId: string
  ): Promise<{ error: Error | null }> {
    return this.updateSafetyReport(id, {
      status: 'acknowledged',
      assigned_to: workerId,
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Transitions report to action_planned
   */
  async planActionSafetyReport(
    id: string,
    workerId: string,
    notes?: string
  ): Promise<{ error: Error | null }> {
    return this.updateSafetyReport(id, {
      status: 'action_planned',
      assigned_to: workerId,
      notes: notes || 'Preventative safety action scheduled with campus operations.',
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Resolves a safety report with resolution notes
   */
  async resolveSafetyReport(
    id: string,
    workerId: string,
    notes?: string
  ): Promise<{ error: Error | null }> {
    return this.updateSafetyReport(id, {
      status: 'resolved',
      assigned_to: workerId,
      notes: notes || 'Safety hazard inspected and mitigated.',
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Closes a safety report
   */
  async closeSafetyReport(
    id: string,
    workerId: string,
    notes?: string
  ): Promise<{ error: Error | null }> {
    return this.updateSafetyReport(id, {
      status: 'closed',
      assigned_to: workerId,
      notes: notes || 'Report archived by security administration.',
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Core updater
   */
  async updateSafetyReport(
    id: string,
    updates: Partial<UnsafeLocationReport>
  ): Promise<{ error: Error | null }> {
    const updatedWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('unsafe_location_reports')
          .update(updatedWithTimestamp)
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.warn('Supabase update failed, synchronizing local storage:', err);
      }
    }

    const current = getLocalReports();
    const updated = current.map((r) => (r.id === id ? { ...r, ...updatedWithTimestamp } : r));
    saveLocalReports(updated);

    return { error: null };
  },
};
