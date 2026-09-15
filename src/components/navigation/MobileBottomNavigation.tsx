import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, MapPin, Car, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  isSpecial?: boolean;
}

const defaultItems: BottomNavItem[] = [
  { label: 'Home',      path: '/dashboard',     icon: LayoutDashboard },
  { label: 'Safety Map',path: '/safety-map',     icon: MapPin },
  { label: 'Emergency', path: '/emergency',      icon: AlertTriangle, isSpecial: true },
  { label: 'Rides',     path: '/rides',          icon: Car },
  { label: 'Alerts',    path: '/notifications',  icon: Bell, badge: 2 },
];

interface MobileBottomNavigationProps {
  items?: BottomNavItem[];
}

export function MobileBottomNavigation({ items = defaultItems }: MobileBottomNavigationProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-3 left-3 right-3 z-30 bg-[#0a0f1d]/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/50"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isEmergency = item.isSpecial;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all relative py-1.5',
                  isEmergency && '-mt-3',
                  isActive
                    ? isEmergency ? 'text-rose-400' : 'text-brand-400 font-bold'
                    : isEmergency ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
                )
              }
              aria-label={item.badge ? `${item.label} — ${item.badge} unread` : item.label}
            >
              {({ isActive }) => (
                <>
                  {isEmergency ? (
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 border-2 border-slate-900 transition-transform active:scale-90',
                        isActive ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950 scale-105' : ''
                      )}>
                        <Icon size={22} className="animate-pulse" aria-hidden="true" />
                      </div>
                      <span className="text-[10px] font-extrabold text-rose-400 tracking-tight mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Icon
                          size={20}
                          className={cn('transition-transform', isActive && 'scale-110')}
                          aria-hidden="true"
                        />
                        {item.badge != null && item.badge > 0 && (
                          <span
                            className="absolute -top-1.5 -right-2 w-4 h-4 bg-cyan-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm"
                            aria-hidden="true"
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className={cn('text-[10px] leading-none', isActive ? 'text-white' : 'text-slate-400')}>
                        {item.label}
                      </span>
                      {isActive && (
                        <span
                          className="absolute bottom-1 w-5 h-0.5 bg-brand-400 rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
