// ============================================================
// Campus Care — WorkerDutyToggle Component
// ============================================================

import { useState } from 'react';
import type { WorkerDutyStatus } from '../../types/database';
import type { WorkerDepartment } from '../../types/auth';
import { workerService } from '../../lib/services/workerService';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface WorkerDutyToggleProps {
  initialStatus?: WorkerDutyStatus;
  department?: WorkerDepartment;
  onStatusChange?: (status: WorkerDutyStatus) => void;
}

export function WorkerDutyToggle({
  initialStatus = 'on_duty',
  department = 'security',
  onStatusChange,
}: WorkerDutyToggleProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<WorkerDutyStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const options: { id: WorkerDutyStatus; label: string; dot: string }[] = [
    { id: 'on_duty', label: 'On Duty', dot: 'bg-emerald-500' },
    { id: 'busy', label: 'Busy (On Scene)', dot: 'bg-amber-500' },
    { id: 'online', label: 'Online', dot: 'bg-blue-500' },
    { id: 'offline', label: 'Off Duty', dot: 'bg-slate-400' },
  ];

  const handleSelect = async (newStatus: WorkerDutyStatus) => {
    if (newStatus === status || loading) return;
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);

    if (user) {
      setLoading(true);
      try {
        await workerService.updateStatus(user.id, department, newStatus);
      } catch (err) {
        console.error('Failed to update worker status:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface-100 rounded-xl border border-surface-200 text-xs">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => handleSelect(opt.id)}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer',
            status === opt.id
              ? 'bg-white text-surface-900 shadow-xs font-bold'
              : 'text-surface-500 hover:text-surface-800'
          )}
        >
          <span className={cn('w-2 h-2 rounded-full', opt.dot)} />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
