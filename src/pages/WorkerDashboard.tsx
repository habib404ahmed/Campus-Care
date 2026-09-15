// ============================================================
// Campus Care — WorkerDashboard Page (Incident Responder Hub)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, Clock, AlertTriangle, Shield,
  Radio, Loader2, Ambulance, Activity, Flame,
  AlertOctagon
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
import { useEmergencyRealtime } from '../hooks/useEmergencyRealtime';
import { emergencyService } from '../lib/services/emergencyService';
import { medicalService, type MedicalIncidentWithDetails } from '../lib/services/medicalService';
import { fireService, type FireIncidentWithDetails } from '../lib/services/fireService';
import type { EmergencyIncident, IncidentAssignment } from '../types/database';
import type { WorkerRole } from '../types';

const workerConfig: Record<WorkerRole, {
  emoji: string;
  title: string;
  color: 'safe' | 'warning' | 'neutral';
  accentBg: string;
}> = {
  medical:  { emoji: '🏥', title: 'Medical Response',  color: 'safe',    accentBg: 'bg-safe-50 border-safe-200' },
  fire:     { emoji: '🔥', title: 'Fire & Emergency',  color: 'warning', accentBg: 'bg-orange-50 border-orange-200' },
  security: { emoji: '👮', title: 'Security Division', color: 'neutral', accentBg: 'bg-brand-50 border-brand-200' },
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
  const [loading, setLoading] = useState(true);

  // Selected incident modal
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<IncidentAssignment | null>(null);
  const [selectedMedicalItem, setSelectedMedicalItem] = useState<MedicalIncidentWithDetails | null>(null);
  const [selectedFireItem, setSelectedFireItem] = useState<FireIncidentWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setIncidents(data.map((d) => d.incident));
      } else if (workerRole === 'fire') {
        const { data } = await fireService.getFireIncidentsForWorker();
        setFireItems(data);
        setMedicalItems([]);
        setIncidents(data.map((d) => d.incident));
      } else {
        const { data } = await emergencyService.getActiveIncidents();
        const filtered = data.filter(isRelevantIncident);
        setIncidents(filtered);
        setMedicalItems([]);
        setFireItems([]);
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

  // Realtime hook: auto-updates when any incident is created or updated
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
  };

  // Calculated dynamic metrics
  const activeCount = incidents.filter((i) => ['assigned', 'in_progress'].includes(i.status)).length;
  const pendingCount = incidents.filter((i) => i.status === 'pending').length;
  const ambulanceCount = workerRole === 'medical' ? medicalItems.filter((i) => i.medical.needs_ambulance).length : 0;
  const trappedCount = workerRole === 'fire' ? fireItems.filter((i) => i.fire.people_trapped === 'yes').length : 0;
  const totalCount = incidents.length;

  return (
    <DashboardLayout role={workerRole} userName={displayName} unreadNotifications={pendingCount}>
      <PageHeader
        title={config.title}
        subtitle="Live emergency dispatch and incident response portal"
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
                : 'Listening for emergency SOS broadcasts in real-time.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
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
        </div>
      </div>

      {/* Live Stat Cards */}
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

      {/* Emergency Requests Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title flex items-center gap-2">
              {workerRole === 'medical' ? (
                <Activity size={18} className="text-rose-600" />
              ) : workerRole === 'fire' ? (
                <Flame size={18} className="text-orange-600" />
              ) : (
                <AlertTriangle size={18} className="text-emergency-600" />
              )}
              {workerRole === 'medical'
                ? 'Live Medical & SOS Requests'
                : workerRole === 'fire'
                ? 'Live Fire & Hazard Requests'
                : 'Live Emergency Requests'}
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Immediate attention required. Click Respond to accept dispatch and begin triage.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-100 text-surface-700">
            {incidents.length} active
          </span>
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
    </DashboardLayout>
  );
}
