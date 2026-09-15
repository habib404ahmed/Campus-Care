import { useState } from 'react';
import type { ReactNode } from 'react';
import { Shield, ChevronDown, User, LogOut, ExternalLink } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { MobileBottomNavigation } from '../components/navigation/MobileBottomNavigation';
import { GlobalSOSButton } from '../components/GlobalSOSButton';
import { NotificationBell } from '../components/ui/NotificationItem';
import { Avatar } from '../components/ui/Avatar';
import { UserRoleBadge } from '../components/ui/UserRoleBadge';
import { PageBackground } from '../components/ui/PageBackground';
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
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const effectiveName = userName || profile?.full_name || 'Campus User';
  const effectiveRole = role || (profile?.role === 'worker' ? (profile.worker_department || 'security') : profile?.role) as UserRole | undefined;
  const effectiveAvatar = userAvatar || profile?.avatar_url || undefined;

  // Determine friendly desktop header page title
  const getPageTitle = (path: string) => {
    if (path.startsWith('/emergency')) return 'Emergency Response Center';
    if (path.startsWith('/safety-map')) return 'Campus Safety Map';
    if (path.startsWith('/rides')) return 'Campus RideShare';
    if (path.startsWith('/lost-found')) return 'Lost & Found Registry';
    if (path.startsWith('/notifications')) return 'Notification Center';
    if (path.startsWith('/profile')) return 'User Profile & Settings';
    if (path.startsWith('/admin')) return 'Operations Command Center';
    if (path.startsWith('/medical')) return 'Medical Response Operations';
    if (path.startsWith('/fire')) return 'Fire & Hazard Operations';
    if (path.startsWith('/security')) return 'Campus Security Operations';
    return 'Dashboard Overview';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Desktop Dark Navy Sidebar */}
      <Sidebar role={effectiveRole} userName={effectiveName} userAvatar={effectiveAvatar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Desktop Glass Header */}
        <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200/80 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-surface-900 tracking-tight">
              {getPageTitle(location.pathname)}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell
              count={unreadNotifications}
              onClick={() => navigate('/notifications')}
            />

            <div className="h-6 w-px bg-surface-200" />

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <Avatar name={effectiveName} src={effectiveAvatar} size="sm" />
                <div className="text-left leading-tight hidden xl:block">
                  <p className="text-xs font-bold text-surface-900 truncate max-w-[130px]">{effectiveName}</p>
                  {effectiveRole && (
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide">
                      {effectiveRole}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={cn('text-surface-400 transition-transform duration-200', isProfileMenuOpen && 'rotate-180')} />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsProfileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-200/80 py-2 z-40 animate-slide-up">
                    <div className="px-4 py-2 border-b border-surface-100">
                      <p className="text-xs font-bold text-surface-900">{effectiveName}</p>
                      <p className="text-[11px] text-surface-400 truncate">{profile?.email || 'Signed in'}</p>
                      {effectiveRole && (
                        <div className="mt-1.5">
                          <UserRoleBadge role={effectiveRole} size="sm" />
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}
                        className="w-full text-left px-4 py-2 text-xs text-surface-700 hover:bg-surface-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User size={14} className="text-surface-400" />
                        <span>View Profile & Settings</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsProfileMenuOpen(false); navigate('/safety-map'); }}
                        className="w-full text-left px-4 py-2 text-xs text-surface-700 hover:bg-surface-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={14} className="text-surface-400" />
                        <span>Open Safety Map</span>
                      </button>
                    </div>

                    <div className="border-t border-surface-100 pt-1">
                      <button
                        type="button"
                        onClick={() => { setIsProfileMenuOpen(false); handleSignOut(); }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut size={14} className="text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile top header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur-md border-b border-surface-200/80 flex-shrink-0 z-20">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-surface-900"
            aria-label={`${APP_NAME} — Home`}
          >
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
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
              className="cursor-pointer"
            >
              <Avatar name={effectiveName} src={effectiveAvatar} size="sm" />
            </button>
          </div>
        </header>

        {/* Scrollable page content with ambient gradient background */}
        <main
          id="main-content"
          className={cn(
            'flex-1 overflow-y-auto',
            // Extra bottom padding on mobile for bottom nav + SOS button
            'pb-24 lg:pb-10',
            'px-4 sm:px-6 lg:px-8',
            'pt-4 lg:pt-6'
          )}
          tabIndex={-1}
          aria-label="Main content"
        >
          <PageBackground>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </PageBackground>
        </main>
      </div>

      {/* Global SOS — FAB — shown for all dashboard users */}
      {showSOS && <GlobalSOSButton variant="fab" />}

      {/* Mobile floating bottom navigation */}
      <MobileBottomNavigation />
    </div>
  );
}

