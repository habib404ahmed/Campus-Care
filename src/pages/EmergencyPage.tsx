// ============================================================
// Campus Care — Emergency Center Page
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Phone, MapPin, CheckCircle2,
  Clock, Shield, Loader2, XCircle, Stethoscope,
  Activity, HeartPulse, Ambulance, Flame, Cloud,
  AlertOctagon
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GlobalSOSButton } from '../components/GlobalSOSButton';
import { IncidentTimeline } from '../components/emergency/IncidentTimeline';
import { MapContainer } from '../components/MapContainer';
import { MedicalEmergencyForm } from '../components/medical/MedicalEmergencyForm';
import { FireEmergencyForm } from '../components/fire/FireEmergencyForm';
import { SecurityReportForm } from '../components/security/SecurityReportForm';
import { SecurityReportCard } from '../components/security/SecurityReportCard';
import { SecurityReportDetailModal } from '../components/security/SecurityReportDetailModal';
import { UnsafeLocationForm } from '../components/safety/UnsafeLocationForm';
import { UnsafeLocationDetailModal } from '../components/safety/UnsafeLocationDetailModal';
import { useAuth } from '../hooks/useAuth';
import { emergencyService } from '../lib/services/emergencyService';
import { medicalService } from '../lib/services/medicalService';
import { fireService } from '../lib/services/fireService';
import { securityService } from '../lib/services/securityService';
import { safetyService } from '../lib/services/safetyService';
import { useEmergencyRealtime } from '../hooks/useEmergencyRealtime';
import type { EmergencyIncident, IncidentAssignment, MedicalIncident, FireIncident, SecurityReport, UnsafeLocationReport } from '../types/database';
import { formatRelativeTime } from '../lib/mockData';
import { cn } from '../lib/utils';

