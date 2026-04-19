import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
} from 'lucide-react';
import { PageShell } from '../components/AppChrome';
import { useApp } from '../context/AppContext';
import { BODY_ZONES, PROTOCOLS } from '../data/mockData';
import {
  buildStartPayload,
  generateClientBrief,
  mqttAuth,
  mqttCommand,
} from '../services/api';
import Body3D from '../components/Body3D';
import CameraAssessment from '../components/CameraAssessment';
import { VoicePanel } from '../components/VoiceAndASL';

const BEHAVIORS = ['Always Present', 'Comes and Goes', 'Only with Certain Activities', 'Varies Day to Day'];
const DURATIONS = ['Less than 6 weeks', '6 weeks to 3 months', '3 to 6 months', '6 months to 1 year', 'More than 1 year'];
const CONTRAINDICATION_ZONES = ['left_foot', 'right_foot', 'left_calf', 'right_calf'];

function StepDots({ step }) {
  return (
    <div className="flex items-center gap-2">
      {['form', 'brief', 'session'].map((entry, index) => {
        const currentIndex = ['form', 'brief', 'session'].indexOf(step);
        const active = step === entry;
        const complete = index < currentIndex;
        return (
          <div
            key={entry}
            className={`h-2.5 w-10 rounded-full transition-all ${
              active ? 'bg-gradient-to-r from-sky-500 to-cyan-500' : complete ? 'bg-emerald-400' : 'bg-slate-200'
            }`}
          />
        );
      })}
    </div>
  );
}

