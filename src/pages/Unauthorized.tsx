// ============================================================
// Campus Care — Unauthorized (Access Denied) Page
// ============================================================

import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export default function Unauthorized() {
  const { profile, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!profile) return '/login';
    if (profile.role === 'admin') return '/admin';
    if (profile.role === 'worker') {
      if (profile.worker_department === 'medical') return '/medical';
      if (profile.worker_department === 'fire') return '/fire';
      if (profile.worker_department === 'security') return '/security';
      return '/security';
    }
    if (profile.role === 'student') return '/student';
    if (profile.role === 'teacher') return '/teacher';
    if (profile.role === 'faculty') return '/faculty';
    return '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-emergency/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-emergency/10 border border-brand-emergency/30 flex items-center justify-center text-brand-emergency shadow-lg shadow-brand-emergency/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-emergency bg-brand-emergency/10 border border-brand-emergency/20 rounded-full">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-bold text-white">Access Restricted</h1>
          <p className="text-sm text-slate-400">
            You do not have the required permissions or role clearances to view this page.
          </p>
        </div>

        {isAuthenticated && profile && (
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex justify-between items-center">
            <span className="text-slate-500">Current Role:</span>
            <span className="font-semibold text-brand-primary uppercase tracking-wide">
              {profile.role === 'worker' ? `${profile.worker_department || ''} Worker` : profile.role}
            </span>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3">
          {isAuthenticated ? (
            <Link to={getDashboardPath()}>
              <Button variant="primary" className="w-full justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to My Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" className="w-full justify-center">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In With Another Account
              </Button>
            </Link>
          )}

          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Return to Campus Care Home
          </Link>
        </div>
      </div>
    </div>
  );
}
