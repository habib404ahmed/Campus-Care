import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { NotificationItem } from '../components/ui/NotificationItem';
import { EmptyState } from '../components/ui/States';
import { mockNotifications } from '../lib/mockData';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n)
    );
  };

  return (
    <DashboardLayout unreadNotifications={unreadCount}>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="btn-ghost btn-sm gap-2 text-brand-600"
              aria-label="Mark all notifications as read"
            >
              <CheckCheck size={16} aria-hidden="true" />
              Mark all read
            </button>
          ) : undefined
        }
      />

      <Card padding="none">
        {notifications.length === 0 ? (
          <EmptyState variant="notifications" />
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="px-4 py-2 bg-brand-50/50 border-b border-brand-100">
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
                  Unread — {unreadCount}
                </p>
              </div>
            )}
            <div role="list" aria-label="Notifications list">
              {notifications
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((notif) => (
                  <div key={notif.id} role="listitem">
                    <NotificationItem notification={notif} onClick={markRead} />
                  </div>
                ))}
            </div>
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
