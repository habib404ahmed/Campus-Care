// ============================================================
// Campus Care — MapContainer Component
// Supports Interactive Hotspots, Night Theme, Map Location Pick, & Zoom
// ============================================================

import { useState } from 'react';
import {
  MapPin,
  Plus,
  Minus,
  Navigation,
  Shield,
  Moon,
  Sun,
} from 'lucide-react';
import type { SafetyHotspot } from '../types/database';
import { cn } from '../lib/utils';

const defaultLegendItems = [
  { color: 'bg-emerald-500', emoji: '🟢', label: 'Low Concern', desc: 'Single report or minor concern' },
  { color: 'bg-amber-400', emoji: '🟡', label: 'Moderate Concern', desc: 'Occasional safety concern' },
  { color: 'bg-orange-500', emoji: '🟠', label: 'Multiple Concerns', desc: 'Active safety cluster (2+ reports)' },
  { color: 'bg-rose-500', emoji: '🔴', label: 'High Concern', desc: 'High severity / urgent hazard' },
];

interface MapContainerProps {
  className?: string;
  height?: string;
  showLegend?: boolean;
  hotspots?: SafetyHotspot[];
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: SafetyHotspot) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
  allowLocationPick?: boolean;
  showControls?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
}

export function MapContainer({
  className,
  height = 'h-80',
  showLegend = true,
  hotspots = [],
  selectedHotspotId = null,
  onSelectHotspot,
  onMapClick,
  isNightMode = false,
  onToggleNightMode,
  allowLocationPick = false,
  showControls = true,
  pickedLocation = null,
}: MapContainerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Coordinate mapper into map canvas percentage
  const getCoordinatesPercent = (lat: number, lng: number) => {
    // Campus bounding box
    const minLat = 12.9700;
    const maxLat = 12.9740;
    const minLng = 77.5930;
    const maxLng = 77.5970;

    const y = Math.min(Math.max(((maxLat - lat) / (maxLat - minLat)) * 76 + 12, 10), 90);
    const x = Math.min(Math.max(((lng - minLng) / (maxLng - minLng)) * 76 + 12, 10), 90);
    return { top: `${y}%`, left: `${x}%` };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowLocationPick && !onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const minLat = 12.9700;
    const maxLat = 12.9740;
    const minLng = 77.5930;
    const maxLng = 77.5970;

    const lat = Math.round((maxLat - clickY * (maxLat - minLat)) * 10000) / 10000;
    const lng = Math.round((minLng + clickX * (maxLng - minLng)) * 10000) / 10000;

    if (onMapClick) {
      onMapClick({ lat, lng });
    }
  };

  const getHotspotPinStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-600 ring-rose-300',
          pulse: 'bg-rose-500 animate-ping',
          emoji: '🔴',
        };
      case 'high':
        return {
          bg: 'bg-orange-600 ring-orange-300',
          pulse: 'bg-orange-400 animate-pulse',
          emoji: '🟠',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500 ring-amber-200',
          pulse: '',
          emoji: '🟡',
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-600 ring-emerald-200',
          pulse: '',
          emoji: '🟢',
        };
    }
  };

  return (
    <div className={cn('card overflow-hidden border border-surface-200 shadow-sm relative flex flex-col', className)}>
      {/* Map Canvas Area */}
      <div
        onClick={handleCanvasClick}
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-500',
          allowLocationPick && 'cursor-crosshair',
          isNightMode
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100'
            : 'bg-gradient-to-br from-surface-100 via-slate-50 to-blue-50/60 text-surface-800',
          height
        )}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.25s ease-out',
        }}
        role="region"
        aria-label="Campus Interactive Safety Map"
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(${isNightMode ? '#38bdf8' : '#64748b'} 1px, transparent 1px),
              linear-gradient(to right, ${isNightMode ? '#38bdf8' : '#64748b'} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative campus buildings & walkways */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Hostel Zone */}
          <div
            className={cn(
              'absolute top-[65%] left-[16%] w-28 h-20 rounded-2xl border transition-colors flex items-center justify-center text-[10px] font-bold',
              isNightMode
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-surface-200/50 border-surface-300/60 text-surface-500'
            )}
          >
            Hostel Zone
          </div>

          {/* Library & Central Plaza */}
          <div
            className={cn(
              'absolute top-[22%] left-[28%] w-36 h-24 rounded-2xl border transition-colors flex items-center justify-center text-[10px] font-bold',
              isNightMode
                ? 'bg-indigo-900/40 border-indigo-700/50 text-indigo-300'
                : 'bg-blue-100/60 border-blue-200 text-blue-800'
            )}
          >
            Library Plaza
          </div>

          {/* Academic Complex */}
          <div
            className={cn(
              'absolute top-[32%] left-[55%] w-36 h-28 rounded-2xl border transition-colors flex items-center justify-center text-[10px] font-bold',
              isNightMode
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-surface-200/60 border-surface-300/70 text-surface-600'
            )}
          >
            Academic Block
          </div>

          {/* Sports Ground */}
          <div
            className={cn(
              'absolute top-[18%] left-[76%] w-28 h-32 rounded-3xl border transition-colors flex items-center justify-center text-[10px] font-bold',
              isNightMode
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            )}
          >
            Sports Ground
          </div>

          {/* Main Gate */}
          <div
            className={cn(
              'absolute bottom-[10%] left-[44%] w-24 h-12 rounded-xl border transition-colors flex items-center justify-center text-[10px] font-bold',
              isNightMode
                ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            )}
          >
            Main Gate
          </div>

          {/* Main campus avenues / walkways */}
          <div className={cn('absolute top-0 bottom-0 left-[48%] w-2', isNightMode ? 'bg-slate-800/70' : 'bg-surface-200/80')} />
          <div className={cn('absolute left-0 right-0 top-[50%] h-2', isNightMode ? 'bg-slate-800/70' : 'bg-surface-200/80')} />
        </div>

        {/* Picked Location Crosshair (if in location pick mode) */}
        {pickedLocation && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={getCoordinatesPercent(pickedLocation.lat, pickedLocation.lng)}
          >
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 bg-brand-500/20 flex items-center justify-center animate-bounce">
              <MapPin size={18} className="text-brand-600 fill-brand-500" />
            </div>
            <span className="bg-surface-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md block text-center mt-1">
              Selected Point
            </span>
          </div>
        )}

        {/* Interactive Hotspot Clustered Markers */}
        {hotspots.map((hotspot) => {
          const pinStyle = getHotspotPinStyle(hotspot.concern_level);
          const isSelected = selectedHotspotId === hotspot.id;
          const pos = getCoordinatesPercent(hotspot.latitude, hotspot.longitude);

          return (
            <div
              key={hotspot.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectHotspot) onSelectHotspot(hotspot);
              }}
              style={pos}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              aria-label={`Hotspot ${hotspot.location_name} - ${hotspot.report_count} reports`}
            >
              {/* Pulse effect */}
              {pinStyle.pulse && (
                <div
                  className={cn(
                    'absolute -inset-2 rounded-full opacity-70 pointer-events-none',
                    pinStyle.pulse
                  )}
                />
              )}

              {/* Hotspot Badge Pin */}
              <div
                className={cn(
                  'relative flex items-center justify-center rounded-full text-white font-black shadow-lg transition-transform duration-200',
                  isSelected ? 'scale-125 ring-4 ring-white shadow-2xl' : 'hover:scale-115',
                  hotspot.report_count >= 3 ? 'w-9 h-9 text-xs' : 'w-7 h-7 text-[11px]',
                  pinStyle.bg
                )}
              >
                <span>{hotspot.report_count}</span>
              </div>

              {/* Tooltip on hover */}
              <div
                className={cn(
                  'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30',
                  'bg-surface-900 text-white px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap text-center'
                )}
              >
                <div className="flex items-center gap-1 text-[11px] font-extrabold">
                  <span>{pinStyle.emoji}</span>
                  <span>{hotspot.location_name}</span>
                </div>
                <span className="text-[10px] text-surface-300">
                  {hotspot.report_count} {hotspot.report_count === 1 ? 'concern' : 'concerns'} clustered
                </span>
                <div className="w-2 h-2 bg-surface-900 transform rotate-45 -mb-1 mt-0.5" />
              </div>
            </div>
          );
        })}

        {/* Center label when empty */}
        {hotspots.length === 0 && (
          <div className="relative z-10 flex flex-col items-center text-center bg-white/85 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-card border border-surface-200/60 max-w-xs">
            <Shield size={26} className="text-brand-600 mb-1.5" aria-hidden="true" />
            <p className="font-extrabold text-sm text-surface-900">Campus Safety Map</p>
            <p className="text-xs text-surface-500 mt-0.5">
              No concerns reported matching active filters.
            </p>
          </div>
        )}
      </div>

      {/* Floating Map Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
          {onToggleNightMode && (
            <button
              type="button"
              onClick={onToggleNightMode}
              title={isNightMode ? 'Switch to Day Mode' : 'Switch to Night Safety Mode'}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-colors cursor-pointer border',
                isNightMode
                  ? 'bg-indigo-900 text-amber-300 border-indigo-700 hover:bg-indigo-800'
                  : 'bg-white text-surface-700 border-surface-200 hover:bg-surface-50'
              )}
              aria-label="Toggle Night Safety Mode"
            >
              {isNightMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
            className="w-9 h-9 rounded-xl bg-white text-surface-700 border border-surface-200 flex items-center justify-center shadow-md hover:bg-surface-50 transition-colors cursor-pointer"
            aria-label="Zoom In"
            title="Zoom In"
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-9 h-9 rounded-xl bg-white text-surface-700 border border-surface-200 flex items-center justify-center shadow-md hover:bg-surface-50 transition-colors cursor-pointer"
            aria-label="Zoom Out"
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="w-9 h-9 rounded-xl bg-white text-surface-700 border border-surface-200 flex items-center justify-center shadow-md hover:bg-surface-50 transition-colors cursor-pointer"
            aria-label="Reset Zoom"
            title="Reset Zoom"
          >
            <Navigation size={14} />
          </button>
        </div>
      )}

      {/* Embedded Legend if showLegend is true */}
      {showLegend && (
        <div className="px-4 py-2.5 border-t border-surface-200 bg-white/95 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-extrabold uppercase text-[10px] tracking-wider text-surface-500">
              Hotspots:
            </span>
            {defaultLegendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', item.color)} />
                <span className="text-surface-700 font-medium text-[11px]">{item.label}</span>
              </div>
            ))}
          </div>

          <span className="text-[10px] text-surface-400 font-medium">
            🛡️ Individual coordinates protected (~100m radius)
          </span>
        </div>
      )}
    </div>
  );
}
