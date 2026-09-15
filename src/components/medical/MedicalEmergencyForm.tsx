// ============================================================
// Campus Care — MedicalEmergencyForm Component
// ============================================================

import { useNavigate } from 'react-router-dom';
import {
  X, CheckCircle, MapPin, Loader2,
  ExternalLink, Cross, ShieldAlert
} from 'lucide-react';
import { useMedicalEmergency } from '../../hooks/useMedicalEmergency';
import { MedicalSeveritySelector } from './MedicalSeveritySelector';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface MedicalEmergencyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencySubmitted?: () => void;
}

export function MedicalEmergencyForm({ isOpen, onClose, onEmergencySubmitted }: MedicalEmergencyFormProps) {
  const navigate = useNavigate();
  const {
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
    setSymptoms,
    setInjuryDescription,
    setSeverity,
    setAmbulanceChoice,
    resetForm,
    submitMedicalEmergency,
  } = useMedicalEmergency();

  if (!isOpen) return null;

  const handleNavigateToCenter = () => {
    onClose();
    resetForm();
    navigate('/emergency');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-slide-up overflow-hidden border border-surface-100 max-h-[92vh] flex flex-col">
        {/* Top green accent bar */}
        <div
          className={cn(
            'h-2',
            isSuccess ? 'bg-emerald-500' : 'bg-safe-600'
          )}
          aria-hidden="true"
        />

        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-safe-100 text-safe-600 flex items-center justify-center">
              <Cross size={20} />
            </div>
            <div>
              <h2 id="medical-form-title" className="text-base font-bold text-surface-900">
                Medical Emergency Request
              </h2>
              <p className="text-xs text-surface-500">
                Campus Health & Urgent Care Response
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* ── CASE 1: SUCCESS STATE ────────────────────────── */}
          {isSuccess && createdIncident ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-scale-in">
                <CheckCircle size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-surface-900">
                  🩺 Medical Assistance Dispatched
                </h3>
                <p className="text-surface-500 text-xs mt-1">
                  The campus medical response team has been alerted with your request.
                </p>
              </div>

              <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Incident ID:</span>
                  <span className="font-mono font-bold text-surface-800">{createdIncident.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Assigned Severity:</span>
                  <span className="font-bold text-emerald-700 uppercase">{createdIncident.priority}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Location Status:</span>
                  <span className="font-medium text-surface-700">
                    {createdIncident.latitude ? '📍 GPS Location Transmitted' : '📍 Location Unavailable (Sent)'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5"
                  onClick={handleNavigateToCenter}
                >
                  <span>View in Live Emergency Center</span>
                  <ExternalLink size={16} className="ml-1.5" />
                </Button>
              </div>
            </div>
          ) : hasActiveMedical && !isSuccess ? (
            /* ── CASE 2: DUPLICATE ACTIVE MEDICAL REQUEST ──── */
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert size={28} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-surface-900">
                  Active Medical Request In Progress
                </h3>
                <p className="text-surface-500 text-xs mt-1">
                  You already have an active medical emergency registered with the clinic.
                </p>
              </div>

              {activeIncident && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Status:</span>
                    <span className="font-bold text-amber-800 capitalize">
                      {activeIncident.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Reported:</span>
                    <span className="text-surface-700">
                      {new Date(activeIncident.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button variant="secondary" className="flex-1 justify-center" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 justify-center bg-safe-600 hover:bg-safe-700 text-white"
                  onClick={handleNavigateToCenter}
                >
                  View Emergency
                </Button>
              </div>
            </div>
          ) : (
            /* ── CASE 3: STANDARD MEDICAL FORM ─────────────── */
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await submitMedicalEmergency();
                onEmergencySubmitted?.();
              }}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Severity Selection */}
              <MedicalSeveritySelector value={severity} onChange={setSeverity} disabled={isSubmitting} />

              {/* Symptoms input */}
              <div>
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1">
                  What is happening? (Symptoms)
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms: e.g. severe headache, dizziness, sharp chest tightness..."
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-safe-500/20 focus:border-safe-500"
                />
              </div>

              {/* Injury Description input */}
              <div>
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1">
                  Injury Description (Optional)
                </label>
                <input
                  type="text"
                  value={injuryDescription}
                  onChange={(e) => setInjuryDescription(e.target.value)}
                  placeholder="e.g. Person has fallen down stairs and injured left ankle"
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-safe-500/20 focus:border-safe-500"
                />
              </div>

              {/* Ambulance Option */}
              <div>
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1.5">
                  Is an ambulance required?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'yes', label: '🚑 Yes' },
                    { id: 'not_sure', label: '❓ Not Sure' },
                    { id: 'no', label: '🏥 No (Clinic Walk-in)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAmbulanceChoice(opt.id as 'yes' | 'no' | 'not_sure')}
                      className={cn(
                        'py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center',
                        ambulanceChoice === opt.id
                          ? 'bg-safe-600 text-white border-safe-600 shadow-xs'
                          : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Status Indicator */}
              <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-surface-500 flex items-center gap-1.5 font-medium">
                  <MapPin size={14} /> Location Status:
                </span>
                <span className="font-semibold text-surface-700">
                  {locationState.detecting ? (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Loader2 size={12} className="animate-spin" /> Detecting...
                    </span>
                  ) : locationState.latitude != null ? (
                    <span className="text-emerald-700">📍 GPS Coordinates Ready</span>
                  ) : (
                    <span className="text-slate-500">Location unavailable (Will send anyway)</span>
                  )}
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full justify-center bg-safe-600 hover:bg-safe-700 text-white font-bold py-3 text-sm shadow-md shadow-safe-600/30 gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Transmitting Medical Alert...</span>
                    </>
                  ) : (
                    <>
                      <Cross size={16} />
                      <span>🩺 Request Medical Help</span>
                    </>
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