const emergencyContacts = [
  { name: 'Campus Security Dispatch', number: '555-0100', emoji: '👮', color: 'bg-brand-50 border-brand-200' },
  { name: 'Student Medical Clinic',   number: '555-0200', emoji: '🏥', color: 'bg-safe-50 border-safe-200' },
  { name: 'Fire Safety Station',      number: '555-0300', emoji: '🔥', color: 'bg-orange-50 border-orange-200' },
  { name: 'Emergency Hotline (24/7)', number: '555-0911', emoji: '📞', color: 'bg-emergency-50 border-emergency-200' },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<IncidentAssignment | null>(null);
  const [activeMedical, setActiveMedical] = useState<MedicalIncident | null>(null);
  const [activeFire, setActiveFire] = useState<FireIncident | null>(null);
  const [history, setHistory] = useState<EmergencyIncident[]>([]);
  const [userSecurityReports, setUserSecurityReports] = useState<SecurityReport[]>([]);
  const [selectedSecurityReport, setSelectedSecurityReport] = useState<SecurityReport | null>(null);
  const [isSecurityDetailOpen, setIsSecurityDetailOpen] = useState(false);
  const [userUnsafeReports, setUserUnsafeReports] = useState<UnsafeLocationReport[]>([]);
  const [selectedUnsafeReport, setSelectedUnsafeReport] = useState<UnsafeLocationReport | null>(null);
  const [isUnsafeDetailOpen, setIsUnsafeDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isFireModalOpen, setIsFireModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isUnsafeLocationModalOpen, setIsUnsafeLocationModalOpen] = useState(false);

  // Fetch current active emergency & past history
  const fetchEmergencyData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: active } = await emergencyService.getActiveEmergencyForUser(user.id);
      setActiveIncident(active);

      if (active) {
        const { assignment } = await emergencyService.getIncidentDetails(active.id);
        setActiveAssignment(assignment);

        if (active.incident_type === 'medical') {
          const { data: medDetails } = await medicalService.getMedicalIncidentDetails(active.id);
          setActiveMedical(medDetails?.medical || null);
          setActiveFire(null);
        } else if (active.incident_type === 'fire') {
          const { data: fireDetails } = await fireService.getFireIncidentDetails(active.id);
          setActiveFire(fireDetails?.fire || null);
          setActiveMedical(null);
        } else {
          setActiveMedical(null);
          setActiveFire(null);
        }
      } else {
        setActiveAssignment(null);
        setActiveMedical(null);
        setActiveFire(null);
      }

      const { data: userHistory } = await emergencyService.getUserEmergencies(user.id);
      setHistory(userHistory.filter((i) => ['resolved', 'cancelled'].includes(i.status)));

      const { data: userSec } = await securityService.getUserSecurityReports(user.id);
      setUserSecurityReports(userSec);

      const { data: userUnsafe } = await safetyService.getUserUnsafeLocationReports(user.id);
      setUserUnsafeReports(userUnsafe);
    } catch (err) {
      console.error('Failed to load emergency data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmergencyData();
  }, [fetchEmergencyData]);

  // Realtime subscription: updates on worker acceptance or resolution
  const { isConnected } = useEmergencyRealtime(fetchEmergencyData);

  const handleCancelPending = async () => {
    if (!activeIncident || !user) return;
    if (!window.confirm('Are you sure you want to cancel this emergency alert?')) return;

    setCancelling(true);
    try {
      await emergencyService.cancelPendingSOS(activeIncident.id, user.id);
      await fetchEmergencyData();
    } catch (err) {
      console.error('Failed to cancel emergency:', err);
    } finally {
      setCancelling(false);
    }
  };

  const isMedicalEmergency = activeIncident?.incident_type === 'medical';
  const isFireEmergency = activeIncident?.incident_type === 'fire';

  return (
    <DashboardLayout unreadNotifications={2} showSOS={false}>
      <PageHeader
        title="Emergency Center"
        subtitle="24/7 Campus safety dispatch, medical triage, fire response, and live incident monitoring"
        action={
          <div className="flex items-center gap-2">
            {!isConnected && (
              <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Live connection reconnecting...
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Dispatch Ready
            </span>
          </div>
        }
      />

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-surface-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-sm">Connecting to campus emergency network...</span>
        </div>
      ) : activeIncident ? (
        /* ── ACTIVE EMERGENCY BANNER & STATUS ────────────────────── */
        <div className="space-y-6 mb-8">
          <div className={`card p-6 sm:p-7 border-2 ${
            isMedicalEmergency
              ? 'border-rose-500 bg-gradient-to-br from-rose-50/70 via-white to-white'
              : isFireEmergency
              ? 'border-orange-500 bg-gradient-to-br from-orange-50/70 via-white to-white'
              : 'border-emergency-500 bg-gradient-to-br from-emergency-50/70 via-white to-white'
          } shadow-xl relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              isMedicalEmergency ? 'bg-rose-600' : isFireEmergency ? 'bg-orange-600' : 'bg-emergency-600'
            } animate-pulse`} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-200/80">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl ${
                  isMedicalEmergency
                    ? 'bg-rose-600 shadow-rose-600/30'
                    : isFireEmergency
                    ? 'bg-orange-600 shadow-orange-600/30'
                    : 'bg-emergency-600 shadow-emergency-600/30'
                } text-white flex items-center justify-center shadow-lg animate-sos-pulse flex-shrink-0`}>
                  {isMedicalEmergency ? (
                    <Stethoscope size={28} />
                  ) : isFireEmergency ? (
                    <Flame size={28} />
                  ) : (
                    <AlertTriangle size={28} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-surface-900 tracking-tight">
                      {isMedicalEmergency
                        ? '🩺 ACTIVE MEDICAL EMERGENCY'
                        : isFireEmergency
                        ? '🔥 ACTIVE FIRE EMERGENCY'
                        : '🚨 ACTIVE EMERGENCY IN PROGRESS'}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      activeIncident.priority === 'critical' || activeFire?.people_trapped === 'yes'
                        ? 'bg-rose-600 text-white'
                        : activeIncident.priority === 'high'
                        ? 'bg-orange-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {activeIncident.priority.toUpperCase()} PRIORITY
                    </span>
                    {activeMedical?.needs_ambulance && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                        <Ambulance size={11} /> AMBULANCE REQUESTED
                      </span>
                    )}
                    {activeFire?.people_trapped === 'yes' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white animate-pulse">
                        <AlertOctagon size={11} /> PEOPLE TRAPPED REPORTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Incident ID: <span className="font-mono font-bold text-surface-700">{activeIncident.id}</span> • Reported {formatRelativeTime(activeIncident.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeIncident.status === 'pending' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelPending}
                    disabled={cancelling}
                    className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    {cancelling ? <Loader2 size={14} className="animate-spin mr-1" /> : <XCircle size={14} className="mr-1" />}
                    Cancel Alert
                  </Button>
                )}
                <div className="px-3.5 py-1.5 rounded-xl bg-surface-900 text-white text-xs font-bold capitalize flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>{activeIncident.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Medical details brief (if medical emergency) */}
            {isMedicalEmergency && activeMedical && (
              <div className="my-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-rose-600" /> Reported Medical Symptoms & Details
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {activeMedical.symptoms && activeMedical.symptoms.trim() ? (
                    activeMedical.symptoms.split(',').map((s) => s.trim()).filter(Boolean).map((symptom) => (
                      <span
                        key={symptom}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-rose-800 border border-rose-200 shadow-xs"
                      >
                        {symptom}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-surface-500 italic">No specific symptoms recorded</span>
                  )}
                </div>
                {activeMedical.injury_description && (
                  <p className="text-xs text-surface-700 mt-2 bg-white/70 p-2.5 rounded-xl border border-rose-100">
                    <strong className="text-rose-950">Injury Notes: </strong>
                    {activeMedical.injury_description}
                  </p>
                )}
              </div>
            )}

            {/* Fire details brief (if fire emergency) */}
            {isFireEmergency && activeFire && (
              <div className="my-4 p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3">
                <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-600" /> Reported Fire & Hazard Status
                </h4>

                {activeFire.people_trapped === 'yes' && (
                  <div className="p-3 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
                    <AlertOctagon size={16} />
                    <span>CRITICAL: OCCUPANTS REPORTED TRAPPED — HIGHEST DISPATCH PRIORITY</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-white text-orange-900 font-bold border border-orange-200 shadow-xs capitalize">
                    Type: {activeFire.fire_type}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white text-surface-700 font-semibold border border-orange-200 shadow-xs flex items-center gap-1">
                    <Cloud size={13} className="text-slate-500" />
                    Smoke: {activeFire.smoke_visible ? 'Visible' : 'Not Visible'}
                  </span>
                  <span className={cn(
                    'px-2.5 py-1 rounded-xl font-bold border shadow-xs flex items-center gap-1',
                    activeFire.people_trapped === 'yes'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-white text-surface-700 border-orange-200'
                  )}>
                    <AlertOctagon size={13} />
                    Trapped: {activeFire.people_trapped === 'yes' ? 'YES (Danger)' : activeFire.people_trapped === 'no' ? 'None Reported' : 'Unknown'}
                  </span>
                </div>

                {activeFire.description && (
                  <p className="text-xs text-surface-700 bg-white/80 p-2.5 rounded-xl border border-orange-100">
                    <strong className="text-orange-950">Observation Notes: </strong>
                    {activeFire.description}
                  </p>
                )}
              </div>
            )}

            {/* Assigned Responder Info (if assigned) */}
            {activeAssignment && activeAssignment.worker && (
              <div className="my-5 p-4 rounded-2xl bg-brand-50/80 border border-brand-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">Responder Dispatched</p>
                    <p className="text-sm font-bold text-surface-900">{activeAssignment.worker.full_name}</p>
                    <p className="text-xs text-surface-500">
                      Department: <span className="capitalize font-semibold">{activeAssignment.worker.worker_department || 'Safety Team'}</span>
                    </p>
                  </div>
                </div>
                {activeAssignment.worker.phone && (
                  <a
                    href={`tel:${activeAssignment.worker.phone}`}
                    className="btn-secondary btn-sm gap-1.5 font-bold text-brand-700 hover:bg-brand-100"
                  >
                    <Phone size={14} /> Call Responder
                  </a>
                )}
              </div>
            )}

            {/* Grid: Timeline & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 mb-3">
                  Live Dispatch Timeline
                </h3>
                <div className="p-4 bg-surface-50/60 rounded-2xl border border-surface-200/80">
                  <IncidentTimeline incident={activeIncident} assignment={activeAssignment} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-600" /> Transmitted Location
                  </h3>
                  <span className="text-xs font-semibold text-surface-600">
                    {activeIncident.location_name || (activeIncident.latitude ? 'GPS Available' : 'Location Unavailable')}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-surface-200">
                  <MapContainer height="h-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── INACTIVE / STANDBY: TRIPLE PATHWAY (SOS vs MEDICAL vs FIRE) ───────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card A: Immediate SOS */}
          <div className="card bg-gradient-to-br from-emergency-50/70 via-white to-surface-50 border-emergency-200 p-6 text-center shadow-md flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emergency-100 text-emergency-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <AlertTriangle size={28} className="animate-sos-pulse" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emergency-100 text-emergency-800 inline-block mb-2">
                Critical Threat
              </span>
              <h2 className="text-lg font-black text-surface-900 tracking-tight mb-1.5">
                Campus SOS
              </h2>
              <p className="text-surface-600 text-xs max-w-xs mx-auto mb-4 leading-relaxed">
                In immediate physical danger? 1-tap rapid dispatch of campus security and officers.
              </p>
            </div>
            <div className="flex justify-center pt-1">
              <GlobalSOSButton variant="inline" className="px-5 py-2.5 text-xs font-bold w-full justify-center" />
            </div>
          </div>

          {/* Card B: Medical Emergency Assistance */}
          <div className="card bg-gradient-to-br from-rose-50/70 via-white to-surface-50 border-rose-200 p-6 text-center shadow-md flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Stethoscope size={28} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 inline-block mb-2">
                Medical & First-Aid
              </span>
              <h2 className="text-lg font-black text-surface-900 tracking-tight mb-1.5">
                Medical Emergency
              </h2>
              <p className="text-surface-600 text-xs max-w-xs mx-auto mb-4 leading-relaxed">
                Need clinical triage, first-aid, or ambulance dispatch? Submit symptoms to the health clinic.
              </p>
            </div>
            <div className="flex justify-center pt-1">
              <Button
                variant="primary"
                onClick={() => setIsMedicalModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs gap-1.5 cursor-pointer w-full justify-center"
              >
                <Activity size={14} /> Request Medical Help
              </Button>
            </div>
          </div>

          {/* Card C: Fire Emergency Assistance */}
          <div className="card bg-gradient-to-br from-orange-50/70 via-white to-surface-50 border-orange-200 p-6 text-center shadow-md flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Flame size={28} className="animate-pulse" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 inline-block mb-2">
                Fire & Hazard
              </span>
              <h2 className="text-lg font-black text-surface-900 tracking-tight mb-1.5">
                Fire Emergency
              </h2>
              <p className="text-surface-600 text-xs max-w-xs mx-auto mb-4 leading-relaxed">
                Report active fire, smoke, gas leak, or electrical hazard to alert the fire response station.
              </p>
            </div>
            <div className="flex justify-center pt-1">
              <Button
                variant="primary"
                onClick={() => setIsFireModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs gap-1.5 cursor-pointer w-full justify-center"
              >
                <Flame size={14} /> Report Fire Emergency
              </Button>
            </div>
          </div>

          {/* Card D: Campus Security Report (Non-urgent safety concerns) */}
          <div className="md:col-span-3 card p-6 bg-gradient-to-r from-brand-50/80 via-white to-surface-50 border-brand-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Shield size={28} />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-100 text-brand-800 inline-block mb-1">
                  Non-Emergency Safety Report
                </span>
                <h3 className="text-lg font-black text-surface-900 tracking-tight">
                  Campus Security Report
                </h3>
                <p className="text-surface-600 text-xs max-w-xl leading-relaxed mt-0.5">
                  Report theft, suspicious activity, vandalism, harassment, or other campus safety concerns.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsSecurityModalOpen(true)}
              className="w-full md:w-auto px-6 py-3 text-xs font-bold gap-2 shadow-xs cursor-pointer flex-shrink-0"
            >
              <Shield size={15} /> Report Security Concern
            </Button>
          </div>

          {/* Card E: Unsafe Location & Safety Map */}
          <div className="md:col-span-3 card p-6 bg-gradient-to-r from-amber-50/80 via-white to-surface-50 border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin size={28} />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 inline-block mb-1">
                  Community Safety & Hotspots
                </span>
                <h3 className="text-lg font-black text-surface-900 tracking-tight">
                  📍 Unsafe Location & Safety Map
                </h3>
                <p className="text-surface-600 text-xs max-w-xl leading-relaxed mt-0.5">
                  Tell the campus community about places that may need attention. See reported safety concerns and hotspots.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate('/safety-map')}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold gap-1.5 cursor-pointer"
              >
                🗺️ View Safety Map
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsUnsafeLocationModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
              >
                📍 Report Unsafe Location
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Emergency Hotline Contacts ──────────────────────────── */}
      <div className="mb-8">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Phone size={18} className="text-brand-600" /> Emergency Hotline Directory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.number}`}
              className={`p-4 rounded-2xl border transition-all hover:shadow-md ${contact.color} flex items-center gap-3.5`}
            >
              <span className="text-3xl flex-shrink-0" aria-hidden="true">{contact.emoji}</span>
              <div className="min-w-0">
                <p className="font-bold text-surface-900 text-sm truncate">{contact.name}</p>
                <p className="text-xs text-surface-500 font-mono mt-0.5">{contact.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Emergency History ──────────────────────────────────── */}
      {history.length > 0 && (
        <Card padding="none">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="font-bold text-surface-900 flex items-center gap-2">
              <Clock size={16} className="text-surface-400" /> My Emergency History
            </h2>
            <span className="text-xs text-surface-400">{history.length} recorded events</span>
          </div>
          <div className="divide-y divide-surface-100">
            {history.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between gap-4 hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.incident_type === 'medical'
                      ? 'bg-rose-100 text-rose-600'
                      : item.incident_type === 'fire'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-surface-100 text-surface-600'
                  }`}>
                    {item.incident_type === 'medical' ? (
                      <Stethoscope size={20} />
                    ) : item.incident_type === 'fire' ? (
                      <Flame size={20} />
                    ) : (
                      <CheckCircle2 size={20} className={item.status === 'resolved' ? 'text-emerald-600' : 'text-slate-400'} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-surface-900 capitalize">
                        {item.incident_type === 'sos'
                          ? '🚨 SOS Emergency Alert'
                          : item.incident_type === 'medical'
                          ? '🩺 Medical Emergency Request'
                          : item.incident_type === 'fire'
                          ? '🔥 Fire Emergency Alert'
                          : `${item.incident_type} Emergency`}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        item.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">
                      ID: {item.id} • {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-surface-500">
                  <span>{item.location_name || 'Campus'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── My Security Reports ─────────────────────────────────── */}
      {userSecurityReports.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <Shield size={18} className="text-brand-600" /> My Security Reports ({userSecurityReports.length})
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSecurityModalOpen(true)}
              className="text-xs font-bold gap-1 cursor-pointer"
            >
              <Shield size={13} /> New Report
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSecurityReports.map((report) => (
              <SecurityReportCard
                key={report.id}
                report={report}
                onSelect={(r) => {
                  setSelectedSecurityReport(r);
                  setIsSecurityDetailOpen(true);
                }}
                actionLabel="View Status"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── My Unsafe Location Reports ──────────────────────────── */}
      {userUnsafeReports.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <MapPin size={18} className="text-amber-600" /> My Unsafe Location Reports ({userUnsafeReports.length})
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsUnsafeLocationModalOpen(true)}
              className="text-xs font-bold gap-1 cursor-pointer"
            >
              <MapPin size={13} /> Report Hazard
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userUnsafeReports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedUnsafeReport(report);
                  setIsUnsafeDetailOpen(true);
                }}
                className="card p-4 border border-surface-200 hover:border-surface-300 hover:shadow-xs transition-all cursor-pointer bg-white rounded-2xl"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {report.reference_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize bg-surface-100 text-surface-700 border border-surface-200">
                    {report.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-black text-surface-900 truncate">
                  {report.location_name}
                </h4>
                <p className="text-[11px] text-surface-500 capitalize mt-0.5">
                  {report.concern_type.replace(/_/g, ' ')} • {report.unsafe_time}
                </p>
                <p className="text-[11px] text-surface-600 line-clamp-2 mt-2 bg-surface-50 p-2 rounded-xl border border-surface-100">
                  {report.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Medical Emergency Request Modal ──────────────────────── */}
      <MedicalEmergencyForm
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        onEmergencySubmitted={fetchEmergencyData}
      />

      {/* ── Fire Emergency Request Modal ─────────────────────────── */}
      <FireEmergencyForm
        isOpen={isFireModalOpen}
        onClose={() => setIsFireModalOpen(false)}
        onEmergencySubmitted={fetchEmergencyData}
      />

      {/* ── Security Report Creation Modal ──────────────────────── */}
      <SecurityReportForm
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onSuccess={fetchEmergencyData}
      />

      {/* ── Security Report Detail Modal ────────────────────────── */}
      <SecurityReportDetailModal
        report={selectedSecurityReport}
        isOpen={isSecurityDetailOpen}
        onClose={() => {
          setIsSecurityDetailOpen(false);
          setSelectedSecurityReport(null);
        }}
        onStatusUpdated={fetchEmergencyData}
        isWorkerOrAdmin={false}
      />

      {/* ── Unsafe Location Form Modal ─────────────────────────── */}
      <UnsafeLocationForm
        isOpen={isUnsafeLocationModalOpen}
        onClose={() => setIsUnsafeLocationModalOpen(false)}
        onSuccess={fetchEmergencyData}
      />

      {/* ── Unsafe Location Detail Modal ───────────────────────── */}
      <UnsafeLocationDetailModal
        report={selectedUnsafeReport}
        isOpen={isUnsafeDetailOpen}
        onClose={() => {
          setIsUnsafeDetailOpen(false);
          setSelectedUnsafeReport(null);
        }}
        onStatusUpdated={fetchEmergencyData}
        isAuthorizedStaff={false}
      />
    </DashboardLayout>
  );
}
