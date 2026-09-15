// ============================================================
// Campus Care — SafetyMapFilters Component
// ============================================================

import {
  Sun,
  Moon,
  Clock,
  Sparkles,
} from 'lucide-react';
import type {
  SafetyConcernType,
  SafetyTimeFilter,
  SafetyMapFilter,
} from '../../types/database';
import { cn } from '../../lib/utils';

interface SafetyMapFiltersProps {
  filters: SafetyMapFilter;
  onChange: (filters: SafetyMapFilter) => void;
  className?: string;
  totalHotspots?: number;
}

const categoryFilterTabs: Array<{ id: 'all' | SafetyConcernType; label: string; icon: string }> = [
  { id: 'all', label: 'All Concerns', icon: '🌐' },
  { id: 'poor_lighting', label: 'Lighting', icon: '💡' },
  { id: 'isolated_area', label: 'Isolated', icon: '🚶' },
  { id: 'unsafe_pathway', label: 'Pathway', icon: '🛣️' },
  { id: 'construction_hazard', label: 'Construction', icon: '🚧' },
  { id: 'harassment_concern', label: 'Harassment', icon: '⚠️' },
  { id: 'animal_concern', label: 'Animals', icon: '🐕' },
  { id: 'security_concern', label: 'Security', icon: '🔐' },
  { id: 'other', label: 'Other', icon: '❓' },
];

export function SafetyMapFilters({
  filters,
  onChange,
  className,
  totalHotspots,
}: SafetyMapFiltersProps) {
  const handleCategoryChange = (category: 'all' | SafetyConcernType) => {
    onChange({ ...filters, category });
  };

  const handleTimeChange = (time: SafetyTimeFilter) => {
    onChange({ ...filters, time });
  };

  return (
    <div
      className={cn(
        'bg-white/95 backdrop-blur-sm border border-surface-200 rounded-2xl p-3 shadow-xs space-y-3',
        className
      )}
    >
      {/* Top row: Time awareness toggle + count badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-100 pb-2.5">
        <div className="flex items-center gap-1.5 bg-surface-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTimeChange('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
              filters.time === 'all'
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-500 hover:text-surface-800'
            )}
          >
            <Clock size={12} />
            <span>24/7 View</span>
          </button>
          <button
            type="button"
            onClick={() => handleTimeChange('day')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
              filters.time === 'day'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'text-surface-500 hover:text-surface-800'
            )}
          >
            <Sun size={12} className="text-amber-600" />
            <span>🌞 Day Safety</span>
          </button>
          <button
            type="button"
            onClick={() => handleTimeChange('night')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
              filters.time === 'night'
                ? 'bg-indigo-950 text-indigo-100 shadow-xs'
                : 'text-surface-500 hover:text-surface-800'
            )}
          >
            <Moon size={12} className="text-indigo-400" />
            <span>🌙 Night Safety</span>
          </button>
        </div>

        {totalHotspots !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-600 bg-surface-50 px-2.5 py-1 rounded-full border border-surface-200">
            <Sparkles size={13} className="text-brand-600" />
            <span>
              {totalHotspots} {totalHotspots === 1 ? 'Hotspot' : 'Hotspots'} Active
            </span>
          </div>
        )}
      </div>

      {/* Category scrollable filter pill tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categoryFilterTabs.map((tab) => {
          const isActive = filters.category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCategoryChange(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0',
                isActive
                  ? 'bg-surface-900 text-white shadow-xs'
                  : 'bg-surface-100 hover:bg-surface-200 text-surface-700'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
