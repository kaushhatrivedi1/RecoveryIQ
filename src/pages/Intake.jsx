import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  MapPin,
  Mic,
  Pause,
  Play,
  Search,
  Square,
  Target,
  User,
  Volume2,
} from 'lucide-react';
import { PageShell } from '../components/AppChrome';
import { useApp } from '../context/AppContext';
import { BODY_ZONES, PROTOCOLS } from '../data/mockData';
import { generateSessionPlan } from '../services/insights';
import { buildMovementIntelligence } from '../services/innovation';
import {
  buildPausePayload,
  buildResumePayload,
  buildStartPayload,
  buildStopPayload,
  hydrawavLogin,
  hydrawavPublish,
} from '../services/hydrawav';
import CameraAssessment from '../components/CameraAssessment';
import VoiceIntake from '../components/VoiceIntake';
import GuidedAssessment from '../components/GuidedAssessment';
import SessionPlan from '../components/SessionPlan';
import { trackEvent } from '../services/marketing';

function LiveSessionCard({
  patient,
  assessmentData,
  planData,
  sessionState,
  mins,
  secs,
  progress,
  selectedProtocol,
  onPauseToggle,
  onStop,
}) {
  const paused = sessionState === 'paused';
  const running = sessionState === 'running';
  const selectedZoneLabels = (assessmentData?.zones || [])
    .map((zoneId) => BODY_ZONES.find((zone) => zone.id === zoneId)?.label || zoneId)
    .slice(0, 3);
  const latestScore = patient?.recovery_scores?.[patient.recovery_scores.length - 1]?.score || 0;

  return (
    <section className="riq-panel riq-mesh overflow-hidden px-6 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="riq-eyebrow mb-3">Live Session</div>
          <h2 className="riq-section-title text-3xl font-semibold text-slate-950 sm:text-4xl">
            Active Device Session
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            MQTT-backed device controls are active. This view now reflects the actual session focus
            selected for {patient?.name || 'this client'} instead of showing only transport controls.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onPauseToggle} className="riq-button-secondary">
            {paused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
            {paused ? 'Resume All' : 'Pause All'}
          </button>
          <button
            type="button"
            onClick={onStop}
            className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 font-bold text-rose-600 transition hover:-translate-y-[1px]"
          >
            <Square size={15} />
            Stop All
          </button>
          <button type="button" className="riq-button-secondary">
            <Volume2 size={16} />
            Mute
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <div className="riq-card bg-white/90 p-6">
          <div className="mb-5 flex justify-end">
            <span
              className={`riq-pill ${
                running
                  ? '!border-emerald-200 !bg-emerald-50 !text-emerald-700'
                  : '!border-amber-200 !bg-amber-50 !text-amber-700'
              }`}
            >
              {running ? 'Running' : 'Paused'}
            </span>
          </div>

          <div
            className="mx-auto mb-6 flex h-60 w-60 items-center justify-center rounded-full border-[14px] border-slate-200"
            style={{
              background: `conic-gradient(var(--riq-primary) ${progress}%, #e2e8f0 ${progress}% 100%)`,
            }}
          >
            <div className="flex h-[176px] w-[176px] flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <div className="riq-section-title text-5xl font-semibold tracking-tight text-slate-950">
                {mins}:{secs}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[var(--riq-primary)]">
                <span className="text-2xl">☾</span>
                <span className="text-2xl">☀</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-950">Hydra-19 (Blue Crystal)</div>
            <div className="mt-2 text-sm font-medium text-slate-500">{selectedProtocol.name}</div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={onPauseToggle} className="riq-button-secondary !rounded-2xl">
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" onClick={onStop} className="riq-button-secondary !rounded-2xl">
              Stop
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <div className="riq-stat p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Current State</div>
            <div className="mt-3 text-lg font-semibold text-slate-950">
              {running ? 'Running' : paused ? 'Paused' : 'Idle'}
            </div>
          </div>
          <div className="riq-stat p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Protocol</div>
            <div className="mt-3 text-lg font-semibold text-slate-950">{selectedProtocol.name}</div>
          </div>
          <div className="riq-stat p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Device Count</div>
            <div className="mt-3 text-lg font-semibold text-slate-950">1 active device</div>
          </div>
          <div className="riq-stat p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <Target size={14} />
              Session Focus
            </div>
            <div className="text-lg font-semibold text-slate-950">
              {planData?.session_focus || 'Mobility session in progress'}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {planData?.readiness_label || 'Moderate'} readiness · score {latestScore}
            </div>
          </div>
          <div className="riq-stat p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <MapPin size={14} />
              Active Areas
            </div>
            {selectedZoneLabels.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedZoneLabels.map((label) => (
                  <span key={label} className="riq-pill !border-sky-200 !bg-sky-50 !text-sky-700">
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No mapped body areas selected for this session.</div>
            )}
          </div>
          <div className="riq-stat p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Protocol Reason</div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              {planData?.protocol_reason || 'Using the currently selected protocol for this device session.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Intake({ publicMode = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    patients,
    patientsLoading,
    addPatient,
    addPatientSession,
    mqttToken,
    setMqttToken,
    mqttBaseUrl,
    setMqttBaseUrl,
  } = useApp();

  const patientId = params.get('patient');
  const patient = patients.find((entry) => entry.id === patientId) || null;
  const patientName = patient?.name || 'Annie Sturm';
  const [clientQuery, setClientQuery] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    age: '',
    condition: '',
  });

  const [showCamera, setShowCamera] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [voiceFilled, setVoiceFilled] = useState(false);

  const [assessmentData, setAssessmentData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [uiMode, setUiMode] = useState('builder');

  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [deviceMac, setDeviceMac] = useState('74:4D:BD:A0:A3:EC');
  const [mqttUser, setMqttUser] = useState('testpractitioner');
  const [mqttPass, setMqttPass] = useState('1234');
  const [mqttBase, setMqttBase] = useState('http://54.241.236.53:8080');
  const [sessionState, setSessionState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const sessionPlanRef = useRef(null);

  useEffect(() => {
    if (sessionState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((current) => {
          if (current <= 1) {
            clearInterval(timerRef.current);
            setSessionState('stopped');
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionState]);

  useEffect(() => {
    if (!planData || !sessionPlanRef.current) return;
    sessionPlanRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [planData]);

  useEffect(() => {
    if (publicMode) trackEvent('demo_page_view', { source: 'public_demo' });
  }, [publicMode]);

  useEffect(() => {
    // Intake/report state is session-specific and should not leak between clients.
    setShowCamera(false);
    setShowVoice(false);
    setScanData(null);
    setVoiceData(null);
    setVoiceFilled(false);
    setAssessmentData(null);
    setPlanData(null);
    setLoadingPlan(false);
    setUiMode('builder');
    setSessionState('idle');
    setTimeLeft(0);
  }, [patientId]);

  function handleCameraAssessment(data) {
    setScanData(data);
    setShowCamera(false);
  }

  function handleVoiceIntakeComplete(data) {
    setVoiceData(data);
    setVoiceFilled(true);
    setShowVoice(false);
  }

  async function handleAssessmentComplete(data) {
    setAssessmentData(data);
    setLoadingPlan(true);
    const movementIntel = buildMovementIntelligence({
      assessmentData: data,
      scanData,
    });
    const plan = await generateSessionPlan({
      name: data.name,
      zones: data.zones,
      romFindings: data.romFindings || [],
      activities: data.activities || {},
      notes: data.notes || '',
      vitals: scanData?.vitals || null,
      movementIntel,
    });
    setPlanData({
      ...plan,
      innovation: plan.innovation || movementIntel,
    });
    setLoadingPlan(false);
    setUiMode('builder');
  }

  async function handleStartSession(protocol = selectedProtocol) {
    setSelectedProtocol(protocol);

    let token = mqttToken;
    if (!token) {
      try {
        token = await hydrawavLogin({ baseUrl: mqttBase, username: mqttUser, password: mqttPass });
        if (token) {
          setMqttToken(token);
          setMqttBaseUrl(mqttBase);
        }
      } catch {
        alert('MQTT auth failed — check credentials');
        return;
      }
    }

    const payload = buildStartPayload(deviceMac, protocol);
    const ok = await hydrawavPublish({ baseUrl: mqttBase, token, payload });
    if (ok !== false) {
      if (patientId && patient) {
        const latestScore = patient.recovery_scores?.[patient.recovery_scores.length - 1]?.score || 0;
        await addPatientSession(patientId, {
          protocol: protocol?.name || selectedProtocol.name,
          duration: protocol?.duration ?? selectedProtocol.duration,
          zones: assessmentData?.zones || [],
          before_score: latestScore,
          after_score: latestScore,
        });
      }
      setTimeLeft((protocol?.duration ?? selectedProtocol.duration) * 60);
      setSessionState('running');
      setUiMode('session');
    }
  }

  async function handlePause() {
    if (mqttToken) {
      await hydrawavPublish({
        baseUrl: mqttBaseUrl || mqttBase,
        token: mqttToken,
        payload: buildPausePayload(deviceMac),
      });
    }
    setSessionState('paused');
  }

  async function handleResume() {
    if (mqttToken) {
      await hydrawavPublish({
        baseUrl: mqttBaseUrl || mqttBase,
        token: mqttToken,
        payload: buildResumePayload(deviceMac),
      });
    }
    setSessionState('running');
  }

  async function handleStop() {
    if (mqttToken) {
      await hydrawavPublish({
        baseUrl: mqttBaseUrl || mqttBase,
        token: mqttToken,
        payload: buildStopPayload(deviceMac),
      });
    }
    setSessionState('stopped');
    setUiMode('builder');
  }

  const totalSeconds = selectedProtocol.duration * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const activeDevices = sessionState === 'running' || sessionState === 'paused' ? 1 : 0;
  const filteredPatients = patients.filter((entry) => {
    const query = clientQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.condition.toLowerCase().includes(query)
    );
  });

  async function handleCreateClient() {
    if (!clientForm.name.trim() || !clientForm.condition.trim()) return;

    setCreatingClient(true);
    try {
      const created = await addPatient({
        name: clientForm.name.trim(),
        age: Number(clientForm.age) || 0,
        condition: clientForm.condition.trim(),
      });
      setShowClientForm(false);
      setClientForm({ name: '', age: '', condition: '' });
      setClientQuery(created.name);
      navigate(`/intake?patient=${created.id}`);
    } finally {
      setCreatingClient(false);
    }
  }

  return (
    <PageShell
      eyebrow={publicMode ? "Interactive Demo" : "Session Workflow"}
      title={publicMode ? "RecoveryIQ Demo Intake" : "Session Manager"}
      subtitle={publicMode
        ? "Walk through the same guided intake, movement capture, and recovery planning flow used inside the practitioner product."
        : "Guided assessment, AI plan generation, and live session controls in the same RecoveryIQ interface used across the rest of the product."}
      actions={
        <>
          {publicMode ? (
            <>
              <Link to="/book-demo" className="riq-button-secondary">
                Book Live Demo
              </Link>
              <Link to="/login" className="riq-button-secondary">
                Practitioner Login
              </Link>
            </>
          ) : (
            <>
              <div className="riq-pill">
                <span className="font-semibold text-slate-500">Account</span>
                <span className="font-bold text-slate-900">Annie&apos;s Demo Account</span>
              </div>
              <div className="riq-pill !gap-3 !px-3 !py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <User size={16} />
                </span>
                <span className="font-bold text-slate-900">{patientName}</span>
              </div>
            </>
          )}
        </>
      }
    >
      <div className="space-y-6 pb-24">
        {!publicMode ? (
        <section className="riq-panel p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Session Client
          </div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
            <div className="flex-1 space-y-3">
              <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                placeholder="Search and choose a client..."
                className="riq-input pl-12"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
              />
              </div>

              <div className="max-h-56 overflow-y-auto rounded-[1.4rem] border border-slate-200 bg-slate-50/70">
                {patientsLoading ? (
                  <div className="px-4 py-4 text-sm text-slate-500">Loading client records...</div>
                ) : filteredPatients.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    No clients match this search yet.
                  </div>
                ) : (
                  filteredPatients.slice(0, 6).map((entry) => {
                    const isSelected = entry.id === patient?.id;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => navigate(`/intake?patient=${entry.id}`)}
                        className={`flex w-full items-center justify-between gap-4 border-b border-slate-200/80 px-4 py-3 text-left last:border-b-0 ${
                          isSelected ? 'bg-sky-50/80' : 'hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-950">{entry.name}</div>
                          <div className="text-sm text-slate-500">{entry.condition}</div>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {entry.age || 'Age n/a'}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className="riq-button-secondary !min-h-0 !px-6 !py-2.5 !shadow-none"
              >
                Client
              </button>
              <button type="button" className="riq-button-ghost !min-h-0 !px-6 !py-2.5">
                Guest
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowClientForm((value) => !value)}
              className="riq-button-secondary"
            >
              + New Client
            </button>
          </div>

          {showClientForm ? (
            <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-3">
              <input
                value={clientForm.name}
                onChange={(e) => setClientForm((current) => ({ ...current, name: e.target.value }))}
                className="riq-input text-sm"
                placeholder="Client name"
              />
              <input
                value={clientForm.age}
                onChange={(e) => setClientForm((current) => ({ ...current, age: e.target.value }))}
                className="riq-input text-sm"
                placeholder="Age"
                inputMode="numeric"
              />
              <input
                value={clientForm.condition}
                onChange={(e) =>
                  setClientForm((current) => ({ ...current, condition: e.target.value }))
                }
                className="riq-input text-sm"
                placeholder="Primary concern / condition"
              />
              <div className="sm:col-span-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={creatingClient || !clientForm.name.trim() || !clientForm.condition.trim()}
                  className="riq-button disabled:cursor-not-allowed"
                >
                  {creatingClient ? 'Creating...' : 'Create Client'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClientForm(false)}
                  className="riq-button-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </section>
        ) : (
          <section className="riq-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Demo Flow
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  This public demo skips practitioner account management and jumps straight into the
                  product workflow: intake, movement capture, recovery feedback, and session planning.
                </p>
              </div>
              <div className="riq-pill !border-sky-200 !bg-sky-50 !text-sky-700">
                Guest walkthrough mode
              </div>
            </div>
          </section>
        )}

        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setShowVoice((value) => !value);
              setShowCamera(false);
            }}
            className={showVoice ? 'riq-button' : 'riq-button-secondary'}
          >
            <Mic size={16} />
            Voice Intake
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCamera((value) => !value);
              setShowVoice(false);
            }}
            className={showCamera ? 'riq-button' : 'riq-button-secondary'}
          >
            Biometric Scan
          </button>
          {voiceFilled ? (
            <div className="riq-pill !border-emerald-200 !bg-emerald-50 !px-4 !py-3 !text-emerald-700">
              <CheckCircle size={14} />
              Voice intake pre-filled the form
            </div>
          ) : null}
          {scanData?.vitals ? (
            <div className="riq-pill !border-sky-200 !bg-sky-50 !px-4 !py-3 !text-sky-700">
              <CheckCircle size={14} />
              Biometric scan captured
            </div>
          ) : null}
        </section>

        {scanData?.vitals ? (
          <section className="riq-panel p-5 sm:p-6">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Stored Biometric Snapshot
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Heart Rate', value: `${scanData.vitals.hr_bpm} BPM` },
                { label: 'HRV', value: `${scanData.vitals.hrv_sdnn_ms} ms` },
                { label: 'Breath Rate', value: `${scanData.vitals.breath_rate_bpm}/min` },
              ].map((item) => (
                <div key={item.label} className="riq-stat p-5">
                  <div className="text-2xl font-black text-slate-950">{item.value}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showVoice ? (
          <VoiceIntake
            key={`voice-${patientId || 'guest'}`}
            patientName={patientName}
            onIntakeComplete={handleVoiceIntakeComplete}
            onClose={() => setShowVoice(false)}
          />
        ) : null}

        {showCamera ? (
          <CameraAssessment
            key={`camera-${patientId || 'guest'}`}
            patientName={patientName}
            onAssessmentComplete={handleCameraAssessment}
            onClose={() => setShowCamera(false)}
          />
        ) : null}

        {uiMode === 'session' ? (
          <LiveSessionCard
            patient={patient}
            assessmentData={assessmentData}
            planData={planData}
            sessionState={sessionState}
            mins={mins}
            secs={secs}
            progress={progress}
            selectedProtocol={selectedProtocol}
            onPauseToggle={sessionState === 'paused' ? handleResume : handlePause}
            onStop={handleStop}
          />
        ) : null}

        {showVoice ? (
          <section className="riq-panel px-6 py-8 text-sm text-slate-600">
            Voice intake is active. Complete it first so the guided assessment can use the same structured inputs instead of mixing manual and voice entry at the same time.
          </section>
        ) : (
          <GuidedAssessment
            key={`guided-${patientId || 'guest'}`}
            patientName={patientName}
            scanData={scanData}
            voiceData={voiceData}
            onComplete={handleAssessmentComplete}
          />
        )}

        {loadingPlan ? (
          <div className="riq-panel px-6 py-10 text-center text-sm font-semibold text-slate-700">
            Generating AI report...
          </div>
        ) : null}

        {planData ? (
          <div ref={sessionPlanRef}>
            <SessionPlan
              key={`plan-${patientId || 'guest'}`}
              assessmentData={assessmentData}
              planData={planData}
              scanData={scanData}
              onStartSession={handleStartSession}
              onProtocolChange={setSelectedProtocol}
            />
          </div>
        ) : null}

        <details className="riq-panel px-5 py-4 text-sm text-slate-600">
          <summary className="cursor-pointer font-semibold text-slate-900">
            Device credentials and MAC address
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <input
              value={mqttBase}
              onChange={(e) => setMqttBase(e.target.value)}
              className="riq-input text-sm"
              placeholder="API base URL"
            />
            <input
              value={mqttUser}
              onChange={(e) => setMqttUser(e.target.value)}
              className="riq-input text-sm"
              placeholder="Username"
            />
            <input
              type="password"
              value={mqttPass}
              onChange={(e) => setMqttPass(e.target.value)}
              className="riq-input text-sm"
              placeholder="Password"
            />
            <input
              value={deviceMac}
              onChange={(e) => setDeviceMac(e.target.value)}
              className="riq-input text-sm"
              placeholder="Device MAC"
            />
          </div>
        </details>
      </div>

      <div className="fixed bottom-4 left-1/2 z-40 w-[min(1120px,calc(100%-1rem))] -translate-x-1/2">
        <div className="riq-topbar !top-0 !rounded-[1.75rem] !px-5 !py-4">
          <div className="text-sm font-medium text-slate-500">{activeDevices} devices ready</div>
          <button
            type="button"
            onClick={() => handleStartSession(selectedProtocol)}
            disabled={!planData}
            className="riq-button disabled:cursor-not-allowed"
          >
            <Play size={18} fill="currentColor" />
            Start Session
          </button>
        </div>
      </div>
    </PageShell>
  );
}
