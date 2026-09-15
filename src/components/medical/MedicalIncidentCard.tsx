// ============================================================
// Campus Care — MedicalIncidentCard Component
// ============================================================

import { Cross, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { MedicalIncidentWithDetails } from '../../lib/services/medicalService';
import { formatRelativeTime } from '../../lib/mockData';
import { cn } from '../../lib/utils';

interface MedicalIncidentCardProps {
  item: MedicalIncidentWithDetails;
  onSelect?: (item: MedicalIncidentWithDetails) => void;
  actionLabel?: string;
}

export function MedicalIncidentCard({
  item,
  onSelect,
  actionLabel = 'Respond',
}: MedicalIncidentCardProps) {
  const { incident, medical } = item;
  const isPending = incident.status === 'pending';
  const isCritical = incident.priority === 'critical';

  const getSeverityBadge = () => {
    switch (incident.priority) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-rose-600 text-white shadow-xs">🔴 Critical</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-800 border border-orange-200">🟠 High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">🟡 Moderate</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Low</span>;
    }
  };

  return (
    <div
      className={cn(
        'p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-white shadow-sm flex flex-col justify-between',
        isCritical && isPending
          ? 'border-rose-300 bg-gradient-to-br from-rose-50/40 via-white to-white ring-1 ring-rose-200'
          : 'border-surface-200 hover:border-surface-300'
      )}
    >
      {/* Top accent bar for critical calls */}
      {isCritical && isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600 animate-pulse" />
      )}

      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-safe-100 text-safe-600 flex items-center justify-center shadow-xs">
              <Cross size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-surface-900 tracking-tight">
                  {incident.incident_type === 'sos' ? '🚨 SOS EMERGENCY' : '🩺 MEDICAL ASSISTANCE'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
                <Clock size={12} />
                <span>{formatRelativeTime(incident.created_at)}</span>
                {incident.reporter && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-surface-600">{incident.reporter.full_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {getSeverityBadge()}
          </div>
        </div>

        {/* Ambulance banner */}
        {medical?.needs_ambulance && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-1.5">
            <span>🚑 Ambulance Support Requested</span>
          </div>
        )}

        {/* Symptoms / Notes excerpt */}
        <div className="space-y-1.5 mb-4 text-xs text-surface-600">
          <p className="line-clamp-2 leading-relaxed">
            <strong className="text-surface-800">Symptoms: </strong>
            {medical?.symptoms || incident.description || 'Medical evaluation requested.'}
          </p>
          {medical?.injury_description && (
            <p className="line-clamp-1 text-surface-500">
              <strong className="text-surface-700">Injury: </strong>
              {medical.injury_description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-surface-500 pt-1">
            <MapPin size={13} className={incident.latitude ? 'text-safe-600' : 'text-surface-400'} />
            <span className="font-medium">
              {incident.location_name || (incident.latitude ? 'GPS Available' : 'Location Unavailable')}
            </span>
          </div>
        </div>
      </div>

      {onSelect && (
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <span className="text-[11px] font-bold capitalize text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {incident.status.replace('_', ' ')}
          </span>

          <button
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              isPending
                ? 'bg-safe-600 hover:bg-safe-700 text-white shadow-xs'
                : 'bg-surface-900 hover:bg-surface-800 text-white'
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
