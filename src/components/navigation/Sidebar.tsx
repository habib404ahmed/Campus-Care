import type { ElementType } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, AlertTriangle, MapPin, Car, Package,
  Bell, User, LogOut, CheckCircle2
} from 'lucide-react';
import { APP_NAME } from '../../lib/env';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../types';
import { UserRoleBadge } from '../ui/UserRoleBadge';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

interface SidebarNavItem {
  label: string;
  path: string;
  icon: ElementType;
  badge?: number;
}

interface SidebarProps {
  role?: UserRole;
  userName?: string;
  userAvatar?: string;
  items?: SidebarNavItem[];
}

const defaultItems: SidebarNavItem[] = [
  { label: 'Dashboard',    path: '/dashboard',      icon: LayoutDashboard },
  { label: 'Emergency',    path: '/emergency',       icon: AlertTriangle },
  { label: 'Campus Map',   path: '/map',             icon: MapPin },
  { label: 'RideShare',    path: '/rides',           icon: Car },
  { label: 'Lost & Found', path: '/lost-found',      icon: Package },
  { label: 'Notifications',path: '/notifications',   icon: Bell, badge: 2 },
  { label: 'Profile',      path: '/profile',         icon: User },
];

export function Sidebar({ role, userName, userAvatar, items = defaultItems }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = userName || profile?.full_name || 'Campus User';
  const displayRole = role || (profile?.role === 'worker' ? (profile.worker_department || 'security') : profile?.role) as UserRole | undefined;
  const displayAvatar = userAvatar || profile?.avatar_url || undefined;
  const isVerified = profile?.is_verified ?? false;

  return (
    <aside
      className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-surface-200 h-screen sticky top-0 z-20 flex-shrink-0"
      aria-label="Application sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-surface-100 flex-shrink-0">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-base font-bold text-surface-900 tracking-tight">{APP_NAME}</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5" aria-label="Sidebar navigation">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(isActive ? 'nav-item-active' : 'nav-item')
              }
              aria-label={item.badge ? `${item.label} — ${item.badge} unread` : item.label}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="w-5 h-5 bg-emergency-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-surface-100 p-4">
        {displayRole && (
          <div className="mb-3 flex items-center justify-between">
            <UserRoleBadge role={displayRole} size="sm" />
            {isVerified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <Avatar name={displayName} src={displayAvatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900 truncate">{displayName}</p>
            <p className="text-xs text-surface-500 truncate">
              {profile?.email || 'Signed in'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="p-1.5 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
