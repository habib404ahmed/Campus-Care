// ============================================================
// Campus Care — IncidentTimeline Component
// ============================================================

import { CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';
import type { EmergencyIncident, IncidentAssignment } from '../../types/database';
import { cn } from '../../lib/utils';

interface IncidentTimelineProps {
  incident: EmergencyIncident;
  assignment?: IncidentAssignment | null;
}

interface TimelineStep {
  title: string;
  description: string;
  time?: string | null;
  state: 'completed' | 'active' | 'pending';
}

export function IncidentTimeline({ incident, assignment }: IncidentTimelineProps) {
  const isResolved = incident.status === 'resolved';
  const isInProgress = incident.status === 'in_progress';
  const isAssigned = ['assigned', 'in_progress', 'resolved'].includes(incident.status);
  const isCancelled = incident.status === 'cancelled';

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return null;
    }
  };

  const steps: TimelineStep[] = [
    {
      title: '🚨 Emergency SOS Activated',
      description: 'Emergency signal triggered by user with device telemetrics.',
      time: formatTime(incident.created_at),
      state: 'completed',
    },
    {
      title: '📡 Central Response Notified',
      description: 'Alert dispatched to all active duty campus safety officers.',
      time: formatTime(incident.created_at),
      state: 'completed',
    },
    {
      title: '👮 Responder Assigned',
      description: assignment?.worker
        ? `${assignment.worker.full_name} (${assignment.worker.worker_department || 'Safety Team'}) accepted the dispatch call.`
        : isAssigned
        ? 'Campus safety responder accepted dispatch.'
        : 'Waiting for available responder to accept...',
      time: formatTime(assignment?.assigned_at || (isAssigned ? incident.updated_at : null)),
      state: isAssigned ? 'completed' : isCancelled ? 'pending' : 'active',
    },
    {
      title: '🏃 Response In Progress',
      description: isInProgress || isResolved
        ? 'Officer is en route and on-scene resolving the situation.'
        : 'Officer dispatch navigation will begin once accepted.',
      time: formatTime(isInProgress || isResolved ? incident.updated_at : null),
      state: isResolved ? 'completed' : isInProgress ? 'active' : 'pending',
    },
    {
      title: isCancelled ? '❌ Incident Cancelled' : '✅ Incident Resolved',
      description: isCancelled
        ? 'Emergency was cancelled by reporting user.'
        : isResolved
        ? 'Campus responder confirmed all clear and situation secured.'
        : 'Final safety clearance pending on-scene resolution.',
      time: formatTime(incident.resolved_at),
      state: isResolved || isCancelled ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="py-2" aria-label="Incident response timeline">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-200">
        {steps.map((step, idx) => {
          return (
            <div key={idx} className="relative group">
              {/* Timeline marker icon */}
              <div className="absolute -left-6 top-0.5 flex items-center justify-center">
                {step.state === 'completed' ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={13} />
                  </div>
                ) : step.state === 'active' ? (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse shadow-sm shadow-amber-400">
                    <Clock size={12} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-surface-100 border-2 border-surface-300 text-surface-400 flex items-center justify-center">
                    <Circle size={8} />
                  </div>
                )}
              </div>

              {/* Step details */}
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={cn(
                      'text-xs font-bold leading-none',
                      step.state === 'completed'
                        ? 'text-surface-900'
                        : step.state === 'active'
                        ? 'text-amber-800'
                        : 'text-surface-400'
                    )}
                  >
                    {step.title}
                  </h4>
                  {step.time && (
                    <span className="text-[11px] font-mono text-surface-400 flex-shrink-0">
                      {step.time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isResolved && (
        <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>This emergency incident has been successfully concluded and secured.</span>
        </div>
      )}
    </div>
  );
}
