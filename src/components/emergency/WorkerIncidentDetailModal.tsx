// ============================================================
// Campus Care — WorkerIncidentDetailModal Component
// ============================================================

import { useState } from 'react';
import {
  AlertTriangle, X, CheckCircle, ShieldAlert,
  Loader2, User, Phone, Navigation, ArrowRight
} from 'lucide-react';
import type { EmergencyIncident, IncidentAssignment } from '../../types/database';
import { emergencyService } from '../../lib/services/emergencyService';
import { useAuth } from '../../hooks/useAuth';
import { MapContainer } from '../MapContainer';
import { IncidentTimeline } from './IncidentTimeline';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface WorkerIncidentDetailModalProps {
  incident: EmergencyIncident | null;
  assignment?: IncidentAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function WorkerIncidentDetailModal({
  incident,
  assignment,
  isOpen,
  onClose,
  onStatusUpdated,
}: WorkerIncidentDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const isPending = incident.status === 'pending';
  const isAssigned = incident.status === 'assigned';
  const isInProgress = incident.status === 'in_progress';
  const isResolved = incident.status === 'resolved';

  const handleAccept = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await emergencyService.acceptIncident({
        incident_id: incident.id,
        worker_id: user.id,
      });
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept incident');
    } finally {
      setLoading(false);
    }
  };

  const handleStartResponse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await emergencyService.updateStatus(incident.id, 'in_progress');
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update response state');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await emergencyService.updateStatus(incident.id, 'resolved');
      if (res.error) {
        setError(res.error.message);
      } else {
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resolve incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="worker-incident-title"
    >
      <div
        className="absolute inset-0 bg-surface-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-modal animate-slide-up overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div
          className={cn(
            'h-2',
            incident.priority === 'critical' ? 'bg-emergency-600' : 'bg-warning-500'
          )}
        />

        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emergency-100 flex items-center justify-center text-emergency-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 id="worker-incident-title" className="text-base font-bold text-surface-900">
                {incident.incident_type === 'sos' ? '🚨 SOS EMERGENCY DISPATCH' : 'EMERGENCY INCIDENT'}
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

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-[11px] font-semibold text-surface-400 block uppercase">Priority</span>
              <span className="text-xs font-black uppercase text-emergency-600">
                {incident.priority}
              </span>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-[11px] font-semibold text-surface-400 block uppercase">Status</span>
              <span className="text-xs font-bold capitalize text-surface-800">
                {incident.status.replace('_', ' ')}
              </span>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-[11px] font-semibold text-surface-400 block uppercase">Reported</span>
              <span className="text-xs font-medium text-surface-700">
                {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Reporter Profile */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <User size={18} />
              </div>
              <div>
                <p className="font-bold text-surface-900 text-sm">
                  {incident.reporter?.full_name || 'Campus Student / User'}
                </p>
                <p className="text-xs text-surface-500">
                  {incident.reporter?.email || 'Registered Campus Community Member'}
                </p>
              </div>
            </div>
            {incident.reporter?.phone && (
              <a
                href={`tel:${incident.reporter.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
              >
                <Phone size={14} /> Call
              </a>
            )}
          </div>

          {/* Location & Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-surface-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={14} className="text-brand-600" /> Incident Location
              </h3>
              <span className="text-xs text-surface-500">
                {incident.location_name || (incident.latitude ? 'GPS Available' : 'Location Unavailable')}
              </span>
            </div>
            <MapContainer height="h-44" />
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-surface-800 text-xs uppercase tracking-wider mb-3">
              Incident Response Timeline
            </h3>
            <IncidentTimeline incident={incident} assignment={assignment} />
          </div>
        </div>

        {/* Footer Actions (State Machine) */}
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
                className="bg-emergency-600 hover:bg-emergency-700 text-white gap-1.5"
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
                className="bg-brand-600 hover:bg-brand-700 text-white gap-1.5"
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Resolve Emergency
              </Button>
            )}

            {isResolved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={16} /> Incident Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
