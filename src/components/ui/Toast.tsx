import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Toast } from '../../hooks/useToast';

const icons = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const colorClasses = {
  success: 'bg-safe-50 border-safe-200 text-safe-800',
  error:   'bg-emergency-50 border-emergency-200 text-emergency-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info:    'bg-info-50 border-info-200 text-info-800',
};

const iconColors = {
  success: 'text-safe-500',
  error:   'text-emergency-500',
  warning: 'text-warning-500',
  info:    'text-info-500',
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card-lg',
        'animate-slide-in-right min-w-72 max-w-sm w-full',
        colorClasses[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} className={cn('flex-shrink-0 mt-0.5', iconColors[toast.type])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-sm mt-0.5 opacity-80 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
