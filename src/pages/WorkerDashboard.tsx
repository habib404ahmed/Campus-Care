// ============================================================
// Campus Care — WorkerDashboard Page (Incident Responder Hub)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, Clock, AlertTriangle, Shield,
  Radio, Loader2, Ambulance, Activity, Flame,
  AlertOctagon, Search
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { UserRoleBadge } from '../components/ui/UserRoleBadge';
import { WorkerDutyToggle } from '../components/emergency/WorkerDutyToggle';
import { EmergencyIncidentCard } from '../components/emergency/EmergencyIncidentCard';
import { WorkerIncidentDetailModal } from '../components/emergency/WorkerIncidentDetailModal';
import { MedicalIncidentCard } from '../components/medical/MedicalIncidentCard';
import { MedicalIncidentDetailModal } from '../components/medical/MedicalIncidentDetailModal';
import { FireIncidentCard } from '../components/fire/FireIncidentCard';
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
import type { EmergencyIncident, IncidentAssignment, SecurityReport, UnsafeLocationReport } from '../types/database';
import type { WorkerRole } from '../types';

const workerConfig: Record<WorkerRole, {
  emoji: string;
  title: string;
  color: 'safe' | 'warning' | 'neutral';
  accentBg: string;
}> = {
  medical:  { emoji: '🏥', title: 'Medical Response Center',  color: 'safe',    accentBg: 'bg-teal-50 border-teal-200/90' },
  fire:     { emoji: '🔥', title: 'Fire Response Center',     color: 'warning', accentBg: 'bg-orange-50 border-orange-200/90' },
  security: { emoji: '👮', title: 'Security Operations Center', color: 'neutral', accentBg: 'bg-indigo-50 border-indigo-200/90' },
};

interface WorkerDashboardProps {
  workerRole: WorkerRole;
  workerName?: string;
}

