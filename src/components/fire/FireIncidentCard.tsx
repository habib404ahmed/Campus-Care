// ============================================================
// Campus Care — FireIncidentCard Component
// ============================================================

import { Flame, Clock, MapPin, ArrowRight, AlertOctagon, Cloud } from 'lucide-react';
import type { FireIncidentWithDetails } from '../../lib/services/fireService';
import { formatRelativeTime } from '../../lib/mockData';
import { cn } from '../../lib/utils';

interface FireIncidentCardProps {
  item: FireIncidentWithDetails;
  onSelect?: (item: FireIncidentWithDetails) => void;
  actionLabel?: string;
}

export function FireIncidentCard({
  item,
  onSelect,
  actionLabel = 'Respond',
}: FireIncidentCardProps) {
  const { incident, fire } = item;
  const isPending = incident.status === 'pending';
  const isCritical = incident.priority === 'critical' || fire.people_trapped === 'yes';

  const getFireTypeLabel = () => {
    switch (fire.fire_type) {
      case 'fire':
        return '🔥 Active Fire';
      case 'smoke':
        return '💨 Smoke / Odor';
      case 'electrical':
        return '⚡ Electrical Fire';
      case 'gas':
        return '🛢️ Gas Leak';
      default:
        return '⚠️ Fire Hazard';
    }
  };

  return (
    <div
      className={cn(
        'card p-5 border-2 transition-all duration-200 flex flex-col justify-between hover:shadow-lg',
        isCritical
          ? 'border-rose-500/80 bg-gradient-to-br from-rose-50/50 via-white to-white'
          : 'border-orange-200 bg-white hover:border-orange-300'
      )}
    >
      <div>
        {/* Top badges bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-xs',
              isCritical
                ? 'bg-rose-600 text-white'
                : 'bg-orange-600 text-white'
            )}>
              <Flame size={12} />
              {isCritical ? '🔴 CRITICAL FIRE' : '🔥 FIRE ALERT'}
            </span>

            {fire.people_trapped === 'yes' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                <AlertOctagon size={12} className="text-rose-600" />
                PEOPLE TRAPPED: YES
              </span>
            )}
          </div>

          <span className={cn(
            'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
            isPending
              ? 'bg-amber-100 text-amber-800 animate-pulse'
              : incident.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : incident.status === 'assigned'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-emerald-100 text-emerald-800'
          )}>
            {incident.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title / Fire Type */}
        <div className="mb-2">
          <h3 className="font-extrabold text-surface-900 text-base flex items-center gap-2">
            {getFireTypeLabel()}
          </h3>
          <p className="text-xs text-surface-600 mt-1 line-clamp-2">
            {fire.description || incident.description || 'Fire emergency reported on campus.'}
          </p>
        </div>

        {/* Status Indicators Pill */}
        <div className="flex flex-wrap gap-2 my-3">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface-100 text-surface-700 flex items-center gap-1">
            <Cloud size={12} className="text-slate-500" />
            Smoke: {fire.smoke_visible ? 'Visible' : 'Not Visible'}
          </span>

          <span className={cn(
            'px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1',
            fire.people_trapped === 'yes'
              ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
              : 'bg-surface-100 text-surface-700'
          )}>
            <AlertOctagon size={12} />
            Trapped: {fire.people_trapped === 'yes' ? 'YES (Danger)' : fire.people_trapped === 'no' ? 'None Reported' : 'Unknown'}
          </span>
        </div>

        {/* Location & Time */}
        <div className="space-y-1 pt-1 border-t border-surface-100 text-xs text-surface-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-orange-500 flex-shrink-0" />
            <span className="font-medium text-surface-700 truncate">
              {incident.location_name || (incident.latitude ? '📍 Coordinates Available' : '⚠️ Location Unavailable')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-surface-400">
            <Clock size={12} />
            <span>Reported {formatRelativeTime(incident.created_at)}</span>
            <span>•</span>
            <span className="font-mono">{incident.id.slice(0, 16)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {onSelect && (
        <div className="pt-4 mt-3 border-t border-surface-100">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              'w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer',
              isCritical
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            )}
          >
            <span>{actionLabel}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
