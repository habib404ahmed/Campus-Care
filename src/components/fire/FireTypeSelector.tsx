// ============================================================
// Campus Care — FireTypeSelector Component
// ============================================================

import { Flame, Cloud, Zap, Fuel, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { FireType } from '../../types/database';
import { cn } from '../../lib/utils';

interface FireTypeOption {
  id: FireType;
  label: string;
  emoji: string;
  icon: typeof Flame;
  desc: string;
  tip?: string;
  color: string;
  borderActive: string;
  bgActive: string;
}

const fireTypeOptions: FireTypeOption[] = [
  {
    id: 'fire',
    label: 'Active Fire',
    emoji: '🔥',
    icon: Flame,
    desc: 'Flames visible, spreading fire, or burning material',
    tip: 'Evacuate immediately via designated emergency stairwells.',
    color: 'text-orange-600',
    borderActive: 'border-orange-500 ring-2 ring-orange-500/20',
    bgActive: 'bg-orange-50/70',
  },
  {
    id: 'smoke',
    label: 'Smoke / Odor',
    emoji: '💨',
    icon: Cloud,
    desc: 'Dense smoke, burning smell, or haze detected',
    tip: 'Stay low if smoke is heavy; cover mouth and nose.',
    color: 'text-slate-600',
    borderActive: 'border-slate-500 ring-2 ring-slate-500/20',
    bgActive: 'bg-slate-50',
  },
  {
    id: 'electrical',
    label: 'Electrical Fire',
    emoji: '⚡',
    icon: Zap,
    desc: 'Sparks, circuit board, wiring, or appliance fire',
    tip: '⚠️ Do not touch exposed electrical equipment or use water.',
    color: 'text-amber-600',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
    bgActive: 'bg-amber-50/70',
  },
  {
    id: 'gas',
    label: 'Gas Leak',
    emoji: '🛢️',
    icon: Fuel,
    desc: 'Strong sulfur/gas odor, hissing sound, or pipe rupture',
    tip: '⚠️ Do not approach suspected leak or flip electrical switches.',
    color: 'text-rose-600',
    borderActive: 'border-rose-500 ring-2 ring-rose-500/20',
    bgActive: 'bg-rose-50/70',
  },
  {
    id: 'other',
    label: 'Hazard / Other',
    emoji: '⚠️',
    icon: AlertTriangle,
    desc: 'Overheating hazard, flammable spillage, or other risk',
    tip: 'Report condition and steer students away from the area.',
    color: 'text-red-600',
    borderActive: 'border-red-500 ring-2 ring-red-500/20',
    bgActive: 'bg-red-50/70',
  },
];

interface FireTypeSelectorProps {
  value: FireType;
  onChange: (val: FireType) => void;
  disabled?: boolean;
}

export function FireTypeSelector({ value, onChange, disabled }: FireTypeSelectorProps) {
  const selectedOption = fireTypeOptions.find((o) => o.id === value);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1">
          Select Fire & Hazard Type <span className="text-emergency-500">*</span>
        </label>
        <p className="text-xs text-surface-500">
          Identify the primary nature of the fire or hazard to dispatch appropriate suppression equipment.
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
        role="radiogroup"
        aria-label="Fire emergency type selection"
      >
        {fireTypeOptions.map((opt) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={cn(
                'p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between',
                isSelected
                  ? `${opt.borderActive} ${opt.bgActive} shadow-sm`
                  : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50/70 bg-white',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
                  <span className="font-bold text-sm text-surface-900">{opt.label}</span>
                </div>
                <Icon size={16} className={cn(isSelected ? opt.color : 'text-surface-400')} />
              </div>
              <p className="text-[11px] text-surface-500 leading-tight">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Contextual brief safety reminder */}
      {selectedOption?.tip && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
          <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Safety Reminder: </strong>
            <span>{selectedOption.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}
