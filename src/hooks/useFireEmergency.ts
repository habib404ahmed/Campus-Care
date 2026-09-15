// ============================================================
// Campus Care — useFireEmergency Hook
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { fireService } from '../lib/services/fireService';
import type {
  EmergencyIncident,
  FireIncident,
  FireType,
  PeopleTrappedStatus,
} from '../types/database';

export interface FireLocationState {
  detecting: boolean;
  latitude: number | null;
  longitude: number | null;
  deniedOrUnavailable: boolean;
}

export function useFireEmergency() {
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active check & duplicate prevention
  const [hasActiveFire, setHasActiveFire] = useState(false);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [activeFire, setActiveFire] = useState<FireIncident | null>(null);
  const [createdIncident, setCreatedIncident] = useState<EmergencyIncident | null>(null);

  // Form fields
  const [fireType, setFireType] = useState<FireType>('fire');
  const [smokeVisible, setSmokeVisible] = useState<'yes' | 'no' | 'not_sure'>('yes');
  const [peopleTrapped, setPeopleTrapped] = useState<PeopleTrappedStatus>('no');
  const [description, setDescription] = useState('');
  const [confirmedTrapped, setConfirmedTrapped] = useState(false);

  // Location detection
  const [locationState, setLocationState] = useState<FireLocationState>({
    detecting: false,
    latitude: null,
    longitude: null,
    deniedOrUnavailable: false,
  });

  const checkActive = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await fireService.getActiveFireEmergency(user.id);
      if (data) {
        setHasActiveFire(true);
        setActiveIncident(data.incident);
        setActiveFire(data.fire);
      } else {
        setHasActiveFire(false);
        setActiveIncident(null);
        setActiveFire(null);
      }
    } catch {
      // Fallback
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkActive();
    }
  }, [user, checkActive]);

  // Request non-blocking location
  const requestLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setLocationState((prev) => ({ ...prev, detecting: true }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationState({
            detecting: false,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            deniedOrUnavailable: false,
          });
        },
        () => {
          setLocationState({
            detecting: false,
            latitude: null,
            longitude: null,
            deniedOrUnavailable: true,
          });
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    } else {
      setLocationState({
        detecting: false,
        latitude: null,
        longitude: null,
        deniedOrUnavailable: true,
      });
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const resetForm = useCallback(() => {
    setFireType('fire');
    setSmokeVisible('yes');
    setPeopleTrapped('no');
    setDescription('');
    setConfirmedTrapped(false);
    setError(null);
    setIsSuccess(false);
    setCreatedIncident(null);
  }, []);

  const submitFireEmergency = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError('Please sign in to report a fire emergency.');
      return false;
    }

    // Duplicate check
    await checkActive();
    if (hasActiveFire) {
      setError('You already have an active fire emergency in progress.');
      return false;
    }

    // If people trapped is 'yes' and not yet acknowledged
    if (peopleTrapped === 'yes' && !confirmedTrapped) {
      setError('Please acknowledge that reporting trapped occupants triggers a critical emergency dispatch.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { incident, error: err } = await fireService.createFireEmergency({
        reported_by: user.id,
        fire_type: fireType,
        smoke_visible: smokeVisible === 'yes',
        people_trapped: peopleTrapped,
        description: description.trim() || undefined,
        latitude: locationState.latitude,
        longitude: locationState.longitude,
        location_name: locationState.latitude ? 'Location detected' : 'Location unavailable',
      });

      if (err || !incident) {
        throw err || new Error('Fire emergency creation failed');
      }

      setCreatedIncident(incident);
      setIsSuccess(true);
      setHasActiveFire(true);
      setActiveIncident(incident);

      // Trigger realtime cross-tab broadcast
      window.dispatchEvent(new CustomEvent('campus_care_emergency_sync'));

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to transmit fire emergency alert. Please try again or press SOS.';
      setError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user,
    hasActiveFire,
    checkActive,
    fireType,
    smokeVisible,
    peopleTrapped,
    confirmedTrapped,
    description,
    locationState,
  ]);

  return {
    isSubmitting,
    isSuccess,
    hasActiveFire,
    activeIncident,
    activeFire,
    createdIncident,
    locationState,
    error,
    fireType,
    smokeVisible,
    peopleTrapped,
    description,
    confirmedTrapped,
    setFireType,
    setSmokeVisible,
    setPeopleTrapped,
    setDescription,
    setConfirmedTrapped,
    resetForm,
    requestLocation,
    submitFireEmergency,
    checkActive,
  };
}
