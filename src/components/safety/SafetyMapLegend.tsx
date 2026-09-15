// ============================================================
// Campus Care — SafetyMapLegend Component
// ============================================================

import { cn } from '../../lib/utils';

export interface LegendItem {
  color: string;
  badgeBg: string;
  emoji: string;
  label: string;
  level: string;
  desc: string;
}

export const safetyLegendItems: LegendItem[] = [
  {
    color: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    emoji: '🟢',
    label: 'Low Concern',
    level: '1 Report',
    desc: 'Minor or isolated environmental concern',
  },
  {
    color: 'bg-amber-400',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    emoji: '🟡',
    label: 'Moderate Concern',
    level: '2 Reports',
    desc: 'Moderate hazard or occasional issue',
  },
  {
    color: 'bg-orange-500',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    emoji: '🟠',
    label: 'Multiple Concerns',
    level: '3+ Reports',
    desc: 'Active safety cluster requiring attention',
  },
  {
    color: 'bg-rose-500',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    emoji: '🔴',
    label: 'High Concern',
    level: 'High / Critical',
    desc: 'Urgent physical hazard or dark isolated hotspot',
  },
];

interface SafetyMapLegendProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function SafetyMapLegend({
  className,
  orientation = 'horizontal',
}: SafetyMapLegendProps) {
  return (
    <div
      className={cn(
        'bg-white/95 backdrop-blur-sm border border-surface-200 rounded-2xl p-3 shadow-xs',
        className
      )}
      aria-label="Safety Map Legend"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-surface-600 flex items-center gap-1.5">
          <span>🗺️</span> Safety Map Legend
        </p>
        <span className="text-[10px] text-surface-400">Aggregated Hotspots</span>
      </div>

      <div
        className={cn(
          orientation === 'horizontal'
            ? 'grid grid-cols-2 sm:grid-cols-4 gap-2'
            : 'space-y-2'
        )}
      >
        {safetyLegendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 p-1.5 rounded-xl hover:bg-surface-50 transition-colors"
          >
            <div className="flex items-center justify-center mt-0.5">
              <span className="text-sm" aria-hidden="true">
                {item.emoji}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-surface-800 tracking-tight truncate">
                  {item.label}
                </span>
              </div>
              <p className="text-[10px] text-surface-500 leading-tight truncate">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
