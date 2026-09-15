import { Package, Search, Plus, MapPin } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/States';
import { mockLostFoundItems, formatRelativeTime } from '../lib/mockData';

export default function LostFoundPage() {
  return (
    <DashboardLayout unreadNotifications={2}>
      <PageHeader
        title="Lost & Found"
        subtitle="Report lost items or log found property"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm gap-1.5">
              <Search size={14} aria-hidden="true" /> Found Item
            </button>
            <button className="btn-primary btn-sm gap-1.5">
              <Plus size={14} aria-hidden="true" /> Lost Item
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Open Lost',  value: '8',  emoji: '🔎', color: 'text-warning-600' },
          { label: 'Items Found',value: '4',  emoji: '📦', color: 'text-safe-600' },
          { label: 'Matched',    value: '3',  emoji: '✅', color: 'text-brand-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-surface-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Items list */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3 border-b border-surface-100 flex items-center justify-between">
          <h2 className="font-bold text-surface-900">Recent Items</h2>
          <span className="text-xs text-surface-400">Mock data — Phase 2</span>
        </div>

        {mockLostFoundItems.length === 0 ? (
          <EmptyState variant="lost-found" />
        ) : (
          <div className="divide-y divide-surface-50">
            {mockLostFoundItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-4 hover:bg-surface-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'lost' ? 'bg-warning-50' : 'bg-safe-50'}`}>
                  <Package
                    size={16}
                    className={item.type === 'lost' ? 'text-warning-600' : 'text-safe-600'}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-surface-900">{item.title}</p>
                    <Badge variant={item.type === 'lost' ? 'warning' : 'safe'} dot>
                      {item.type === 'lost' ? 'Lost' : 'Found'}
                    </Badge>
                    {item.status === 'matched' && <Badge variant="safe">Matched</Badge>}
                  </div>
                  <p className="text-xs text-surface-500 leading-snug truncate">{item.description}</p>
                  <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                    <MapPin size={10} aria-hidden="true" />
                    {item.location}
                  </p>
                </div>
                <time className="text-xs text-surface-400 flex-shrink-0 whitespace-nowrap" dateTime={item.createdAt}>
                  {formatRelativeTime(item.createdAt)}
                </time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
