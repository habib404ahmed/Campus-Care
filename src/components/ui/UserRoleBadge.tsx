import type { UserRole } from '../../types';
import { cn } from '../../lib/utils';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
  size?: 'sm' | 'md';
}

const roleConfig: Record<UserRole, { label: string; emoji: string; classes: string }> = {
  admin:     { label: 'Admin',    emoji: '👨‍💼', classes: 'bg-violet-100 text-violet-700' },
  student:   { label: 'Student',  emoji: '🎓', classes: 'bg-brand-100 text-brand-700' },
  teacher:   { label: 'Teacher',  emoji: '👨‍🏫', classes: 'bg-teal-100 text-teal-700' },
  faculty:   { label: 'Faculty',  emoji: '👨‍💼', classes: 'bg-indigo-100 text-indigo-700' },
  medical:   { label: 'Medical',  emoji: '🏥', classes: 'bg-emerald-100 text-emerald-700' },
  fire:      { label: 'Fire',     emoji: '🔥', classes: 'bg-orange-100 text-orange-700' },
  security:  { label: 'Security', emoji: '👮', classes: 'bg-slate-100 text-slate-700' },
};

export function UserRoleBadge({ role, className, size = 'md' }: UserRoleBadgeProps) {
  const config = roleConfig[role];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold', config.classes, sizeClass, className)}
      aria-label={`Role: ${config.label}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {config.label}
    </span>
  );
}
