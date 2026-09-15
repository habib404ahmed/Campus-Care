// ============================================================
// Campus Care — SecurityReportDetailModal Component
// ============================================================

import { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  Shield,
  EyeOff,
  Phone,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  FileText,
  Search,
} from 'lucide-react';
import type { SecurityReport, SecurityStatus } from '../../types/database';
import { SecurityPriorityBadge } from './SecurityPriorityBadge';
import { securityCategoryOptions } from './SecurityCategorySelector';
import { securityService } from '../../lib/services/securityService';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../lib/mockData';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface SecurityReportDetailModalProps {
  report: SecurityReport | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
  isWorkerOrAdmin?: boolean;
}

export function SecurityReportDetailModal({
  report,
  isOpen,
  onClose,
  onStatusUpdated,
  isWorkerOrAdmin = true,
}: SecurityReportDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);

  if (!isOpen || !report) return null;

  const categoryConfig = securityCategoryOptions.find((c) => c.id === report.category) || {
    label: report.category.replace('_', ' '),
    emoji: '🛡️',
  };

  const handleAction = async (nextStatus: SecurityStatus) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let res: { error: Error | null };

      if (nextStatus === 'assigned') {
        res = await securityService.acceptSecurityReport(report.id, user.id);
      } else if (nextStatus === 'investigating') {
        res = await securityService.startInvestigation(report.id, user.id);
      } else if (nextStatus === 'resolved') {
        res = await securityService.resolveSecurityReport(report.id, user.id, notes.trim() || undefined);
      } else if (nextStatus === 'closed') {
        res = await securityService.closeSecurityReport(report.id, user.id, notes.trim() || undefined);
      } else {
        res = await securityService.updateSecurityReport(report.id, nextStatus, notes.trim() || undefined);
      }

      if (res.error) {
        setError(res.error.message);
      } else {
        setShowNotesInput(false);
        setNotes('');
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // Build sequential timeline steps
  const steps: { key: SecurityStatus; label: string; done: boolean }[] = [
    { key: 'pending', label: 'Report Submitted', done: true },
    {
      key: 'assigned',
      label: 'Security Assigned',
      done: ['assigned', 'investigating', 'resolved', 'closed'].includes(report.status),
    },
    {
      key: 'investigating',
      label: 'Investigation Started',
      done: ['investigating', 'resolved', 'closed'].includes(report.status),
    },
    {
      key: 'resolved',
      label: 'Incident Resolved',
      done: ['resolved', 'closed'].includes(report.status),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-detail-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-surface-200/80 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shadow-xs flex-shrink-0">
              <span className="text-2xl" aria-hidden="true">{categoryConfig.emoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="security-detail-title" className="text-base font-extrabold text-surface-900 leading-tight">
                  {categoryConfig.label}
                </h2>
                <SecurityPriorityBadge priority={report.priority} />
                {report.immediate_danger && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={10} /> Danger
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                Report ID: <span className="font-mono font-bold text-surface-700">{report.id}</span> • {formatRelativeTime(report.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Immediate danger banner if flagged */}
          {report.immediate_danger && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
              <div>
                <strong className="font-extrabold text-rose-950">Immediate Danger Reported: </strong>
                <span>The reporter flagged an imminent safety hazard or personal threat.</span>
              </div>
            </div>
          )}

          {/* Investigation Timeline */}
          <div>
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">
              Status Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {steps.map((step, idx) => (
                <div
                  key={step.key}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all',
                    step.done
                      ? 'bg-safe-50/70 border-safe-300 text-safe-900'
                      : 'bg-surface-50 border-surface-200 text-surface-400 opacity-60'
                  )}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2
                      size={14}
                      className={step.done ? 'text-safe-600' : 'text-surface-300'}
                    />
                    <span className="text-[10px] font-mono font-bold">Step {idx + 1}</span>
                  </div>
                  <p className="text-xs font-extrabold leading-tight">{step.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-surface-50/80 rounded-2xl border border-surface-200/80">
            <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-brand-600" /> Incident Description
            </h3>
            <p className="text-xs text-surface-800 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location & Time */}
            <div className="p-4 bg-surface-50/50 rounded-2xl border border-surface-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs text-surface-700">
                <MapPin size={15} className="text-brand-600 flex-shrink-0" />
                <span className="font-bold">Location:</span>
                <span className="truncate">{report.location_name || 'Campus Grounds'}</span>
              </div>
              {report.latitude && report.longitude && (
                <div className="text-[11px] text-surface-500 pl-6 font-mono">
                  Coordinates: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-surface-700 pt-1 border-t border-surface-100">
                <Clock size={15} className="text-brand-600 flex-shrink-0" />
                <span className="font-bold">Occurred:</span>
                <span className="capitalize">{report.incident_time?.replace('_', ' ') || 'Recent'}</span>
              </div>
            </div>

            {/* Reporter Information & Privacy Shield */}
            <div className="p-4 bg-surface-50/50 rounded-2xl border border-surface-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {report.anonymous_report ? (
                  <>
                    <EyeOff size={15} className="text-slate-600 flex-shrink-0" />
                    <span className="font-bold text-surface-700">Reporter:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-800">
                      Anonymous Reporter
                    </span>
                  </>
                ) : (
                  <>
                    <User size={15} className="text-brand-600 flex-shrink-0" />
                    <span className="font-bold text-surface-700">Reporter:</span>
                    <span className="font-semibold text-surface-900 truncate">
                      {report.reporter?.full_name || 'Campus Member'}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-surface-600 pt-1 border-t border-surface-100">
                <Phone size={14} className="text-surface-400 flex-shrink-0" />
                <span>Contact Permission: </span>
                <strong className={report.contact_allowed ? 'text-safe-700' : 'text-surface-500'}>
                  {report.contact_allowed ? 'Allowed (Security may contact)' : 'Declined'}
                </strong>
              </div>

              {!report.anonymous_report && report.contact_allowed && report.reporter?.phone && (
                <div className="pl-5 text-xs text-brand-700 font-bold">
                  <a href={`tel:${report.reporter.phone}`} className="hover:underline">
                    📞 {report.reporter.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Preview if uploaded */}
          {report.evidence_url && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} className="text-brand-600" /> Attached Photo Evidence
              </h3>
              <div className="rounded-2xl overflow-hidden border border-surface-200 max-w-sm">
                <img
                  src={report.evidence_url}
                  alt="Incident evidence"
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          )}

          {/* Resolution notes (if present or when resolving) */}
          {report.notes && (
            <div className="p-3.5 bg-brand-50/60 border border-brand-200 rounded-2xl text-xs text-brand-950">
              <strong className="block font-bold mb-1">Investigation Notes:</strong>
              <p className="whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}

          {showNotesInput && (
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-2 animate-fade-in">
              <label htmlFor="res-notes" className="text-xs font-bold text-surface-800 block">
                Add Resolution / Investigation Findings:
              </label>
              <textarea
                id="res-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details on actions taken, suspects identified, or property recovered..."
                className="input-field w-full text-xs"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer / Worker Action Controls */}
        <div className="px-6 py-4 bg-surface-50/80 border-t border-surface-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-surface-500">
            Current Status:{' '}
            <span className="font-extrabold text-surface-900 capitalize">
              {report.status.replace('_', ' ')}
            </span>
          </div>

          {isWorkerOrAdmin && (
            <div className="flex items-center gap-2">
              {report.status === 'pending' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction('assigned')}
                  disabled={loading}
                  className="text-xs font-bold shadow-xs gap-1"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                  Accept Report
                </Button>
              )}

              {report.status === 'assigned' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction('investigating')}
                  disabled={loading}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 shadow-xs gap-1"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  Start Investigation
                </Button>
              )}

              {report.status === 'investigating' && (
                <>
                  {!showNotesInput ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowNotesInput(true)}
                      className="text-xs font-bold bg-safe-600 hover:bg-safe-700 shadow-xs gap-1"
                    >
                      <CheckCircle2 size={13} />
                      Resolve Report...
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction('resolved')}
                      disabled={loading}
                      className="text-xs font-bold bg-safe-600 hover:bg-safe-700 shadow-xs gap-1"
                    >
                      {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Confirm Resolution
                    </Button>
                  )}
                </>
              )}

              {report.status === 'resolved' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction('closed')}
                  disabled={loading}
                  className="text-xs font-bold gap-1"
                >
                  Close Archive
                </Button>
              )}

              <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
