import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'brand' | 'emergency' | 'safe' | 'warning' | 'info' | 'neutral';
  icon?: React.ReactNode;
  isLive?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

const colorConfig = {
  brand: {
    bg: 'bg-gradient-to-br from-brand-50 to-indigo-100/60 border-brand-200/60',
    icon: 'text-brand-600',
    value: 'text-brand-900',
    dot: 'bg-brand-500',
  },
  emergency: {
    bg: 'bg-gradient-to-br from-emergency-50 to-rose-100/60 border-emergency-200/60',
    icon: 'text-emergency-600',
    value: 'text-emergency-900',
    dot: 'bg-emergency-500',
  },
  safe: {
    bg: 'bg-gradient-to-br from-safe-50 to-emerald-100/60 border-safe-200/60',
    icon: 'text-safe-600',
    value: 'text-safe-900',
    dot: 'bg-safe-500',
  },
  warning: {
    bg: 'bg-gradient-to-br from-warning-50 to-amber-100/60 border-warning-200/60',
    icon: 'text-warning-600',
    value: 'text-warning-900',
    dot: 'bg-warning-500',
  },
  info: {
    bg: 'bg-gradient-to-br from-info-50 to-sky-100/60 border-info-200/60',
    icon: 'text-info-600',
    value: 'text-info-900',
    dot: 'bg-info-500',
  },
  neutral: {
    bg: 'bg-gradient-to-br from-surface-50 to-slate-100/70 border-surface-200',
    icon: 'text-surface-600',
    value: 'text-surface-900',
    dot: 'bg-surface-400',
  },
};

const trendConfig = {
  up:      { icon: TrendingUp,   classes: 'text-safe-700 bg-safe-50 border-safe-200' },
  down:    { icon: TrendingDown, classes: 'text-emergency-700 bg-emergency-50 border-emergency-200' },
  neutral: { icon: Minus,        classes: 'text-surface-600 bg-surface-100 border-surface-200' },
};

export function StatCard({
  label,
  value,
  change,
  trend = 'neutral',
  color = 'neutral',
  icon,
  isLive,
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const colors = colorConfig[color];
  const TrendIcon = trendConfig[trend].icon;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'stat-card text-left transition-all duration-200 relative overflow-hidden',
        onClick && 'cursor-pointer active:scale-[0.99] hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        {icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm', colors.bg)}>
            <span className={cn('text-lg', colors.icon)}>{icon}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              Live
            </span>
          )}

          {change && (
            <div className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border', trendConfig[trend].classes)}>
              <TrendIcon size={12} aria-hidden="true" />
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3.5">
        <p className={cn('text-3xl font-extrabold tracking-tight', colors.value)}>{value}</p>
        <p className="text-xs font-medium text-surface-500 mt-1 uppercase tracking-wider">{label}</p>
        {subtitle && <p className="text-[11px] text-surface-400 mt-0.5">{subtitle}</p>}
      </div>
    </Tag>
  );
}

