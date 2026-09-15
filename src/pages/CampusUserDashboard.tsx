import { Bell, Car, Package, Shield } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { CampusStatusBadge } from '../components/ui/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { NotificationItem } from '../components/ui/NotificationItem';
import { QuickActionCard } from '../components/ui/FeatureCard';
import { MapContainer } from '../components/MapContainer';
import { UserRoleBadge } from '../components/ui/UserRoleBadge';
import { Card } from '../components/ui/Card';
import { mockCampusStatus, mockNotifications } from '../lib/mockData';
import type { CampusUserRole } from '../types';

interface CampusUserDashboardProps {
  role: CampusUserRole;
  userName?: string;
}

const roleGreeting: Record<CampusUserRole, string> = {
  student: 'Good morning, Student 👋',
  teacher: 'Good morning, Teacher 👋',
  faculty: 'Good morning 👋',
};

const quickActions = [
  { emoji: '🚨', label: 'Emergency',       color: 'emergency' as const },
  { emoji: '🏥', label: 'Medical',          color: 'safe' as const },
  { emoji: '🔥', label: 'Fire',             color: 'warning' as const },
  { emoji: '👮', label: 'Security',         color: 'info' as const },
  { emoji: '⚠️', label: 'Unsafe Area',     color: 'warning' as const },
  { emoji: '🚗', label: 'RideShare',        color: 'brand' as const },
  { emoji: '🔎', label: 'Lost & Found',     color: 'brand' as const },
];

export default function CampusUserDashboard({ role, userName }: CampusUserDashboardProps) {
  const displayName = userName ?? (role === 'student' ? 'Alex Johnson' : role === 'teacher' ? 'Prof. Williams' : 'Dr. Martinez');
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout role={role} userName={displayName} unreadNotifications={unreadCount}>
      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {roleGreeting[role].replace('👋', '')}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserRoleBadge role={role} />
          <CampusStatusBadge status={mockCampusStatus.overall} size="sm" />
        </div>
      </div>

      {/* Campus Status Banner */}
      <div className="card p-4 mb-6 flex items-center gap-3 bg-safe-50 border-safe-200">
        <div className="w-10 h-10 rounded-xl bg-safe-100 flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-safe-600" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-safe-800 text-sm">Campus Status</p>
          <p className="text-safe-600 text-xs">{mockCampusStatus.message}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading" className="mb-6">
        <h2 id="quick-actions-heading" className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              emoji={action.emoji}
              label={action.label}
              color={action.color}
              onClick={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Campus Map */}
        <div className="lg:col-span-2">
          <MapContainer height="h-64" />
        </div>

        {/* Stats column */}
        <div className="space-y-3">
          <StatCard
            label="Unread Alerts"
            value={unreadCount}
            color="emergency"
            icon={<Bell size={18} />}
          />
          <StatCard
            label="Active Rides"
            value="3"
            color="brand"
            icon={<Car size={18} />}
          />
          <StatCard
            label="Lost Items Near You"
            value="2"
            color="warning"
            icon={<Package size={18} />}
          />
        </div>
      </div>

      {/* Recent Notifications */}
      <Card padding="none" className="mb-4">
        <div className="px-5 pt-5 pb-3 border-b border-surface-100">
          <h2 className="font-bold text-surface-900">Recent Notifications</h2>
        </div>
        <div className="divide-y divide-surface-50">
          {mockNotifications.slice(0, 3).map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
        <div className="px-4 py-3 border-t border-surface-100">
          <a href="/notifications" className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors">
            View all notifications →
          </a>
        </div>
      </Card>
    </DashboardLayout>
  );
}
