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
      <p className="text-sm text-surface-500 font-medium">{message}</p>
    </div>
  );
}

// --- Skeleton Loaders ---
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5 space-y-3.5', className)} aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
        <div className="w-16 h-5 rounded-md skeleton-shimmer" />
      </div>
      <div className="w-24 h-8 rounded-lg skeleton-shimmer" />
      <div className="w-36 h-4 rounded-md skeleton-shimmer" />
    </div>
  );
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 rounded skeleton-shimmer" />
            <div className="w-2/3 h-3 rounded skeleton-shimmer" />
          </div>
          <div className="w-16 h-6 rounded-full skeleton-shimmer flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)} aria-hidden="true">
      <div className="h-28 rounded-3xl skeleton-shimmer" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl skeleton-shimmer" />
        <div className="h-72 rounded-2xl skeleton-shimmer" />
      </div>
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
      <div className="w-16 h-16 rounded-2xl bg-emergency-50 flex items-center justify-center mb-4 border border-emergency-200/60 shadow-sm">
        <span className="text-3xl" aria-hidden="true">⚠️</span>
      </div>
      <h3 className="text-base font-bold text-surface-900">{title}</h3>
      <p className="text-sm text-surface-500 mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-md btn-secondary cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
