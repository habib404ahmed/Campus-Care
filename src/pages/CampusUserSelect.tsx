import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '../lib/env';

const campusRoles = [
  {
    id: 'student',
    emoji: '🎓',
    title: 'Student',
    description: 'Access SOS, campus map, RideShare, Lost & Found, and safety alerts.',
    path: '/student',
    bg: 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300',
    badge: 'bg-brand-100 text-brand-700',
  },
  {
    id: 'teacher',
    emoji: '👨‍🏫',
    title: 'Teacher',
    description: 'Manage classroom safety and access all campus services.',
    path: '/teacher',
    bg: 'bg-teal-50 border-teal-200 hover:bg-teal-100 hover:border-teal-300',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'faculty',
    emoji: '👨‍💼',
    title: 'Faculty',
    description: 'Administrative campus access with full safety feature set.',
    path: '/faculty',
    bg: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-700',
  },
];

export default function CampusUserSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/20 flex flex-col">
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

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4" aria-hidden="true">🎓</div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">
              Select Your Role
            </h1>
            <p className="text-surface-500 mt-2 text-sm">
              Are you a student, teacher, or faculty member?
            </p>
          </div>

          <div className="space-y-3" role="list" aria-label="Campus user role selection">
            {campusRoles.map((role) => (
              <button
                key={role.id}
                id={`campus-${role.id}`}
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
                      {role.title}
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
