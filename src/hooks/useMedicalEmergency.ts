// ============================================================
// Campus Care — useMedicalEmergency Hook
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { medicalService } from '../lib/services/medicalService';
import type { EmergencyIncident, IncidentPriority } from '../types/database';

export interface MedicalLocationState {
  detecting: boolean;
  latitude: number | null;
  longitude: number | null;
  deniedOrUnavailable: boolean;
}

export function useMedicalEmergency() {
  const { user, profile } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active check & duplicate prevention
  const [hasActiveMedical, setHasActiveMedical] = useState(false);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [createdIncident, setCreatedIncident] = useState<EmergencyIncident | null>(null);

  // Form fields
  const [symptoms, setSymptoms] = useState('');
  const [injuryDescription, setInjuryDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentPriority>('high');
  const [ambulanceChoice, setAmbulanceChoice] = useState<'yes' | 'no' | 'not_sure'>('not_sure');

  // Location detection
  const [locationState, setLocationState] = useState<MedicalLocationState>({
    detecting: false,
    latitude: null,
    longitude: null,
    deniedOrUnavailable: false,
  });

  const checkActive = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await medicalService.getActiveMedicalEmergency(user.id);
      if (data) {
        setHasActiveMedical(true);
        setActiveIncident(data.incident);
      } else {
        setHasActiveMedical(false);
        setActiveIncident(null);
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

  const openForm = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsFormOpen(true);
    checkActive();

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
  }, [checkActive]);

  const closeForm = useCallback(() => {
    if (!isSubmitting) {
      setIsFormOpen(false);
      setError(null);
    }
  }, [isSubmitting]);

  const resetForm = useCallback(() => {
    setSymptoms('');
    setInjuryDescription('');
    setSeverity('high');
    setAmbulanceChoice('not_sure');
    setIsSuccess(false);
    setCreatedIncident(null);
    setError(null);
  }, []);

  const submitMedicalEmergency = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to request medical assistance.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Non-blocking location resolution
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
        // Continue even if location unavailable
      }
    }

    const needsAmbulance = ambulanceChoice === 'yes' || ambulanceChoice === 'not_sure';

    try {
      const res = await medicalService.createMedicalEmergency({
        reported_by: user.id,
        symptoms: symptoms.trim() || 'Medical emergency reported',
        injury_description: injuryDescription.trim() || null,
        severity,
        needs_ambulance: needsAmbulance,
        latitude: finalLat,
        longitude: finalLng,
        location_name: finalLat ? 'GPS Location Transmitted' : 'Location Unavailable',
      });

      if (res.error) {
        if (res.error.message === 'ACTIVE_MEDICAL_EXISTS') {
          setHasActiveMedical(true);
          setActiveIncident(res.incident);
          setError('You already have an active medical emergency in progress.');
        } else {
          setError('Failed to submit medical emergency. Please call student clinic or 911.');
        }
        setIsSubmitting(false);
        return;
      }

      if (res.incident) {
        setCreatedIncident(res.incident);
        setIsSuccess(true);
        setHasActiveMedical(true);
        setActiveIncident(res.incident);
      }
    } catch (err: unknown) {
      console.error('Medical submission error:', err);
      setError('Could not transmit medical request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, locationState, ambulanceChoice, symptoms, injuryDescription, severity]);

  return {
    isFormOpen,
    isSubmitting,
    isSuccess,
    hasActiveMedical,
    activeIncident,
    createdIncident,
    locationState,
    error,
    symptoms,
    injuryDescription,
    severity,
    ambulanceChoice,
    user,
    profile,
    setSymptoms,
    setInjuryDescription,
    setSeverity,
    setAmbulanceChoice,
    openForm,
    closeForm,
    resetForm,
    submitMedicalEmergency,
    checkActive,
  };
}