export default function Intake() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { patients, mqttToken, setMqttToken, mqttBaseUrl, setMqttBaseUrl } = useApp();

  const patientId = params.get('patient');
  const patient = patients.find((entry) => entry.id === patientId) || null;

  const [patientName, setPatientName] = useState(patient?.name || '');
  const [selectedZones, setSelectedZones] = useState([]);
  const [zoneDetails, setZoneDetails] = useState({});
  const [hrv, setHrv] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState('form');
  const [brief, setBrief] = useState('');
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [deviceMac, setDeviceMac] = useState('74:4D:BD:A0:A3:EC');
  const [mqttUser, setMqttUser] = useState('');
  const [mqttPass, setMqttPass] = useState('');
  const [mqttBase, setMqttBase] = useState('https://api.hydrawav3.studio');
  const [sessionState, setSessionState] = useState('idle');
  const [elevenKey, setElevenKey] = useState('');
  const [contraAcknowledged, setContraAcknowledged] = useState(false);

  // ── Camera assessment state ──
  const [assessmentData, setAssessmentData] = useState(null);

  const hasContraindication = selectedZones.some((zone) => CONTRAINDICATION_ZONES.includes(zone));

  function toggleZone(zoneId) {
    setSelectedZones((previous) =>
      previous.includes(zoneId) ? previous.filter((zone) => zone !== zoneId) : [...previous, zoneId]
    );
    if (!zoneDetails[zoneId]) {
      setZoneDetails((previous) => ({
        ...previous,
        [zoneId]: { discomfort: 5, behavior: BEHAVIORS[0], duration: DURATIONS[2] },
      }));
    }
  }

  function updateZoneDetail(zoneId, field, value) {
    setZoneDetails((previous) => ({
      ...previous,
      [zoneId]: { ...previous[zoneId], [field]: value },
    }));
  }

  async function handleGenerateBrief() {
    if (!patientName || selectedZones.length === 0) return;
    setLoadingBrief(true);

    const primaryZone = selectedZones[0];
    const detail = zoneDetails[primaryZone] || {};
    const text = await generateClientBrief({
      name: patientName,
      zones: selectedZones,
      discomfort: detail.discomfort || 5,
      behavior: detail.behavior || BEHAVIORS[1],
      duration: detail.duration || DURATIONS[2],
      hrv: hrv || null,
      notes,
      rom: assessmentData?.rom || null,
      flags: assessmentData?.flags || [],
    });

    setBrief(text);
    setLoadingBrief(false);
    setStep('brief');
  }

  async function handleStartSession() {
    if (!mqttToken) {
      try {
        const token = await mqttAuth(mqttBase, mqttUser, mqttPass);
        if (token) {
          setMqttToken(token);
          setMqttBaseUrl(mqttBase);
        }
      } catch {
        alert('MQTT auth failed — check credentials');
        return;
      }
    }

    const token = mqttToken;
    const payload = buildStartPayload(deviceMac, selectedProtocol);
    const ok = await mqttCommand(mqttBase, token, payload);
    if (ok !== false) {
      setSessionState('running');
      setStep('session');
    }
  }

  async function handlePause() {
    if (mqttToken) {
      await mqttCommand(mqttBaseUrl || mqttBase, mqttToken, { mac: deviceMac, playCmd: 2 });
    }
    setSessionState('paused');
  }

  async function handleResume() {
    if (mqttToken) {
      await mqttCommand(mqttBaseUrl || mqttBase, mqttToken, { mac: deviceMac, playCmd: 4 });
    }
    setSessionState('running');
  }

  async function handleStop() {
    if (mqttToken) {
      await mqttCommand(mqttBaseUrl || mqttBase, mqttToken, { mac: deviceMac, playCmd: 3 });
    }
    setSessionState('stopped');
  }

  const hrvFlag = hrv
    ? parseInt(hrv, 10) < 50
      ? { type: 'warn', msg: 'HRV below 50ms. A recovery-focused session is recommended.' }
      : parseInt(hrv, 10) > 70
        ? { type: 'good', msg: 'HRV above 70ms. Patient may be ready for activation work.' }
        : { type: 'neutral', msg: `HRV at ${hrv}ms. Patient appears in a moderate recovery state.` }
    : null;

  return (
    <PageShell
      backTo="/dashboard"
      eyebrow="Smart Intake"
      title={patient ? `Guided intake for ${patient.name}` : 'Guided intake for a new patient'}
      subtitle="This flow has been rebuilt with a lighter futuristic template: clearer steps, calmer form fields, and a more premium consultation feel."
      actions={<StepDots step={step} />}
      contentWidth="max-w-6xl"
    >
      {/* ── STEP: FORM ── */}
      {step === 'form' ? (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* Left column — body map */}
          <article className="riq-panel riq-mesh px-6 py-6 sm:px-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="riq-eyebrow mb-3">Interactive body map</div>
                <h2 className="riq-section-title text-3xl font-semibold text-slate-950">Select areas of focus</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tap the zones of concern. The new body map is brighter and easier to read during intake.
                </p>
              </div>
              <span className="riq-pill text-slate-500">{selectedZones.length} selected</span>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/75 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="h-[420px] overflow-hidden rounded-[1.75rem] border border-slate-100 bg-gradient-to-b from-white to-sky-50/70 sm:h-[520px]">
                <Body3D selectedZones={selectedZones} onToggleZone={toggleZone} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedZones.length > 0 ? (
                  selectedZones.map((zoneId) => {
                    const zone = BODY_ZONES.find((entry) => entry.id === zoneId);
                    return (
                      <span key={zoneId} className="riq-pill bg-sky-50 text-sky-700">
                        {zone?.label}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-slate-400">No zones selected yet.</span>
                )}
              </div>
            </div>

            {selectedZones.length > 0 ? (
              <div className="mt-5 space-y-4">
                {selectedZones.map((zoneId) => {
                  const zone = BODY_ZONES.find((entry) => entry.id === zoneId);
                  const detail = zoneDetails[zoneId] || {};
                  return (
                    <div key={zoneId} className="rounded-[1.75rem] border border-slate-200/70 bg-white/75 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-base font-semibold text-slate-950">{zone?.label}</div>
                        <span className="riq-pill text-slate-500">Active zone</span>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                          <span>Discomfort level</span>
                          <span>{detail.discomfort || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={detail.discomfort || 5}
                          onChange={(e) => updateZoneDetail(zoneId, 'discomfort', parseInt(e.target.value, 10))}
                          className="h-2 w-full cursor-pointer accent-sky-600"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <select
                          value={detail.behavior || BEHAVIORS[0]}
                          onChange={(e) => updateZoneDetail(zoneId, 'behavior', e.target.value)}
                          className="riq-select"
                        >
                          {BEHAVIORS.map((behavior) => (
                            <option key={behavior}>{behavior}</option>
                          ))}
                        </select>
                        <select
                          value={detail.duration || DURATIONS[2]}
                          onChange={(e) => updateZoneDetail(zoneId, 'duration', e.target.value)}
                          className="riq-select"
                        >
                          {DURATIONS.map((duration) => (
                            <option key={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </article>

          {/* Right column */}
          <div className="space-y-6">

            {/* ── CAMERA ASSESSMENT ── */}
            <article className="riq-card px-5 py-5 sm:px-6">
              <div className="riq-eyebrow mb-4">Camera Assessment</div>
              <CameraAssessment
                patientName={patientName || 'Patient'}
                onAssessmentComplete={(data) => {
                  setAssessmentData(data);
                  // Auto-fill HRV if camera extracted it
                  if (data.hrv) setHrv(String(data.hrv));
                }}
              />
              {/* Show assessment flags inline if complete */}
              {assessmentData?.flags?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {assessmentData.flags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
                    >
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      {flag}
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* Patient context */}
            <article className="riq-card px-5 py-5 sm:px-6">
              <div className="riq-eyebrow mb-4">Patient context</div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Patient name</label>
                  <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="riq-input"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    HRV (ms){' '}
                    <span className="text-slate-400">
                      {assessmentData?.hrv ? '— auto-filled from camera scan' : 'optional'}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={hrv}
                    onChange={(e) => setHrv(e.target.value)}
                    className="riq-input"
                    placeholder="e.g. 42"
                  />
                  {hrvFlag ? (
                    <div
                      className={`mt-3 rounded-[1.25rem] border px-4 py-3 text-sm ${
                        hrvFlag.type === 'warn'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : hrvFlag.type === 'good'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-sky-200 bg-sky-50 text-sky-700'
                      }`}
                    >
                      {hrvFlag.msg}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Additional notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="riq-textarea"
                    placeholder="Any additional observations or patient comments..."
                  />
                </div>
              </div>
            </article>

            {/* ElevenLabs key */}
            <article className="riq-card px-5 py-5 sm:px-6">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                ElevenLabs API key <span className="text-slate-400">optional</span>
              </label>
              <input
                value={elevenKey}
                onChange={(e) => setElevenKey(e.target.value)}
                className="riq-input"
                placeholder="sk_..."
                type="password"
              />
            </article>

            {/* Contraindication warning */}
            {hasContraindication ? (
              <article className="rounded-[1.75rem] border border-rose-200 bg-rose-50/90 px-5 py-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
                  <div>
                    <div className="font-semibold text-rose-700">Contraindication warning</div>
                    <p className="mt-2 text-sm leading-6 text-rose-700/85">
                      Selected zone may require additional safety screening before treatment.
                    </p>
                    <label className="mt-3 flex items-center gap-2 text-sm text-rose-700">
                      <input
                        type="checkbox"
                        checked={contraAcknowledged}
                        onChange={(e) => setContraAcknowledged(e.target.checked)}
                        className="accent-rose-500"
                      />
                      I have reviewed safety screening for this selection.
                    </label>
                  </div>
                </div>
              </article>
            ) : null}

            {/* Generate brief CTA */}
            <article className="riq-panel px-5 py-5 sm:px-6">
              <div className="mb-4">
                <div className="riq-eyebrow mb-3">Step 2 preview</div>
                <h3 className="riq-section-title text-2xl font-semibold text-slate-950">
                  Generate the client brief
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The brief combines area, severity, symptom pattern, HRV
                  {assessmentData ? ', camera ROM data,' : ''} and notes into a polished summary.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateBrief}
                disabled={
                  !patientName ||
                  selectedZones.length === 0 ||
                  loadingBrief ||
                  (hasContraindication && !contraAcknowledged)
                }
                className="riq-button w-full"
              >
                {loadingBrief ? 'Generating client brief...' : 'Generate client brief'}
              </button>

              {selectedZones.length === 0 ? (
                <p className="mt-3 text-center text-sm text-slate-400">
                  Select at least one body zone to continue.
                </p>
              ) : null}
            </article>
          </div>
        </section>
      ) : null}

      {/* ── STEP: BRIEF ── */}
      {step === 'brief' ? (
        <section className="mx-auto max-w-4xl">
          <article className="riq-panel riq-mesh px-6 py-7 sm:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="riq-eyebrow mb-3">
                  <Sparkles size={14} />
                  AI Wellness Summary
                </div>
                <h2 className="riq-section-title text-3xl font-semibold text-slate-950">Client brief ready</h2>
              </div>
              <span className="riq-pill text-slate-500">{new Date().toLocaleTimeString()}</span>
            </div>

            {/* Intake summary grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Patient', value: patientName },
                { label: 'Primary zones', value: selectedZones.map((zone) => zone.replace(/_/g, ' ')).join(', ') },
                { label: 'Discomfort', value: `${zoneDetails[selectedZones[0]]?.discomfort || 5}/10` },
                { label: 'Pattern', value: zoneDetails[selectedZones[0]]?.behavior || BEHAVIORS[1] },
                { label: 'Duration', value: zoneDetails[selectedZones[0]]?.duration || DURATIONS[2] },
                { label: 'HRV', value: hrv ? `${hrv}ms` : 'Not provided' },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] bg-white/80 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                  <div className="mt-2 text-sm font-semibold leading-6 text-slate-900 capitalize">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Camera ROM summary — only if assessment was done */}
            {assessmentData?.rom && (
              <div className="mt-4 rounded-[1.75rem] border border-sky-100 bg-white/80 px-5 py-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">Camera Assessment</div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[
                    { label: 'L Shoulder', val: assessmentData.rom.leftShoulder },
                    { label: 'R Shoulder', val: assessmentData.rom.rightShoulder },
                    { label: 'L Hip', val: assessmentData.rom.leftHip },
                    { label: 'R Hip', val: assessmentData.rom.rightHip },
                    { label: 'L Knee', val: assessmentData.rom.leftKnee },
                    { label: 'R Knee', val: assessmentData.rom.rightKnee },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="text-lg font-bold font-mono text-slate-800">{m.val ?? '—'}°</div>
                      <div className="text-xs text-slate-400">{m.label}</div>
                    </div>
                  ))}
                </div>
                {assessmentData.rom.asymmetryFlag && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle size={13} />
                    Asymmetry detected — {assessmentData.rom.asymmetryScore} point difference between sides
                  </div>
                )}
              </div>
            )}

            {/* AI brief text */}
            <div className="mt-6 rounded-[1.75rem] border border-cyan-100 bg-white/85 px-5 py-5 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-700">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                AI-generated wellness summary
              </div>
              <p className="text-sm leading-7 text-slate-600">{brief}</p>
            </div>

            {/* ── VOICE PANEL (ElevenLabs + ASL) ── */}
            <div className="mt-5">
              <VoicePanel text={brief} label="Read Brief" />
            </div>

            {/* Protocol + MQTT config */}
            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <div className="riq-card px-5 py-5">
                <div className="mb-4">
                  <div className="riq-eyebrow mb-3">Protocol selection</div>
                  <h3 className="riq-section-title text-2xl font-semibold text-slate-950">
                    Configure the session
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Treatment protocol</label>
                    <select
                      value={selectedProtocol.id}
                      onChange={(e) =>
                        setSelectedProtocol(PROTOCOLS.find((protocol) => protocol.id === e.target.value))
                      }
                      className="riq-select"
                    >
                      {PROTOCOLS.map((protocol) => (
                        <option key={protocol.id} value={protocol.id}>
                          {protocol.name} ({protocol.duration} min)
                        </option>
                      ))}
                    </select>
                    {/* Protocol description to avoid confusion */}
                    {selectedProtocol?.description && (
                      <p className="mt-2 text-xs text-slate-400">{selectedProtocol.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Device MAC address</label>
                    <input
                      value={deviceMac}
                      onChange={(e) => setDeviceMac(e.target.value)}
                      className="riq-input"
                      placeholder="74:4D:BD:A0:A3:EC"
                    />
                  </div>
                </div>
              </div>

              <div className="riq-card px-5 py-5">
                <div className="mb-4">
                  <div className="riq-eyebrow mb-3">MQTT connection</div>
                  <h3 className="riq-section-title text-2xl font-semibold text-slate-950">
                    Device control credentials
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">API base URL</label>
                    <input
                      value={mqttBase}
                      onChange={(e) => setMqttBase(e.target.value)}
                      className="riq-input"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Username</label>
                    <input
                      value={mqttUser}
                      onChange={(e) => setMqttUser(e.target.value)}
                      className="riq-input"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
                    <input
                      type="password"
                      value={mqttPass}
                      onChange={(e) => setMqttPass(e.target.value)}
                      className="riq-input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleStartSession} className="riq-button">
                <Play size={18} fill="white" />
                Start {selectedProtocol.name.split('(')[0].trim()} session
              </button>
              <button type="button" onClick={() => setStep('form')} className="riq-button-secondary">
                <RotateCcw size={16} />
                Back to intake
              </button>
            </div>
          </article>
        </section>
      ) : null}

      {/* ── STEP: SESSION ── */}
      {step === 'session' ? (
        <section className="mx-auto max-w-3xl">
          <article className="riq-panel riq-mesh px-6 py-8 text-center sm:px-8">
            <div
              className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-8 ${
                sessionState === 'running'
                  ? 'border-emerald-200 bg-emerald-50'
                  : sessionState === 'paused'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-rose-200 bg-rose-50'
              }`}
            >
              {sessionState === 'running' ? (
                <div className="h-7 w-7 rounded-full bg-emerald-500 animate-pulse" />
              ) : sessionState === 'paused' ? (
                <Pause size={32} className="text-amber-600" />
              ) : (
                <Square size={32} className="text-rose-600" />
              )}
            </div>

            <div className="riq-eyebrow mb-4">Session control</div>
            <h2 className="riq-section-title text-4xl font-semibold text-slate-950">
              {sessionState === 'running'
                ? 'Session active'
                : sessionState === 'paused'
                  ? 'Session paused'
                  : 'Session complete'}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {selectedProtocol.name} · {selectedProtocol.duration} min · {patientName}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {sessionState === 'running' ? (
                <>
                  <button type="button" onClick={handlePause} className="riq-button-secondary">
                    <Pause size={16} />
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 font-semibold text-white shadow-[0_16px_30px_rgba(234,91,122,0.25)]"
                  >
                    <Square size={16} />
                    Stop
                  </button>
                </>
              ) : null}

              {sessionState === 'paused' ? (
                <>
                  <button type="button" onClick={handleResume} className="riq-button">
                    <Play size={16} fill="white" />
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 font-semibold text-white shadow-[0_16px_30px_rgba(234,91,122,0.25)]"
                  >
                    <Square size={16} />
                    Stop
                  </button>
                </>
              ) : null}

              {sessionState === 'stopped' ? (
                <button
                  type="button"
                  onClick={() => navigate(`/journey/${patientId || 'maria-001'}`)}
                  className="riq-button"
                >
                  View patient journey
                </button>
              ) : null}
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-slate-200/70 bg-white/80 px-4 py-4 text-left">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle size={15} className="text-emerald-600" />
                MQTT command dispatched to `HydraWav3Pro/config`
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                playCmd: {sessionState === 'running' ? 1 : sessionState === 'paused' ? 2 : 3}
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </PageShell>
  );
}