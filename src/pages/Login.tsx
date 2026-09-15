import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ChevronRight, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { APP_NAME } from '../lib/env';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';

interface RoleCategory {
  id: 'admin' | 'worker' | 'campus-user';
  emoji: string;
  title: string;
  description: string;
  color: string;
  bg: string;
  badge: string;
  defaultEmail: string;
}

const roleCards: RoleCategory[] = [
  {
    id: 'admin',
    emoji: '👨‍💼',
    title: 'Admin',
    description: 'Manage campus safety and operations.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 border-violet-200 hover:bg-violet-100 hover:border-violet-300',
    badge: 'bg-violet-100 text-violet-700',
    defaultEmail: 'admin@campuscare.edu',
  },
  {
    id: 'worker',
    emoji: '🛡️',
    title: 'Worker',
    description: 'Respond to medical, fire and security incidents.',
    color: 'from-brand-500 to-blue-600',
    bg: 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300',
    badge: 'bg-brand-100 text-brand-700',
    defaultEmail: 'security@campuscare.edu',
  },
  {
    id: 'campus-user',
    emoji: '🎓',
    title: 'Student / Teacher / Faculty',
    description: 'Access campus safety and community services.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
    defaultEmail: 'student@campuscare.edu',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<RoleCategory | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectCategory = (cat: RoleCategory) => {
    setSelectedCategory(cat);
    setEmail(cat.defaultEmail);
    setError(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
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
      setError('Please provide an email address.');
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
      setError(err instanceof Error ? err.message : 'Sign in failed.');
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
        <Link to="/" className="text-sm text-surface-500 hover:text-surface-800 transition-colors">
          ← Back to home
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Step 1: Category Selection */}
          {!selectedCategory ? (
            <>
              {/* Heading */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/30">
                  <Shield size={30} className="text-white" aria-hidden="true" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight">
                  Welcome to {APP_NAME}
                </h1>
                <p className="text-surface-500 mt-2 text-base">
                  Choose how you want to continue.
                </p>
              </div>

              {!isSupabaseConfigured() && (
                <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong>Demo Simulation Ready:</strong> Pre-configured mock profiles are active for all roles.
                  </span>
                </div>
              )}

              {/* Role cards */}
              <div className="space-y-3" role="list" aria-label="Sign-in role options">
                {roleCards.map((card) => (
                  <button
                    key={card.id}
                    id={`login-${card.id}`}
                    type="button"
                    onClick={() => handleSelectCategory(card)}
                    role="listitem"
                    className={`
                      w-full text-left flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200
                      active:scale-[0.99] cursor-pointer group
                      ${card.bg}
                    `}
                    aria-label={`Continue as ${card.title}`}
                  >
                    {/* Emoji avatar */}
                    <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center text-3xl shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      {card.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-base font-bold text-surface-900">{card.title}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${card.badge}`}>
                          {card.id === 'campus-user' ? 'Campus' : card.title}
                        </span>
                      </div>
                      <p className="text-sm text-surface-500 leading-snug">{card.description}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight size={20} className="text-surface-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-surface-400">
                  New campus student, teacher, or faculty?{' '}
                  <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Step 2: Sign-In Form for Selected Category */
            <div className="max-w-md mx-auto bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl">
              <button
                type="button"
                onClick={handleBackToCategories}
                className="text-xs text-surface-500 hover:text-surface-900 flex items-center gap-1.5 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back to role selection
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center text-2xl shadow-inner">
                  {selectedCategory.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-900">
                    Sign in as {selectedCategory.title}
                  </h2>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${selectedCategory.badge}`}>
                    {selectedCategory.id === 'campus-user' ? 'Campus Portal' : selectedCategory.title}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo quick-fill accounts */}
              <div className="mb-5 p-3 bg-surface-50 border border-surface-200 rounded-xl">
                <div className="text-xs font-semibold text-surface-700 mb-1.5 flex items-center justify-between">
                  <span>Quick Test Logins:</span>
                  <span className="text-[10px] text-surface-400">Click to fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategory.id === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setEmail('admin@campuscare.edu')}
                      className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                    >
                      admin@campuscare.edu
                    </button>
                  )}
                  {selectedCategory.id === 'worker' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEmail('medical@campuscare.edu')}
                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                      >
                        medical@campuscare.edu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('fire@campuscare.edu')}
                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                      >
                        fire@campuscare.edu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('security@campuscare.edu')}
                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                      >
                        security@campuscare.edu
                      </button>
                    </>
                  )}
                  {selectedCategory.id === 'campus-user' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEmail('student@campuscare.edu')}
                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                      >
                        student@campuscare.edu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('teacher@campuscare.edu')}
                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                      >
                        teacher@campuscare.edu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('faculty@campuscare.edu')}
                        className="text-[11px] bg-white px-2 py-1 rounded-md border border-surface-200 text-surface-700 hover:border-brand-400"
                      >
                        faculty@campuscare.edu
                      </button>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campuscare.edu"
                    className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-surface-700">
                      Password
                    </label>
                    <span className="text-[11px] text-surface-400">Demo: any password</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </form>

              {selectedCategory.id === 'campus-user' && (
                <div className="mt-6 text-center text-xs text-surface-500">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
                    Register here
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
