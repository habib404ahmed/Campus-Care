import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle, Zap, Users, MapPin } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { APP_NAME, APP_TAGLINE } from '../lib/env';

const features = [
  { emoji: '🚨', title: 'Emergency SOS',        description: 'One-tap emergency activation with instant response team dispatch.',        color: 'emergency' },
  { emoji: '🏥', title: 'Medical Assistance',    description: 'Request immediate medical help anywhere on campus.',                         color: 'safe' },
  { emoji: '🔥', title: 'Fire Emergency',        description: 'Report fire incidents with precise location for rapid response.',           color: 'warning' },
  { emoji: '👮', title: 'Security Reports',      description: 'Submit security concerns and track response in real time.',                  color: 'info' },
  { emoji: '⚠️', title: 'Unsafe Locations',      description: 'Flag and track hazardous areas across campus.',                             color: 'warning' },
  { emoji: '🚗', title: 'Campus RideShare',      description: 'Coordinate safe campus rides with fellow students and staff.',              color: 'brand' },
  { emoji: '🔎', title: 'Lost & Found',          description: 'Report lost items and recover found property with smart matching.',         color: 'brand' },
];

const trustPoints = [
  { icon: Zap,        label: 'Instant Alerts',        desc: 'Real-time notifications pushed to the right people immediately.' },
  { icon: Users,      label: 'Multi-Role Access',     desc: 'Tailored interfaces for students, faculty, workers, and admins.' },
  { icon: MapPin,     label: 'Location Aware',        desc: 'Campus map integration for precise incident reporting.' },
  { icon: CheckCircle,label: 'Verified Response',     desc: 'Track incident resolution from report to close.' },
];

const colorBg: Record<string, string> = {
  emergency: 'bg-emergency-50 border-emergency-100',
  safe:      'bg-safe-50 border-safe-100',
  warning:   'bg-warning-50 border-warning-100',
  info:      'bg-info-50 border-info-100',
  brand:     'bg-brand-50 border-brand-100',
};

const colorEmoji: Record<string, string> = {
  emergency: 'bg-emergency-100',
  safe:      'bg-safe-100',
  warning:   'bg-warning-100',
  info:      'bg-info-100',
  brand:     'bg-brand-100',
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50/30">
      <Navbar />

      {/* Skip to content */}
      <a href="#features" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 btn-primary btn-sm z-50">
        Skip to features
      </a>

      {/* ====== HERO ====== */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6 border border-brand-200">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" aria-hidden="true" />
              Phase 1 — Campus Safety Platform
            </div>

            {/* Shield icon */}
            <div className="w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-brand-500/30">
              <Shield size={40} className="text-white" aria-hidden="true" />
            </div>

            {/* Headline */}
            <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-black text-surface-900 tracking-tighter leading-none mb-4">
              {APP_NAME}
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-brand-600 mb-4 tracking-wide">
              {APP_TAGLINE}
            </p>
            <p className="text-base sm:text-lg text-surface-500 max-w-2xl leading-relaxed mb-10">
              A connected campus platform for emergency response, safety reporting, shared rides, and lost &amp; found.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Link
                to="/login"
                id="hero-get-started"
                className="btn-primary btn-lg gap-2 min-w-40"
              >
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#features"
                id="hero-explore-features"
                className="btn-secondary btn-lg min-w-40"
              >
                Explore Features
              </a>
            </div>

            {/* Social proof strip */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-surface-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-safe-500" aria-hidden="true" />
                Emergency Ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-safe-500" aria-hidden="true" />
                Mobile First
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-safe-500" aria-hidden="true" />
                Multi-Role Access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-safe-500" aria-hidden="true" />
                Real-Time Alerts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== DASHBOARD PREVIEW ====== */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" aria-label="Dashboard preview">
        <div className="max-w-4xl mx-auto">
          <div className="card overflow-hidden shadow-card-lg">
            {/* Fake browser chrome */}
            <div className="bg-surface-800 px-4 py-3 flex items-center gap-2" aria-hidden="true">
              <div className="w-2.5 h-2.5 rounded-full bg-emergency-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-safe-500" />
              <div className="flex-1 mx-4 bg-surface-700 rounded-md h-5 flex items-center px-3">
                <span className="text-surface-400 text-[10px]">campus-care.app/dashboard</span>
              </div>
            </div>

            {/* Preview content */}
            <div className="bg-surface-50 p-4 sm:p-6">
              {/* Status row */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-surface-900">Good morning 👋</h2>
                  <p className="text-xs text-surface-500">Tuesday, September 15</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-safe-50 text-safe-700 border border-safe-200">
                  <span className="w-1.5 h-1.5 bg-safe-500 rounded-full" />
                  Campus Safe
                </span>
              </div>

              {/* Stat cards preview */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                {[
                  { label: 'Active Incidents', value: '03', color: 'text-emergency-600', bg: 'bg-emergency-50 border-emergency-100' },
                  { label: 'Reports Today',    value: '07', color: 'text-warning-600',   bg: 'bg-warning-50 border-warning-100' },
                  { label: 'Workers Online',   value: '24', color: 'text-safe-600',      bg: 'bg-safe-50 border-safe-100' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-surface-500 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions preview */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {features.map((f) => (
                  <div key={f.title} className={`rounded-xl border p-2.5 flex flex-col items-center gap-1.5 ${colorBg[f.color]}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${colorEmoji[f.color]}`}>{f.emoji}</span>
                    <span className="text-[9px] font-semibold text-surface-600 text-center leading-tight hidden sm:block">{f.title.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES GRID ====== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight mb-3">
              Everything your campus needs
            </h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              From emergency SOS to campus rides — Campus Care keeps your entire campus connected and safe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${colorBg[feature.color]}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${colorEmoji[feature.color]}`}>
                  {feature.emoji}
                </div>
                <h3 className="font-bold text-surface-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-surface-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TRUST SECTION ====== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-900" aria-labelledby="trust-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 id="trust-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Built for campus safety
            </h2>
            <p className="text-surface-400 text-sm">
              Designed with emergency-readiness and accessibility at its core.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.label} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mb-3">
                    <Icon size={22} className="text-brand-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{point.label}</h3>
                  <p className="text-xs text-surface-400 leading-relaxed">{point.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight mb-3">
            Ready to make your campus safer?
          </h2>
          <p className="text-surface-500 mb-8">
            Join Campus Care and experience a smarter, safer campus community.
          </p>
          <Link
            to="/login"
            id="cta-get-started"
            className="btn-primary btn-xl inline-flex gap-2"
          >
            Get Started Now
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-surface-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-surface-700">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <Shield size={12} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-sm">{APP_NAME}</span>
          </div>
          <p className="text-xs text-surface-400">
            © 2026 {APP_NAME}. Engineering Day Project — Phase 1.
          </p>
          <p className="text-xs text-surface-400">
            {APP_TAGLINE}
          </p>
        </div>
      </footer>
    </div>
  );
}
