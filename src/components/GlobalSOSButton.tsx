// ============================================================
// Campus Care — GlobalSOSButton Component
// ============================================================

import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, X, CheckCircle, MapPin, Loader2,
  ExternalLink, User, RefreshCw
} from 'lucide-react';
import { useSOS } from '../hooks/useSOS';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface GlobalSOSButtonProps {
  className?: string;
  variant?: 'fab' | 'inline';
}

export function GlobalSOSButton({ className, variant = 'fab' }: GlobalSOSButtonProps) {
  const navigate = useNavigate();
  const {
    isModalOpen,
    isActivating,
    isSuccess,
    hasActiveEmergency,
    existingIncident,
    createdIncident,
    locationState,
    error,
    profile,
    openModal,
    closeModal,
    activateSOS,
    resetSOS,
  } = useSOS();

  const handleNavigateToEmergency = () => {
    closeModal();
    resetSOS();
    navigate('/emergency');
  };

  return (
    <>
      {/* ── Trigger Button (FAB or Inline) ───────────────────── */}
      {variant === 'fab' ? (
        <button
          type="button"
          onClick={openModal}
          aria-label="Activate Emergency SOS"
          id="global-sos-fab"
          className={cn(
            'fixed bottom-24 right-4 z-40',
            'lg:bottom-8 lg:right-8',
            'w-16 h-16 rounded-full',
            'bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 text-white',
            'flex flex-col items-center justify-center gap-0.5',
            'shadow-2xl shadow-rose-600/50 ring-4 ring-rose-500/25',
            'hover:scale-105 hover:shadow-rose-600/70 active:scale-95 transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400',
            'animate-sos-pulse cursor-pointer group',
            className
          )}
        >
          <AlertTriangle size={22} className="transition-transform group-hover:scale-110" aria-hidden="true" />
          <span className="text-[10px] font-black tracking-widest leading-none">SOS</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          aria-label="Activate Emergency SOS"
          id="inline-sos-btn"
          className={cn(
            'btn-danger btn-md gap-2 shadow-lg shadow-rose-600/35 animate-sos-pulse cursor-pointer hover:scale-[1.02] active:scale-95',
            className
          )}
        >
          <AlertTriangle size={18} aria-hidden="true" />
          <span className="font-black tracking-wide">🚨 ACTIVATE SOS</span>
        </button>
      )}

      {/* ── Confirmation / Active Emergency / Success Modal ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-slide-up overflow-hidden border border-surface-100">
            {/* Top red alert bar */}
            <div
              className={cn(
                'h-2',
                isSuccess ? 'bg-emerald-500' : 'bg-emergency-600'
              )}
              aria-hidden="true"
            />

            <div className="p-6 sm:p-7">
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                disabled={isActivating}
                className="absolute top-5 right-5 p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* ── CASE 1: SUCCESS STATE ────────────────────────── */}
              {isSuccess && createdIncident ? (
                <div className="text-center space-y-4 py-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 animate-scale-in">
                    <CheckCircle size={32} />
                  </div>

                  <div>
                    <h2 id="sos-modal-title" className="text-2xl font-black text-surface-900 tracking-tight">
                      🚨 Emergency Alert Sent
                    </h2>
                    <p className="text-surface-500 text-xs mt-1 font-medium">
                      Campus response and emergency dispatch has been notified.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-surface-400">Incident ID:</span>
                      <span className="font-mono font-bold text-surface-800">{createdIncident.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-400">Status:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending Response
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-surface-400">Location Status:</span>
                      <span className="font-medium text-surface-700">
                        {createdIncident.latitude
                          ? '📍 GPS Location Transmitted'
                          : '📍 Location Unavailable (Sent)'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5"
                      onClick={handleNavigateToEmergency}
                    >
                      <span>View Emergency in Live Center</span>
                      <ExternalLink size={16} className="ml-1.5" />
                    </Button>
                  </div>
                </div>
              ) : hasActiveEmergency && !isSuccess ? (
                /* ── CASE 2: DUPLICATE ACTIVE EMERGENCY WARNING ──── */
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                    <AlertTriangle size={28} />
                  </div>

                  <div>
                    <h2 id="sos-modal-title" className="text-xl font-bold text-surface-900">
                      Active Emergency In Progress
                    </h2>
                    <p className="text-surface-500 text-xs mt-1">
                      You already have an active emergency alert being handled by campus response.
                    </p>
                  </div>

                  {existingIncident && (
                    <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-left space-y-1">
                      <div className="flex justify-between">
                        <span className="text-surface-500">Status:</span>
                        <span className="font-bold text-amber-800 capitalize">
                          {existingIncident.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-500">Reported:</span>
                        <span className="text-surface-700">
                          {new Date(existingIncident.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2.5">
                    <Button
                      variant="secondary"
                      className="flex-1 justify-center"
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 justify-center bg-brand-600 hover:bg-brand-700 text-white"
                      onClick={handleNavigateToEmergency}
                    >
                      View Emergency
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── CASE 3: STANDARD SOS CONFIRMATION MODAL ──────── */
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emergency-100 text-emergency-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h2 id="sos-modal-title" className="text-lg font-bold text-surface-900">
                        Activate Emergency SOS?
                      </h2>
                      <p className="text-xs text-emergency-600 font-semibold">
                        Immediate priority dispatch
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-surface-600 leading-relaxed">
                    This will immediately create a critical emergency alert for the campus response team.
                  </p>

                  {/* Caller Identity Card */}
                  <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-500 flex items-center gap-1.5">
                        <User size={14} /> Current User:
                      </span>
                      <span className="font-bold text-surface-800">
                        {profile?.full_name || 'Authenticated User'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-500">Account Role:</span>
                      <span className="font-bold text-brand-600 uppercase tracking-wide">
                        {profile?.role || 'STUDENT'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-surface-200/60">
                      <span className="text-surface-500 flex items-center gap-1.5">
                        <MapPin size={14} /> Geolocation:
                      </span>
                      <span className="font-medium text-surface-700">
                        {locationState.detecting ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Loader2 size={12} className="animate-spin" /> Detecting location...
                          </span>
                        ) : locationState.latitude != null ? (
                          <span className="text-emerald-700 font-semibold">
                            📍 Coordinates detected
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Location unavailable (Will send anyway)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
                      <span>{error}</span>
                      <button
                        type="button"
                        onClick={activateSOS}
                        className="text-xs font-bold text-rose-800 flex items-center gap-1 underline hover:no-underline ml-2"
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={closeModal}
                      disabled={isActivating}
                      className="flex-1 justify-center py-2.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={activateSOS}
                      disabled={isActivating}
                      aria-busy={isActivating}
                      className="flex-1 justify-center py-2.5 gap-2 font-bold shadow-md shadow-emergency-600/30"
                    >
                      {isActivating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending emergency alert...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} />
                          <span>Activate SOS</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
