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
import { WorkerIncidentDetailModal } from '../components/emergency/WorkerIncidentDetailModal';
import { MedicalIncidentDetailModal } from '../components/medical/MedicalIncidentDetailModal';
import { FireIncidentDetailModal } from '../components/fire/FireIncidentDetailModal';
import { SecurityReportCard } from '../components/security/SecurityReportCard';
import { SecurityReportDetailModal } from '../components/security/SecurityReportDetailModal';
import { UnsafeLocationDetailModal } from '../components/safety/UnsafeLocationDetailModal';
import { useEmergencyRealtime } from '../hooks/useEmergencyRealtime';
import { emergencyService } from '../lib/services/emergencyService';
import { medicalService, type MedicalIncidentWithDetails } from '../lib/services/medicalService';
import { fireService, type FireIncidentWithDetails } from '../lib/services/fireService';
import { securityService } from '../lib/services/securityService';
import { safetyService } from '../lib/services/safetyService';
import type { EmergencyIncident, IncidentAssignment, SecurityReport, UnsafeLocationReport, SafetyHotspot } from '../types/database';
import { mockAdminStats, mockIncidents, formatRelativeTime } from '../lib/mockData';

export default function AdminDashboard() {
  const [liveIncidents, setLiveIncidents] = useState<EmergencyIncident[]>([]);
  const [securityReports, setSecurityReports] = useState<SecurityReport[]>([]);
  const [safetyReports, setSafetyReports] = useState<UnsafeLocationReport[]>([]);
  const [safetyHotspots, setSafetyHotspots] = useState<SafetyHotspot[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<IncidentAssignment | null>(null);
  const [selectedMedicalItem, setSelectedMedicalItem] = useState<MedicalIncidentWithDetails | null>(null);
  const [selectedFireItem, setSelectedFireItem] = useState<FireIncidentWithDetails | null>(null);
  const [selectedSecurityReport, setSelectedSecurityReport] = useState<SecurityReport | null>(null);
  const [selectedSafetyReport, setSelectedSafetyReport] = useState<UnsafeLocationReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const fetchLiveEmergencies = useCallback(async () => {
    try {
      const { data } = await emergencyService.getActiveIncidents();
      setLiveIncidents(data);

      const { data: secData } = await securityService.getSecurityReportsForWorker(true);
      setSecurityReports(secData);

      const { data: safeData } = await safetyService.getReportsForAuthorizedStaff();
      setSafetyReports(safeData);

      const { data: spotData } = await safetyService.getSafetyHotspots();
      setSafetyHotspots(spotData);
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
  const openSecurityCount = securityReports.filter((r) => ['pending', 'assigned', 'investigating'].includes(r.status)).length;

  return (
    <DashboardLayout role="admin" userName="Chief Administrator" unreadNotifications={pendingCount}>
      {/* ── COMMAND CENTER HERO ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#070b14] via-[#0f192f] to-[#070b14] p-6 sm:p-8 mb-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-brand-300 text-xs font-bold mb-3 border border-slate-700">
              <Shield size={14} className="text-brand-400" />
              <span>Campus Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Campus Operations Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Live overview of campus safety and services, incident telemetry, and responder dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/80 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isConnected ? 'Real-Time Connected' : 'Connecting WebSocket...'}
            </span>
          </div>
        </div>
      </div>

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
            value={openSecurityCount > 0 ? openSecurityCount : mockAdminStats.securityReports}
            color={openSecurityCount > 0 ? 'warning' : 'safe'}
            icon={<Shield size={18} />}
            change={openSecurityCount > 0 ? `${openSecurityCount} active` : 'Normal'}
            trend={openSecurityCount > 0 ? 'up' : 'neutral'}
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
              Live Campus Overview & Safety Hotspots
            </h2>
          </div>
          <MapContainer height="h-72" hotspots={safetyHotspots} />
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

      {/* ── Campus Security Reports Oversight ───────────────────────── */}
      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Shield size={18} className="text-brand-600" />
              Campus Security Reports & Investigations
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Supervise all recorded non-emergency campus safety concerns, theft, and hazard observations.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-100 text-surface-700">
            {securityReports.length} recorded
          </span>
        </div>

        {securityReports.length === 0 ? (
          <Card className="text-center py-8">
            <Shield size={32} className="mx-auto text-surface-300 mb-1.5" />
            <p className="text-xs text-surface-500 font-semibold">No security reports logged yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {securityReports.slice(0, 6).map((report) => (
              <SecurityReportCard
                key={report.id}
                report={report}
                onSelect={(r) => {
                  setSelectedSecurityReport(r);
                  setIsSecurityModalOpen(true);
                }}
                actionLabel="Inspect Report"
              />
            ))}
          </div>
        )}
      </div>

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

      {/* Security Report Admin Inspector Modal */}
      <SecurityReportDetailModal
        report={selectedSecurityReport}
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false);
          setSelectedSecurityReport(null);
        }}
        onStatusUpdated={async () => {
          await fetchLiveEmergencies();
          if (selectedSecurityReport) {
            const { data: refSec } = await securityService.getSecurityReport(selectedSecurityReport.id, 'admin');
            setSelectedSecurityReport(refSec);
          }
        }}
        isWorkerOrAdmin={true}
      />

      {/* Campus Safety Oversight Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">📍</span> Campus Safety & Environmental Hotspots
          </h2>
          <span className="text-xs font-semibold text-surface-500 bg-surface-100 px-3 py-1 rounded-full border border-surface-200">
            {safetyHotspots.length} Active Hotspots
          </span>
        </div>

        {/* 6 Core Safety Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card p-3.5 bg-white border border-surface-200 rounded-2xl">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide block">Safety Reports</span>
            <span className="text-lg font-black text-surface-900 font-mono mt-0.5 block">{safetyReports.length}</span>
            <span className="text-[10px] text-surface-500">All submissions</span>
          </div>

          <div className="card p-3.5 bg-white border border-surface-200 rounded-2xl">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide block">Active Hotspots</span>
            <span className="text-lg font-black text-brand-600 font-mono mt-0.5 block">{safetyHotspots.length}</span>
            <span className="text-[10px] text-surface-500">Clustered zones</span>
          </div>

          <div className="card p-3.5 bg-white border border-surface-200 rounded-2xl">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide block">High Concern</span>
            <span className="text-lg font-black text-rose-600 font-mono mt-0.5 block">
              {safetyHotspots.filter((h) => h.concern_level === 'high' || h.concern_level === 'critical').length}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">Requires patrol</span>
          </div>

          <div className="card p-3.5 bg-white border border-surface-200 rounded-2xl">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide block">This Week</span>
            <span className="text-lg font-black text-amber-600 font-mono mt-0.5 block">
              {safetyReports.filter((r) => Date.now() - new Date(r.created_at).getTime() < 7 * 86400000).length}
            </span>
            <span className="text-[10px] text-surface-500">Past 7 days</span>
          </div>

          <div className="card p-3.5 bg-white border border-surface-200 rounded-2xl">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide block">Resolved</span>
            <span className="text-lg font-black text-emerald-600 font-mono mt-0.5 block">
              {safetyReports.filter((r) => r.status === 'resolved').length}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Mitigated</span>
          </div>

          <div className="card p-3.5 bg-white border border-surface-200 rounded-2xl">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide block">Night Safety</span>
            <span className="text-lg font-black text-indigo-700 font-mono mt-0.5 block">
              {safetyReports.filter((r) => r.unsafe_time === 'night').length}
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">Low visibility</span>
          </div>
        </div>

        {/* Weekly Trend Bar Chart */}
        <div className="card p-4 bg-white border border-surface-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-surface-700">
              Safety Concerns Reported This Week
            </h4>
            <span className="text-[10px] text-surface-400">Daily hazard distribution</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2 text-center">
            {[
              { day: 'Mon', count: 2 },
              { day: 'Tue', count: 4 },
              { day: 'Wed', count: 1 },
              { day: 'Thu', count: 3 },
              { day: 'Fri', count: 5 },
              { day: 'Sat', count: 2 },
              { day: 'Sun', count: safetyReports.length > 5 ? safetyReports.length - 4 : 1 },
            ].map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1">
                <div className="w-full bg-surface-100 rounded-lg h-16 flex items-end justify-center p-1">
                  <div
                    className="w-full bg-amber-500 rounded-md transition-all"
                    style={{ height: `${Math.min((d.count / 6) * 100, 100)}%` }}
                    title={`${d.count} reports`}
                  />
                </div>
                <span className="text-[10px] font-bold text-surface-600">{d.day}</span>
                <span className="text-[10px] font-mono text-surface-400">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Report Admin Inspector Modal */}
      <UnsafeLocationDetailModal
        report={selectedSafetyReport}
        isOpen={isSafetyModalOpen}
        onClose={() => {
          setIsSafetyModalOpen(false);
          setSelectedSafetyReport(null);
        }}
        onStatusUpdated={fetchLiveEmergencies}
        isAuthorizedStaff={true}
      />
    </DashboardLayout>
  );
}
