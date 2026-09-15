// ============================================================
// Campus Care — EmergencyIncidentCard Component
// ============================================================

import { AlertTriangle, MapPin, Clock, ArrowRight, Shield, Flame, Cross } from 'lucide-react';
import type { EmergencyIncident } from '../../types/database';
import { formatRelativeTime } from '../../lib/mockData';
import { cn } from '../../lib/utils';

interface EmergencyIncidentCardProps {
  incident: EmergencyIncident;
  onSelect?: (incident: EmergencyIncident) => void;
  actionLabel?: string;
  showReporter?: boolean;
}

export function EmergencyIncidentCard({
  incident,
  onSelect,
  actionLabel = 'Respond',
  showReporter = true,
}: EmergencyIncidentCardProps) {
  const isSOS = incident.incident_type === 'sos';
  const isCritical = incident.priority === 'critical';
  const isPending = incident.status === 'pending';

  const getTypeIcon = () => {
    switch (incident.incident_type) {
      case 'sos':
        return <AlertTriangle size={18} className="text-emergency-600" />;
      case 'medical':
        return <Cross size={18} className="text-safe-600" />;
      case 'fire':
        return <Flame size={18} className="text-orange-600" />;
      case 'security':
        return <Shield size={18} className="text-brand-600" />;
      default:
        return <AlertTriangle size={18} className="text-warning-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (incident.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Response
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Responder Assigned
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-spin" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Resolved
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-white shadow-sm',
        isCritical && isPending
          ? 'border-emergency-300 bg-gradient-to-br from-emergency-50/50 via-white to-white ring-1 ring-emergency-200'
          : 'border-surface-200 hover:border-surface-300'
      )}
    >
      {/* Top red alert bar for critical SOS */}
      {isCritical && isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-emergency-500 animate-pulse" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
              isSOS ? 'bg-emergency-100' : 'bg-surface-100'
            )}
          >
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-surface-900 tracking-tight">
                {isSOS ? '🚨 SOS EMERGENCY' : `${incident.incident_type.toUpperCase()} INCIDENT`}
              </h3>
              {isCritical && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emergency-600 text-white">
                  CRITICAL
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-surface-400 mt-0.5">
              <Clock size={12} />
              <span>{formatRelativeTime(incident.created_at)}</span>
              {showReporter && incident.reporter && (
                <>
                  <span>•</span>
                  <span className="font-medium text-surface-600">{incident.reporter.full_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      <div className="space-y-2 mb-4 text-xs text-surface-600">
        <p className="line-clamp-2 leading-relaxed">{incident.description || 'Emergency incident requires response.'}</p>
        <div className="flex items-center gap-1.5 text-surface-500">
          <MapPin size={14} className={incident.latitude ? 'text-brand-600' : 'text-surface-400'} />
          <span className="font-medium">
            {incident.location_name || (incident.latitude ? 'GPS Coordinates Available' : 'Location Unavailable')}
          </span>
          {incident.latitude != null && incident.longitude != null && (
            <span className="text-[10px] text-surface-400 font-mono">
              ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
            </span>
          )}
        </div>
      </div>

      {onSelect && (
        <div className="flex justify-end pt-2 border-t border-surface-100">
          <button
            type="button"
            onClick={() => onSelect(incident)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              isPending
                ? 'bg-emergency-600 hover:bg-emergency-700 text-white shadow-sm shadow-emergency-500/30'
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
