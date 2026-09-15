import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Notification } from '../../types';
import { formatRelativeTime } from '../../lib/mockData';

const typeConfig = {
  emergency: { icon: AlertTriangle, iconClass: 'text-emergency-500', bg: 'bg-emergency-50', dotClass: 'bg-emergency-500' },
  warning:   { icon: AlertTriangle, iconClass: 'text-warning-500',   bg: 'bg-warning-50',   dotClass: 'bg-warning-500' },
  info:      { icon: Info,          iconClass: 'text-info-500',       bg: 'bg-info-50',       dotClass: 'bg-info-500' },
  success:   { icon: CheckCircle,   iconClass: 'text-safe-500',       bg: 'bg-safe-50',       dotClass: 'bg-safe-500' },
};

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationItem({ notification, onClick, className }: NotificationItemProps) {
  const config = typeConfig[notification.type] ?? typeConfig.info;
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-150',
        'hover:bg-surface-50 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none',
        !notification.isRead && 'bg-brand-50/50',
        className
      )}
      aria-label={`${notification.title}: ${notification.message}`}
    >
      {/* Icon bubble */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', config.bg)}>
        <Icon size={16} className={config.iconClass} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold leading-tight', notification.isRead ? 'text-surface-700' : 'text-surface-900')}>
            {notification.title}
          </p>
          <time className="text-xs text-surface-400 flex-shrink-0 mt-0.5" dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>
        <p className="text-sm text-surface-500 mt-0.5 leading-snug line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span
          className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', config.dotClass)}
          aria-label="Unread"
        />
      )}
    </button>
  );
}

// --- Notification Bell with count ---
interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
      className="relative p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
    >
      <Bell size={20} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emergency-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
