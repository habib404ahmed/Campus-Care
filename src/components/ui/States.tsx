import React from 'react';
import { SearchX, FolderOpen, Bell, MapPin, Car, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

type EmptyStateVariant = 'generic' | 'search' | 'folder' | 'notifications' | 'map' | 'rides' | 'lost-found';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

const variantDefaults: Record<EmptyStateVariant, { icon: React.ElementType; title: string; message: string }> = {
  generic:       { icon: FolderOpen,   title: 'Nothing here yet',          message: 'No items to display.' },
  search:        { icon: SearchX,      title: 'No results found',          message: 'Try adjusting your search or filters.' },
  folder:        { icon: FolderOpen,   title: 'Empty',                     message: 'No records available.' },
  notifications: { icon: Bell,         title: 'All caught up!',            message: 'You have no new notifications.' },
  map:           { icon: MapPin,       title: 'Map loading',               message: 'Map data will appear here.' },
  rides:         { icon: Car,          title: 'No rides available',        message: 'No campus rides are scheduled right now.' },
  'lost-found':  { icon: Package,      title: 'No items reported',         message: 'Lost or found items will appear here.' },
};

export function EmptyState({ variant = 'generic', title, message, action, className }: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const Icon = defaults.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-surface-700">{title ?? defaults.title}</h3>
      <p className="text-sm text-surface-500 mt-1 max-w-xs">{message ?? defaults.message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// --- Loading State ---
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6', className)} role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" aria-hidden="true" />
      <p className="text-sm text-surface-500">{message}</p>
    </div>
  );
}

// --- Error State ---
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', message = 'An error occurred. Please try again.', onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)} role="alert">
      <div className="w-16 h-16 rounded-2xl bg-emergency-50 flex items-center justify-center mb-4">
        <span className="text-3xl" aria-hidden="true">⚠️</span>
      </div>
      <h3 className="text-base font-semibold text-surface-800">{title}</h3>
      <p className="text-sm text-surface-500 mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-md btn-secondary"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
