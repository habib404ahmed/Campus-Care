import { Link } from 'react-router-dom';
import {
  Shield, ArrowRight, CheckCircle2, Zap, Users, MapPin,
  Flame, Stethoscope, ShieldAlert, Car, Package, AlertTriangle, Radio
} from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { APP_NAME } from '../lib/env';

const features = [
  {
    icon: AlertTriangle,
    title: 'Emergency SOS',
    description: 'One-tap critical emergency activation with instant campus response and responder GPS dispatch.',
    accent: 'from-rose-500 to-red-600',
    border: 'border-rose-200/80',
    bg: 'bg-rose-50/50 hover:bg-rose-50',
    badge: 'Immediate Priority',
    colorText: 'text-rose-600',
  },
  {
    icon: Stethoscope,
    title: 'Medical Help',
    description: 'Direct medical assistance requests with symptom reporting, triage urgency, and ambulance coordination.',
    accent: 'from-teal-500 to-emerald-600',
    border: 'border-teal-200/80',
    bg: 'bg-teal-50/50 hover:bg-teal-50',
    badge: 'Paramedic & Nurse',
    colorText: 'text-teal-600',
  },
  {
    icon: Flame,
    title: 'Fire & Hazard',
    description: 'Rapid fire incident reporting with people-trapped alerts, smoke hazard tagging, and building evacuation.',
    accent: 'from-orange-500 to-amber-600',
    border: 'border-orange-200/80',
    bg: 'bg-orange-50/50 hover:bg-orange-50',
    badge: 'Fire Department',
    colorText: 'text-orange-600',
  },
  {
    icon: ShieldAlert,
    title: 'Security Operations',
    description: 'Discrete or immediate reporting for suspicious activity, harassment concerns, and campus safety threats.',
    accent: 'from-indigo-500 to-blue-600',
    border: 'border-indigo-200/80',
    bg: 'bg-indigo-50/50 hover:bg-indigo-50',
    badge: '24/7 Security Patrol',
    colorText: 'text-indigo-600',
  },
  {
    icon: MapPin,
    title: 'Campus Safety Map',
    description: 'Interactive intelligence center showing aggregated safety hotspots, night lighting, and report clusters.',
    accent: 'from-amber-500 to-yellow-600',
    border: 'border-amber-200/80',
    bg: 'bg-amber-50/50 hover:bg-amber-50',
    badge: 'Privacy Protected',
    colorText: 'text-amber-600',
  },
  {
    icon: Car,
    title: 'Campus RideShare',
    description: 'Safe mobility between campus gates, hostels, and town. Share rides with verified students and staff.',
    accent: 'from-blue-500 to-cyan-600',
    border: 'border-blue-200/80',
    bg: 'bg-blue-50/50 hover:bg-blue-50',
    badge: 'Verified Community',
    colorText: 'text-blue-600',
  },
  {
    icon: Package,
    title: 'Lost & Found',
    description: 'Report lost property or log items you found on campus with intelligent category and location matching.',
    accent: 'from-purple-500 to-pink-600',
    border: 'border-purple-200/80',
    bg: 'bg-purple-50/50 hover:bg-purple-50',
    badge: 'Property Recovery',
    colorText: 'text-purple-600',
  },
];

