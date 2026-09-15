import { Mail, Phone, MapPin, Edit, LogOut, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { UserRoleBadge } from '../components/ui/UserRoleBadge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const name = profile?.full_name || 'Campus User';
  const email = profile?.email || user?.email || 'user@campuscare.edu';
  const role = (profile?.role === 'worker' ? (profile.worker_department || 'security') : profile?.role || 'student') as UserRole;
  const campusId = profile?.campus_id || 'ID-CAMPUS-01';
  const phone = profile?.phone || '+1 (555) 019-2834';
  const isVerified = profile?.is_verified ?? false;

  return (
    <DashboardLayout role={role} userName={name} unreadNotifications={2}>
      <PageHeader
        title="My Profile"
        subtitle="Manage your account details and security clearances"
        action={
          <Button variant="secondary" size="sm" leftIcon={<Edit size={14} />}>
            Edit Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <Card className="flex flex-col items-center text-center py-8 lg:col-span-1">
          <Avatar name={name} size="xl" className="mb-4" />
          <h2 className="text-xl font-bold text-surface-900">{name}</h2>
          <p className="text-surface-500 text-sm mt-1">{email}</p>
          
          <div className="mt-3 flex items-center gap-2">
            <UserRoleBadge role={role} />
            {isVerified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>

          <div className="mt-6 w-full border-t border-surface-100 pt-4 flex justify-around text-center">
            <div>
              <p className="text-xs text-surface-400">Campus ID</p>
              <p className="font-mono text-xs font-bold text-surface-700 mt-0.5">{campusId}</p>
            </div>
            <div className="border-l border-surface-100" />
            <div>
              <p className="text-xs text-surface-400">Account Status</p>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">Active</p>
            </div>
          </div>
        </Card>

        {/* Info cards */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="font-bold text-surface-900 mb-4">Contact & Identity</h3>
            <div className="space-y-3">
              {[
                { icon: Mail,    label: 'Campus Email', value: email },
                { icon: Phone,   label: 'Contact Phone', value: phone },
                { icon: Shield,  label: 'Authorization Role', value: profile?.role?.toUpperCase() || 'STUDENT' },
                { icon: MapPin,  label: 'Primary Location', value: 'Main Campus Quad / Central Hall' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-surface-500" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">{label}</p>
                    <p className="text-sm font-medium text-surface-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-surface-900 mb-4">Emergency & Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-800">Email Safety Alerts</p>
                  <p className="text-xs text-surface-500">Receive immediate campus alerts via registered email</p>
                </div>
                <div className="w-10 h-6 bg-brand-600 rounded-full relative cursor-pointer" role="switch" aria-checked="true" tabIndex={0}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-800">SMS Geolocation Alerts</p>
                  <p className="text-xs text-surface-500">Get notified of nearby active incidents</p>
                </div>
                <div className="w-10 h-6 bg-brand-600 rounded-full relative cursor-pointer" role="switch" aria-checked="true" tabIndex={0}>
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-rose-50/50 border-rose-200">
            <h3 className="font-bold text-rose-900 mb-2">Session Management</h3>
            <p className="text-xs text-rose-700 mb-4">
              Sign out from this browser session. You will be redirected to the secure portal login.
            </p>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<LogOut size={14} />}
              onClick={handleSignOut}
            >
              Sign Out of Campus Care
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
