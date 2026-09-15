import { useState } from 'react';
import {
  Package, Search, Plus, MapPin, Clock,
  CheckCircle2, Compass
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { EmptyState } from '../components/ui/States';
import { mockLostFoundItems, formatRelativeTime } from '../lib/mockData';
import { Button } from '../components/ui/Button';

type FilterType = 'all' | 'lost' | 'found' | 'nearby' | 'resolved';

export default function LostFoundPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = mockLostFoundItems.filter((item) => {
    if (filter === 'lost' && item.type !== 'lost') return false;
    if (filter === 'found' && item.type !== 'found') return false;
    if (filter === 'resolved' && item.status !== 'matched') return false;
    if (searchQuery.trim()) {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <DashboardLayout unreadNotifications={2}>
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170e2b] via-[#241442] to-[#120a24] p-6 sm:p-8 mb-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-3 border border-purple-400/30">
              <Package size={14} />
              <span>Campus Property Recovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Lost & Found Registry
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Report lost belongings or register property you've found on campus. Help items return to their owners safely.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="gap-2 bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800"
              onClick={() => alert('Log Found Property modal: Enter item description, location found, and handover point.')}
            >
              <Package size={16} />
              <span>Found an Item</span>
            </Button>
            <Button
              variant="primary"
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-500/30 font-bold"
              onClick={() => alert('Report Lost Item modal: Enter details of your lost belonging.')}
            >
              <Plus size={16} />
              <span>Report Lost Item</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── METRIC STATS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 border border-amber-100 bg-gradient-to-br from-white to-amber-50/40 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Open Lost</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">🔎</span>
          </div>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">08</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">Searching for matches</p>
        </div>

        <div className="card p-5 border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Items Found</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">📦</span>
          </div>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">04</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Safely deposited</p>
        </div>

        <div className="card p-5 border border-purple-100 bg-gradient-to-br from-white to-purple-50/40 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Matched & Returned</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">✅</span>
          </div>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">03</p>
          <p className="text-xs text-purple-700 font-medium mt-0.5">Returned to owners</p>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface-100 rounded-2xl border border-surface-200 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'lost', label: '🔎 Lost' },
            { id: 'found', label: '📦 Found' },
            { id: 'nearby', label: '📍 Nearby' },
            { id: 'resolved', label: '✅ Resolved' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id as FilterType)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-white text-surface-900 shadow-xs border border-surface-200'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, tags, or location..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* ── ITEMS GRID (Visual Cards) ────────────────────────────── */}
      {filteredItems.length === 0 ? (
        <div className="card p-10">
          <EmptyState variant="lost-found" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filteredItems.map((item, idx) => {
            const isLost = item.type === 'lost';
            const isMatched = item.status === 'matched';
            const distance = idx === 0 ? '~150m away' : idx === 1 ? '~400m away' : '~650m away';

            return (
              <div
                key={item.id}
                className="card overflow-hidden flex flex-col justify-between border border-surface-200/90 hover:border-purple-300 hover:shadow-card-hover transition-all duration-200 group"
              >
                {/* Visual Image / Placeholder Header */}
                <div className={`h-36 flex items-center justify-center relative ${
                  isLost
                    ? 'bg-gradient-to-br from-amber-50 to-orange-100/70'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-100/70'
                }`}>
                  <Package
                    size={48}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isLost ? 'text-amber-500/80' : 'text-emerald-500/80'
                    }`}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-xs ${
                      isLost
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      {isLost ? '🔎 Lost Item' : '📦 Found Item'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {isMatched ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Matched
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-surface-600 border border-surface-200">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Distance pill */}
                  <div className="absolute bottom-2 right-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/90 text-surface-600 px-2 py-0.5 rounded-full border border-surface-200">
                      <Compass size={10} />
                      {distance}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-surface-900 group-hover:text-purple-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-surface-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3.5 space-y-1.5 text-xs text-surface-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-500 flex-shrink-0" />
                        <span className="font-medium truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-surface-400 flex-shrink-0" />
                        <span>Reported {formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-surface-100 flex items-center justify-between">
                    <Button
                      variant={isLost ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full justify-center text-xs font-bold py-2"
                      onClick={() => alert(`Inquiring about ${item.title}. Notification sent to reporter.`)}
                    >
                      {isLost ? 'I Found This' : 'Claim This Item'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
