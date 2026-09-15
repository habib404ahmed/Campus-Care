// ============================================================
// Campus Care — LoadingScreen Component
// ============================================================

import { Shield, Loader2 } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../lib/env';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-brand-safe/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Animated Brand Shield */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-primary/30 to-brand-primary/10 border border-brand-primary/30 shadow-2xl shadow-brand-primary/20 animate-pulse">
          <Shield className="w-10 h-10 text-brand-primary" />
          <div className="absolute -inset-1 rounded-2xl bg-brand-primary/20 blur-sm -z-10 animate-ping" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{APP_NAME}</h1>
          <p className="text-xs text-slate-400 mt-1">{APP_TAGLINE}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
          <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
          <span>Verifying security session...</span>
        </div>
      </div>
    </div>
  );
}
