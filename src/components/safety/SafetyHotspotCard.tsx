// ============================================================
// Campus Care — SafetyHotspotCard Component
// ============================================================

import {
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { SafetyHotspot } from '../../types/database';
import { safetyConcernOptions } from './SafetyConcernSelector';
import { cn } from '../../lib/utils';

interface SafetyHotspotCardProps {
  hotspot: SafetyHotspot;
  onSelect?: (hotspot: SafetyHotspot) => void;
  isSelected?: boolean;
  className?: string;
}

export function SafetyHotspotCard({
  hotspot,
  onSelect,
  isSelected = false,
  className,
}: SafetyHotspotCardProps) {
  const concernMeta = safetyConcernOptions.find((o) => o.id === hotspot.dominant_category) || {
    label: 'Safety Concern',
    emoji: '⚠️',
    color: 'text-surface-700',
  };

  const getSeverityBadge = () => {
    switch (hotspot.concern_level) {
      case 'critical':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500 animate-ping',
          label: 'Critical Concern',
          emoji: '🔴',
        };
      case 'high':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500',
          label: 'High Concern',
          emoji: '🟠',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Moderate Concern',
          emoji: '🟡',
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Low Concern',
          emoji: '🟢',
        };
    }
  };

  const badge = getSeverityBadge();

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div
      onClick={() => onSelect && onSelect(hotspot)}
      className={cn(
        'card p-4 transition-all text-left cursor-pointer border rounded-2xl relative overflow-hidden',
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 shadow-md'
          : 'border-surface-200 hover:border-surface-300 hover:shadow-xs bg-white',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base flex-shrink-0" aria-hidden="true">
            {concernMeta.emoji}
          </span>
          <h4 className="text-xs font-black text-surface-900 tracking-tight truncate">
            {hotspot.location_name}
          </h4>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex-shrink-0',
            badge.bg
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', badge.dot)} />
          {badge.label}
        </span>
      </div>

      <div className="space-y-1.5 my-2.5">
        <div className="flex items-center justify-between text-xs text-surface-600">
          <span className="flex items-center gap-1 text-surface-500 text-[11px]">
            <Layers size={13} className="text-brand-600" /> Clustered Reports:
          </span>
          <span className="font-extrabold text-surface-900">
            {hotspot.report_count} {hotspot.report_count === 1 ? 'Report' : 'Reports'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-surface-600">
          <span className="flex items-center gap-1 text-surface-500 text-[11px]">
            <Sparkles size={13} className="text-amber-600" /> Dominant Issue:
          </span>
          <span className="font-bold text-surface-800 truncate max-w-[140px]">
            {concernMeta.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-surface-600">
          <span className="flex items-center gap-1 text-surface-500 text-[11px]">
            <Clock size={13} className="text-surface-400" /> Last Reported:
          </span>
          <span className="font-semibold text-surface-600 text-[11px]">
            {timeAgo(hotspot.last_reported_at)}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-surface-500 leading-relaxed bg-surface-50 p-2 rounded-xl border border-surface-100">
        Multiple campus community members have highlighted safety concerns in this area. Exercise awareness.
      </p>

      {/* Privacy note */}
      <div className="mt-2 flex items-center justify-between pt-1 border-t border-surface-100">
        <span className="text-[10px] text-surface-400 flex items-center gap-1">
          <MapPin size={10} /> Approximate Area (~100m)
        </span>
        <span className="text-[10px] font-bold text-brand-600 flex items-center gap-0.5">
          View details <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
}
