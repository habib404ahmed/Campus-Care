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
  className?: string;
}

const colorConfig = {
  brand:     { bg: 'bg-brand-50',     icon: 'text-brand-600',     value: 'text-brand-700' },
  emergency: { bg: 'bg-emergency-50', icon: 'text-emergency-600', value: 'text-emergency-700' },
  safe:      { bg: 'bg-safe-50',      icon: 'text-safe-600',      value: 'text-safe-700' },
  warning:   { bg: 'bg-warning-50',   icon: 'text-warning-600',   value: 'text-warning-700' },
  info:      { bg: 'bg-info-50',      icon: 'text-info-600',      value: 'text-info-700' },
  neutral:   { bg: 'bg-surface-50',   icon: 'text-surface-500',   value: 'text-surface-800' },
};

const trendConfig = {
  up:      { icon: TrendingUp,   classes: 'text-safe-600' },
  down:    { icon: TrendingDown, classes: 'text-emergency-600' },
  neutral: { icon: Minus,        classes: 'text-surface-400' },
};

export function StatCard({ label, value, change, trend = 'neutral', color = 'neutral', icon, className }: StatCardProps) {
  const colors = colorConfig[color];
  const TrendIcon = trendConfig[trend].icon;

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
            <span className={colors.icon}>{icon}</span>
          </div>
        )}
        {change && (
          <div className={cn('flex items-center gap-0.5 text-xs font-medium ml-auto', trendConfig[trend].classes)}>
            <TrendIcon size={12} aria-hidden="true" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold tracking-tight text-surface-900">{value}</p>
        <p className="text-sm text-surface-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
