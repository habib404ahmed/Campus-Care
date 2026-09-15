// ============================================================
// Campus Care — SafetyMapPage (/safety-map)
// Interactive Campus Safety Map & Hotspot Exploration
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Plus,
  RefreshCw,
  Layers,
  ChevronRight,
  Building,
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { MapContainer } from '../components/MapContainer';
import { SafetyMapFilters } from '../components/safety/SafetyMapFilters';
import { SafetyMapLegend } from '../components/safety/SafetyMapLegend';
import { SafetyHotspotCard } from '../components/safety/SafetyHotspotCard';
import { UnsafeLocationForm } from '../components/safety/UnsafeLocationForm';
import { UnsafeLocationDetailModal } from '../components/safety/UnsafeLocationDetailModal';
import { safetyService } from '../lib/services/safetyService';
import { useEmergencyRealtime } from '../hooks/useEmergencyRealtime';
import { useAuth } from '../hooks/useAuth';
import type {
  SafetyHotspot,
  SafetyMapFilter,
  UnsafeLocationReport,
} from '../types/database';
import { cn } from '../lib/utils';

export default function SafetyMapPage() {
  const { user } = useAuth();

  const [hotspots, setHotspots] = useState<SafetyHotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<SafetyHotspot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [detailReport, setDetailReport] = useState<UnsafeLocationReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [userReports, setUserReports] = useState<UnsafeLocationReport[]>([]);
  const [showMyReports, setShowMyReports] = useState<boolean>(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [filters, setFilters] = useState<SafetyMapFilter>({
    category: 'all',
    time: 'all',
    severity: 'all',
  });

  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  // Sync night mode with time filter
  const handleFiltersChange = (newFilters: SafetyMapFilter) => {
    setFilters(newFilters);
    if (newFilters.time === 'night') {
      setIsNightMode(true);
    } else if (newFilters.time === 'day') {
      setIsNightMode(false);
    }
  };

  const toggleNightMode = () => {
    setIsNightMode((prev) => {
      const next = !prev;
      setFilters((f) => ({ ...f, time: next ? 'night' : 'all' }));
      return next;
    });
  };

  const loadMapData = useCallback(async () => {
    try {
      const { data } = await safetyService.getSafetyHotspots(filters);
      setHotspots(data);

      if (user) {
        const { data: userSec } = await safetyService.getUserUnsafeLocationReports(user.id);
        setUserReports(userSec);
      }
    } catch (err) {
      console.error('Failed to load safety map data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Realtime updates on safety reports
  const { isConnected } = useEmergencyRealtime(loadMapData);

  const handleSelectHotspot = (hotspot: SafetyHotspot) => {
    setSelectedHotspot(hotspot);
  };

  const handleOpenMyReport = (report: UnsafeLocationReport) => {
    setDetailReport(report);
    setIsDetailOpen(true);
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setPickedLocation(coords);
    setIsFormOpen(true);
  };

  return (
    <DashboardLayout unreadNotifications={2}>
      {/* Page Header */}
      <PageHeader
        title="Campus Safety Map"
        subtitle="See reported safety concerns and aggregated safety hotspots across campus"
        action={
          <div className="flex items-center gap-2">
            {!isConnected && (
              <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Reconnecting...
              </span>
            )}
            <Button
              variant="primary"
              onClick={() => setIsFormOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Report Unsafe Location
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {/* Filters Bar */}
        <SafetyMapFilters
          filters={filters}
          onChange={handleFiltersChange}
          totalHotspots={hotspots.length}
        />

        {/* Main Grid: Interactive Map + Sidebar Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Map Canvas Area */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative">
              <MapContainer
                height="h-[460px] sm:h-[540px]"
                hotspots={hotspots}
                selectedHotspotId={selectedHotspot?.id}
                onSelectHotspot={handleSelectHotspot}
                onMapClick={handleMapClick}
                allowLocationPick={true}
                isNightMode={isNightMode}
                onToggleNightMode={toggleNightMode}
                pickedLocation={pickedLocation}
                showLegend={false}
              />

              {/* Notice beneath map */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-[11px] text-surface-500 flex items-center gap-1">
                  💡 Click anywhere on the map to pin a hazard, or click any numbered hotspot to inspect.
                </span>
                <button
                  type="button"
                  onClick={loadMapData}
                  disabled={loading}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={11} className={cn(loading && 'animate-spin')} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Map Legend (High contrast with descriptions) */}
            <SafetyMapLegend orientation="horizontal" />
          </div>

          {/* Sidebar / Inspector Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Hotspot Inspection Details */}
            {selectedHotspot ? (
              <div className="card p-5 border border-brand-200 bg-white shadow-md rounded-2xl space-y-3 animate-fade-in relative">
                <div className="flex items-start justify-between gap-2 border-b border-surface-100 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                      Active Hotspot
                    </span>
                    <h3 className="text-base font-extrabold text-surface-900 mt-1">
                      {selectedHotspot.location_name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHotspot(null)}
                    className="text-surface-400 hover:text-surface-700 p-1 text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-surface-50">
                    <span className="text-surface-500 font-medium">Reported Concerns:</span>
                    <span className="font-extrabold text-surface-900">
                      {selectedHotspot.report_count} Reports
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-50">
                    <span className="text-surface-500 font-medium">Dominant Concern:</span>
                    <span className="font-extrabold text-amber-800 capitalize">
                      {selectedHotspot.dominant_category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-50">
                    <span className="text-surface-500 font-medium">Concern Level:</span>
                    <span className="font-black capitalize text-surface-900">
                      {selectedHotspot.concern_level}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-surface-500 font-medium">Night-time Reports:</span>
                    <span className="font-bold text-indigo-700">
                      {selectedHotspot.time_concerns.night} reports
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 text-[11px] text-surface-600 leading-relaxed">
                  Multiple campus users have reported environmental safety issues in this approximate zone. Safety patrols are informed.
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    setPickedLocation({ lat: selectedHotspot.latitude, lng: selectedHotspot.longitude });
                    setIsFormOpen(true);
                  }}
                  className="w-full text-xs font-bold py-2 bg-surface-900 hover:bg-surface-800 cursor-pointer"
                >
                  Add Report In This Area
                </Button>
              </div>
            ) : (
              <div className="card p-5 border border-surface-200 bg-surface-50/60 rounded-2xl text-center space-y-2">
                <MapPin size={24} className="mx-auto text-surface-400" />
                <h4 className="text-xs font-extrabold text-surface-800">Select a Safety Hotspot</h4>
                <p className="text-[11px] text-surface-500 leading-snug">
                  Click on any clustered hotspot pin on the campus map to view aggregated safety information.
                </p>
              </div>
            )}

            {/* 2. Hotspots Feed List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-surface-700 flex items-center gap-1.5">
                  <Layers size={13} className="text-brand-600" /> Reported Hotspots ({hotspots.length})
                </h4>
                <span className="text-[10px] text-surface-400">Privacy Aggregated</span>
              </div>

              {hotspots.length === 0 ? (
                <div className="card p-6 text-center border-dashed border-surface-300 rounded-2xl space-y-2">
                  <span className="text-2xl" aria-hidden="true">🗺️</span>
                  <p className="text-xs font-bold text-surface-800">No safety concerns reported</p>
                  <p className="text-[11px] text-surface-500">
                    No safety concerns have been reported in this filter category yet. Be the first to report a concern.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsFormOpen(true)}
                    className="text-xs font-bold mt-2"
                  >
                    Report Unsafe Location
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {hotspots.map((hs) => (
                    <SafetyHotspotCard
                      key={hs.id}
                      hotspot={hs}
                      isSelected={selectedHotspot?.id === hs.id}
                      onSelect={handleSelectHotspot}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 3. My Safety Reports Collapsible */}
            {user && (
              <div className="card p-4 border border-surface-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-surface-900 flex items-center gap-1.5">
                    <Building size={14} className="text-amber-600" /> My Safety Reports ({userReports.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowMyReports(!showMyReports)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                  >
                    {showMyReports ? 'Hide' : 'View'}
                  </button>
                </div>

                {showMyReports && (
                  <div className="space-y-2 pt-2 border-t border-surface-100 max-h-48 overflow-y-auto">
                    {userReports.length === 0 ? (
                      <p className="text-[11px] text-surface-500 text-center py-2">
                        You have not submitted any unsafe location reports yet.
                      </p>
                    ) : (
                      userReports.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => handleOpenMyReport(r)}
                          className="p-2 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors border border-surface-200 flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                                {r.reference_id}
                              </span>
                              <p className="text-xs font-bold text-surface-900 truncate">
                                {r.location_name}
                              </p>
                            </div>
                            <p className="text-[10px] text-surface-500 truncate capitalize mt-0.5">
                              {r.concern_type.replace(/_/g, ' ')} • {r.status.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-surface-400" />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Unsafe Location Modal */}
      <UnsafeLocationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadMapData}
        initialCoords={pickedLocation || undefined}
      />

      {/* Report Detail Modal */}
      <UnsafeLocationDetailModal
        report={detailReport}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusUpdated={loadMapData}
        isAuthorizedStaff={false}
      />
    </DashboardLayout>
  );
}
