// ============================================================
// Campus Care — SecurityReportForm Component
// ============================================================

import { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  EyeOff,
  PhoneCall,
  Loader2,
  CheckCircle2,
  X,
  XCircle,
} from 'lucide-react';
import { useSecurityReport } from '../../hooks/useSecurityReport';
import { SecurityCategorySelector } from './SecurityCategorySelector';
import { Button } from '../ui/Button';
import type { IncidentTimeOption } from '../../types/database';
import { cn } from '../../lib/utils';

interface SecurityReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onActivateSOS?: () => void;
}

const timeOptions: { id: IncidentTimeOption; label: string; desc: string }[] = [
  { id: 'just_now', label: 'Just now', desc: 'Within past 15 minutes' },
  { id: 'last_hour', label: 'Within past hour', desc: 'Between 15-60 min ago' },
  { id: 'today', label: 'Earlier today', desc: 'Sometime earlier today' },
  { id: 'yesterday', label: 'Yesterday', desc: 'Past 24-48 hours' },
  { id: 'earlier', label: 'Earlier this week', desc: 'More than 2 days ago' },
  { id: 'custom', label: 'Specific time', desc: 'Enter custom date/time' },
];

export function SecurityReportForm({
  isOpen,
  onClose,
  onSuccess,
  onActivateSOS,
}: SecurityReportFormProps) {
  const {
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
    anonymousReport,
    setAnonymousReport,
    contactAllowed,
    setContactAllowed,
    setEvidenceFile,
    submitting,
    error,
    success,
    referenceId,
    locationLoading,
    detectLocation,
    submitReport,
    resetForm,
  } = useSecurityReport(onSuccess);

  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Supported image formats: JPG, PNG, WEBP');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10 MB limit');
      return;
    }

    setEvidenceFile(file);
    const previewUrl = URL.createObjectURL(file);
    setEvidencePreview(previewUrl);
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null);
    if (evidencePreview) {
      URL.revokeObjectURL(evidencePreview);
      setEvidencePreview(null);
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
      aria-labelledby="security-report-modal-title"
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
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shadow-xs">
              <span className="text-xl" aria-hidden="true">🛡️</span>
            </div>
            <div>
              <h2 id="security-report-modal-title" className="text-base font-extrabold text-surface-900 leading-tight">
                Campus Security Report
              </h2>
              <p className="text-xs text-surface-500">
                Log non-emergency safety concerns, theft, vandalism, or suspicious activity.
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
            /* ── SUCCESS RECEIPT ──────────────────────────────────── */
            <div className="text-center py-6 px-4 animate-fade-in space-y-4">
              <div className="w-16 h-16 rounded-full bg-safe-100 text-safe-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200 inline-block mb-2">
                  Reference: #{referenceId || 'CC-SEC-CONFIRMED'}
                </span>
                <h3 className="text-xl font-black text-surface-900">Security Report Submitted</h3>
                <p className="text-sm text-surface-600 mt-1 max-w-md mx-auto">
                  Campus Security Dispatch has received your report. An officer will review the details and initiate an inquiry.
                </p>
              </div>

              {anonymousReport && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 max-w-md mx-auto flex items-center gap-2 text-left">
                  <EyeOff size={18} className="text-slate-500 flex-shrink-0" />
                  <span>Your identity is strictly hidden from standard security worker incident views.</span>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. IMMEDIATE DANGER ASSESSMENT */}
              <div className={cn(
                'p-4 rounded-2xl border transition-all duration-200',
                immediateDanger
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-surface-50/80 border-surface-200/80'
              )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className={immediateDanger ? 'text-rose-600' : 'text-amber-500'} />
                    <span className="text-xs font-black uppercase tracking-wider text-surface-900">
                      Are you currently in immediate danger?
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImmediateDanger(true)}
                      className={cn(
                        'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        immediateDanger
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-surface-700 border border-surface-200 hover:bg-surface-100'
                      )}
                    >
                      Yes (Danger)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImmediateDanger(false)}
                      className={cn(
                        'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        !immediateDanger
                          ? 'bg-surface-900 text-white shadow-xs'
                          : 'bg-white text-surface-700 border border-surface-200 hover:bg-surface-100'
                      )}
                    >
                      No (Routine)
                    </button>
                  </div>
                </div>

                {immediateDanger && (
                  <div className="mt-3 p-3.5 bg-rose-100/70 border border-rose-200 rounded-xl text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div>
                      <p className="font-extrabold text-sm mb-0.5">⚠️ Your safety comes first.</p>
                      <p className="text-xs text-rose-900 leading-relaxed">
                        If you or someone nearby is in immediate physical peril, activate SOS now for instantaneous campus police dispatch.
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
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex-shrink-0 gap-1.5"
                      >
                        🚨 Activate SOS
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. CATEGORY SELECTOR */}
              <SecurityCategorySelector value={category} onChange={setCategory} disabled={submitting} />

              {/* 3. DESCRIPTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="sec-desc" className="text-xs font-bold text-surface-800 uppercase tracking-wider block">
                    Tell us what happened <span className="text-emergency-500">*</span>
                  </label>
                  <span className={cn('text-[11px]', description.length < 10 ? 'text-amber-600 font-semibold' : 'text-surface-400')}>
                    {description.length} characters (min 10)
                  </span>
                </div>
                <textarea
                  id="sec-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  placeholder="Someone entered the laboratory after hours and damaged equipment..."
                  className="input-field w-full text-xs leading-relaxed resize-y min-h-[80px]"
                  required
                />
              </div>

              {/* 4. WHEN DID IT HAPPEN */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-brand-600" /> When did this happen?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIncidentTime(opt.id)}
                      disabled={submitting}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                        incidentTime === opt.id
                          ? 'border-brand-500 bg-brand-50/70 shadow-xs'
                          : 'border-surface-200 hover:border-surface-300 bg-white'
                      )}
                    >
                      <p className="text-xs font-bold text-surface-900">{opt.label}</p>
                      <p className="text-[10px] text-surface-500 truncate">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {incidentTime === 'custom' && (
                  <input
                    type="text"
                    value={customIncidentTime}
                    onChange={(e) => setCustomIncidentTime(e.target.value)}
                    placeholder="e.g. Tuesday around 4:30 PM near Science Hall"
                    className="input-field w-full text-xs mt-2"
                  />
                )}
              </div>

              {/* 5. LOCATION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="sec-loc" className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-600" /> Incident Location
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locationLoading || submitting}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                  >
                    {locationLoading ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                    {latitude ? 'GPS Detected ✓' : 'Detect GPS'}
                  </button>
                </div>
                <input
                  id="sec-loc"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., Central Library 2nd floor, Student Union north exit..."
                  className="input-field w-full text-xs"
                />
                <p className="text-[11px] text-surface-400">
                  Exact coordinates are protected and only visible to authorized security staff and administrators.
                </p>
              </div>

              {/* 6. EVIDENCE / PHOTO (OPTIONAL) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera size={14} className="text-brand-600" /> Optional Photo / Evidence
                </label>

                {evidencePreview ? (
                  <div className="relative inline-block border border-surface-200 rounded-2xl overflow-hidden shadow-xs group">
                    <img
                      src={evidencePreview}
                      alt="Uploaded evidence preview"
                      className="w-44 h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-surface-900/80 hover:bg-surface-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm"
                      aria-label="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-surface-300 hover:border-brand-400 rounded-2xl p-4 text-center cursor-pointer block transition-colors bg-surface-50/50">
                      <Camera size={22} className="mx-auto text-surface-400 mb-1" />
                      <span className="text-xs font-bold text-surface-700 block">
                        Upload damage photo or suspicious object (Optional)
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

              {/* 7. ANONYMOUS REPORTING TOGGLE */}
              <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={anonymousReport}
                  onChange={(e) => setAnonymousReport(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="anonymous-toggle" className="text-xs font-extrabold text-surface-900 flex items-center gap-1.5 cursor-pointer">
                    <EyeOff size={14} className="text-surface-600" /> Submit anonymously
                  </label>
                  <p className="text-[11px] text-surface-500 leading-relaxed mt-0.5">
                    Your identity will be hidden from standard report views. Campus administrators may retain audit information according to campus policy.
                  </p>
                </div>
              </div>

              {/* 8. CONTACT PERMISSION */}
              <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <PhoneCall size={16} className="text-brand-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-surface-900">May Security contact you?</p>
                    <p className="text-[11px] text-surface-500 truncate">For follow-up questions during investigation</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setContactAllowed(true)}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      contactAllowed ? 'bg-surface-900 text-white' : 'bg-white text-surface-600 border border-surface-200'
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactAllowed(false)}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      !contactAllowed ? 'bg-surface-900 text-white' : 'bg-white text-surface-600 border border-surface-200'
                    )}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Error Callout */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <XCircle size={16} className="text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={submitting}
                  className="text-xs px-4 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || description.trim().length < 10}
                  className="text-xs px-6 py-2.5 font-bold shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Submitting Report...
                    </>
                  ) : (
                    'Submit Security Report'
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
