import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'emergency' | 'warning' | 'safe' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  emergency: 'badge-emergency',
  warning:   'badge-warning',
  safe:      'badge-safe',
  info:      'badge-info',
  neutral:   'badge-neutral',
};

const dotColors: Record<BadgeVariant, string> = {
  emergency: 'bg-emergency-500',
  warning:   'bg-warning-500',
  safe:      'bg-safe-500',
  info:      'bg-info-500',
  neutral:   'bg-surface-400',
};

export function Badge({ variant = 'neutral', children, className, dot }: BadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)}>
      {dot && (
        <span
          className={cn('inline-block w-1.5 h-1.5 rounded-full', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
