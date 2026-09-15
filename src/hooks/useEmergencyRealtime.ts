// ============================================================
// Campus Care — Realtime Emergency Hook
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useEmergencyRealtime(onIncidentChange?: () => void) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const callbackRef = useRef(onIncidentChange);

  useEffect(() => {
    callbackRef.current = onIncidentChange;
  }, [onIncidentChange]);

  useEffect(() => {
    // 1. Cross-tab and local custom event listener for demo mode / offline sync
    const handleCustomSync = () => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'campus_care_demo_emergencies' ||
        e.key === 'campus_care_demo_assignments' ||
        e.key === 'campus_care_demo_security_reports' ||
        e.key === 'campus_care_demo_unsafe_locations'
      ) {
        if (callbackRef.current) {
          callbackRef.current();
        }
      }
    };

    window.addEventListener('campus_care_emergency_sync', handleCustomSync);
    window.addEventListener('campus_care_assignment_sync', handleCustomSync);
    window.addEventListener('campus_care_security_sync', handleCustomSync);
    window.addEventListener('campus_care_unsafe_location_sync', handleCustomSync);
    window.addEventListener('storage', handleStorage);

    // 2. If Supabase is configured, subscribe to realtime postgres changes
    if (!isSupabaseConfigured()) {
      setIsConnected(true);
      return () => {
        window.removeEventListener('campus_care_emergency_sync', handleCustomSync);
        window.removeEventListener('campus_care_assignment_sync', handleCustomSync);
        window.removeEventListener('campus_care_security_sync', handleCustomSync);
        window.removeEventListener('campus_care_unsafe_location_sync', handleCustomSync);
        window.removeEventListener('storage', handleStorage);
      };
    }

    const channel = supabase
      .channel('emergency-incidents-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_incidents' },
        () => {
          if (callbackRef.current) callbackRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incident_assignments' },
        () => {
          if (callbackRef.current) callbackRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'security_reports' },
        () => {
          if (callbackRef.current) callbackRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'unsafe_location_reports' },
        () => {
          if (callbackRef.current) callbackRef.current();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    return () => {
      window.removeEventListener('campus_care_emergency_sync', handleCustomSync);
      window.removeEventListener('campus_care_assignment_sync', handleCustomSync);
      window.removeEventListener('campus_care_security_sync', handleCustomSync);
      window.removeEventListener('campus_care_unsafe_location_sync', handleCustomSync);
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
    };
  }, []);

  return { isConnected };
}
