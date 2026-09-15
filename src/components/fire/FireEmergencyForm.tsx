// ============================================================
// Campus Care — FireEmergencyForm Component
// ============================================================

import { useNavigate } from 'react-router-dom';
import {
  X, CheckCircle, MapPin, Loader2, ExternalLink,
  Flame, ShieldAlert, AlertOctagon, Info
} from 'lucide-react';
import { useFireEmergency } from '../../hooks/useFireEmergency';
import { FireTypeSelector } from './FireTypeSelector';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface FireEmergencyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencySubmitted?: () => void;
}

export function FireEmergencyForm({
  isOpen,
  onClose,
  onEmergencySubmitted,
}: FireEmergencyFormProps) {
  const navigate = useNavigate();
  const {
    isSubmitting,
    isSuccess,
    hasActiveFire,
    activeIncident,
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
    submitFireEmergency,
  } = useFireEmergency();

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
      aria-labelledby="fire-form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-slide-up overflow-hidden border border-surface-100 max-h-[92vh] flex flex-col">
        {/* Top orange accent bar */}
        <div
          className={cn('h-2', isSuccess ? 'bg-emerald-500' : 'bg-orange-500')}
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Flame size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 id="fire-form-title" className="text-lg font-black text-surface-900 tracking-tight flex items-center gap-2">
                Report Fire Emergency
              </h2>
              <p className="text-xs text-surface-500">
                Direct alert to campus fire response and safety dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Close fire form"
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
                  🔥 Fire Emergency Dispatched
                </h3>
                <p className="text-surface-500 text-xs mt-1">
                  Campus fire responders have been alerted and dispatched to your location.
                </p>
              </div>

              <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Incident ID:</span>
                  <span className="font-mono font-bold text-surface-800">{createdIncident.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Priority Level:</span>
                  <span className={cn(
                    'font-bold uppercase px-2 py-0.5 rounded text-[10px]',
                    createdIncident.priority === 'critical'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-orange-100 text-orange-800'
                  )}>
                    {createdIncident.priority}
                  </span>
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
                  className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5"
                  onClick={handleNavigateToCenter}
                >
                  <span>View in Live Emergency Center</span>
                  <ExternalLink size={16} className="ml-1.5" />
                </Button>
              </div>
            </div>
          ) : hasActiveFire && !isSuccess ? (
            /* ── CASE 2: DUPLICATE ACTIVE FIRE REQUEST ──── */
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert size={28} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-surface-900">
                  Active Fire Emergency In Progress
                </h3>
                <p className="text-surface-500 text-xs mt-1">
                  You already have an active fire emergency registered with dispatch.
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

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5"
                  onClick={handleNavigateToCenter}
                >
                  <span>Go to Active Emergency Center</span>
                  <ExternalLink size={16} className="ml-1.5" />
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={handleClose}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ) : (
            /* ── CASE 3: STANDARD FIRE REPORT FORM ─────────── */
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await submitFireEmergency();
                if (ok) {
                  onEmergencySubmitted?.();
                }
              }}
              className="space-y-5"
            >
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Fire Type Selector */}
              <FireTypeSelector value={fireType} onChange={setFireType} disabled={isSubmitting} />

              {/* 2. Smoke Visible Selection */}
              <div>
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1.5">
                  Is Smoke Visible? <span className="text-emergency-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Smoke visibility options">
                  {[
                    { val: 'yes', label: 'Yes, Visible', emoji: '💨' },
                    { val: 'no', label: 'No Flames/Smoke', emoji: '🚫' },
                    { val: 'not_sure', label: 'Not Sure', emoji: '❓' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={smokeVisible === opt.val}
                      onClick={() => setSmokeVisible(opt.val as 'yes' | 'no' | 'not_sure')}
                      className={cn(
                        'py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        smokeVisible === opt.val
                          ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-xs'
                          : 'border-surface-200 hover:border-surface-300 bg-white text-surface-700'
                      )}
                    >
                      <span aria-hidden="true">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. People Trapped Safety Field */}
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={18} className="text-rose-600 flex-shrink-0" />
                  <label className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    Are People Trapped or Unable to Evacuate? <span className="text-emergency-600">*</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="People trapped options">
                  {[
                    { val: 'yes', label: 'Yes, Trapped', emoji: '⚠️', critical: true },
                    { val: 'no', label: 'No, Clear', emoji: '✅', critical: false },
                    { val: 'unknown', label: 'Unknown', emoji: '❓', critical: false },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      role="radio"
                      aria-checked={peopleTrapped === opt.val}
                      onClick={() => {
                        setPeopleTrapped(opt.val as any);
                        if (opt.val !== 'yes') setConfirmedTrapped(false);
                      }}
                      className={cn(
                        'py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1',
                        peopleTrapped === opt.val
                          ? opt.critical
                            ? 'border-rose-600 bg-rose-600 text-white font-bold shadow-xs'
                            : 'border-surface-800 bg-surface-900 text-white font-bold'
                          : 'border-rose-200 bg-white text-surface-700 hover:bg-rose-50'
                      )}
                    >
                      <span aria-hidden="true">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Critical confirmation banner if trapped = yes */}
                {peopleTrapped === 'yes' && (
                  <div className="p-3 bg-rose-600 text-white rounded-xl text-xs space-y-2 animate-fade-in shadow-sm">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertOctagon size={16} /> 🔴 CRITICAL EMERGENCY: LIVES IN DANGER
                    </p>
                    <p className="text-[11px] text-rose-100 leading-relaxed">
                      People are reported trapped. This alert will be immediately escalated to campus safety leadership and the highest priority fire dispatch queue.
                    </p>
                    <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmedTrapped}
                        onChange={(e) => setConfirmedTrapped(e.target.checked)}
                        className="w-4 h-4 rounded border-rose-300 text-rose-800 focus:ring-rose-400 cursor-pointer"
                      />
                      <span className="font-bold text-xs">
                        Confirm: Report Critical Fire Emergency
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* 4. Description */}
              <div>
                <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1">
                  Describe What You See <span className="text-surface-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Smoke coming from electrical room on 2nd floor of Science Hall..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-surface-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all placeholder:text-surface-400"
                />
              </div>

              {/* 5. Location status indicator */}
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className={locationState.latitude ? 'text-emerald-600' : 'text-amber-500'} />
                  <span className="font-medium text-surface-700">
                    {locationState.detecting
                      ? 'Acquiring GPS coordinates...'
                      : locationState.latitude
                      ? '📍 Location detected'
                      : '⚠️ Location unavailable (will report without GPS)'}
                  </span>
                </div>
                {locationState.latitude && (
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    GPS Ready
                  </span>
                )}
              </div>

              {/* 6. Campus Safety Briefing */}
              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex items-start gap-2 text-[11px] text-orange-950">
                <Info size={14} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Campus Safety Reminders:</p>
                  <p className="text-surface-600">
                    Move to a safe location if possible. Do not approach the fire. If you are in immediate danger, activate the SOS button.
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || (peopleTrapped === 'yes' && !confirmedTrapped)}
                  className={cn(
                    'w-full justify-center text-white font-bold py-3 text-sm shadow-md gap-2 cursor-pointer',
                    peopleTrapped === 'yes'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                      : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Transmitting Fire Emergency Alert...</span>
                    </>
                  ) : peopleTrapped === 'yes' ? (
                    <>
                      <AlertOctagon size={16} />
                      <span>🔥 Report Critical Fire Emergency</span>
                    </>
                  ) : (
                    <>
                      <Flame size={16} />
                      <span>🔥 Report Fire Emergency</span>
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
