// ============================================================
// Campus Care — UnsafeLocationForm Component
// ============================================================

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Repeat,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  Trash2,
  Navigation,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SafetyConcernSelector } from './SafetyConcernSelector';
import { useUnsafeLocation } from '../../hooks/useUnsafeLocation';
import { CAMPUS_LOCATIONS } from '../../lib/services/safetyService';
import type {
  SafetyTimeOption,
  SafetyFrequency,
} from '../../types/database';
import { cn } from '../../lib/utils';

interface UnsafeLocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onActivateSOS?: () => void;
  initialLocationName?: string;
  initialCoords?: { lat: number; lng: number };
}

const timeOptions: Array<{ id: SafetyTimeOption; label: string; desc: string }> = [
  { id: 'always', label: 'All the time', desc: 'Hazard is static 24/7' },
  { id: 'night', label: 'Night (After dark)', desc: 'Dark, isolated, poor visibility' },
  { id: 'evening', label: 'Evening (Sunset)', desc: 'During dusk / transition hours' },
  { id: 'morning', label: 'Morning', desc: 'Early hours or commute time' },
  { id: 'afternoon', label: 'Afternoon', desc: 'Midday peak hours' },
  { id: 'specific_time', label: 'Specific Time', desc: 'Certain recurring hours' },
];

const frequencyOptions: Array<{ id: SafetyFrequency; label: string; desc: string }> = [
  { id: 'once', label: 'First time', desc: 'Just noticed today' },
  { id: 'occasionally', label: 'Occasionally', desc: 'Happens from time to time' },
  { id: 'frequently', label: 'Frequently', desc: 'Multiple times per week' },
  { id: 'every_day', label: 'Every day', desc: 'Constant daily issue' },
];

