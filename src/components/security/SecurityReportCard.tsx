// ============================================================
// Campus Care — SecurityReportCard Component
// ============================================================

import {
  MapPin,
  Clock,
  ArrowRight,
  EyeOff,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import type { SecurityReport } from '../../types/database';
import { SecurityPriorityBadge } from './SecurityPriorityBadge';
import { securityCategoryOptions } from './SecurityCategorySelector';
import { formatRelativeTime } from '../../lib/mockData';
import { cn } from '../../lib/utils';

interface SecurityReportCardProps {
  report: SecurityReport;
  onSelect?: (report: SecurityReport) => void;
  actionLabel?: string;
  className?: string;
}

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-800' },
  acknowledged: { label: 'Acknowledged', bg: 'bg-blue-100', text: 'text-blue-800' },
  assigned: { label: 'Assigned', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  investigating: { label: 'Investigating', bg: 'bg-purple-100', text: 'text-purple-800' },
  resolved: { label: 'Resolved', bg: 'bg-safe-100', text: 'text-safe-800' },
  closed: { label: 'Closed', bg: 'bg-surface-200', text: 'text-surface-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-surface-100', text: 'text-surface-500' },
  dismissed: { label: 'Dismissed', bg: 'bg-surface-100', text: 'text-surface-500' },
};

export function SecurityReportCard({
  report,
  onSelect,
  actionLabel = 'Review Report',
  className,
}: SecurityReportCardProps) {
  const categoryConfig = securityCategoryOptions.find((c) => c.id === report.category) || {
    label: report.category.replace('_', ' '),
    emoji: '🛡️',
  };

  const statusConfig = statusLabels[report.status] || {
    label: report.status.replace('_', ' '),
    bg: 'bg-surface-100',
    text: 'text-surface-700',
  };

  return (
    <div
      className={cn(
        'card p-4 sm:p-5 transition-all duration-200 hover:shadow-md border flex flex-col justify-between',
        report.immediate_danger
          ? 'border-rose-300 bg-rose-50/20 shadow-xs'
          : 'border-surface-200/80 bg-white',
        className
      )}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-surface-900 text-sm flex items-center gap-1.5">
              <span>{categoryConfig.emoji}</span>
              <span className="capitalize">{categoryConfig.label}</span>
            </span>

            {report.immediate_danger && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                <AlertTriangle size={10} /> Danger
              </span>
            )}

            {report.anonymous_report && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <EyeOff size={10} /> Anonymous
              </span>
            )}
          </div>

          <SecurityPriorityBadge priority={report.priority} />
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-surface-600 line-clamp-2 mb-3 leading-relaxed">
          {report.description}
        </p>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-surface-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-surface-400" />
            <span className="truncate max-w-[180px]">{report.location_name || 'Campus Grounds'}</span>
          </span>

          <span className="flex items-center gap-1">
            <Clock size={13} className="text-surface-400" />
            <span className="capitalize">{report.incident_time?.replace('_', ' ') || 'Recent'}</span>
          </span>

          {report.evidence_url && (
            <span className="flex items-center gap-1 text-brand-600 font-medium text-[11px]">
              <Camera size={12} /> Photo Attached
            </span>
          )}
        </div>
      </div>

      {/* Footer Status & CTA */}
      <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize',
              statusConfig.bg,
              statusConfig.text
            )}
          >
            {statusConfig.label}
          </span>
          <span className="text-[11px] text-surface-400">
            {formatRelativeTime(report.created_at)}
          </span>
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(report)}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
          >
            {actionLabel} <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
