import type { ElementType } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, AlertTriangle, Stethoscope, Flame,
  ShieldAlert, MapPin, Car, Package, Bell, User, LogOut, CheckCircle2
} from 'lucide-react';
import { APP_NAME } from '../../lib/env';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../types';
import { UserRoleBadge } from '../ui/UserRoleBadge';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarNavItem {
  label: string;
  path: string;
  icon: ElementType;
  badge?: number;
  iconColor?: string;
  badgeColor?: string;
}

interface SidebarProps {
  role?: UserRole;
  userName?: string;
  userAvatar?: string;
  items?: SidebarNavItem[];
}

const defaultItems: SidebarNavItem[] = [
  { label: 'Dashboard',    path: '/dashboard',     icon: LayoutDashboard, iconColor: 'text-brand-400' },
  { label: 'Emergency',    path: '/emergency',      icon: AlertTriangle,   iconColor: 'text-rose-400', badgeColor: 'bg-rose-500' },
  { label: 'Medical',      path: '/emergency',      icon: Stethoscope,     iconColor: 'text-teal-400' },
  { label: 'Fire',         path: '/emergency',      icon: Flame,           iconColor: 'text-orange-400' },
  { label: 'Security',     path: '/emergency',      icon: ShieldAlert,     iconColor: 'text-indigo-400' },
  { label: 'Safety Map',   path: '/safety-map',     icon: MapPin,          iconColor: 'text-amber-400' },
  { label: 'RideShare',    path: '/rides',          icon: Car,             iconColor: 'text-blue-400' },
  { label: 'Lost & Found', path: '/lost-found',     icon: Package,         iconColor: 'text-purple-400' },
  { label: 'Notifications',path: '/notifications',  icon: Bell,            iconColor: 'text-cyan-400', badge: 2, badgeColor: 'bg-cyan-500' },
  { label: 'Profile',      path: '/profile',        icon: User,            iconColor: 'text-slate-400' },
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
      className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0a0f1d] border-r border-slate-800/80 h-screen sticky top-0 z-20 flex-shrink-0 text-slate-300 select-none shadow-2xl"
      aria-label="Application sidebar"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/70 flex-shrink-0 bg-gradient-to-b from-[#0e162a] to-[#0a0f1d]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/25 ring-2 ring-brand-400/20">
          <Shield size={20} className="text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <span className="text-base font-extrabold text-white tracking-tight leading-none block">
            {APP_NAME}
          </span>
          <span className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase mt-1 block">
            Campus Safety Platform
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1 scrollbar-hide" aria-label="Sidebar navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Main Menu
        </div>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.path}-${item.label}-${idx}`}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/25 via-brand-600/15 to-transparent text-white font-semibold border-l-4 border-brand-400 shadow-sm shadow-brand-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )
              }
              aria-label={item.badge ? `${item.label} — ${item.badge} unread` : item.label}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={cn(
                      'transition-transform duration-200 group-hover:scale-110 flex-shrink-0',
                      isActive ? 'text-brand-300' : item.iconColor || 'text-slate-400'
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span
                      className={cn(
                        'min-w-5 h-5 px-1.5 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm',
                        item.badgeColor || 'bg-brand-500'
                      )}
                      aria-hidden="true"
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-800/80 p-4 bg-[#090d19]/90">
        <div className="mb-3 flex items-center justify-between">
          {displayRole && (
            <UserRoleBadge role={displayRole} size="sm" />
          )}
          {/* Online status indicator */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <Avatar name={displayName} src={displayAvatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
              {displayName}
              {isVerified && <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {profile?.email || 'Active Session'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

