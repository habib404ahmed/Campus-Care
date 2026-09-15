import { Car, MapPin, Clock, Plus } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/States';
import { mockRides, formatRelativeTime } from '../lib/mockData';

const statusVariant = {
  pending:     'warning',
  accepted:    'info',
  in_progress: 'safe',
  completed:   'neutral',
  cancelled:   'neutral',
} as const;

const statusLabel = {
  pending:     'Pending',
  accepted:    'Accepted',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

export default function RidesPage() {
  return (
    <DashboardLayout unreadNotifications={2}>
      <PageHeader
        title="Campus RideShare"
        subtitle="Safe and coordinated campus rides"
        action={
          <button className="btn-primary btn-sm gap-2">
            <Plus size={16} aria-hidden="true" />
            Request Ride
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active Rides',    value: '3', emoji: '🚗' },
          { label: 'Pending Requests',value: '2', emoji: '⏳' },
          { label: 'Today\'s Rides',  value: '18',emoji: '✅' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
            <p className="text-2xl font-black text-surface-900 mt-1">{s.value}</p>
            <p className="text-xs text-surface-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rides list */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between">
          <h2 className="font-bold text-surface-900">Recent Rides</h2>
          <span className="text-xs text-surface-400">Mock data — Phase 2 will show real rides</span>
        </div>

        {mockRides.length === 0 ? (
          <EmptyState variant="rides" />
        ) : (
          <div className="divide-y divide-surface-50">
            {mockRides.map((ride) => (
              <div key={ride.id} className="flex items-start gap-3 px-5 py-4 hover:bg-surface-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Car size={16} className="text-brand-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-surface-900">{ride.requestedBy}</p>
                    <Badge variant={statusVariant[ride.status]} dot>
                      {statusLabel[ride.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-surface-500">
                    <MapPin size={11} aria-hidden="true" />
                    <span>{ride.from}</span>
                    <span className="text-surface-300">→</span>
                    <span>{ride.to}</span>
                  </div>
                </div>
                <time className="text-xs text-surface-400 flex-shrink-0 mt-1" dateTime={ride.createdAt}>
                  <Clock size={11} className="inline mr-0.5" aria-hidden="true" />
                  {formatRelativeTime(ride.createdAt)}
                </time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
