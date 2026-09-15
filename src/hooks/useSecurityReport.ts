// ============================================================
// Campus Care — useSecurityReport Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { securityService } from '../lib/services/securityService';
import type {
  SecurityCategory,
  IncidentTimeOption,
  SecurityReport,
} from '../types/database';

export interface UseSecurityReportReturn {
  // Form State
  category: SecurityCategory;
  setCategory: (val: SecurityCategory) => void;
  immediateDanger: boolean;
  setImmediateDanger: (val: boolean) => void;
  description: string;
  setDescription: (val: string) => void;
  incidentTime: IncidentTimeOption;
  setIncidentTime: (val: IncidentTimeOption) => void;
  customIncidentTime: string;
  setCustomIncidentTime: (val: string) => void;
  locationName: string;
  setLocationName: (val: string) => void;
  latitude: number | null;
  longitude: number | null;
  anonymousReport: boolean;
  setAnonymousReport: (val: boolean) => void;
  contactAllowed: boolean;
  setContactAllowed: (val: boolean) => void;
  evidenceUrl: string | null;
  setEvidenceUrl: (val: string | null) => void;
  evidenceFile: File | null;
  setEvidenceFile: (file: File | null) => void;

  // Status & Actions
  submitting: boolean;
  error: string | null;
  success: boolean;
  referenceId: string | null;
  createdReport: SecurityReport | null;
  locationLoading: boolean;
  locationError: string | null;
  detectLocation: () => void;
  submitReport: () => Promise<boolean>;
  resetForm: () => void;
}

export function useSecurityReport(onSuccessCallback?: () => void): UseSecurityReportReturn {
  const { user } = useAuth();

  const [category, setCategory] = useState<SecurityCategory>('suspicious_activity');
  const [immediateDanger, setImmediateDanger] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [incidentTime, setIncidentTime] = useState<IncidentTimeOption>('just_now');
  const [customIncidentTime, setCustomIncidentTime] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [anonymousReport, setAnonymousReport] = useState<boolean>(false);
  const [contactAllowed, setContactAllowed] = useState<boolean>(true);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [createdReport, setCreatedReport] = useState<SecurityReport | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Non-blocking geolocation capture
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by device');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationLoading(false);
        if (!locationName) {
          setLocationName('Current Location (GPS Verified)');
        }
      },
      (err) => {
        console.warn('Security report location capture fallback:', err.message);
        setLocationLoading(false);
        setLocationError('Location permission denied or unavailable');
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  }, [locationName]);

  // Attempt initial gentle GPS capture on mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const submitReport = async (): Promise<boolean> => {
    if (!user) {
      setError('You must be signed in to submit a security report.');
      return false;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      const finalIncidentTime =
        incidentTime === 'custom' && customIncidentTime.trim()
          ? customIncidentTime.trim()
          : incidentTime;

      // Handle optional evidence preview / storage mock
      let finalEvidence = evidenceUrl;
      if (evidenceFile && !finalEvidence) {
        // Create local object URL for preview demo
        finalEvidence = URL.createObjectURL(evidenceFile);
      }

      const res = await securityService.createSecurityReport({
        reported_by: user.id,
        category,
        description: description.trim(),
        incident_time: finalIncidentTime,
        latitude,
        longitude,
        location_name: locationName.trim() || 'Campus Area',
        immediate_danger: immediateDanger,
        anonymous_report: anonymousReport,
        contact_allowed: contactAllowed,
        evidence_url: finalEvidence,
      });

      if (res.error || !res.data) {
        setError(res.error?.message || 'Failed to submit report. Please try again.');
        setSubmitting(false);
        return false;
      }

      setCreatedReport(res.data);
      setReferenceId(res.referenceId);
      setSuccess(true);
      setSubmitting(false);

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setSubmitting(false);
      return false;
    }
  };

  const resetForm = () => {
    setCategory('suspicious_activity');
    setImmediateDanger(false);
    setDescription('');
    setIncidentTime('just_now');
    setCustomIncidentTime('');
    setLocationName('');
    setAnonymousReport(false);
    setContactAllowed(true);
    setEvidenceUrl(null);
    setEvidenceFile(null);
    setError(null);
    setSuccess(false);
    setReferenceId(null);
    setCreatedReport(null);
    detectLocation();
  };

  return {
    category,
    setCategory,
    immediateDanger,
    setImmediateDanger,
    description,
    setDescription,
    incidentTime,
    setIncidentTime,
    customIncidentTime,
    setCustomIncidentTime,
    locationName,
    setLocationName,
    latitude,
    longitude,
    anonymousReport,
    setAnonymousReport,
    contactAllowed,
    setContactAllowed,
    evidenceUrl,
    setEvidenceUrl,
    evidenceFile,
    setEvidenceFile,
    submitting,
    error,
    success,
    referenceId,
    createdReport,
    locationLoading,
    locationError,
    detectLocation,
    submitReport,
    resetForm,
  };
}
