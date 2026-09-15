import { useState } from 'react';
import {
  Mail, MapPin, Edit, LogOut, CheckCircle2,
  Key, BellRing, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Avatar } from '../components/ui/Avatar';
import { UserRoleBadge } from '../components/ui/UserRoleBadge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [geoTracking, setGeoTracking] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const name = profile?.full_name || 'Campus User';
  const email = profile?.email || user?.email || 'user@campuscare.edu';
  const role = (profile?.role === 'worker' ? (profile.worker_department || 'security') : profile?.role || 'student') as UserRole;
  const campusId = profile?.campus_id || 'ID-CAMPUS-01';
  const phone = profile?.phone || '+1 (555) 019-2834';
  const isVerified = profile?.is_verified ?? true;

  return (
    <DashboardLayout role={role} userName={name} unreadNotifications={2}>
      {/* ── LARGE EXECUTIVE PROFILE HEADER ──────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a0f1d] via-[#151c33] to-[#0a0f1d] p-6 sm:p-8 mb-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with glowing ring */}
          <div className="relative flex-shrink-0">
            <div className="p-1 rounded-full bg-gradient-to-tr from-brand-500 via-indigo-500 to-cyan-400 shadow-xl">
              <Avatar name={name} size="xl" />
            </div>
            {isVerified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-slate-950 shadow-md" title="Verified Identity">
                <CheckCircle2 size={14} />
              </span>
            )}
          </div>

          {/* Profile metadata */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
              <UserRoleBadge role={role} size="md" />
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Account
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">{name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{email}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-400" />
                Campus ID: <strong className="font-mono text-white">{campusId}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-400" />
                Central Campus Quad
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800"
              onClick={() => alert('Edit profile details.')}
            >
              <Edit size={14} className="mr-1.5" />
              <span>Edit Details</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── SECTIONED CARDS GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Contact & Identity Card */}
        <div className="card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-100">
            <Mail size={16} className="text-brand-600" />
            <h2 className="font-bold text-surface-900 text-sm">Identity & Contact</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="text-surface-400 font-semibold uppercase tracking-wider text-[10px]">Registered Email</p>
              <p className="text-sm font-semibold text-surface-800 mt-0.5">{email}</p>
            </div>
            <div>
              <p className="text-surface-400 font-semibold uppercase tracking-wider text-[10px]">Direct Phone</p>
              <p className="text-sm font-semibold text-surface-800 mt-0.5">{phone}</p>
            </div>
            <div>
              <p className="text-surface-400 font-semibold uppercase tracking-wider text-[10px]">Campus Designation</p>
              <p className="text-sm font-semibold text-surface-800 mt-0.5 capitalize">{profile?.role || 'Student'}</p>
            </div>
            <div>
              <p className="text-surface-400 font-semibold uppercase tracking-wider text-[10px]">Verification Protocol</p>
              <p className="text-sm font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 size={14} /> University Verified
              </p>
            </div>
          </div>
        </div>

        {/* Emergency & Notification Preferences */}
        <div className="card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-100">
            <BellRing size={16} className="text-brand-600" />
            <h2 className="font-bold text-surface-900 text-sm">Emergency Alert Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-surface-800">Email Safety Broadcasts</p>
                <p className="text-[11px] text-surface-500">Urgent campus evacuation & alerts</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                  emailAlerts ? 'bg-brand-600' : 'bg-surface-200'
                }`}
                role="switch"
                aria-checked={emailAlerts}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${
                  emailAlerts ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-surface-800">SMS Geolocation Alerts</p>
                <p className="text-[11px] text-surface-500">Live SMS dispatch for nearby hazards</p>
              </div>
              <button
                type="button"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                  smsAlerts ? 'bg-brand-600' : 'bg-surface-200'
                }`}
                role="switch"
                aria-checked={smsAlerts}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${
                  smsAlerts ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-surface-800">Precision GPS Transmittal</p>
                <p className="text-[11px] text-surface-500">Send coordinates during SOS trigger</p>
              </div>
              <button
                type="button"
                onClick={() => setGeoTracking(!geoTracking)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                  geoTracking ? 'bg-brand-600' : 'bg-surface-200'
                }`}
                role="switch"
                aria-checked={geoTracking}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform ${
                  geoTracking ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Session Security & Sign Out */}
        <div className="card p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-100">
              <Key size={16} className="text-brand-600" />
              <h2 className="font-bold text-surface-900 text-sm">Security & Access</h2>
            </div>

            <div className="space-y-2.5 text-xs text-surface-600 mb-6">
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
                <p className="font-bold text-surface-800">Authentication Level</p>
                <p className="text-[11px] text-surface-500 mt-0.5">Role-Based Access Control (RBAC) Active</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
                <p className="font-bold text-surface-800">Active Device</p>
                <p className="text-[11px] text-surface-500 mt-0.5">Current Browser Session (Verified)</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-100">
            <Button
              variant="danger"
              className="w-full justify-center text-xs font-bold py-2.5 shadow-sm"
              onClick={handleSignOut}
            >
              <LogOut size={14} className="mr-1.5" />
              <span>Sign Out of Campus Care</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
