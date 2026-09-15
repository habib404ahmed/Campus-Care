// ============================================================
// Campus Care — SecurityPriorityBadge Component
// ============================================================

import type { SecurityPriority } from '../../types/database';
import { cn } from '../../lib/utils';

interface SecurityPriorityBadgeProps {
  priority: SecurityPriority;
  className?: string;
  showDot?: boolean;
}

const config: Record<SecurityPriority, { label: string; bg: string; text: string; dot: string }> = {
  low: {
    label: 'Low Priority',
    bg: 'bg-surface-100 border-surface-300',
    text: 'text-surface-700',
    dot: 'bg-surface-400',
  },
  medium: {
    label: 'Medium Priority',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High Priority',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
  critical: {
    label: 'Critical Priority',
    bg: 'bg-rose-100 border-rose-300',
    text: 'text-rose-900',
    dot: 'bg-rose-600 animate-ping',
  },
};

export function SecurityPriorityBadge({
  priority,
  className,
  showDot = true,
}: SecurityPriorityBadgeProps) {
  const c = config[priority] || config.low;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border uppercase tracking-wider',
        c.bg,
        c.text,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} aria-hidden="true" />}
      {c.label}
    </span>
  );
}
