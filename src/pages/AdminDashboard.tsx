// ============================================================
// Campus Care — AdminDashboard Page (Safety Operations Center)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, MapPin, Shield, Activity,
  Clock, Radio, Eye, Stethoscope, Flame
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge, SeverityBadge } from '../components/ui/StatusBadge';
import { MapContainer } from '../components/MapContainer';
import { Card, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { WorkerIncidentDetailModal } from '../components/emergency/WorkerIncidentDetailModal';
import { MedicalIncidentDetailModal } from '../components/medical/MedicalIncidentDetailModal';
import { FireIncidentDetailModal } from '../components/fire/FireIncidentDetailModal';
import { useEmergencyRealtime } from '../hooks/useEmergencyRealtime';
import { emergencyService } from '../lib/services/emergencyService';
import { medicalService, type MedicalIncidentWithDetails } from '../lib/services/medicalService';
import { fireService, type FireIncidentWithDetails } from '../lib/services/fireService';
import type { EmergencyIncident, IncidentAssignment } from '../types/database';
import { mockAdminStats, mockIncidents, formatRelativeTime } from '../lib/mockData';

export default function AdminDashboard() {
  const [liveIncidents, setLiveIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<IncidentAssignment | null>(null);
  const [selectedMedicalItem, setSelectedMedicalItem] = useState<MedicalIncidentWithDetails | null>(null);
  const [selectedFireItem, setSelectedFireItem] = useState<FireIncidentWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLiveEmergencies = useCallback(async () => {
    try {
      const { data } = await emergencyService.getActiveIncidents();
      setLiveIncidents(data);
    } catch (err) {
      console.error('Failed to load active emergencies for admin:', err);
    }
  }, []);

  useEffect(() => {
    fetchLiveEmergencies();
  }, [fetchLiveEmergencies]);

  // Subscribe to live emergency events
  const { isConnected } = useEmergencyRealtime(fetchLiveEmergencies);

  const handleOpenIncident = async (incident: EmergencyIncident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
    try {
      const { assignment } = await emergencyService.getIncidentDetails(incident.id);
      setSelectedAssignment(assignment);

      if (incident.incident_type === 'medical') {
        const { data: details } = await medicalService.getMedicalIncidentDetails(incident.id);
        setSelectedMedicalItem(details);
        setSelectedFireItem(null);
      } else if (incident.incident_type === 'fire') {
        const { data: details } = await fireService.getFireIncidentDetails(incident.id);
        setSelectedFireItem(details);
        setSelectedMedicalItem(null);
      } else {
        setSelectedMedicalItem(null);
        setSelectedFireItem(null);
      }
    } catch {
      setSelectedAssignment(null);
      setSelectedMedicalItem(null);
      setSelectedFireItem(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
    setSelectedAssignment(null);
    setSelectedMedicalItem(null);
    setSelectedFireItem(null);
  };

  const handleStatusUpdated = async () => {
    await fetchLiveEmergencies();
    if (selectedIncident) {
      const { incident, assignment } = await emergencyService.getIncidentDetails(selectedIncident.id);
      setSelectedIncident(incident);
      setSelectedAssignment(assignment);
      if (selectedIncident.incident_type === 'medical') {
        const { data: details } = await medicalService.getMedicalIncidentDetails(selectedIncident.id);
        setSelectedMedicalItem(details);
      } else if (selectedIncident.incident_type === 'fire') {
        const { data: details } = await fireService.getFireIncidentDetails(selectedIncident.id);
        setSelectedFireItem(details);
      }
    }
  };

  const activeEmergenciesCount = liveIncidents.length;
  const criticalCount = liveIncidents.filter((i) => i.priority === 'critical').length;
  const pendingCount = liveIncidents.filter((i) => i.status === 'pending').length;
  const medicalCount = liveIncidents.filter((i) => i.incident_type === 'medical').length;
  const fireCount = liveIncidents.filter((i) => i.incident_type === 'fire').length;

  return (
    <DashboardLayout role="admin" userName="Chief Administrator" unreadNotifications={pendingCount}>
      <PageHeader
        title="Command & Safety Control"
        subtitle="Campus-wide security oversight, real-time dispatch, and worker monitoring"
        action={
          <div className="flex items-center gap-2">
            <span className="badge badge-safe gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 bg-safe-500 rounded-full animate-pulse" />
              {isConnected ? 'Real-Time Connected' : 'Connecting...'}
            </span>
          </div>
        }
      />

      {/* Stats Grid */}
      <section aria-labelledby="stats-heading" className="mb-6">
        <h2 id="stats-heading" className="sr-only">Campus Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
          <StatCard
            label="Live Emergencies"
            value={activeEmergenciesCount}
            color="emergency"
            icon={<AlertTriangle size={18} />}
            change={activeEmergenciesCount > 0 ? `${activeEmergenciesCount} active` : 'Normal'}
            trend={activeEmergenciesCount > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            label="Critical SOS"
            value={criticalCount}
            color="emergency"
            icon={<Radio size={18} />}
          />
          <StatCard
            label="Fire Alerts"
            value={fireCount}
            color={fireCount > 0 ? 'emergency' : 'safe'}
            icon={<Flame size={18} className={fireCount > 0 ? 'text-orange-500' : ''} />}
          />
          <StatCard
            label="Medical Calls"
            value={medicalCount}
            color={medicalCount > 0 ? 'emergency' : 'safe'}
            icon={<Stethoscope size={18} />}
          />
          <StatCard
            label="Pending Dispatch"
            value={pendingCount}
            color="warning"
            icon={<Clock size={18} />}
          />
          <StatCard
            label="Security Reports"
            value={mockAdminStats.securityReports}
            color="warning"
            icon={<Shield size={18} />}
          />
          <StatCard
            label="Unsafe Locations"
            value={mockAdminStats.unsafeLocations}
            color="warning"
            icon={<MapPin size={18} />}
          />
        </div>
      </section>

      {/* ── Live Emergency SOS, Fire & Medical Broadcast Feed ─────────── */}
      {liveIncidents.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl border border-emergency-300 bg-emergency-50/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emergency-600 animate-ping" />
              <h2 className="font-extrabold text-emergency-900 text-sm tracking-wide">
                ACTIVE EMERGENCY BROADCAST FEED ({liveIncidents.length})
              </h2>
            </div>
            <span className="text-xs text-emergency-700 font-semibold">Priority Monitoring</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveIncidents.map((incident) => {
              const isMedical = incident.incident_type === 'medical';
              const isFire = incident.incident_type === 'fire';
              return (
                <div
                  key={incident.id}
                  className={`p-4 bg-white rounded-xl border ${
                    isFire
                      ? 'border-orange-300 bg-orange-50/20'
                      : isMedical
                      ? 'border-rose-200'
                      : 'border-emergency-200'
                  } shadow-sm flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-surface-900 text-xs flex items-center gap-1">
                        {isFire ? (
                          <Flame size={14} className="text-orange-600" />
                        ) : isMedical ? (
                          <Stethoscope size={14} className="text-rose-600" />
                        ) : (
                          <AlertTriangle size={14} className="text-emergency-600" />
                        )}
                        {isFire
                          ? 'FIRE EMERGENCY'
                          : isMedical
                          ? 'MEDICAL EMERGENCY'
                          : incident.incident_type === 'sos'
                          ? 'SOS EMERGENCY'
                          : incident.incident_type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        isFire
                          ? 'bg-orange-100 text-orange-800'
                          : isMedical
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-surface-600 line-clamp-2 mb-2">{incident.description}</p>
                    <p className="text-[11px] text-surface-400">
                      📍 {incident.location_name || 'Coordinates Available'}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-surface-100 flex items-center justify-between text-xs">
                    <span className="text-surface-400">{formatRelativeTime(incident.created_at)}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenIncident(incident)}
                      className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} /> Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main grid: Live Map & Responder Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Live Campus Overview */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <Activity size={18} className="text-brand-500" aria-hidden="true" />
              Live Campus Overview
            </h2>
          </div>
          <MapContainer height="h-72" />
        </div>

        {/* Worker Department Status */}
        <div>
          <h2 className="section-title mb-3">On-Duty Responders</h2>
          <div className="space-y-3">
            {[
              { dept: 'Medical Team',   emoji: '🏥', active: 4, total: 8, color: 'text-safe-600',   bg: 'bg-safe-50' },
              { dept: 'Fire Safety',    emoji: '🔥', active: 3, total: 6, color: 'text-orange-600', bg: 'bg-orange-50' },
              { dept: 'Campus Security',emoji: '👮', active: 7, total: 10, color: 'text-brand-600', bg: 'bg-brand-50' },
            ].map((dept) => (
              <div key={dept.dept} className={`card p-4 flex items-center gap-3 ${dept.bg} border-transparent`}>
                <span className="text-2xl" aria-hidden="true">{dept.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-800 text-sm">{dept.dept}</p>
                  <div className="w-full bg-surface-200/60 rounded-full h-1.5 mt-1.5">
                    <div
                      className="h-1.5 rounded-full bg-current transition-all"
                      style={{ width: `${(dept.active / dept.total) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={dept.active}
                      aria-valuemin={0}
                      aria-valuemax={dept.total}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${dept.color}`}>{dept.active}/{dept.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      <Card padding="none">
        <CardHeader
          title="Campus Incident Log"
          subtitle="All recorded safety dispatches and incident reports"
          icon={<Clock size={16} className="text-surface-500" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Recent incidents table">
            <thead>
              <tr className="border-t border-surface-100">
                {['ID', 'Type', 'Title', 'Location', 'Status', 'Severity', 'Time'].map((col) => (
                  <th key={col} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {mockIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-surface-500">{incident.id}</td>
                  <td className="px-4 py-3 capitalize text-surface-700">
                    {incident.type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 font-medium text-surface-900 max-w-xs truncate">
                    {incident.title}
                  </td>
                  <td className="px-4 py-3 text-surface-500 text-xs max-w-xs truncate">
                    {incident.location}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-4 py-3 text-surface-400 text-xs whitespace-nowrap">
                    {formatRelativeTime(incident.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admin Inspector Modal (Fire vs Medical vs Generic SOS) */}
      {selectedIncident?.incident_type === 'fire' && selectedFireItem ? (
        <FireIncidentDetailModal
          item={selectedFireItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdated={handleStatusUpdated}
        />
      ) : selectedIncident?.incident_type === 'medical' && selectedMedicalItem ? (
        <MedicalIncidentDetailModal
          item={selectedMedicalItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdated={handleStatusUpdated}
        />
      ) : (
        <WorkerIncidentDetailModal
          incident={selectedIncident}
          assignment={selectedAssignment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </DashboardLayout>
  );
}
