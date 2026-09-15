// ============================================================
// Campus Care — SecurityCategorySelector Component
// ============================================================

import {
  Lock,
  ShoppingBag,
  AlertCircle,
  Hammer,
  AlertTriangle,
  UserX,
  ShieldCheck,
  Package,
  FileText,
} from 'lucide-react';
import type { SecurityCategory } from '../../types/database';
import { cn } from '../../lib/utils';

export interface SecurityCategoryOption {
  id: SecurityCategory;
  label: string;
  emoji: string;
  icon: typeof Lock;
  desc: string;
  color: string;
  borderActive: string;
  bgActive: string;
}

export const securityCategoryOptions: SecurityCategoryOption[] = [
  {
    id: 'unauthorized_access',
    label: 'Unauthorized Access',
    emoji: '🔐',
    icon: Lock,
    desc: 'Trespassing, forced entry, or unbadged access in restricted areas',
    color: 'text-amber-600',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
    bgActive: 'bg-amber-50/70',
  },
  {
    id: 'theft',
    label: 'Theft / Missing Items',
    emoji: '👜',
    icon: ShoppingBag,
    desc: 'Stolen laptop, bag, wallet, bicycle, or personal property',
    color: 'text-blue-600',
    borderActive: 'border-blue-500 ring-2 ring-blue-500/20',
    bgActive: 'bg-blue-50/70',
  },
  {
    id: 'suspicious_activity',
    label: 'Suspicious Activity',
    emoji: '🚨',
    icon: AlertCircle,
    desc: 'Unusual loitering, unattended bags, or concerning behavior',
    color: 'text-orange-600',
    borderActive: 'border-orange-500 ring-2 ring-orange-500/20',
    bgActive: 'bg-orange-50/70',
  },
  {
    id: 'vandalism',
    label: 'Vandalism / Damage',
    emoji: '🧱',
    icon: Hammer,
    desc: 'Defaced walls, broken windows, damaged facilities, or graffiti',
    color: 'text-purple-600',
    borderActive: 'border-purple-500 ring-2 ring-purple-500/20',
    bgActive: 'bg-purple-50/70',
  },
  {
    id: 'threatening_behavior',
    label: 'Threatening Behavior',
    emoji: '⚠️',
    icon: AlertTriangle,
    desc: 'Intimidation, verbal threats, aggressive posturing, or weapon concern',
    color: 'text-rose-600',
    borderActive: 'border-rose-500 ring-2 ring-rose-500/20',
    bgActive: 'bg-rose-50/70',
  },
  {
    id: 'harassment',
    label: 'Harassment / Stalking',
    emoji: '🤝',
    icon: UserX,
    desc: 'Unwanted following, persistent targeting, or verbal harassment',
    color: 'text-red-600',
    borderActive: 'border-red-500 ring-2 ring-red-500/20',
    bgActive: 'bg-red-50/70',
  },
  {
    id: 'safety_concern',
    label: 'Campus Safety Concern',
    emoji: '🏫',
    icon: ShieldCheck,
    desc: 'Broken lights, open gates, slippery areas, or dark pathways',
    color: 'text-teal-600',
    borderActive: 'border-teal-500 ring-2 ring-teal-500/20',
    bgActive: 'bg-teal-50/70',
  },
  {
    id: 'property_issue',
    label: 'Property / Item Issue',
    emoji: '📦',
    icon: Package,
    desc: 'Lost gear, damaged campus lockers, or unattended lab equipment',
    color: 'text-indigo-600',
    borderActive: 'border-indigo-500 ring-2 ring-indigo-500/20',
    bgActive: 'bg-indigo-50/70',
  },
  {
    id: 'other',
    label: 'Other Concern',
    emoji: '📝',
    icon: FileText,
    desc: 'Any other safety or security observation not listed above',
    color: 'text-slate-600',
    borderActive: 'border-slate-500 ring-2 ring-slate-500/20',
    bgActive: 'bg-slate-50',
  },
];

interface SecurityCategorySelectorProps {
  value: SecurityCategory;
  onChange: (val: SecurityCategory) => void;
  disabled?: boolean;
}

export function SecurityCategorySelector({
  value,
  onChange,
  disabled,
}: SecurityCategorySelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-surface-800 uppercase tracking-wider block mb-1">
          Select Security Category <span className="text-emergency-500">*</span>
        </label>
        <p className="text-xs text-surface-500">
          Choose the category that best matches your observation for efficient dispatch and logging.
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
        role="radiogroup"
        aria-label="Security report category selection"
      >
        {securityCategoryOptions.map((opt) => {
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
                  <span className="text-xl" aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span className="font-bold text-sm text-surface-900">{opt.label}</span>
                </div>
                <Icon size={16} className={cn(isSelected ? opt.color : 'text-surface-400')} />
              </div>
              <p className="text-[11px] text-surface-500 leading-tight">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
