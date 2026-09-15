import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '../lib/env';

const workerRoles = [
  {
    id: 'medical',
    emoji: '🏥',
    title: 'Medical',
    description: 'Respond to medical emergencies and health incidents across campus.',
    path: '/medical',
    bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
    tag: 'Medical Response',
  },
  {
    id: 'fire',
    emoji: '🔥',
    title: 'Fire & Emergency',
    description: 'Respond to fire and emergency incidents with rapid deployment.',
    path: '/fire',
    bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    badge: 'bg-orange-100 text-orange-700',
    tag: 'Fire Response',
  },
  {
    id: 'security',
    emoji: '👮',
    title: 'Security',
    description: 'Manage security incidents, patrol reports, and unsafe locations.',
    path: '/security',
    bg: 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300',
    badge: 'bg-slate-100 text-slate-700',
    tag: 'Security',
  },
];

export default function WorkerSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/20 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2 font-bold text-surface-900">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-base tracking-tight">{APP_NAME}</span>
        </Link>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-800 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4" aria-hidden="true">🛡️</div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">
              Select Worker Department
            </h1>
            <p className="text-surface-500 mt-2 text-sm">
              Choose your department to access your worker dashboard.
            </p>
          </div>

          <div className="space-y-3" role="list" aria-label="Worker department selection">
            {workerRoles.map((role) => (
              <button
                key={role.id}
                id={`worker-${role.id}`}
                type="button"
                onClick={() => navigate(role.path)}
                role="listitem"
                className={`
                  w-full text-left flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200
                  active:scale-[0.99] cursor-pointer group ${role.bg}
                `}
                aria-label={`Continue as ${role.title}`}
              >
                <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center text-3xl shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                  {role.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-base font-bold text-surface-900">{role.title}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${role.badge}`}>
                      {role.tag}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500 leading-snug">{role.description}</p>
                </div>
                <ChevronRight size={20} className="text-surface-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
