import { cn } from '../../lib/utils';

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  color?: 'emergency' | 'warning' | 'safe' | 'info' | 'brand' | 'neutral';
  onClick?: () => void;
  className?: string;
}

const colorConfig = {
  emergency: {
    bg: 'bg-emergency-50',
    border: 'border-emergency-100',
    emoji: 'bg-emergency-100',
    title: 'text-emergency-800',
    hover: 'hover:bg-emergency-100 hover:border-emergency-200',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    emoji: 'bg-warning-100',
    title: 'text-warning-800',
    hover: 'hover:bg-warning-100 hover:border-warning-200',
  },
  safe: {
    bg: 'bg-safe-50',
    border: 'border-safe-100',
    emoji: 'bg-safe-100',
    title: 'text-safe-800',
    hover: 'hover:bg-safe-100 hover:border-safe-200',
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-100',
    emoji: 'bg-info-100',
    title: 'text-info-800',
    hover: 'hover:bg-info-100 hover:border-info-200',
  },
  brand: {
    bg: 'bg-brand-50',
    border: 'border-brand-100',
    emoji: 'bg-brand-100',
    title: 'text-brand-800',
    hover: 'hover:bg-brand-100 hover:border-brand-200',
  },
  neutral: {
    bg: 'bg-surface-50',
    border: 'border-surface-200',
    emoji: 'bg-surface-100',
    title: 'text-surface-800',
    hover: 'hover:bg-surface-100 hover:border-surface-300',
  },
};

export function FeatureCard({ emoji, title, description, color = 'brand', onClick, className }: FeatureCardProps) {
  const colors = colorConfig[color];
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cn(
        'w-full text-left rounded-2xl border p-5 transition-all duration-200 group',
        colors.bg,
        colors.border,
        onClick && `cursor-pointer ${colors.hover} active:scale-[0.98]`,
        className
      )}
      onClick={onClick}
      {...(onClick ? { type: 'button' as const } : {})}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110', colors.emoji)}>
        {emoji}
      </div>
      <h3 className={cn('font-semibold text-sm leading-tight', colors.title)}>{title}</h3>
      <p className="text-xs text-surface-500 mt-1 leading-relaxed">{description}</p>
    </Tag>
  );
}

interface QuickActionCardProps {
  emoji: string;
  label: string;
  description?: string;
  color?: 'emergency' | 'warning' | 'safe' | 'info' | 'brand' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export function QuickActionCard({ emoji, label, description, color = 'brand', onClick, className }: QuickActionCardProps) {
  const colors = colorConfig[color];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 w-full group shadow-sm',
        'hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.98] cursor-pointer',
        colors.bg,
        colors.border,
        colors.hover,
        className
      )}
      aria-label={label}
    >
      <span className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1 shadow-sm transition-transform duration-200 group-hover:scale-110',
        colors.emoji
      )}>
        {emoji}
      </span>
      <span className={cn('text-xs font-bold leading-snug', colors.title)}>{label}</span>
      {description && (
        <span className="text-[10px] text-surface-500 line-clamp-1 mt-0.5 leading-tight">{description}</span>
      )}
    </button>
  );
}
