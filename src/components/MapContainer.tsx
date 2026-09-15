import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

const legendItems = [
  { color: 'bg-safe-500',      emoji: '🟢', label: 'Safe',         desc: 'Area clear and safe' },
  { color: 'bg-warning-400',   emoji: '🟡', label: 'Caution',      desc: 'Exercise caution' },
  { color: 'bg-emergency-500', emoji: '🔴', label: 'Emergency',    desc: 'Active emergency' },
  { color: 'bg-orange-500',    emoji: '🟠', label: 'Security',     desc: 'Security incident' },
  { color: 'bg-brand-500',     emoji: '🚗', label: 'Active Ride',  desc: 'Campus ride in progress' },
  { color: 'bg-violet-500',    emoji: '🔎', label: 'Lost / Found', desc: 'Lost or found item' },
];

interface MapContainerProps {
  className?: string;
  height?: string;
  showLegend?: boolean;
}

export function MapContainer({ className, height = 'h-80', showLegend = true }: MapContainerProps) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      {/* Map Placeholder */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center',
          'bg-gradient-to-br from-surface-100 via-slate-50 to-blue-50',
          height
        )}
        role="img"
        aria-label="Campus map placeholder — real map will be integrated in Phase 2"
      >
        {/* Grid lines decorative */}
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(#64748b 1px, transparent 1px),
              linear-gradient(to right, #64748b 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative campus blobs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-32 h-20 bg-safe-200/50 rounded-xl rotate-12" />
          <div className="absolute top-1/3 left-1/2 w-24 h-16 bg-brand-200/40 rounded-lg -rotate-6" />
          <div className="absolute bottom-1/3 right-1/4 w-20 h-28 bg-surface-200/60 rounded-xl rotate-3" />
          <div className="absolute top-1/2 left-1/5 w-16 h-16 bg-warning-200/50 rounded-xl rotate-45" />
          {/* Paths */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-surface-300/60" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-surface-300/60" />
        </div>

        {/* Pin markers */}
        <div className="absolute top-[30%] left-[45%]" aria-hidden="true">
          <div className="relative">
            <div className="w-4 h-4 bg-emergency-500 rounded-full border-2 border-white shadow-md animate-pulse" />
          </div>
        </div>
        <div className="absolute top-[55%] left-[60%]" aria-hidden="true">
          <div className="w-3 h-3 bg-safe-500 rounded-full border-2 border-white shadow-md" />
        </div>
        <div className="absolute top-[40%] left-[25%]" aria-hidden="true">
          <div className="w-3 h-3 bg-brand-500 rounded-full border-2 border-white shadow-md" />
        </div>

        {/* Center label */}
        <div className="relative z-10 flex flex-col items-center text-center bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-card">
          <MapPin size={28} className="text-brand-500 mb-2" aria-hidden="true" />
          <p className="font-semibold text-surface-800">Campus Map</p>
          <p className="text-xs text-surface-500 mt-0.5">Interactive map — Phase 2</p>
          <p className="text-[10px] text-surface-400 mt-1">Configure via VITE_MAP_API_KEY</p>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="px-4 py-3 border-t border-surface-100">
          <p className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wide">Legend</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', item.color)} aria-hidden="true" />
                <span className="text-xs text-surface-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
