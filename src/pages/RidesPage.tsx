import { useState } from 'react';
import {
  Car, Clock, Plus, Search, Users, ArrowDown,
  CheckCircle2, ShieldCheck
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { EmptyState } from '../components/ui/States';
import { mockRides, formatRelativeTime } from '../lib/mockData';
import { Button } from '../components/ui/Button';

export default function RidesPage() {
  const [requestedRides, setRequestedRides] = useState<Record<string, boolean>>({});

  const handleRequestRide = (id: string) => {
    setRequestedRides((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <DashboardLayout unreadNotifications={2}>
      {/* ── MOBILITY HERO BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a1128] via-[#111e42] to-[#0c1328] p-6 sm:p-8 mb-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
              <Car size={14} />
              <span>Campus Safe Mobility</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Campus RideShare
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Going somewhere? Find a campus member heading your way or offer a safe seat to peers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              className="gap-2 bg-gradient-to-r from-brand-500 to-blue-600 shadow-md shadow-brand-500/30 font-bold"
              onClick={() => alert('Offer a Ride modal: Choose destination, departure time, and available seats.')}
            >
              <Plus size={16} />
              <span>Offer a Ride</span>
            </Button>
            <Button
              variant="secondary"
              className="gap-2 bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800"
              onClick={() => alert('Search filters active.')}
            >
              <Search size={16} />
              <span>Find a Ride</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── METRIC STATS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Active Carpools</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">🚗</span>
          </div>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">03</p>
          <p className="text-xs text-blue-600 font-medium mt-0.5">Departing next 2 hours</p>
        </div>

        <div className="card p-5 border border-amber-100 bg-gradient-to-br from-white to-amber-50/40 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Pending Requests</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">⏳</span>
          </div>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">02</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">Awaiting driver accept</p>
        </div>

        <div className="card p-5 border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Today's Rides</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">✅</span>
          </div>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">18</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Verified safe commutes</p>
        </div>
      </div>

      {/* ── AVAILABLE RIDES (Visual Route Cards) ──────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900 tracking-tight">Available Campus Rides</h2>
          <span className="text-xs text-surface-500 font-medium">Updated 2 minutes ago</span>
        </div>

        {mockRides.length === 0 ? (
          <EmptyState variant="rides" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockRides.map((ride, idx) => {
              const isRequested = requestedRides[ride.id];
              const seatsAvailable = idx === 0 ? 2 : idx === 1 ? 3 : 1;
              const departureTime = idx === 0 ? '5:30 PM' : idx === 1 ? '6:15 PM' : '7:00 PM';

              return (
                <div
                  key={ride.id}
                  className="card p-5 flex flex-col justify-between border border-surface-200/90 hover:border-brand-300 hover:shadow-card-hover transition-all duration-200 group"
                >
                  <div>
                    {/* Top Driver & Seats Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {ride.requestedBy.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-surface-900 leading-none">{ride.requestedBy}</p>
                          <span className="text-[10px] text-surface-500 flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={11} className="text-emerald-500" /> Verified Student
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                        <Users size={11} />
                        {seatsAvailable} seats left
                      </span>
                    </div>

                    {/* Route Visual Details */}
                    <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200/80 mb-4 space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-surface-400 font-semibold uppercase">Meeting Point</p>
                          <p className="font-bold text-surface-900">{ride.from}</p>
                        </div>
                      </div>

                      <div className="flex items-center pl-0.5 text-surface-300">
                        <ArrowDown size={14} />
                      </div>

                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-brand-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-surface-400 font-semibold uppercase">Destination</p>
                          <p className="font-bold text-surface-900">{ride.to}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-surface-500 px-1 mb-4">
                      <span className="flex items-center gap-1 font-semibold text-surface-700">
                        <Clock size={13} className="text-brand-500" /> {departureTime}
                      </span>
                      <time className="text-[11px] text-surface-400">
                        {formatRelativeTime(ride.createdAt)}
                      </time>
                    </div>
                  </div>

                  {/* Join CTA */}
                  <Button
                    variant={isRequested ? 'secondary' : 'primary'}
                    className={`w-full justify-center text-xs font-bold py-2.5 ${
                      isRequested ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''
                    }`}
                    onClick={() => handleRequestRide(ride.id)}
                    disabled={isRequested}
                  >
                    {isRequested ? (
                      <>
                        <CheckCircle2 size={14} className="mr-1 text-emerald-600" />
                        <span>Request Sent</span>
                      </>
                    ) : (
                      <>
                        <span>Request to Join Ride</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
