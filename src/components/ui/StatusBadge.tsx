import {
  AlertTriangle, CheckCircle2, Clock, AlertOctagon,
  ShieldCheck, Loader2, XCircle, Info, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IncidentStatus, SeverityLevel, CampusStatus } from '../../types';

// Extended status strings supported across features
export type ExtendedStatus =
  | IncidentStatus
  | 'assigned'
  | 'in_progress'
  | 'investigating'
  | 'cancelled'
  | 'open'
  | 'full'
  | 'confirmed'
  | 'started'
  | 'completed';

// --- Incident / General Status Badge ---
interface StatusBadgeProps {
  status: ExtendedStatus;
  className?: string;
}

const statusConfig: Record<
  ExtendedStatus,
  { label: string; classes: string; icon: React.ElementType; dotColor?: string; pulse?: boolean }
> = {
  active:        { label: 'Active',        classes: 'bg-rose-50 text-rose-700 border-rose-200/80',          icon: AlertOctagon, dotColor: 'bg-rose-500', pulse: true },
  pending:       { label: 'Pending',       classes: 'bg-amber-50 text-amber-700 border-amber-200/80',      icon: Clock,        dotColor: 'bg-amber-500', pulse: false },
  assigned:      { label: 'Assigned',      classes: 'bg-blue-50 text-blue-700 border-blue-200/80',          icon: Loader2,      dotColor: 'bg-blue-500', pulse: true },
  in_progress:   { label: 'In Progress',   classes: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',    icon: Loader2,      dotColor: 'bg-indigo-500', pulse: true },
  investigating: { label: 'Investigating', classes: 'bg-purple-50 text-purple-700 border-purple-200/80',    icon: Info,         dotColor: 'bg-purple-500', pulse: true },
  resolved:      { label: 'Resolved',      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',icon: CheckCircle2, dotColor: 'bg-emerald-500', pulse: false },
  completed:     { label: 'Completed',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',icon: CheckCircle2, dotColor: 'bg-emerald-500', pulse: false },
  confirmed:     { label: 'Confirmed',     classes: 'bg-teal-50 text-teal-700 border-teal-200/80',          icon: ShieldCheck,  dotColor: 'bg-teal-500', pulse: false },
  started:       { label: 'Started',       classes: 'bg-sky-50 text-sky-700 border-sky-200/80',            icon: Sparkles,     dotColor: 'bg-sky-500', pulse: false },
  open:          { label: 'Open',          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',icon: CheckCircle2, dotColor: 'bg-emerald-500', pulse: false },
  full:          { label: 'Full',          classes: 'bg-slate-100 text-slate-700 border-slate-200',         icon: Info,         dotColor: 'bg-slate-500', pulse: false },
  closed:        { label: 'Closed',        classes: 'bg-slate-100 text-slate-600 border-slate-200',         icon: XCircle,      dotColor: 'bg-slate-400', pulse: false },
  cancelled:     { label: 'Cancelled',     classes: 'bg-rose-50 text-rose-700 border-rose-200/60',          icon: XCircle,      dotColor: 'bg-rose-400', pulse: false },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span className={cn('badge', config.classes, className)}>
      <span
        className={cn(
          'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
          config.dotColor,
          config.pulse && 'animate-ping'
        )}
        aria-hidden="true"
      />
      <Icon size={12} className="flex-shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

// --- Severity Badge ---
interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

const severityConfig: Record<
  SeverityLevel,
  { label: string; classes: string; icon: React.ElementType }
> = {
  critical: { label: 'Critical', classes: 'bg-rose-600 text-white border-rose-700 shadow-sm shadow-rose-600/30 font-extrabold', icon: AlertOctagon },
  high:     { label: 'High',     classes: 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',                           icon: AlertTriangle },
  medium:   { label: 'Medium',   classes: 'bg-amber-50 text-amber-800 border-amber-200/90 font-semibold',                     icon: AlertTriangle },
  low:      { label: 'Low',      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-medium',               icon: CheckCircle2 },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity] || severityConfig.medium;
  const Icon = config.icon;
  return (
    <span className={cn('badge', config.classes, className)}>
      <Icon size={11} className="flex-shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

// --- Campus Status Indicator ---
interface CampusStatusBadgeProps {
  status: CampusStatus['overall'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const campusStatusConfig: Record<
  CampusStatus['overall'],
  { label: string; emoji: string; classes: string; dotClass: string }
> = {
  safe:      { label: 'Campus Safe',          emoji: '🟢', classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90',   dotClass: 'bg-emerald-500' },
  caution:   { label: 'Exercise Caution',     emoji: '🟡', classes: 'bg-amber-50 text-amber-800 border border-amber-200/90',        dotClass: 'bg-amber-500 animate-pulse' },
  emergency: { label: 'Active Campus Alert',  emoji: '🔴', classes: 'bg-rose-50 text-rose-800 border border-rose-300 shadow-sm',   dotClass: 'bg-rose-600 animate-ping' },
};

export function CampusStatusBadge({ status, size = 'md', className }: CampusStatusBadgeProps) {
  const config = campusStatusConfig[status] || campusStatusConfig.safe;
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs';

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full font-bold tracking-tight', config.classes, sizeClass, className)}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dotClass)} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
