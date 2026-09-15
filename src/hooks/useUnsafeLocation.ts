// ============================================================
// Campus Care — useUnsafeLocation Hook
// ============================================================

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { safetyService, CAMPUS_LOCATIONS } from '../lib/services/safetyService';
import type {
  SafetyConcernType,
  SafetyTimeOption,
  SafetyFrequency,
} from '../types/database';

export function useUnsafeLocation(onSuccess?: () => void) {
  const { user } = useAuth();

  const [concernType, setConcernType] = useState<SafetyConcernType>('poor_lighting');
  const [description, setDescription] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('Hostel Area');
  const [latitude, setLatitude] = useState<number | null>(CAMPUS_LOCATIONS[0].lat);
  const [longitude, setLongitude] = useState<number | null>(CAMPUS_LOCATIONS[0].lng);
  const [unsafeTime, setUnsafeTime] = useState<SafetyTimeOption>('night');
  const [frequency, setFrequency] = useState<SafetyFrequency>('frequently');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isImmediateDanger, setIsImmediateDanger] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  /**
   * Non-blocking GPS detection with campus fallback
   */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage('GPS not supported. Please select a campus location manually.');
      return;
    }

    setLocationLoading(true);
    setLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Find closest campus location for human context
        let closest = CAMPUS_LOCATIONS[0];
        let minDist = Infinity;
        for (const loc of CAMPUS_LOCATIONS) {
          const d = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2));
          if (d < minDist) {
            minDist = d;
            closest = loc;
          }
        }

        setLocationName(`${closest.name} (GPS)`);
        setLocationLoading(false);
        setLocationMessage('GPS coordinates verified.');
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err.message);
        setLocationLoading(false);
        setLocationMessage('Location access is unavailable. You can select the location manually.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  /**
   * Set location from campus selector
   */
  const selectCampusLocation = useCallback((name: string) => {
    setLocationName(name);
    const matched = CAMPUS_LOCATIONS.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (matched) {
      setLatitude(matched.lat);
      setLongitude(matched.lng);
    }
  }, []);

  /**
   * Set location from map pin/click
   */
  const selectMapCoordinates = useCallback((lat: number, lng: number, label?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (label) {
      setLocationName(label);
    }
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setConcernType('poor_lighting');
    setDescription('');
    setLocationName('Hostel Area');
    setLatitude(CAMPUS_LOCATIONS[0].lat);
    setLongitude(CAMPUS_LOCATIONS[0].lng);
    setUnsafeTime('night');
    setFrequency('frequently');
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    setIsImmediateDanger(false);
    setError(null);
    setSuccess(false);
    setReferenceId(null);
    setLocationMessage(null);
  }, [photoPreview]);

  /**
   * Submit report
   */
  const submitReport = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to report an unsafe location.');
      return false;
    }

    if (description.trim().length < 10) {
      setError('Please provide at least 10 characters describing the hazard.');
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: serviceError } = await safetyService.createUnsafeLocationReport({
        reported_by: user.id,
        concern_type: concernType,
        description: description.trim(),
        location_name: locationName.trim() || 'Campus Area',
        latitude,
        longitude,
        unsafe_time: unsafeTime,
        frequency,
        photo_path: photoFile ? photoFile.name : null,
      });

      if (serviceError || !data) {
        throw serviceError || new Error('Unable to submit safety report.');
      }

      setReferenceId(data.reference_id);
      setSuccess(true);
      if (onSuccess) onSuccess();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [
    user,
    description,
    concernType,
    locationName,
    latitude,
    longitude,
    unsafeTime,
    frequency,
    photoFile,
    onSuccess,
  ]);

  return {
    concernType,
    setConcernType,
    description,
    setDescription,
    locationName,
    setLocationName,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    unsafeTime,
    setUnsafeTime,
    frequency,
    setFrequency,
    photoFile,
    setPhotoFile,
    photoPreview,
    setPhotoPreview,
    isImmediateDanger,
    setIsImmediateDanger,
    submitting,
    error,
    success,
    referenceId,
    locationLoading,
    locationMessage,
    detectLocation,
    selectCampusLocation,
    selectMapCoordinates,
    submitReport,
    resetForm,
  };
}
