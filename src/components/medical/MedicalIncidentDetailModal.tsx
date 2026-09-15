// ============================================================
// Campus Care — MedicalIncidentDetailModal Component
// ============================================================

import { useState } from 'react';
import {
  X, CheckCircle, ShieldAlert, Loader2, User,
  Phone, Navigation, ArrowRight, Cross
} from 'lucide-react';
import type { MedicalIncidentWithDetails } from '../../lib/services/medicalService';
import { medicalService } from '../../lib/services/medicalService';
import { useAuth } from '../../hooks/useAuth';
import { MapContainer } from '../MapContainer';
import { IncidentTimeline } from '../emergency/IncidentTimeline';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface MedicalIncidentDetailModalProps {
  item: MedicalIncidentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function MedicalIncidentDetailModal({
  item,
  isOpen,
  onClose,
  onStatusUpdated,
}: MedicalIncidentDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const { incident, medical, assignment } = item;
  const isPending = incident.status === 'pending';
  const isAssigned = incident.status === 'assigned';
  const isInProgress = incident.status === 'in_progress';
  const isResolved = incident.status === 'resolved';

  const handleAccept = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await medicalService.acceptMedicalEmergency({
        incident_id: incident.id,
        worker_id: user.id,
      });
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept medical emergency');
    } finally {
      setLoading(false);
    }
  };

  const handleStartResponse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicalService.updateStatus(incident.id, 'in_progress');
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
    setLoading(true);
    setError(null);
    try {
      const res = await medicalService.updateStatus(incident.id, 'resolved');
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resolve medical emergency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-detail-title"
    >
      <div
        className="absolute inset-0 bg-surface-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal animate-slide-up overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top green accent bar */}
        <div
          className={cn(
            'h-2',
            incident.priority === 'critical' ? 'bg-rose-600' : 'bg-safe-600'
          )}
        />

        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-safe-100 text-safe-600 flex items-center justify-center">
              <Cross size={20} />
            </div>
            <div>
              <h2 id="medical-detail-title" className="text-base font-bold text-surface-900">
                Medical Emergency Response
              </h2>
              <p className="text-xs text-surface-500">ID: {incident.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ambulance Alert Banner */}
          {medical?.needs_ambulance && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-base">🚑</span> Ambulance Support Requested by Caller
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] font-black uppercase">
                Priority
              </span>
            </div>
          )}

          {/* Severity & Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-[10px] font-semibold text-surface-400 block uppercase">Severity</span>
              <span className="text-xs font-bold capitalize text-surface-900">{incident.priority}</span>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-[10px] font-semibold text-surface-400 block uppercase">Status</span>
              <span className="text-xs font-bold capitalize text-safe-700">
                {incident.status.replace('_', ' ')}
              </span>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-[10px] font-semibold text-surface-400 block uppercase">Reported</span>
              <span className="text-xs font-medium text-surface-700">
                {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Medical Clinical Notes */}
          <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-2 text-xs">
            <h4 className="font-bold text-surface-800 uppercase tracking-wider text-[11px]">
              Reported Symptoms & Conditions
            </h4>
            <p className="text-surface-700 leading-relaxed">
              {medical?.symptoms || incident.description || 'General medical assistance required.'}
            </p>
            {medical?.injury_description && (
              <div className="pt-2 border-t border-surface-200/60">
                <span className="font-semibold text-surface-600 block">Injury Detail:</span>
                <p className="text-surface-700 mt-0.5">{medical.injury_description}</p>
              </div>
            )}
          </div>

          {/* Reporter Identity */}
          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-safe-100 text-safe-700 flex items-center justify-center font-bold">
                <User size={16} />
              </div>
              <div>
                <p className="font-bold text-surface-900 text-xs">
                  {incident.reporter?.full_name || 'Campus Student / User'}
                </p>
                <p className="text-[11px] text-surface-500">
                  {incident.reporter?.email || 'Campus Community Member'}
                </p>
              </div>
            </div>
            {incident.reporter?.phone && (
              <a
                href={`tel:${incident.reporter.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-safe-700 bg-safe-50 border border-safe-200 rounded-lg hover:bg-safe-100 transition-colors"
              >
                <Phone size={13} /> Call
              </a>
            )}
          </div>

          {/* Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-surface-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={13} className="text-safe-600" /> Patient Location
              </h4>
              <span className="text-xs text-surface-500">
                {incident.location_name || (incident.latitude ? 'GPS Available' : 'Location Unavailable')}
              </span>
            </div>
            <MapContainer height="h-44" />
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-bold text-surface-800 text-xs uppercase tracking-wider mb-2">
              Medical Response Timeline
            </h4>
            <IncidentTimeline incident={incident} assignment={assignment} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-50 border-t border-surface-200 flex items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {isPending && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAccept}
                disabled={loading}
                className="bg-safe-600 hover:bg-safe-700 text-white gap-1.5 font-bold"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Accept Emergency
              </Button>
            )}

            {isAssigned && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartResponse}
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 text-white gap-1.5 font-bold"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Start Response (On Route)
              </Button>
            )}

            {isInProgress && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleResolve}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Resolve Emergency
              </Button>
            )}

            {isResolved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={16} /> Medical Call Concluded
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
