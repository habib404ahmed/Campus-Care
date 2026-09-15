import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Loader2, AlertCircle, Mail, Lock,
  Eye, EyeOff, ArrowRight, Radio
} from 'lucide-react';
import { APP_NAME } from '../lib/env';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

interface RoleCategory {
  id: 'admin' | 'worker' | 'campus-user';
  emoji: string;
  title: string;
  description: string;
  badge: string;
  defaultEmail: string;
}

const roleCategories: RoleCategory[] = [
  {
    id: 'campus-user',
    emoji: '🎓',
    title: 'Student / Faculty',
    description: 'Access safety services, report incidents, and share rides.',
    badge: 'Campus Portal',
    defaultEmail: 'student@campuscare.edu',
  },
  {
    id: 'worker',
    emoji: '🛡️',
    title: 'Incident Responder',
    description: 'Medical, Fire, and Security duty operations center.',
    badge: 'Response Team',
    defaultEmail: 'security@campuscare.edu',
  },
  {
    id: 'admin',
    emoji: '👨‍💼',
    title: 'Chief Admin',
    description: 'Executive supervision, campus operations, and audit logs.',
    badge: 'Safety Control',
    defaultEmail: 'admin@campuscare.edu',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [selectedCategoryId, setSelectedCategoryId] = useState<'admin' | 'worker' | 'campus-user'>('campus-user');
  const [email, setEmail] = useState('student@campuscare.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = (cat: RoleCategory) => {
    setSelectedCategoryId(cat.id);
    setEmail(cat.defaultEmail);
    setError(null);
  };

  const redirectUser = (role: string, department?: string | null) => {
    const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
    if (fromPath && fromPath !== '/login' && fromPath !== '/unauthorized') {
      navigate(fromPath);
      return;
    }

    if (role === 'admin') navigate('/admin');
    else if (role === 'student') navigate('/student');
    else if (role === 'teacher') navigate('/teacher');
    else if (role === 'faculty') navigate('/faculty');
    else if (role === 'worker') {
      if (department === 'medical') navigate('/medical');
      else if (department === 'fire') navigate('/fire');
      else navigate('/security');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your campus email address.');
      return;
    }
    if (!password) {
      setError('Please provide your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn({ email, password });
      if (res.error) {
        setError(res.error.message);
        return;
      }
      if (res.profile) {
        redirectUser(res.profile.role, res.profile.worker_department);
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0f1d]">
      {/* ── LEFT PANEL: Dark Branded Showcase (Desktop) ─────────── */}
      <div className="lg:w-1/2 xl:w-5/12 bg-[#0a0f1d] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Decorative background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label={`${APP_NAME} — Home`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-2 ring-brand-400/20">
              <Shield size={20} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight block">
                {APP_NAME}
              </span>
              <span className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase block">
                Campus Safety Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center Content */}
        <div className="my-10 lg:my-0 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-4 border border-brand-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Campus Command & Community Portal
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your campus. <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Your safety. One place.
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-md leading-relaxed">
            Real-time emergency dispatch, direct medical and fire triage, 24/7 security patrols, and verified campus mobility in one synchronized platform.
          </p>

          {/* Feature Highlights */}
          <div className="mt-8 space-y-3.5 max-w-md">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl">🚨</span>
              <div>
                <p className="text-xs font-bold text-white">Emergency Response</p>
                <p className="text-[11px] text-slate-400">One-tap SOS dispatch with immediate coordinates to campus units.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl">🩺</span>
              <div>
                <p className="text-xs font-bold text-white">Medical Support</p>
                <p className="text-[11px] text-slate-400">Direct triage to campus doctors, paramedics, and ambulance drivers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-xs font-bold text-white">Campus Security</p>
                <p className="text-[11px] text-slate-400">Hotspot mapping, security reports, and automated patrol routing.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-xl">🚗</span>
              <div>
                <p className="text-xs font-bold text-white">RideShare Mobility</p>
                <p className="text-[11px] text-slate-400">Safe, coordinated travels with verified university peers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/60">
          <span>Campus Care 2026</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Radio size={12} className="animate-pulse" />
            Zero Trust Authentication
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Premium Login Card ─────────────────────── */}
      <div className="flex-1 bg-surface-50 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-white border border-surface-200/90 rounded-3xl p-6 sm:p-8 shadow-card-elevated">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full">
                  Secure Access Portal
                </span>
                <Link to="/" className="text-xs font-medium text-surface-400 hover:text-surface-800 transition-colors">
                  ← Return to Home
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight mt-3">
                Sign In to Campus Care
              </h1>
              <p className="text-xs text-surface-500 mt-1">
                Select your account role or choose from test profiles below.
              </p>
            </div>

            {/* Role Category Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-100/80 rounded-2xl mb-5 border border-surface-200">
              {roleCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectRole(cat)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? 'bg-white text-surface-900 shadow-sm border border-surface-200/80'
                        : 'text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    <span className="text-sm">{cat.emoji}</span>
                    <span className="truncate w-full text-[11px]">{cat.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick test profile fill buttons */}
            <div className="mb-5 p-3 rounded-2xl bg-surface-50 border border-surface-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-surface-700 uppercase tracking-wide">
                  Quick Demo Accounts:
                </span>
                <span className="text-[10px] text-brand-600 font-semibold">1-Click Fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCategoryId === 'campus-user' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEmail('student@campuscare.edu')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        email === 'student@campuscare.edu'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-surface-700 border-surface-200 hover:border-brand-400'
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('teacher@campuscare.edu')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        email === 'teacher@campuscare.edu'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-surface-700 border-surface-200 hover:border-brand-400'
                      }`}
                    >
                      📚 Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('faculty@campuscare.edu')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        email === 'faculty@campuscare.edu'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-surface-700 border-surface-200 hover:border-brand-400'
                      }`}
                    >
                      🏛️ Faculty
                    </button>
                  </>
                )}

                {selectedCategoryId === 'worker' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEmail('security@campuscare.edu')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        email === 'security@campuscare.edu'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-surface-700 border-surface-200 hover:border-brand-400'
                      }`}
                    >
                      🛡️ Security
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('medical@campuscare.edu')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        email === 'medical@campuscare.edu'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-surface-700 border-surface-200 hover:border-teal-400'
                      }`}
                    >
                      🩺 Medical
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('fire@campuscare.edu')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        email === 'fire@campuscare.edu'
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-surface-700 border-surface-200 hover:border-orange-400'
                      }`}
                    >
                      🔥 Fire
                    </button>
                  </>
                )}

                {selectedCategoryId === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setEmail('admin@campuscare.edu')}
                    className="text-[11px] font-semibold px-3 py-1 rounded-lg border bg-brand-600 text-white border-brand-600 cursor-pointer"
                  >
                    👨‍💼 Chief Administrator
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign-in Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-surface-800 mb-1.5">
                  Campus Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campuscare.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-300/80 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-surface-800">
                    Password
                  </label>
                  <span className="text-[11px] text-surface-400">Demo: password123</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-50 border border-surface-300/80 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-surface-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-surface-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-surface-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
                <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Demo environment: any password works!'); }} className="text-brand-600 font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-3 shadow-md shadow-brand-500/30 text-sm font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={16} className="ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Registration footer */}
            <div className="mt-6 pt-5 border-t border-surface-100 text-center text-xs text-surface-500">
              New campus student, teacher, or faculty?{' '}
              <Link to="/signup" className="text-brand-600 font-bold hover:underline">
                Register account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
