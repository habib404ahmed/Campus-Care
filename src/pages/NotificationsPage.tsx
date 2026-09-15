import { useState } from 'react';
import {
  Bell, CheckCheck, Clock, AlertTriangle, Car,
  Stethoscope, Flame, Shield
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/States';
import { mockNotifications, formatRelativeTime } from '../lib/mockData';
import { Button } from '../components/ui/Button';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Group notifications by relative date
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const todayList = notifications.filter((n) => now - new Date(n.createdAt).getTime() < oneDay);
  const earlierList = notifications.filter((n) => now - new Date(n.createdAt).getTime() >= oneDay);

  const getEventIcon = (type: string) => {
    if (type.includes('emergency') || type.includes('sos')) {
      return { icon: AlertTriangle, bg: 'bg-rose-50 text-rose-600 border-rose-200' };
    }
    if (type.includes('medical')) {
      return { icon: Stethoscope, bg: 'bg-teal-50 text-teal-600 border-teal-200' };
    }
    if (type.includes('fire')) {
      return { icon: Flame, bg: 'bg-orange-50 text-orange-600 border-orange-200' };
    }
    if (type.includes('ride')) {
      return { icon: Car, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
    }
    return { icon: Shield, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
  };

  const renderGroup = (title: string, list: Notification[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3 px-1">
          {title} ({list.length})
        </h2>
        <div className="card divide-y divide-surface-100 overflow-hidden shadow-card">
          {list.map((notif) => {
            const { icon: Icon, bg } = getEventIcon(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-surface-50/80 ${
                  !notif.isRead ? 'bg-brand-50/20' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-xs ${bg}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm tracking-tight ${!notif.isRead ? 'font-bold text-surface-900' : 'font-semibold text-surface-700'}`}>
                      {notif.title}
                    </p>
                    <time className="text-[11px] text-surface-400 flex items-center gap-1 flex-shrink-0">
                      <Clock size={11} />
                      {formatRelativeTime(notif.createdAt)}
                    </time>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-2 flex-shrink-0 animate-pulse" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout unreadNotifications={unreadCount}>
      {/* ── HEADER BANNER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Bell size={18} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">
              Activity & Notifications
            </h1>
          </div>
          <p className="text-sm text-surface-500">
            Realtime campus alerts, emergency status, and community activity updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
            className="gap-2 font-bold text-xs"
          >
            <CheckCheck size={16} className="text-brand-600" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="py-12">
          <EmptyState variant="notifications" />
        </Card>
      ) : (
        <div className="max-w-4xl">
          {renderGroup('Today', todayList)}
          {renderGroup('Earlier This Week', earlierList)}
        </div>
      )}
    </DashboardLayout>
  );
}
