// ============================================================
// Campus Care — UnsafeLocationDetailModal Component
// ============================================================

import { useState } from 'react';
import {
  X,
  Clock,
  Repeat,
  Shield,
  Loader2,
  FileText,
} from 'lucide-react';
import type { UnsafeLocationReport } from '../../types/database';
import { safetyConcernOptions } from './SafetyConcernSelector';
import { safetyService } from '../../lib/services/safetyService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface UnsafeLocationDetailModalProps {
  report: UnsafeLocationReport | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
  isAuthorizedStaff?: boolean;
}

export function UnsafeLocationDetailModal({
  report,
  isOpen,
  onClose,
  onStatusUpdated,
  isAuthorizedStaff = false,
}: UnsafeLocationDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !report) return null;

  const concernMeta = safetyConcernOptions.find((o) => o.id === report.concern_type) || {
    label: report.concern_type.replace(/_/g, ' '),
    emoji: '⚠️',
    color: 'text-surface-800',
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case 'resolved':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' };
      case 'action_planned':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Action Planned' };
      case 'acknowledged':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Acknowledged' };
      case 'reviewing':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Under Review' };
      case 'closed':
        return { bg: 'bg-surface-100 text-surface-600 border-surface-200', label: 'Closed' };
      case 'reported':
      default:
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Reported' };
    }
  };

  const statusBadge = getStatusBadge();

  const handleStatusChange = async (action: 'review' | 'acknowledge' | 'plan' | 'resolve' | 'close') => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let res: { error: Error | null };
      if (action === 'review') {
        res = await safetyService.reviewSafetyReport(report.id, user.id);
      } else if (action === 'acknowledge') {
        res = await safetyService.acknowledgeSafetyReport(report.id, user.id);
      } else if (action === 'plan') {
        res = await safetyService.planActionSafetyReport(report.id, user.id, notes.trim() || undefined);
      } else if (action === 'resolve') {
        res = await safetyService.resolveSafetyReport(report.id, user.id, notes.trim() || undefined);
      } else {
        res = await safetyService.closeSafetyReport(report.id, user.id, notes.trim() || undefined);
      }

      if (res.error) {
        setError(res.error.message);
      } else {
        setNotes('');
        if (onStatusUpdated) onStatusUpdated();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(report.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsafe-modal-detail-title"
    >
      <div
        className="fixed inset-0 bg-surface-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl border border-surface-200/80 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
              <span className="text-xl" aria-hidden="true">
                {concernMeta.emoji}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {report.reference_id}
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border',
                    statusBadge.bg
                  )}
                >
                  {statusBadge.label}
                </span>
              </div>
              <h3 id="unsafe-modal-detail-title" className="text-base font-extrabold text-surface-900 leading-tight mt-1">
                {report.location_name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-xs">
            <div>
              <p className="text-surface-400 text-[10px] font-bold uppercase">Safety Concern</p>
              <p className="font-bold text-surface-800 capitalize mt-0.5">{concernMeta.label}</p>
            </div>
            <div>
              <p className="text-surface-400 text-[10px] font-bold uppercase">When Unsafe</p>
              <p className="font-bold text-surface-800 capitalize mt-0.5 flex items-center gap-1">
                <Clock size={11} className="text-brand-600" />
                {report.unsafe_time.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-surface-400 text-[10px] font-bold uppercase">Frequency</p>
              <p className="font-bold text-surface-800 capitalize mt-0.5 flex items-center gap-1">
                <Repeat size={11} className="text-purple-600" />
                {report.frequency.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-surface-400 text-[10px] font-bold uppercase">Severity</p>
              <span className="font-bold text-surface-800 capitalize mt-0.5 block">
                {report.severity}
              </span>
            </div>
            <div className="sm:col-span-2">
              <p className="text-surface-400 text-[10px] font-bold uppercase">Reported On</p>
              <p className="font-semibold text-surface-700 mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-surface-700">
              Hazard Description
            </h4>
            <div className="p-3.5 bg-white border border-surface-200 rounded-2xl text-xs text-surface-800 leading-relaxed">
              {report.description}
            </div>
          </div>

          {/* Operational Notes if any */}
          {report.notes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-700 flex items-center gap-1">
                <FileText size={13} /> Maintenance & Security Notes
              </h4>
              <div className="p-3.5 bg-brand-50/50 border border-brand-200 rounded-2xl text-xs text-brand-900 leading-relaxed">
                {report.notes}
              </div>
            </div>
          )}

          {/* Authorized staff action controls */}
          {isAuthorizedStaff && (
            <div className="space-y-3 pt-2 border-t border-surface-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-surface-800 flex items-center gap-1.5">
                <Shield size={14} className="text-brand-600" /> Security Officer Workflow
              </h4>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-surface-600 block">
                  Add Resolution or Maintenance Notes:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Work order dispatched to campus electrical department..."
                  className="input-field w-full text-xs"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {report.status === 'reported' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('review')}
                    disabled={loading}
                    className="text-xs py-1.5"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : 'Mark Reviewing'}
                  </Button>
                )}
                {(report.status === 'reported' || report.status === 'reviewing') && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('acknowledge')}
                    disabled={loading}
                    className="text-xs py-1.5"
                  >
                    Acknowledge
                  </Button>
                )}
                {report.status !== 'action_planned' && report.status !== 'resolved' && report.status !== 'closed' && (
                  <Button
                    variant="primary"
                    onClick={() => handleStatusChange('plan')}
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs py-1.5"
                  >
                    Plan Action
                  </Button>
                )}
                {report.status !== 'resolved' && report.status !== 'closed' && (
                  <Button
                    variant="primary"
                    onClick={() => handleStatusChange('resolve')}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5"
                  >
                    Resolve Hazard
                  </Button>
                )}
                {report.status === 'resolved' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('close')}
                    disabled={loading}
                    className="text-xs py-1.5 text-surface-600"
                  >
                    Archive & Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
