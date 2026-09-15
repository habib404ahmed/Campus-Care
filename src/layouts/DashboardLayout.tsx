import type { ReactNode } from 'react';
import { Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { MobileBottomNavigation } from '../components/navigation/MobileBottomNavigation';
import { GlobalSOSButton } from '../components/GlobalSOSButton';
import { NotificationBell } from '../components/ui/NotificationItem';
import { Avatar } from '../components/ui/Avatar';
import { APP_NAME } from '../lib/env';
import { cn } from '../lib/utils';
import type { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
  role?: UserRole;
  userName?: string;
  userAvatar?: string;
  unreadNotifications?: number;
  showSOS?: boolean;
}

export function DashboardLayout({
  children,
  role,
  userName,
  userAvatar,
  unreadNotifications = 0,
  showSOS = true,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const effectiveName = userName || profile?.full_name || 'Campus User';
  const effectiveRole = role || (profile?.role === 'worker' ? (profile.worker_department || 'security') : profile?.role) as UserRole | undefined;
  const effectiveAvatar = userAvatar || profile?.avatar_url || undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Desktop Sidebar */}
      <Sidebar role={effectiveRole} userName={effectiveName} userAvatar={effectiveAvatar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-surface-200 flex-shrink-0 z-20">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-surface-900"
            aria-label={`${APP_NAME} — Home`}
          >
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-base tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell
              count={unreadNotifications}
              onClick={() => navigate('/notifications')}
            />
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Go to profile"
            >
              <Avatar name={effectiveName} src={effectiveAvatar} size="sm" />
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <main
          id="main-content"
          className={cn(
            'flex-1 overflow-y-auto',
            // Extra bottom padding on mobile for bottom nav + SOS button
            'pb-24 lg:pb-6',
            'px-4 sm:px-6 lg:px-8',
            'pt-4 lg:pt-6'
          )}
          tabIndex={-1}
          aria-label="Main content"
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global SOS — FAB — shown for all dashboard users */}
      {showSOS && <GlobalSOSButton variant="fab" />}

      {/* Mobile bottom navigation */}
      <MobileBottomNavigation />
    </div>
  );
}
