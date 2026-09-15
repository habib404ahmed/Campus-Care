import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, MapPin, Car, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const defaultItems: BottomNavItem[] = [
  { label: 'Home',      path: '/dashboard',     icon: LayoutDashboard },
  { label: 'Emergency', path: '/emergency',      icon: AlertTriangle },
  { label: 'Map',       path: '/map',            icon: MapPin },
  { label: 'Rides',     path: '/rides',          icon: Car },
  { label: 'Alerts',    path: '/notifications',  icon: Bell, badge: 2 },
];

interface MobileBottomNavigationProps {
  items?: BottomNavItem[];
}

export function MobileBottomNavigation({ items = defaultItems }: MobileBottomNavigationProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-surface-200 safe-bottom"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors relative',
                  isActive
                    ? 'text-brand-600'
                    : 'text-surface-400 hover:text-surface-700'
                )
              }
              aria-label={item.badge ? `${item.label} — ${item.badge} unread` : item.label}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} aria-hidden="true" />
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emergency-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] leading-none">{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-600 rounded-full"
                      aria-hidden="true"
                    />
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