export function UnsafeLocationForm({
  isOpen,
  onClose,
  onSuccess,
  onActivateSOS,
  initialLocationName,
  initialCoords,
}: UnsafeLocationFormProps) {
  const {
    concernType,
    setConcernType,
    description,
    setDescription,
    locationName,
    setLocationName,
    latitude,
    unsafeTime,
    setUnsafeTime,
    frequency,
    setFrequency,
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
  } = useUnsafeLocation(onSuccess);

  const [fileError, setFileError] = useState<string | null>(null);

  // Set initial location if provided from map click
  React.useEffect(() => {
    if (isOpen && initialLocationName) {
      setLocationName(initialLocationName);
    }
    if (isOpen && initialCoords) {
      selectMapCoordinates(initialCoords.lat, initialCoords.lng);
    }
  }, [isOpen, initialLocationName, initialCoords, setLocationName, selectMapCoordinates]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Supported formats: JPG, PNG, WEBP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10 MB maximum limit');
      return;
    }

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleRemoveFile = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReport();
  };

  const handleClose = () => {
    resetForm();
    handleRemoveFile();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsafe-location-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-surface-200/80 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
              <span className="text-xl" aria-hidden="true">📍</span>
            </div>
            <div>
              <h2 id="unsafe-location-modal-title" className="text-base font-extrabold text-surface-900 leading-tight">
                Report Unsafe Location
              </h2>
              <p className="text-xs text-surface-500">
                Tell the campus community about places that need safety attention.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            /* Success confirmation */
            <div className="text-center py-6 px-4 animate-fade-in space-y-4">
              <div className="w-16 h-16 rounded-full bg-safe-100 text-safe-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-block mb-2">
                  Reference: {referenceId || '#CC-LOC-CONFIRMED'}
                </span>
                <h3 className="text-xl font-black text-surface-900">Safety Concern Registered</h3>
                <p className="text-sm text-surface-600 mt-1 max-w-md mx-auto">
                  Thank you for keeping campus safe. Your report has been aggregated into the campus safety map and routed to security administration.
                </p>
              </div>

              <div className="p-4 bg-surface-50 border border-surface-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-surface-500 font-medium">Location:</span>
                  <span className="font-bold text-surface-900">{locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 font-medium">Concern:</span>
                  <span className="font-bold text-amber-700 capitalize">
                    {concernType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 font-medium">Time Context:</span>
                  <span className="font-bold text-surface-800 capitalize">
                    {unsafeTime.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleClose}
                  className="px-6 py-2.5 text-xs font-bold shadow-xs cursor-pointer"
                >
                  View Safety Map
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. IMMEDIATE DANGER ASSESSMENT */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-surface-900">
                        Is this an active or immediate emergency?
                      </p>
                      <p className="text-[11px] text-surface-600 leading-snug">
                        Unsafe location reports are reviewed for campus maintenance and safety patrols.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsImmediateDanger(false)}
                      className={cn(
                        'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        !isImmediateDanger ? 'bg-surface-900 text-white' : 'bg-white text-surface-600 border border-surface-200'
                      )}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsImmediateDanger(true)}
                      className={cn(
                        'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        isImmediateDanger ? 'bg-rose-600 text-white' : 'bg-white text-surface-600 border border-surface-200'
                      )}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {isImmediateDanger && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-rose-800">🚨 Need immediate help?</p>
                      <p className="text-[11px] text-rose-700">
                        If you or someone nearby is in physical danger, trigger emergency SOS for instantaneous response.
                      </p>
                    </div>
                    {onActivateSOS && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          handleClose();
                          onActivateSOS();
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex-shrink-0 gap-1.5 cursor-pointer"
                      >
                        Activate SOS
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. LOCATION SELECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-600" /> Campus Location <span className="text-emergency-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locationLoading || submitting}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                  >
                    {locationLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                    {latitude ? 'GPS Verified ✓' : 'Detect GPS'}
                  </button>
                </div>

                {/* Campus Location Preset Dropdown */}
                <select
                  value={CAMPUS_LOCATIONS.some((c) => c.name === locationName) ? locationName : 'Other Campus Area'}
                  onChange={(e) => selectCampusLocation(e.target.value)}
                  disabled={submitting}
                  className="input-field w-full text-xs font-medium cursor-pointer"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      📍 {loc.name}
                    </option>
                  ))}
                </select>

                {/* Location specific detail */}
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., Hostel 3 rear walkway near basketball court"
                  className="input-field w-full text-xs"
                  required
                />
                {locationMessage && (
                  <p className="text-[11px] text-amber-700">{locationMessage}</p>
                )}
              </div>

              {/* 3. CONCERN CATEGORY SELECTOR */}
              <SafetyConcernSelector
                value={concernType}
                onChange={setConcernType}
                disabled={submitting}
              />

              {/* 4. DESCRIPTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="unsafe-desc" className="text-xs font-bold text-surface-800 uppercase tracking-wider block">
                    What makes this location unsafe? <span className="text-emergency-500">*</span>
                  </label>
                  <span
                    className={cn(
                      'text-[11px]',
                      description.length < 10 ? 'text-amber-600 font-semibold' : 'text-surface-400'
                    )}
                  >
                    {description.length} / 500 (min 10)
                  </span>
                </div>
                <textarea
                  id="unsafe-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  disabled={submitting}
                  placeholder="e.g. Pathway behind the hostel becomes completely pitch black after 8 PM with broken paver tiles..."
                  className="input-field w-full text-xs leading-relaxed resize-y min-h-[80px]"
                  required
                />
              </div>

              {/* 5. TIME OF CONCERN */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-brand-600" /> When is this location unsafe?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUnsafeTime(opt.id)}
                      disabled={submitting}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                        unsafeTime === opt.id
                          ? 'border-brand-500 bg-brand-50/80 shadow-xs'
                          : 'border-surface-200 hover:border-surface-300 bg-white'
                      )}
                    >
                      <p className="text-xs font-bold text-surface-900">{opt.label}</p>
                      <p className="text-[10px] text-surface-500 truncate">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. FREQUENCY */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Repeat size={14} className="text-purple-600" /> How often does this happen?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {frequencyOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFrequency(opt.id)}
                      disabled={submitting}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                        frequency === opt.id
                          ? 'border-purple-500 bg-purple-50/80 shadow-xs'
                          : 'border-surface-200 hover:border-surface-300 bg-white'
                      )}
                    >
                      <p className="text-xs font-bold text-surface-900">{opt.label}</p>
                      <p className="text-[10px] text-surface-500 truncate">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. OPTIONAL PHOTO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera size={14} className="text-surface-500" /> Photo Evidence (Optional)
                </label>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-surface-200 w-fit">
                    <img
                      src={photoPreview}
                      alt="Hazard Preview"
                      className="w-48 h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 bg-surface-900/80 hover:bg-surface-900 text-white rounded-full transition-colors cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-surface-300 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer block transition-colors bg-surface-50/50">
                      <Camera size={22} className="mx-auto text-surface-400 mb-1" />
                      <span className="text-xs font-bold text-surface-700 block">
                        Upload broken light, pavement, or hazard photo
                      </span>
                      <span className="text-[10px] text-surface-400 block mt-0.5">
                        JPG, PNG, WEBP up to 10 MB. Never made public.
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {fileError && <p className="text-xs text-rose-600 font-semibold">{fileError}</p>}
              </div>

              {/* 8. PUBLIC PRIVACY GUARANTEE CALLOUT */}
              <div className="p-3.5 bg-brand-50/60 border border-brand-200 rounded-2xl flex items-start gap-3">
                <Shield size={16} className="text-brand-700 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-brand-900 leading-relaxed">
                  <span className="font-black">Campus Privacy Guarantee:</span> Your name, student ID, and exact coordinates will never be shown on the public map. Reports are clustered into approximate safety hotspots (~100m) to keep everyone safe while protecting reporter privacy.
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || description.trim().length < 10}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" /> Submitting...
                    </span>
                  ) : (
                    'Submit Safety Report'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
