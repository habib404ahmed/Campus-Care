import { cn } from '../../lib/utils';
import type { IncidentStatus, SeverityLevel, CampusStatus } from '../../types';

// --- Incident Status Badge ---
interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

const statusConfig: Record<IncidentStatus, { label: string; classes: string; dot: string }> = {
  active:   { label: 'Active',   classes: 'bg-emergency-100 text-emergency-700', dot: 'bg-emergency-500 animate-pulse' },
  pending:  { label: 'Pending',  classes: 'bg-warning-100 text-warning-700',   dot: 'bg-warning-500' },
  resolved: { label: 'Resolved', classes: 'bg-safe-100 text-safe-700',         dot: 'bg-safe-500' },
  closed:   { label: 'Closed',   classes: 'bg-surface-100 text-surface-500',   dot: 'bg-surface-400' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('badge', config.classes, className)}>
      <span className={cn('inline-block w-1.5 h-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}

// --- Severity Badge ---
interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

const severityConfig: Record<SeverityLevel, { label: string; classes: string }> = {
  critical: { label: 'Critical', classes: 'bg-emergency-600 text-white' },
  high:     { label: 'High',     classes: 'bg-emergency-100 text-emergency-700' },
  medium:   { label: 'Medium',   classes: 'bg-warning-100 text-warning-700' },
  low:      { label: 'Low',      classes: 'bg-safe-100 text-safe-700' },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span className={cn('badge', config.classes, className)}>
      {config.label}
    </span>
  );
}

// --- Campus Status Indicator ---
interface CampusStatusBadgeProps {
  status: CampusStatus['overall'];
  size?: 'sm' | 'md' | 'lg';
}

const campusStatusConfig: Record<CampusStatus['overall'], { label: string; emoji: string; classes: string; dotClass: string }> = {
  safe:      { label: 'Campus is Safe',       emoji: '🟢', classes: 'bg-safe-50 text-safe-700 border border-safe-200',           dotClass: 'bg-safe-500' },
  caution:   { label: 'Exercise Caution',     emoji: '🟡', classes: 'bg-warning-50 text-warning-700 border border-warning-200',  dotClass: 'bg-warning-500 animate-pulse' },
  emergency: { label: 'Active Emergency',     emoji: '🔴', classes: 'bg-emergency-50 text-emergency-700 border border-emergency-200', dotClass: 'bg-emergency-500 animate-pulse' },
};

export function CampusStatusBadge({ status, size = 'md' }: CampusStatusBadgeProps) {
  const config = campusStatusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-sm';

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full font-semibold', config.classes, sizeClass)}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dotClass)} aria-hidden="true" />
      {config.label}
    </span>
  );
}