const trustPoints = [
  { icon: Zap, label: 'Instant Real-Time Alerts', desc: 'Realtime WebSocket push notifications to workers and administrators instantly.' },
  { icon: Users, label: 'Role-Based Access Control', desc: 'Custom portals for students, faculty, medical, fire, and security personnel.' },
  { icon: MapPin, label: 'Privacy-Safe Geolocation', desc: 'High-precision coordinate transmittal for responders, privacy-safe clusters on public maps.' },
  { icon: CheckCircle2, label: 'Verified Incident Lifecycle', desc: 'End-to-end accountability from report acknowledgment through triage and resolution.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 selection:bg-brand-500/20">
      <Navbar />

      {/* Skip to features */}
      <a href="#features" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 btn-primary btn-sm z-50">
        Skip to features
      </a>

      {/* ====== HERO SECTION (Dark Navy Midnight) ====== */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#070b14] overflow-hidden" aria-labelledby="hero-heading">
        {/* Ambient Decorative Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-brand-600/20 via-indigo-600/20 to-purple-600/10 blur-[100px]" />
          <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[90px]" />
          <div className="absolute bottom-10 -left-20 w-[30rem] h-[30rem] rounded-full bg-rose-600/15 blur-[90px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Live ecosystem pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-6 border border-brand-500/30 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>LIVE CAMPUS PROTECTION ECOSYSTEM</span>
            </div>

            {/* Shield Logo with glowing gradient container */}
            <div className="w-20 h-20 bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/30 ring-4 ring-brand-400/20">
              <Shield size={42} className="text-white" aria-hidden="true" />
            </div>

            {/* Headline */}
            <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl mb-4">
              {APP_NAME}
            </h1>

            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent mb-4 tracking-tight">
              One platform for a safer, smarter campus.
            </p>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-10">
              Report emergencies, request help, share rides, find lost items, and stay connected with your campus community.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link
                to="/login"
                id="hero-get-started"
                className="btn-primary btn-xl gap-2 min-w-44 shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50"
              >
                Get Started
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link
                to="/safety-map"
                id="hero-explore-features"
                className="btn-secondary btn-xl min-w-44 bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm"
              >
                Explore Campus Safety
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Emergency Ready
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Real-Time Dispatch
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Multi-Role Security
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
                <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
                Mobile First
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SIMULATED COMMAND CENTER PREVIEW ====== */}
      <section className="relative -mt-10 px-4 sm:px-6 lg:px-8 z-20" aria-label="Interactive platform overview">
        <div className="max-w-5xl mx-auto">
          <div className="card-elevated overflow-hidden border border-slate-700/50 bg-[#0c1222] text-white shadow-2xl shadow-black/40">
            {/* Fake command window bar */}
            <div className="bg-[#090d18] px-4 py-3 flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">campus-care.platform / live-control</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Hotspots Active
                </span>
              </div>
            </div>

            {/* Command preview layout */}
            <div className="p-6 sm:p-8 bg-[#0b101f]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Responders</span>
                    <Radio size={16} className="text-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">24</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">Medical, Fire & Security</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Avg Dispatch Time</span>
                    <Zap size={16} className="text-cyan-400" />
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">1.8m</p>
                  <p className="text-[11px] text-cyan-400 mt-0.5">High-speed alert triage</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rides Shared Today</span>
                    <Car size={16} className="text-indigo-400" />
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">18</p>
                  <p className="text-[11px] text-indigo-400 mt-0.5">Safe campus transport</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hotspot Reports</span>
                    <MapPin size={16} className="text-amber-400" />
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">08</p>
                  <p className="text-[11px] text-amber-400 mt-0.5">Patrols dispatched</p>
                </div>
              </div>

              {/* Quick action shortcuts */}
              <div className="flex flex-wrap gap-2.5 items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-semibold">Integrated Safety Services:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 font-bold">🚨 Emergency SOS</span>
                  <span className="px-3 py-1 rounded-lg bg-teal-950/60 border border-teal-800/60 text-teal-300 font-bold">🩺 Medical</span>
                  <span className="px-3 py-1 rounded-lg bg-orange-950/60 border border-orange-800/60 text-orange-300 font-bold">🔥 Fire Alert</span>
                  <span className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-bold">🛡 Security</span>
                  <span className="px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 font-bold">🚗 RideShare</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CORE FEATURES GRID ====== */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-labelledby="features-heading">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Full Spectrum Protection
          </span>
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mt-3 mb-3">
            Everything your campus community needs
          </h2>
          <p className="text-surface-500 max-w-2xl mx-auto text-base">
            From life-safety emergency dispatch to everyday student mobility and lost property recovery — Campus Care is the complete operating system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`card p-6 flex flex-col justify-between border ${feature.border} ${feature.bg} transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.accent} flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-110`}>
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 bg-white px-2.5 py-1 rounded-md border border-surface-200 shadow-xs">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-surface-900 text-base mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-surface-600 leading-relaxed">{feature.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-surface-200/50 flex items-center justify-between text-xs font-semibold">
                  <span className={feature.colorText}>Learn more</span>
                  <ArrowRight size={14} className="text-surface-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====== TRUST & INFRASTRUCTURE SECTION ====== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0f1d] text-white" aria-labelledby="trust-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="trust-heading" className="text-3xl font-extrabold text-white tracking-tight mb-3">
              Engineered for emergency resilience
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Built on enterprise data architecture, row-level access control, and instant real-time channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.label} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-left hover:border-slate-700 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{point.label}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{point.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-50 to-indigo-50/40" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/25">
            <Shield size={32} />
          </div>
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight mb-3">
            Ready to secure your campus community?
          </h2>
          <p className="text-surface-500 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Experience the new standard in campus safety, emergency response, and community collaboration today.
          </p>
          <Link
            to="/login"
            id="cta-get-started"
            className="btn-primary btn-xl inline-flex gap-2.5 shadow-xl shadow-brand-600/30"
          >
            Access Campus Care
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-surface-200 py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <div className="flex items-center gap-2.5 font-extrabold text-surface-900">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <Shield size={14} aria-hidden="true" />
            </div>
            <span className="text-sm tracking-tight">{APP_NAME}</span>
          </div>
          <p className="text-surface-400">
            © 2026 {APP_NAME}. Modern Campus Command & Safety Ecosystem.
          </p>
          <div className="flex items-center gap-4 text-surface-400">
            <Link to="/login" className="hover:text-surface-900 transition-colors">Sign In</Link>
            <Link to="/safety-map" className="hover:text-surface-900 transition-colors">Safety Map</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
