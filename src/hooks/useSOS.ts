// ============================================================
// Campus Care — useSOS Hook (End-to-End Emergency Dispatch)
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { emergencyService } from '../lib/services/emergencyService';
import type { EmergencyIncident } from '../types/database';

export interface SOSLocationState {
  detecting: boolean;
  latitude: number | null;
  longitude: number | null;
  deniedOrUnavailable: boolean;
}

export function useSOS() {
  const { user, profile } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdIncident, setCreatedIncident] = useState<EmergencyIncident | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Duplicate active emergency check
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false);
  const [existingIncident, setExistingIncident] = useState<EmergencyIncident | null>(null);

  // Location detection
  const [locationState, setLocationState] = useState<SOSLocationState>({
    detecting: false,
    latitude: null,
    longitude: null,
    deniedOrUnavailable: false,
  });

  // Check active emergency on open or mount
  const checkExistingEmergency = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await emergencyService.getActiveEmergencyForUser(user.id);
      if (data) {
        setHasActiveEmergency(true);
        setExistingIncident(data);
      } else {
        setHasActiveEmergency(false);
        setExistingIncident(null);
      }
    } catch {
      // Fallback
    }
  }, [user]);

  useEffect(() => {
    if (isModalOpen && user) {
      checkExistingEmergency();
    }
  }, [isModalOpen, user, checkExistingEmergency]);

  const openModal = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsModalOpen(true);
    checkExistingEmergency();

    // Start proactive non-blocking geolocation check
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
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      setLocationState({
        detecting: false,
        latitude: null,
        longitude: null,
        deniedOrUnavailable: true,
      });
    }
  }, [checkExistingEmergency]);

  const closeModal = useCallback(() => {
    if (!isActivating) {
      setIsModalOpen(false);
      setError(null);
    }
  }, [isActivating]);

  const resetSOS = useCallback(() => {
    setIsSuccess(false);
    setIsActivating(false);
    setCreatedIncident(null);
    setError(null);
  }, []);

  /**
   * Activates Emergency SOS with graceful non-blocking location fallback
   */
  const activateSOS = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to activate SOS.');
      return;
    }

    setIsActivating(true);
    setError(null);

    // Final location check if still detecting
    let finalLat = locationState.latitude;
    let finalLng = locationState.longitude;

    if (finalLat == null && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { timeout: 3000 }
          );
        });
        if (position) {
          finalLat = position.coords.latitude;
          finalLng = position.coords.longitude;
        }
      } catch {
        // Continue even if location fails
      }
    }

    try {
      const { data, error: serviceError } = await emergencyService.createSOS({
        reported_by: user.id,
        latitude: finalLat,
        longitude: finalLng,
        location_name: finalLat ? 'GPS Location Detected' : 'Location Unavailable',
        description: `Emergency SOS activated by ${profile?.full_name || 'campus user'} (${profile?.role || 'student'}).`,
      });

      if (serviceError) {
        if (serviceError.message === 'ACTIVE_EMERGENCY_EXISTS') {
          setHasActiveEmergency(true);
          setExistingIncident(data);
          setError('You already have an active emergency in progress.');
        } else {
          setError('Emergency alert could not be sent. Please retry or call emergency hotline.');
        }
        setIsActivating(false);
        return;
      }

      if (data) {
        setCreatedIncident(data);
        setIsSuccess(true);
        setHasActiveEmergency(true);
      }
    } catch (err: unknown) {
      console.error('SOS activation exception:', err);
      setError('Emergency alert could not be sent. Please try again.');
    } finally {
      setIsActivating(false);
    }
  }, [user, profile, locationState]);

  return {
    isModalOpen,
    isActivating,
    isSuccess,
    hasActiveEmergency,
    existingIncident,
    createdIncident,
    locationState,
    error,
    user,
    profile,
    openModal,
    closeModal,
    activateSOS,
    resetSOS,
  };
}
