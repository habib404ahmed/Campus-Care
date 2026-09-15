// ============================================================
// Campus Care — SafetyConcernSelector Component
// ============================================================

import {
  Lightbulb,
  Footprints,
  Route,
  HardHat,
  AlertCircle,
  Dog,
  Eye,
  ShieldAlert,
  Lock,
  Building,
  HelpCircle,
} from 'lucide-react';
import type { SafetyConcernType } from '../../types/database';
import { cn } from '../../lib/utils';

export interface SafetyConcernOption {
  id: SafetyConcernType;
  label: string;
  emoji: string;
  icon: typeof Lightbulb;
  desc: string;
  color: string;
  borderActive: string;
  bgActive: string;
}

export const safetyConcernOptions: SafetyConcernOption[] = [
  {
    id: 'poor_lighting',
    label: 'Poor Lighting',
    emoji: '💡',
    icon: Lightbulb,
    desc: 'Broken streetlamp, dark sidewalk, non-functioning lighting',
    color: 'text-amber-600',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
    bgActive: 'bg-amber-50/80',
  },
  {
    id: 'isolated_area',
    label: 'Isolated Area',
    emoji: '🚶',
    icon: Footprints,
    desc: 'Low footfall, remote corner, deserted after hours',
    color: 'text-purple-600',
    borderActive: 'border-purple-500 ring-2 ring-purple-500/20',
    bgActive: 'bg-purple-50/80',
  },
  {
    id: 'unsafe_pathway',
    label: 'Unsafe Pathway',
    emoji: '🛣️',
    icon: Route,
    desc: 'Uneven paving, steep embankment, blind turns or bushes',
    color: 'text-sky-600',
    borderActive: 'border-sky-500 ring-2 ring-sky-500/20',
    bgActive: 'bg-sky-50/80',
  },
  {
    id: 'construction_hazard',
    label: 'Construction Hazard',
    emoji: '🚧',
    icon: HardHat,
    desc: 'Open trench, unsecured scaffolding, building debris',
    color: 'text-orange-600',
    borderActive: 'border-orange-500 ring-2 ring-orange-500/20',
    bgActive: 'bg-orange-50/80',
  },
  {
    id: 'damaged_surface',
    label: 'Damaged Surface',
    emoji: '🕳️',
    icon: AlertCircle,
    desc: 'Pothole, slippery oil/algae, broken stairs or manhole',
    color: 'text-stone-600',
    borderActive: 'border-stone-500 ring-2 ring-stone-500/20',
    bgActive: 'bg-stone-50/80',
  },
  {
    id: 'animal_concern',
    label: 'Animal Concern',
    emoji: '🐕',
    icon: Dog,
    desc: 'Aggressive stray animals, dog packs, pest hazard',
    color: 'text-emerald-600',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
    bgActive: 'bg-emerald-50/80',
  },
  {
    id: 'suspicious_activity',
    label: 'Suspicious Activity',
    emoji: '👤',
    icon: Eye,
    desc: 'Unusual loitering, vehicle circling, trespassing',
    color: 'text-indigo-600',
    borderActive: 'border-indigo-500 ring-2 ring-indigo-500/20',
    bgActive: 'bg-indigo-50/80',
  },
  {
    id: 'harassment_concern',
    label: 'Harassment Concern',
    emoji: '⚠️',
    icon: ShieldAlert,
    desc: 'Stalking, catcalling, intimidation, recurring hotspot',
    color: 'text-rose-600',
    borderActive: 'border-rose-500 ring-2 ring-rose-500/20',
    bgActive: 'bg-rose-50/80',
  },
  {
    id: 'security_concern',
    label: 'Security Concern',
    emoji: '🔐',
    icon: Lock,
    desc: 'Unmanned security booth, broken gate lock, camera blind spot',
    color: 'text-blue-600',
    borderActive: 'border-blue-500 ring-2 ring-blue-500/20',
    bgActive: 'bg-blue-50/80',
  },
  {
    id: 'general_safety',
    label: 'General Safety Issue',
    emoji: '🏫',
    icon: Building,
    desc: 'Missing handrail, water logging, structural issue',
    color: 'text-teal-600',
    borderActive: 'border-teal-500 ring-2 ring-teal-500/20',
    bgActive: 'bg-teal-50/80',
  },
  {
    id: 'other',
    label: 'Other Concern',
    emoji: '❓',
    icon: HelpCircle,
    desc: 'Other physical hazard or safety consideration',
    color: 'text-surface-600',
    borderActive: 'border-surface-500 ring-2 ring-surface-500/20',
    bgActive: 'bg-surface-50/80',
  },
];

interface SafetyConcernSelectorProps {
  value: SafetyConcernType;
  onChange: (type: SafetyConcernType) => void;
  disabled?: boolean;
}

export function SafetyConcernSelector({
  value,
  onChange,
  disabled = false,
}: SafetyConcernSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block">
        Select Safety Concern <span className="text-emergency-500">*</span>
      </label>
      <div
        role="radiogroup"
        aria-label="Safety Concern Category"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1"
      >
        {safetyConcernOptions.map((opt) => {
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
                'flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer',
                'focus:outline-hidden focus:ring-2 focus:ring-brand-500/40',
                isSelected
                  ? `${opt.borderActive} ${opt.bgActive} shadow-xs`
                  : 'border-surface-200 hover:border-surface-300 bg-white hover:bg-surface-50/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
                  isSelected ? 'bg-white shadow-xs' : 'bg-surface-100 text-surface-600'
                )}
              >
                <span>{opt.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-extrabold tracking-tight truncate', opt.color)}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-surface-500 leading-snug line-clamp-2 mt-0.5">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
