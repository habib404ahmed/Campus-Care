// ============================================================
// Campus Care — FireIncidentDetailModal Component
// ============================================================

import { useState } from 'react';
import {
  X, CheckCircle, ShieldAlert, Loader2, User,
  Phone, Navigation, ArrowRight, Flame, AlertOctagon,
  Cloud
} from 'lucide-react';
import type { FireIncidentWithDetails } from '../../lib/services/fireService';
import { fireService } from '../../lib/services/fireService';
import { useAuth } from '../../hooks/useAuth';
import { MapContainer } from '../MapContainer';
import { IncidentTimeline } from '../emergency/IncidentTimeline';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface FireIncidentDetailModalProps {
  item: FireIncidentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function FireIncidentDetailModal({
  item,
  isOpen,
  onClose,
  onStatusUpdated,
}: FireIncidentDetailModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const { incident, fire, assignment } = item;
  const isPending = incident.status === 'pending';
  const isAssigned = incident.status === 'assigned';
  const isInProgress = incident.status === 'in_progress';
  const isResolved = incident.status === 'resolved';

  // Authorization check: Only fire workers and admins can perform responder actions
  const isFireWorker = profile?.role === 'worker' && profile?.worker_department === 'fire';
  const isAdmin = profile?.role === 'admin';
  const canRespond = isFireWorker || isAdmin;

  const handleAccept = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fireService.acceptFireEmergency(incident.id, user.id);
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept fire emergency');
    } finally {
      setLoading(false);
    }
  };

  const handleStartResponse = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fireService.startFireResponse(incident.id, user.id);
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update response status');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fireService.resolveFireEmergency(incident.id, user.id);
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resolve fire emergency');
    } finally {
      setLoading(false);
    }
  };

  const isCritical = incident.priority === 'critical' || fire.people_trapped === 'yes';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fire-detail-title"
    >
      <div
        className="absolute inset-0 bg-surface-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal animate-slide-up overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top accent bar */}
        <div
          className={cn(
            'h-2',
            isCritical ? 'bg-rose-600 animate-pulse' : 'bg-orange-500'
          )}
        />

        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold shadow-sm',
              isCritical ? 'bg-rose-600 shadow-rose-600/30' : 'bg-orange-600 shadow-orange-600/30'
            )}>
              <Flame size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="fire-detail-title" className="text-base font-extrabold text-surface-900">
                  🔥 Fire Emergency Incident
                </h2>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-black uppercase shadow-xs',
                  isCritical ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'
                )}>
                  {incident.priority.toUpperCase()} PRIORITY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-100 text-surface-700">
                  {incident.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-surface-400 mt-0.5 font-mono">
                ID: {incident.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!canRespond && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
              <span>
                Viewing as <strong>{profile?.role} ({profile?.worker_department || 'unassigned'})</strong>. Direct responder action buttons are restricted to authorized Fire Department personnel.
              </span>
            </div>
          )}

          {/* People Trapped Callout */}
          {fire.people_trapped === 'yes' && (
            <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-md flex items-center gap-3.5">
              <AlertOctagon size={28} className="flex-shrink-0 animate-bounce" />
              <div>
                <p className="font-extrabold text-sm tracking-wide">
                  CRITICAL: OCCUPANTS REPORTED TRAPPED
                </p>
                <p className="text-xs text-rose-100 mt-0.5">
                  Occupants may be unable to evacuate. High priority dispatch protocol active. Coordinate immediately with campus emergency team.
                </p>
              </div>
            </div>
          )}

          {/* Fire Triage Details Card */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3">
            <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={14} className="text-orange-600" /> Fire Hazard Assessment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <span className="text-surface-400 block text-[10px] uppercase font-bold">Fire Type</span>
                <span className="font-bold text-surface-900 capitalize flex items-center gap-1 mt-0.5">
                  {fire.fire_type}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <span className="text-surface-400 block text-[10px] uppercase font-bold">Smoke Visibility</span>
                <span className="font-bold text-surface-900 capitalize flex items-center gap-1 mt-0.5">
                  <Cloud size={13} className="text-slate-500" />
                  {fire.smoke_visible ? 'Smoke Visible' : 'No Smoke Visible'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <span className="text-surface-400 block text-[10px] uppercase font-bold">Trapped Occupants</span>
                <span className={cn(
                  'font-bold capitalize flex items-center gap-1 mt-0.5',
                  fire.people_trapped === 'yes' ? 'text-rose-600' : 'text-surface-900'
                )}>
                  <AlertOctagon size={13} />
                  {fire.people_trapped === 'yes' ? 'YES (Trapped)' : fire.people_trapped === 'no' ? 'None Reported' : 'Unknown'}
                </span>
              </div>
            </div>

            {fire.description && (
              <div className="p-3 bg-white rounded-xl border border-orange-100 text-xs">
                <span className="text-surface-400 block text-[10px] uppercase font-bold mb-0.5">Reported Description</span>
                <p className="text-surface-800">{fire.description}</p>
              </div>
            )}
          </div>

          {/* Reporter Information */}
          <div className="flex items-center justify-between p-3.5 bg-surface-50 rounded-2xl border border-surface-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center text-surface-600">
                <User size={16} />
              </div>
              <div>
                <p className="font-bold text-surface-900">
                  {incident.reporter?.full_name || 'Campus Member'}
                </p>
                <p className="text-[11px] text-surface-500 capitalize">
                  {incident.reporter?.role || 'Authorized Campus User'}
                </p>
              </div>
            </div>

            {incident.reporter?.phone && (
              <a
                href={`tel:${incident.reporter.phone}`}
                className="btn-secondary btn-sm gap-1 text-brand-700 font-bold hover:bg-brand-50"
              >
                <Phone size={13} /> Call Reporter
              </a>
            )}
          </div>

          {/* Location & Map Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1">
                <Navigation size={13} className="text-orange-600" /> Incident Location
              </h4>
              <span className="text-xs font-medium text-surface-600">
                {incident.location_name || (incident.latitude ? 'GPS Available' : 'Location Unavailable')}
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-surface-200">
              <MapContainer height="h-44" />
            </div>
          </div>

          {/* Live Incident Timeline */}
          <div>
            <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
              Live Fire Response Timeline
            </h4>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200">
              <IncidentTimeline incident={incident} assignment={assignment} />
            </div>
          </div>
        </div>

        {/* Action Footer: State Machine transitions */}
        {canRespond && !isResolved && (
          <div className="p-5 border-t border-surface-100 bg-surface-50 flex items-center justify-end gap-3">
            {isPending && (
              <Button
                variant="primary"
                onClick={handleAccept}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Flame size={16} />}
                <span>Accept Fire Emergency</span>
              </Button>
            )}

            {isAssigned && (
              <Button
                variant="primary"
                onClick={handleStartResponse}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                <span>Start Fire Response / En Route</span>
              </Button>
            )}

            {isInProgress && (
              <Button
                variant="primary"
                onClick={handleResolve}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                <span>Fire Suppressed & Resolved</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