export default function WorkerDashboard({ workerRole, workerName }: WorkerDashboardProps) {
  const config = workerConfig[workerRole];
  const displayName = workerName ?? `${workerRole.charAt(0).toUpperCase() + workerRole.slice(1)} Responder`;

  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [medicalItems, setMedicalItems] = useState<MedicalIncidentWithDetails[]>([]);
  const [fireItems, setFireItems] = useState<FireIncidentWithDetails[]>([]);
  const [securityReports, setSecurityReports] = useState<SecurityReport[]>([]);
  const [securityTab, setSecurityTab] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');
  const [safetyReports, setSafetyReports] = useState<UnsafeLocationReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected incident modal
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<IncidentAssignment | null>(null);
  const [selectedMedicalItem, setSelectedMedicalItem] = useState<MedicalIncidentWithDetails | null>(null);
  const [selectedFireItem, setSelectedFireItem] = useState<FireIncidentWithDetails | null>(null);
  const [selectedSecurityReport, setSelectedSecurityReport] = useState<SecurityReport | null>(null);
  const [selectedSafetyReport, setSelectedSafetyReport] = useState<UnsafeLocationReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Filter incidents for this worker's authorization scope
  const isRelevantIncident = useCallback((inc: EmergencyIncident) => {
    if (inc.incident_type === 'sos') return true;
    if (workerRole === 'medical' && inc.incident_type === 'medical') return true;
    if (workerRole === 'fire' && inc.incident_type === 'fire') return true;
    if (workerRole === 'security' && (inc.incident_type === 'security' || inc.incident_type === 'other')) return true;
    return false;
  }, [workerRole]);

  const fetchIncidents = useCallback(async () => {
    try {
      if (workerRole === 'medical') {
        const { data } = await medicalService.getMedicalIncidentsForWorker();
        setMedicalItems(data);
        setFireItems([]);
        setSecurityReports([]);
        setIncidents(data.map((d) => d.incident));
      } else if (workerRole === 'fire') {
        const { data } = await fireService.getFireIncidentsForWorker();
        setFireItems(data);
        setMedicalItems([]);
        setSecurityReports([]);
        setIncidents(data.map((d) => d.incident));
      } else if (workerRole === 'security') {
        const { data: secData } = await securityService.getSecurityReportsForWorker(false);
        setSecurityReports(secData);
        const { data: safeData } = await safetyService.getReportsForAuthorizedStaff();
        setSafetyReports(safeData);
        setMedicalItems([]);
        setFireItems([]);
        const { data: emData } = await emergencyService.getActiveIncidents();
        setIncidents(emData.filter((i) => i.incident_type === 'sos'));
      } else {
        const { data } = await emergencyService.getActiveIncidents();
        const filtered = data.filter(isRelevantIncident);
        setIncidents(filtered);
        setMedicalItems([]);
        setFireItems([]);
        setSecurityReports([]);
      }
    } catch (err) {
      console.error('Failed to load active worker emergencies:', err);
    } finally {
      setLoading(false);
    }
  }, [workerRole, isRelevantIncident]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Realtime hook: auto-updates when any incident or report is created or updated
  const { isConnected } = useEmergencyRealtime(fetchIncidents);

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

  const handleOpenSecurityReport = (report: SecurityReport) => {
    setSelectedSecurityReport(report);
    setIsSecurityModalOpen(true);
  };

  const handleCloseSecurityModal = () => {
    setIsSecurityModalOpen(false);
    setSelectedSecurityReport(null);
  };

  const handleStatusUpdated = async () => {
    await fetchIncidents();
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
    if (selectedSecurityReport) {
      const { data: refreshedSec } = await securityService.getSecurityReport(selectedSecurityReport.id);
      setSelectedSecurityReport(refreshedSec);
    }
  };

  // Calculated dynamic metrics
  const activeCount = incidents.filter((i) => ['assigned', 'in_progress'].includes(i.status)).length;
  const pendingCount = incidents.filter((i) => i.status === 'pending').length;
  const ambulanceCount = workerRole === 'medical' ? medicalItems.filter((i) => i.medical.needs_ambulance).length : 0;
  const trappedCount = workerRole === 'fire' ? fireItems.filter((i) => i.fire.people_trapped === 'yes').length : 0;
  const totalCount = incidents.length;

  // Security role metrics
  const openSecurityCount = securityReports.filter((r) => ['pending', 'assigned', 'investigating'].includes(r.status)).length;
  const highPrioritySecurityCount = securityReports.filter((r) => ['high', 'critical'].includes(r.priority)).length;
  const dangerSecurityCount = securityReports.filter((r) => r.immediate_danger).length;
  const investigatingCount = securityReports.filter((r) => r.status === 'investigating').length;
  const resolvedSecurityCount = securityReports.filter((r) => ['resolved', 'closed'].includes(r.status)).length;

  const filteredSecurityReports = securityReports.filter((r) => {
    if (securityTab === 'pending') return r.status === 'pending' || r.status === 'assigned';
    if (securityTab === 'investigating') return r.status === 'investigating';
    if (securityTab === 'resolved') return ['resolved', 'closed'].includes(r.status);
    return true;
  });

  return (
    <DashboardLayout role={workerRole} userName={displayName} unreadNotifications={pendingCount + openSecurityCount}>
      <PageHeader
        title={config.title}
        subtitle="Live incident response, security operations, and rapid dispatch portal"
        action={
          <div className="flex items-center gap-3">
            <WorkerDutyToggle department={workerRole} />
            <UserRoleBadge role={workerRole} />
          </div>
        }
      />

      {/* Duty Status Banner with Realtime Indicator */}
      <div className={`card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${config.accentBg}`}>
        <div className="flex items-center gap-3.5">
          <span className="text-4xl" aria-hidden="true">{config.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-surface-900 text-base">{config.title} Station</h2>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  <Radio size={12} className="animate-pulse" /> Live Stream Active
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  Reconnecting...
                </span>
              )}
            </div>
            <p className="text-xs text-surface-600 mt-0.5">
              {workerRole === 'medical'
                ? 'Monitoring incoming clinical assistance requests and critical SOS alerts.'
                : workerRole === 'fire'
                ? 'Monitoring incoming fire, smoke, electrical, and gas hazard alerts in real-time.'
                : 'Supervising campus security reports, investigations, and SOS alerts in real-time.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {workerRole === 'security' ? (
            <>
              <div>
                <span className="text-surface-400 block">Open Reports:</span>
                <span className="font-bold text-base text-brand-600 font-mono">{openSecurityCount}</span>
              </div>
              <div className="border-l border-surface-200 pl-4">
                <span className="text-surface-400 block">Immediate Danger:</span>
                <span className="font-bold text-base text-rose-600 font-mono">{dangerSecurityCount}</span>
              </div>
              <div className="border-l border-surface-200 pl-4">
                <span className="text-surface-400 block">Investigating:</span>
                <span className="font-bold text-base text-purple-600 font-mono">{investigatingCount}</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-surface-400 block">Pending Alerts:</span>
                <span className="font-bold text-base text-emergency-600 font-mono">{pendingCount}</span>
              </div>
              <div className="border-l border-surface-200 pl-4">
                <span className="text-surface-400 block">Active Calls:</span>
                <span className="font-bold text-base text-surface-800 font-mono">{activeCount}</span>
              </div>
              {workerRole === 'medical' && ambulanceCount > 0 && (
                <div className="border-l border-surface-200 pl-4">
                  <span className="text-surface-400 block">Ambulance:</span>
                  <span className="font-bold text-base text-rose-600 font-mono">{ambulanceCount}</span>
                </div>
              )}
              {workerRole === 'fire' && trappedCount > 0 && (
                <div className="border-l border-surface-200 pl-4">
                  <span className="text-surface-400 block">Trapped:</span>
                  <span className="font-bold text-base text-rose-600 font-mono">{trappedCount}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Live Stat Cards */}
      {workerRole === 'security' ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard
            label="Open Reports"
            value={openSecurityCount}
            color={openSecurityCount > 0 ? 'warning' : 'safe'}
            icon={<Shield size={18} />}
            change={openSecurityCount > 0 ? `${openSecurityCount} active` : 'All Clear'}
            trend={openSecurityCount > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            label="High Priority"
            value={highPrioritySecurityCount}
            color={highPrioritySecurityCount > 0 ? 'emergency' : 'safe'}
            icon={<AlertTriangle size={18} />}
          />
          <StatCard
            label="Immediate Danger"
            value={dangerSecurityCount}
            color={dangerSecurityCount > 0 ? 'emergency' : 'safe'}
            icon={<AlertTriangle size={18} className={dangerSecurityCount > 0 ? 'animate-pulse text-rose-600' : ''} />}
          />
          <StatCard
            label="Investigations"
            value={investigatingCount}
            color="neutral"
            icon={<Search size={18} />}
          />
          <StatCard
            label="Resolved"
            value={resolvedSecurityCount}
            color="safe"
            icon={<CheckCircle size={18} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Pending Dispatch"
            value={pendingCount}
            color="emergency"
            icon={<AlertTriangle size={18} />}
            change={pendingCount > 0 ? `${pendingCount} waiting` : 'Clear'}
            trend={pendingCount > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            label="In Progress"
            value={activeCount}
            color="warning"
            icon={<Clock size={18} />}
          />
          <StatCard
            label={
              workerRole === 'medical'
                ? 'Ambulance Calls'
                : workerRole === 'fire'
                ? 'Trapped Occupants'
                : 'Total Handled'
            }
            value={
              workerRole === 'medical'
                ? ambulanceCount
                : workerRole === 'fire'
                ? trappedCount
                : totalCount
            }
            color={
              workerRole === 'medical' && ambulanceCount > 0
                ? 'emergency'
                : workerRole === 'fire' && trappedCount > 0
                ? 'emergency'
                : 'safe'
            }
            icon={
              workerRole === 'medical' ? (
                <Ambulance size={18} />
              ) : workerRole === 'fire' ? (
                <AlertOctagon size={18} />
              ) : (
                <CheckCircle size={18} />
              )
            }
          />
          <StatCard
            label="Division Clearance"
            value="Level 1"
            color="neutral"
            icon={<Shield size={18} />}
          />
        </div>
      )}

      {/* Emergency & Security Reports Feed */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="section-title flex items-center gap-2">
              {workerRole === 'medical' ? (
                <Activity size={18} className="text-rose-600" />
              ) : workerRole === 'fire' ? (
                <Flame size={18} className="text-orange-600" />
              ) : (
                <Shield size={18} className="text-brand-600" />
              )}
              {workerRole === 'medical'
                ? 'Live Medical & SOS Requests'
                : workerRole === 'fire'
                ? 'Live Fire & Hazard Requests'
                : 'Security Reports & Dispatch Feed'}
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              {workerRole === 'security'
                ? 'Review incident reports, initiate investigations, and log findings.'
                : 'Immediate attention required. Click Respond to accept dispatch.'}
            </p>
          </div>

          {workerRole === 'security' && (
            <div className="flex items-center gap-1.5 bg-surface-100 p-1 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: `All (${securityReports.length})` },
                { id: 'pending', label: 'Pending / Open' },
                { id: 'investigating', label: 'Investigating' },
                { id: 'resolved', label: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSecurityTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    securityTab === tab.id
                      ? 'bg-white text-surface-900 shadow-xs'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-surface-400 flex flex-col items-center gap-2 bg-white rounded-2xl border border-surface-200">
            <Loader2 size={24} className="animate-spin text-brand-600" />
            <span className="text-xs">Checking live emergency frequency...</span>
          </div>
        ) : workerRole === 'medical' ? (
          medicalItems.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-2" aria-hidden="true">✅</div>
              <h3 className="font-bold text-surface-900 text-base">No Active Medical Emergencies</h3>
              <p className="text-surface-500 text-xs mt-1 max-w-sm mx-auto">
                All sectors currently secure. Any incoming medical assistance request will appear here in real-time.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalItems.map((item) => (
                <MedicalIncidentCard
                  key={item.incident.id}
                  item={item}
                  onSelect={() => handleOpenIncident(item.incident)}
                  actionLabel="Respond to Medical"
                />
              ))}
            </div>
          )
        ) : workerRole === 'fire' ? (
          fireItems.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-4xl mb-2" aria-hidden="true">✅</div>
              <h3 className="font-bold text-surface-900 text-base">No Active Fire Emergencies</h3>
              <p className="text-surface-500 text-xs mt-1 max-w-sm mx-auto">
                All sectors currently secure. Any incoming fire, smoke, or hazard report will appear here in real-time.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fireItems.map((item) => (
                <FireIncidentCard
                  key={item.incident.id}
                  item={item}
                  onSelect={() => handleOpenIncident(item.incident)}
                  actionLabel="Respond to Fire"
                />
              ))}
            </div>
          )
        ) : workerRole === 'security' ? (
          <div className="space-y-8">
            {/* 1. Security Incidents Queue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-surface-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={16} className="text-brand-600" /> Security Incidents Queue ({filteredSecurityReports.length})
                </h3>
              </div>

              {filteredSecurityReports.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-4xl mb-2" aria-hidden="true">🛡️</div>
                  <h3 className="font-bold text-surface-900 text-base">No Security Reports Found</h3>
                  <p className="text-surface-500 text-xs mt-1 max-w-sm mx-auto">
                    No reports matching the selected filter. Any incoming campus security concern will appear here live.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSecurityReports.map((report) => (
                    <SecurityReportCard
                      key={report.id}
                      report={report}
                      onSelect={handleOpenSecurityReport}
                      actionLabel="Review & Handle"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 2. Campus Safety Reports (Unsafe Locations & Environmental Hazards) */}
            <div className="space-y-4 pt-4 border-t border-surface-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-surface-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">📍</span> Campus Safety Reports ({safetyReports.length})
                  </h3>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Poor lighting, isolated areas, damaged surfaces, and environmental hazards reported across campus.
                  </p>
                </div>

                {/* Safety Report Counters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                    {safetyReports.filter((r) => r.status === 'reported').length} New
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                    {safetyReports.filter((r) => r.status === 'reviewing').length} Reviewing
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 font-bold">
                    {safetyReports.filter((r) => r.severity === 'high' || r.severity === 'critical').length} High Concern
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                    {safetyReports.filter((r) => r.status === 'action_planned' || r.status === 'acknowledged').length} Action Planned
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {safetyReports.filter((r) => r.status === 'resolved').length} Resolved
                  </span>
                </div>
              </div>

              {safetyReports.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-xs text-surface-500">No unsafe location reports recorded.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {safetyReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => {
                        setSelectedSafetyReport(report);
                        setIsSafetyModalOpen(true);
                      }}
                      className="card p-4 border border-surface-200 hover:border-brand-300 hover:shadow-xs transition-all cursor-pointer bg-white rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {report.reference_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize border ${
                          report.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : report.status === 'action_planned'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : report.status === 'reviewing'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {report.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-surface-900 tracking-tight truncate">
                          {report.location_name}
                        </h4>
                        <p className="text-[11px] text-surface-500 capitalize mt-0.5">
                          {report.concern_type.replace(/_/g, ' ')} • {report.unsafe_time}
                        </p>
                      </div>

                      <p className="text-[11px] text-surface-600 line-clamp-2 bg-surface-50 p-2 rounded-xl border border-surface-100">
                        {report.description}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-surface-400">
                        <span>Severity: <strong className="text-surface-700 capitalize">{report.severity}</strong></span>
                        <span className="text-brand-600 font-bold">Review & Handle →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : incidents.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-2" aria-hidden="true">✅</div>
            <h3 className="font-bold text-surface-900 text-base">No Active Emergencies</h3>
            <p className="text-surface-500 text-xs mt-1 max-w-sm mx-auto">
              All sectors currently secure. Any incoming emergency alert will appear here in real-time.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <EmergencyIncidentCard
                key={incident.id}
                incident={incident}
                onSelect={handleOpenIncident}
                actionLabel="Open Incident"
              />
            ))}
          </div>
        )}
      </div>

      {/* Incident Detail / Response Modal (Fire vs Medical vs General) */}
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

      {/* Security Report Inspector & Handling Modal */}
      <SecurityReportDetailModal
        report={selectedSecurityReport}
        isOpen={isSecurityModalOpen}
        onClose={handleCloseSecurityModal}
        onStatusUpdated={handleStatusUpdated}
        isWorkerOrAdmin={true}
      />

      {/* Safety Report Inspector & Handling Modal */}
      <UnsafeLocationDetailModal
        report={selectedSafetyReport}
        isOpen={isSafetyModalOpen}
        onClose={() => {
          setIsSafetyModalOpen(false);
          setSelectedSafetyReport(null);
        }}
        onStatusUpdated={handleStatusUpdated}
        isAuthorizedStaff={true}
      />
    </DashboardLayout>
  );
}

