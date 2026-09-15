import { useNavigate } from 'react-router-dom';
import {
  Bell, Car, Package, Shield, AlertTriangle, MapPin, ArrowRight, ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { CampusStatusBadge } from '../components/ui/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { NotificationItem } from '../components/ui/NotificationItem';
import { QuickActionCard } from '../components/ui/FeatureCard';
import { MapContainer } from '../components/MapContainer';
import { UserRoleBadge } from '../components/ui/UserRoleBadge';
import { mockCampusStatus, mockNotifications } from '../lib/mockData';
import type { CampusUserRole } from '../types';

interface CampusUserDashboardProps {
  role: CampusUserRole;
  userName?: string;
}

export default function CampusUserDashboard({ role, userName }: CampusUserDashboardProps) {
  const navigate = useNavigate();
  const displayName = userName ?? (role === 'student' ? 'Alex Johnson' : role === 'teacher' ? 'Prof. Williams' : 'Dr. Martinez');
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  const quickActions = [
    {
      emoji: '🚨',
      label: 'Emergency SOS',
      description: 'Immediate priority help',
      color: 'emergency' as const,
      onClick: () => navigate('/emergency'),
    },
    {
      emoji: '🩺',
      label: 'Medical Help',
      description: 'Doctor & ambulance',
      color: 'safe' as const,
      onClick: () => navigate('/emergency'),
    },
    {
      emoji: '🔥',
      label: 'Report Fire',
      description: 'Urgent hazard dispatch',
      color: 'warning' as const,
      onClick: () => navigate('/emergency'),
    },
    {
      emoji: '🛡️',
      label: 'Security Report',
      description: 'Campus patrol assistance',
      color: 'info' as const,
      onClick: () => navigate('/emergency'),
    },
    {
      emoji: '⚠️',
      label: 'Unsafe Location',
      description: 'Report dark or isolated area',
      color: 'warning' as const,
      onClick: () => navigate('/safety-map'),
    },
    {
      emoji: '🚗',
      label: 'Offer a Ride',
      description: 'Share campus commute',
      color: 'brand' as const,
      onClick: () => navigate('/rides'),
    },
    {
      emoji: '🔎',
      label: 'Lost & Found',
      description: 'Recover campus property',
      color: 'brand' as const,
      onClick: () => navigate('/lost-found'),
    },
  ];

  return (
    <DashboardLayout role={role} userName={displayName} unreadNotifications={unreadCount}>
      {/* ── DASHBOARD HERO BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a0f1d] via-[#111c35] to-[#0a0f1d] p-6 sm:p-8 mb-8 text-white shadow-xl border border-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserRoleBadge role={role} size="sm" />
              <span className="text-xs text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, {displayName} 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Everything you need to stay safe, informed, and connected across campus.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <CampusStatusBadge status={mockCampusStatus.overall} size="md" />
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS TILES ──────────────────────────────────── */}
      <section aria-labelledby="quick-actions-heading" className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 id="quick-actions-heading" className="text-sm font-bold uppercase tracking-wider text-surface-500">
            Quick Actions
          </h2>
          <span className="text-xs text-surface-400">Click to launch service</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              emoji={action.emoji}
              label={action.label}
              description={action.description}
              color={action.color}
              onClick={action.onClick}
            />
          ))}
        </div>
      </section>

      {/* ── DASHBOARD METRIC CARDS ────────────────────────────────── */}
      <section aria-labelledby="metrics-heading" className="mb-8">
        <h2 id="metrics-heading" className="sr-only">Live Campus Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            label="Active Emergencies"
            value="03"
            color="emergency"
            isLive={true}
            change="3 Live"
            trend="down"
            icon={<AlertTriangle size={20} />}
            subtitle="Campus dispatch active"
            onClick={() => navigate('/emergency')}
          />
          <StatCard
            label="Rides Today"
            value="18"
            color="brand"
            change="↑ 12%"
            trend="up"
            icon={<Car size={20} />}
            subtitle="Active student transit"
            onClick={() => navigate('/rides')}
          />
          <StatCard
            label="Lost Items"
            value="07"
            color="warning"
            change="5 resolved"
            trend="neutral"
            icon={<Package size={20} />}
            subtitle="Matched on campus"
            onClick={() => navigate('/lost-found')}
          />
          <StatCard
            label="Safety Reports"
            value="12"
            color="info"
            change="This Week"
            trend="up"
            icon={<Shield size={20} />}
            subtitle="Security patrols assigned"
            onClick={() => navigate('/safety-map')}
          />
        </div>
      </section>

      {/* ── TWO-COLUMN INTERACTIVE CONTENT ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Campus Safety Map Preview (2 cols) */}
        <div className="lg:col-span-2">
          <div className="card p-5 h-full flex flex-col justify-between shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900">Campus Safety Hotspots Map</h3>
                  <p className="text-xs text-surface-500">Live aggregated safety areas & incident markers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/safety-map')}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Screen Map</span>
                <ExternalLink size={12} />
              </button>
            </div>

            <div className="flex-1 min-h-[280px] rounded-2xl overflow-hidden border border-surface-200">
              <MapContainer height="h-72" />
            </div>
          </div>
        </div>

        {/* Live Notifications Feed (1 col) */}
        <div className="card p-0 flex flex-col justify-between shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-brand-600" />
              <h3 className="font-bold text-surface-900 text-sm">Recent Activity</h3>
            </div>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="divide-y divide-surface-100 flex-1 overflow-y-auto max-h-[300px]">
            {mockNotifications.slice(0, 4).map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))}
          </div>

          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50/50">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-full text-center text-xs text-brand-600 hover:text-brand-800 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>View Activity Center</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
