// ============================================================
// Campus Care — Sign Up Page (Campus Users: Student / Teacher / Faculty)
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { APP_NAME } from '../../lib/env';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [campusId, setCampusId] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'faculty'>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await signUp({
        email,
        password,
        fullName,
        role,
        campusId: campusId || undefined,
        phone: phone || undefined,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (role === 'student') navigate('/student');
        else if (role === 'teacher') navigate('/teacher');
        else if (role === 'faculty') navigate('/faculty');
        else navigate('/');
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/20 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-surface-900 hover:opacity-80 transition-opacity"
          aria-label={`${APP_NAME} — Go home`}
        >
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-base tracking-tight">{APP_NAME}</span>
        </Link>
        <Link to="/login" className="text-sm text-surface-500 hover:text-surface-800 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white border border-surface-200 shadow-xl rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Create Campus Account</h1>
            <p className="text-surface-500 text-sm mt-1">
              Join Campus Care for safety alerts, incident reporting, and peer rides.
            </p>
          </div>

          {!isSupabaseConfigured() && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Supabase keys are not set in <code>.env</code>. You can register locally for instant simulation.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Account created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Type */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Campus Affiliation / Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'teacher', 'faculty'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border capitalize transition-all ${
                      role === r
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Campus Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jdoe@university.edu"
                className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Campus ID & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Campus ID / Student ID
                </label>
                <input
                  type="text"
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                  placeholder="e.g. STU-2024-991"
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Phone (for SOS SMS)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
