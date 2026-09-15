// ============================================================
// Campus Care — MedicalSeveritySelector Component
// ============================================================

import type { IncidentPriority } from '../../types/database';
import { cn } from '../../lib/utils';

interface SeverityOption {
  id: IncidentPriority;
  label: string;
  emoji: string;
  tag: string;
  description: string;
  bg: string;
  border: string;
  activeRing: string;
}

const severityOptions: SeverityOption[] = [
  {
    id: 'low',
    label: 'Low',
    emoji: '🟢',
    tag: 'Non-Urgent',
    description: 'Minor scrape, mild headache, simple sprain.',
    bg: 'hover:bg-emerald-50/50',
    border: 'border-emerald-200',
    activeRing: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-400',
  },
  {
    id: 'medium',
    label: 'Moderate',
    emoji: '🟡',
    tag: 'Needs Attention',
    description: 'Deep cut, intense nausea, mobility difficulty.',
    bg: 'hover:bg-amber-50/50',
    border: 'border-amber-200',
    activeRing: 'ring-2 ring-amber-500 bg-amber-50 border-amber-400',
  },
  {
    id: 'high',
    label: 'High',
    emoji: '🟠',
    tag: 'Urgent Response',
    description: 'Suspected fracture, severe pain, asthma flare-up.',
    bg: 'hover:bg-orange-50/50',
    border: 'border-orange-200',
    activeRing: 'ring-2 ring-orange-500 bg-orange-50 border-orange-400',
  },
  {
    id: 'critical',
    label: 'Critical',
    emoji: '🔴',
    tag: 'Immediate Danger',
    description: 'Unconscious, chest pain, uncontrolled bleeding.',
    bg: 'hover:bg-rose-50/50',
    border: 'border-rose-200',
    activeRing: 'ring-2 ring-rose-500 bg-rose-50 border-rose-400',
  },
];

interface MedicalSeveritySelectorProps {
  value: IncidentPriority;
  onChange: (val: IncidentPriority) => void;
  disabled?: boolean;
}

export function MedicalSeveritySelector({ value, onChange, disabled = false }: MedicalSeveritySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block">
          Severity Level <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-surface-500">Helps medical team prioritize</span>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        role="radiogroup"
        aria-label="Medical emergency severity levels"
      >
        {severityOptions.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={cn(
                'text-left p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-2.5',
                opt.bg,
                isSelected ? opt.activeRing : `${opt.border} bg-white shadow-xs`,
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {opt.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-surface-900">{opt.label}</span>
                  <span className="text-[10px] font-semibold text-surface-500">{opt.tag}</span>
                </div>
                <p className="text-[11px] text-surface-600 leading-snug">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
