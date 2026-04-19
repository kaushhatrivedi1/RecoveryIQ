import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import Body3D from './Body3D';
import {
  AGGRAVATING_FACTORS,
  BODY_ZONES,
  DAILY_ACTIVITIES,
  POSITION_TOLERANCE,
  ROM_TESTS,
  SENSATION_TAGS,
  SLEEP_POSTURES,
} from '../data/mockData';

const TOTAL_STEPS = 4;
const BEHAVIORS = ['Always Present', 'Comes and Goes', 'Only with Certain Activities', 'Varies Day to Day'];
const DURATIONS = ['Less than 6 weeks', '6 weeks to 3 months', '3 to 6 months', '6 months to 1 year', 'More than 1 year'];
const CONTRAINDICATION_ZONES = ['left_foot', 'right_foot', 'left_calf', 'right_calf'];
const BACKEND = 'http://localhost:8000';
const MOTION_CAPTURE_SECONDS = 6;
const MOTION_CAPTURE_FPS = 8;
const TOTAL_MOTION_FRAMES = MOTION_CAPTURE_SECONDS * MOTION_CAPTURE_FPS;

const ROM_ART = {
  forward_bend: '↘',
  squat: '⌴',
  sit_to_stand: '↥',
  trunk_rotation: '↺',
  ankle_dorsiflexion: '⌞',
  shoulder_flexion: '↗',
  gait: '⇢',
  neck_flexion: '⌵',
  neck_rotation: '⟳',
  hip_flexion: '⌜',
  manual_entry: '✦',
};

const MOVEMENT_GUIDE_SRC = {
  forward_bend: '/guides/forward_bend.png',
  squat: '/guides/squat.png',
  sit_to_stand: '/guides/sit_to_stand.png',
  trunk_rotation: '/guides/trunk_rotation.png',
  ankle_dorsiflexion: '/guides/ankle_dorsiflexion.png',
  shoulder_flexion: '/guides/shoulder_flexion.png',
  gait: '/guides/gait.png',
  neck_flexion: '/guides/neck_flexion.png',
  neck_rotation: '/guides/neck_rotation.png',
  hip_flexion: '/guides/hip_flexion.png',
  manual_entry: '/guides/manual_entry.svg',
};

function StepProgress({ currentStep }) {
  const steps = [
    { id: 1, label: 'Step 1', title: 'Area of Focus' },
    { id: 2, label: 'Step 2', title: 'Range of Motion' },
    { id: 3, label: 'Step 3', title: 'Daily Activities' },
    { id: 4, label: 'Step 4', title: 'Final Remarks' },
  ];

  const width = `${(currentStep / TOTAL_STEPS) * 100}%`;

  return (
    <div className="space-y-5">
      <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className="h-full rounded-full bg-[#CBA989] transition-all duration-300" style={{ width }} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {steps.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 text-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all ${
                  done
                    ? 'bg-[#CBA989] text-white'
                    : active
                      ? 'bg-[#1C303A] text-white'
                      : 'bg-[#ECEEF3] text-[#9AA3B2]'
                }`}
              >
                {done ? <Check size={16} /> : step.id}
              </div>
              <span className={`text-[11px] font-semibold ${active ? 'text-[#1C303A]' : 'text-[#8B93A5]'}`}>{step.label}</span>
              <span className={`text-[11px] font-medium ${active ? 'text-[#1C303A]' : 'text-[#8B93A5]'}`}>{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ active, children, onClick, tone = 'default' }) {
  const activeMap = {
    default: 'border-[#1C303A] bg-[#1C303A] text-white shadow-sm',
    tan: 'border-[#CBA989] bg-[#CBA989] text-white shadow-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
        active
          ? activeMap[tone]
          : 'border-[#DFE3EA] bg-white text-[#647084] hover:border-[#CBA989] hover:text-[#1C303A]'
      }`}
    >
      {children}
    </button>
  );
}

function StepArea({
  zones,
  zoneDetails,
  onToggleZone,
  onUpdateDetail,
  contraAcknowledged,
  onContraChange,
}) {
  const selectedZones = zones
    .map((id) => BODY_ZONES.find((zone) => zone.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-[#17303A]">Area of Focus</h3>
            <p className="mt-1 text-sm text-[#7B8495]">Tap body regions and set the primary complaint first.</p>
          </div>
          <div className="h-[360px] overflow-hidden rounded-[24px] border border-[#EEF1F4] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7F2EC_100%)]">
            <Body3D selectedZones={zones} onToggleZone={onToggleZone} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedZones.length === 0 ? (
              <span className="text-sm text-[#98A1B2]">No areas selected yet.</span>
            ) : (
              selectedZones.map((zone, index) => (
                <div
                  key={zone.id}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                    index === 0
                      ? 'border-[#CBA989] bg-[#FAF2EA] text-[#8A6345]'
                      : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#556074]'
                  }`}
                >
                  <span>{zone.label}</span>
                  {index === 0 ? <span className="rounded-full bg-[#CBA989] px-2 py-0.5 text-[9px] text-white">PRIMARY</span> : null}
                  <button type="button" onClick={() => onToggleZone(zone.id)} className="opacity-60 hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedZones.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#98A1B2]">
              Select an area on the body map to configure discomfort and duration.
            </div>
          ) : (
            selectedZones.map((zone, index) => {
              const detail = zoneDetails[zone.id] || {};
              return (
                <div key={zone.id} className="rounded-[28px] border border-[#ECE7E1] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.03)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A9917B]">
                        {index === 0 ? 'Primary Region' : 'Secondary Region'}
                      </div>
                      <div className="mt-1 text-lg font-bold text-[#17303A]">{zone.label}</div>
                    </div>
                    <div className="rounded-full bg-[#F6F7F9] px-3 py-1 text-xs font-bold text-[#607086]">
                      {detail.discomfort ?? 5}/10
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-[#98A1B2]">
                      <span>Discomfort level</span>
                      <span>{detail.discomfort ?? 5}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={detail.discomfort ?? 5}
                      onChange={(e) => onUpdateDetail(zone.id, 'discomfort', Number(e.target.value))}
                      className="h-2 w-full cursor-pointer accent-[#CBA989]"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Behavior</div>
                    <div className="flex flex-wrap gap-2">
                      {BEHAVIORS.map((behavior) => (
                        <Pill
                          key={behavior}
                          active={(detail.behavior ?? BEHAVIORS[1]) === behavior}
                          onClick={() => onUpdateDetail(zone.id, 'behavior', behavior)}
                        >
                          {behavior}
                        </Pill>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Duration</div>
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((duration) => (
                        <Pill
                          key={duration}
                          active={(detail.duration ?? DURATIONS[2]) === duration}
                          onClick={() => onUpdateDetail(zone.id, 'duration', duration)}
                        >
                          {duration}
                        </Pill>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Notes</div>
                    <textarea
                      rows={2}
                      value={detail.notes ?? ''}
                      onChange={(e) => onUpdateDetail(zone.id, 'notes', e.target.value)}
                      placeholder="Add practitioner notes for this region..."
                      className="riq-textarea !rounded-[18px] !border-[#E6EAF0] !bg-[#FAFBFD] text-sm"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {zones.some((zone) => CONTRAINDICATION_ZONES.includes(zone)) ? (
        <label className="flex items-start gap-3 rounded-[22px] border border-[#F0D4D4] bg-[#FFF6F6] px-4 py-4 text-sm text-[#8B4950]">
          <input type="checkbox" checked={contraAcknowledged} onChange={(e) => onContraChange(e.target.checked)} className="mt-1 accent-[#CBA989]" />
          <span>I reviewed the safety notice for foot and calf selection before generating a plan.</span>
        </label>
      ) : null}
    </div>
  );
}

function StepRom({ romFindings, onAddFinding, onRemoveFinding }) {
  const [activeTest, setActiveTest] = useState(ROM_TESTS[0].id);
  const [draft, setDraft] = useState({ body_part: '', side: 'Both', sensations: [], custom_test: '' });

  const activeConfig = ROM_TESTS.find((test) => test.id === activeTest) || ROM_TESTS[0];
  const bodyParts = activeConfig.id === 'manual_entry' ? [] : activeConfig.body_parts;

  function toggleSensation(tag) {
    setDraft((prev) => ({
      ...prev,
      sensations: prev.sensations.includes(tag)
        ? prev.sensations.filter((item) => item !== tag)
        : [...prev.sensations, tag],
    }));
  }

  function addFinding() {
    const testLabel = activeConfig.label;
    const bodyPart = activeConfig.id === 'manual_entry' ? draft.custom_test.trim() : draft.body_part;
    if (!bodyPart) return;
    onAddFinding({
      test: activeConfig.id,
      test_label: testLabel,
      body_part: bodyPart,
      side: draft.side,
      position: 'Both',
      sensations: draft.sensations,
    });
    setDraft({ body_part: '', side: 'Both', sensations: [], custom_test: '' });
  }

  function importCaptureFindings(findings) {
    findings.forEach((finding) => {
      onAddFinding({
        test: activeConfig.id,
        test_label: activeConfig.label,
        body_part: finding.body_part,
        side: finding.side || 'Both',
        position: 'Both',
        sensations: finding.sensations || [],
      });
    });
  }

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-3">
          {ROM_TESTS.map((test) => {
            const active = test.id === activeTest;
            return (
              <button
                key={test.id}
                type="button"
                onClick={() => setActiveTest(test.id)}
                className={`min-w-[122px] rounded-[18px] border px-3 py-4 text-left transition-all ${
                  active
                    ? 'border-[#1C303A] bg-[#1C303A] text-white shadow-[0_18px_36px_rgba(28,48,58,0.18)]'
                    : 'border-[#E8EBF0] bg-white text-[#1C303A] hover:border-[#CBA989]'
                }`}
              >
                <div className={`mb-3 flex h-20 items-center justify-center rounded-[16px] text-4xl ${active ? 'bg-white/10' : 'bg-[#F7F2EC]'}`}>
                  {ROM_ART[test.id] || '•'}
                </div>
                <div className="text-xs font-black leading-tight">{test.label}</div>
                <div className={`mt-1 text-[8px] font-bold uppercase tracking-wide ${active ? 'text-white/65' : 'text-[#95A0B1]'}`}>
                  {test.region}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeConfig.id !== 'manual_entry' ? (
        <MotionCapturePanel activeConfig={activeConfig} onImportFindings={importCaptureFindings} />
      ) : null}

      <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Body Part</div>
            {activeConfig.id === 'manual_entry' ? (
              <input
                value={draft.custom_test}
                onChange={(e) => setDraft((prev) => ({ ...prev, custom_test: e.target.value }))}
                placeholder="Enter custom test or body part"
                className="riq-input !rounded-[16px] !border-[#E6EAF0] !bg-[#FAFBFD] text-sm"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {bodyParts.map((bodyPart) => (
                  <Pill
                    key={bodyPart}
                    active={draft.body_part === bodyPart}
                    onClick={() => setDraft((prev) => ({ ...prev, body_part: bodyPart }))}
                    tone="tan"
                  >
                    {bodyPart}
                  </Pill>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Side / Sensations</div>
            <div className="mb-2 flex flex-wrap gap-2">
              {['Left', 'Both', 'Right'].map((side) => (
                <Pill
                  key={side}
                  active={draft.side === side}
                  onClick={() => setDraft((prev) => ({ ...prev, side }))}
                >
                  {side}
                </Pill>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SENSATION_TAGS.map((tag) => (
                <Pill key={tag} active={draft.sensations.includes(tag)} onClick={() => toggleSensation(tag)}>
                  {tag}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={addFinding}
              disabled={activeConfig.id === 'manual_entry' ? !draft.custom_test.trim() : !draft.body_part}
              className="inline-flex items-center gap-2 rounded-[16px] bg-[#1C303A] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

      {romFindings.length > 0 ? (
        <div className="space-y-3">
          {romFindings.map((finding, index) => (
            <div key={`${finding.test}-${index}`} className="flex items-start justify-between gap-3 rounded-[20px] border border-[#E8EBF0] bg-white px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-[#EAF5EF] p-1.5 text-[#2E8B57]">
                  <Check size={12} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#17303A]">
                    {finding.test_label} <span className="font-medium text-[#7B8495]">· {finding.body_part} · {finding.side}</span>
                  </div>
                  {finding.sensations.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {finding.sensations.map((sensation) => (
                        <span key={sensation} className="rounded-full bg-[#F7F2EC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8A6345]">
                          {sensation}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <button type="button" onClick={() => onRemoveFinding(index)} className="text-[#C1C7D1] transition-colors hover:text-[#D05D5D]">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MotionCapturePanel({ activeConfig, onImportFindings }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const previewRequestRef = useRef(0);

  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewReady, setPreviewReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setPreviewReady(false);
  }, []);

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    stopStream();
  }, [stopStream]);

  const ensurePreview = useCallback(async () => {
    if (streamRef.current && videoRef.current?.srcObject) {
      setPreviewReady(true);
      return true;
    }

    const requestId = previewRequestRef.current + 1;
    previewRequestRef.current = requestId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      if (previewRequestRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPreviewReady(true);
      setErrorMsg('');
      return true;
    } catch (error) {
      setPreviewReady(false);
      setErrorMsg(error.message || 'Camera access denied');
      return false;
    }
  }, []);

  useEffect(() => {
    if (phase !== 'idle') return;
    ensurePreview();
  }, [phase, activeConfig.id, ensurePreview]);

  async function startCapture() {
    setPhase('starting');
    setProgress(0);
    setResult(null);
    setErrorMsg('');

    try {
      const ready = await ensurePreview();
      if (!ready) throw new Error('Camera preview unavailable');
      setPhase('capturing');

      const captured = [];
      intervalRef.current = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 320, 240);
        captured.push(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
        setProgress(Math.round((captured.length / TOTAL_MOTION_FRAMES) * 100));

        if (captured.length >= TOTAL_MOTION_FRAMES) {
          clearInterval(intervalRef.current);
          stopStream();
          analyzeMovement(captured);
        }
      }, 1000 / MOTION_CAPTURE_FPS);
    } catch (error) {
      setPhase('error');
      setErrorMsg(error.message || 'Camera access denied');
    }
  }

  async function analyzeMovement(capturedFrames) {
    setPhase('analyzing');
    try {
      const res = await fetch(`${BACKEND}/api/analyze-movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames_b64: capturedFrames,
          fps: MOTION_CAPTURE_FPS,
          movement_type: activeConfig.id,
        }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('done');
    } catch {
      setResult({
        detected: true,
        quality_score: 61,
        quality_label: 'Moderate',
        all_flags: [`${activeConfig.label} capture used demo movement analysis.`],
        range_of_motion: {},
        suggested_findings: [
          {
            body_part: activeConfig.body_parts[0] || activeConfig.label,
            side: 'Both',
            sensations: ['Stiff'],
          },
        ],
      });
      setPhase('done');
    }
  }

  function resetCapture() {
    clearInterval(intervalRef.current);
    setPhase('idle');
    setProgress(0);
    setResult(null);
    ensurePreview();
  }

  return (
    <div className="rounded-[28px] border border-[#D9E7F8] bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)] p-5 shadow-[0_14px_28px_rgba(59,130,246,0.06)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4E81D8]">Camera Movement Capture</div>
          <div className="mt-1 text-lg font-bold text-[#17303A]">{activeConfig.label}</div>
          <p className="mt-1 text-sm text-[#6E7B8E]">
            Record this motion directly in the app to extract ROM, asymmetry, and movement quality.
          </p>
        </div>
        <button
          type="button"
          onClick={phase === 'idle' || phase === 'error' || phase === 'done' ? startCapture : resetCapture}
          className="inline-flex items-center gap-2 rounded-[16px] bg-[#1C4ED8] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
        >
          <Camera size={14} />
          {phase === 'idle' ? 'Capture Test' : phase === 'done' ? 'Re-capture' : phase === 'error' ? 'Retry' : 'Cancel'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[24px] border border-[#E6ECF5] bg-white">
          <div className="border-b border-[#EEF2F7] px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4E81D8]">Movement Demo</div>
            <div className="mt-1 text-sm font-semibold text-[#17303A]">Follow this motion pattern before recording</div>
          </div>
            <div className="aspect-video bg-[linear-gradient(180deg,#FFFDFB_0%,#F7F2EC_100%)] p-3">
              <img
                src={MOVEMENT_GUIDE_SRC[activeConfig.id] || '/guides/manual_entry.svg'}
                alt={`${activeConfig.label} guide`}
                className="h-full w-full rounded-[18px] object-contain"
              />
            </div>
          </div>

        <div className="overflow-hidden rounded-[24px] border border-[#DCE6F4] bg-[#0F172A]">
          <div className="relative aspect-video">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {phase === 'idle' && !previewReady ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/70">
                {errorMsg ? 'Camera unavailable' : 'Starting camera preview…'}
              </div>
            ) : null}
            {phase === 'capturing' ? (
              <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 text-center text-xs text-white/80">Recording {progress}%</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-[20px] border border-[#E6ECF5] bg-white px-4 py-4 text-sm text-[#5E6B7D]">
          Perform the full motion in frame for 6 seconds. Best supported tests right now are squat, shoulder flexion, trunk rotation, gait, and sit-to-stand.
        </div>

        {phase === 'starting' ? (
          <div className="rounded-[20px] border border-[#E6ECF5] bg-white px-4 py-4 text-sm font-medium text-[#5E6B7D]">Starting camera…</div>
        ) : null}
        {phase === 'capturing' ? (
          <div className="rounded-[20px] border border-[#E6ECF5] bg-white px-4 py-4 text-sm font-medium text-[#5E6B7D]">
            Recording {activeConfig.label}. Stay fully visible and complete smooth repetitions.
          </div>
        ) : null}
        {phase === 'analyzing' ? (
          <div className="rounded-[20px] border border-[#E6ECF5] bg-white px-4 py-4 text-sm font-medium text-[#5E6B7D]">
            Computing movement quality, asymmetry, and ROM…
          </div>
        ) : null}
        {phase === 'error' ? (
          <div className="rounded-[20px] border border-[#F5D7D7] bg-[#FFF8F8] px-4 py-4 text-sm text-[#9B4B4B]">{errorMsg}</div>
        ) : null}

        {phase === 'done' && result?.detected ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-[#E6ECF5] bg-white px-4 py-3">
                <div className="text-2xl font-black text-[#17303A]">{result.quality_score}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#98A1B2]">Quality Score</div>
              </div>
              <div className="rounded-[18px] border border-[#E6ECF5] bg-white px-4 py-3">
                <div className="text-lg font-black text-[#17303A]">{result.quality_label}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#98A1B2]">Movement Label</div>
              </div>
              <div className="rounded-[18px] border border-[#E6ECF5] bg-white px-4 py-3">
                <div className="text-lg font-black text-[#17303A]">{result.frames_analyzed || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#98A1B2]">Frames Analyzed</div>
              </div>
            </div>

            {Object.keys(result.range_of_motion || {}).length > 0 ? (
              <div className="rounded-[20px] border border-[#E6ECF5] bg-white px-4 py-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Range of Motion</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(result.range_of_motion).slice(0, 6).map(([joint, values]) => (
                    <div key={joint} className="rounded-[16px] bg-[#F8FAFD] px-3 py-3 text-sm text-[#5E6B7D]">
                      <div className="font-bold text-[#17303A]">{joint.replaceAll('_', ' ')}</div>
                      <div className="mt-1">Range {values.range}° · Min {values.min}° · Max {values.max}°</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(result.all_flags || []).length > 0 ? (
              <div className="rounded-[20px] border border-[#F4E3B2] bg-[#FFF9E8] px-4 py-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#A67516]">Movement Flags</div>
                <div className="space-y-2">
                  {result.all_flags.slice(0, 4).map((flag) => (
                    <div key={flag} className="text-sm leading-6 text-[#7B5A18]">• {flag}</div>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onImportFindings(result.suggested_findings || [])}
              disabled={!result.suggested_findings?.length}
              className="inline-flex items-center gap-2 rounded-[16px] bg-[#17303A] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} />
              Import Capture Findings
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StepActivities({ activities, onUpdate }) {
  const ranked = activities.ranked ?? [];
  const unranked = DAILY_ACTIVITIES.filter((item) => !ranked.includes(item));

  function toggleItem(item) {
    if (ranked.includes(item)) {
      onUpdate('ranked', ranked.filter((entry) => entry !== item));
      return;
    }
    onUpdate('ranked', [...ranked, item]);
  }

  function toggleList(field, item) {
    const current = activities[field] ?? [];
    onUpdate(field, current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
        <div className="mb-3 text-sm font-bold text-[#17303A]">Rank Daily Activities</div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Available</div>
            <div className="flex flex-wrap gap-2">
              {unranked.map((item) => (
                <Pill key={item} active={false} onClick={() => toggleItem(item)}>
                  {item}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Ranked</div>
            <div className="space-y-2">
              {ranked.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[#E5E7EB] bg-[#FAFBFD] px-4 py-6 text-sm text-[#98A1B2]">
                  Select activities to rank them by time spent.
                </div>
              ) : (
                ranked.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-[18px] border border-[#E8EBF0] bg-[#FAFBFD] px-4 py-3">
                    <GripVertical size={14} className="text-[#C1C7D1]" />
                    <span className="text-xs font-black text-[#CBA989]">{index + 1}</span>
                    <span className="flex-1 text-sm font-semibold text-[#17303A]">{item}</span>
                    <button type="button" onClick={() => toggleItem(item)} className="text-[#C1C7D1] hover:text-[#D05D5D]">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Usual Sleep Posture</div>
          <div className="flex flex-wrap gap-2">
            {SLEEP_POSTURES.map((item) => (
              <Pill key={item} active={activities.sleep_posture === item} onClick={() => onUpdate('sleep_posture', item)} tone="tan">
                {item}
              </Pill>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Position Harder to Tolerate</div>
          <div className="flex flex-wrap gap-2">
            {POSITION_TOLERANCE.map((item) => (
              <Pill key={item} active={activities.position_tolerance === item} onClick={() => onUpdate('position_tolerance', item)} tone="tan">
                {item}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Makes Discomfort Worse</div>
          <div className="flex flex-wrap gap-2">
            {AGGRAVATING_FACTORS.map((item) => (
              <Pill key={item} active={(activities.makes_worse ?? []).includes(item)} onClick={() => toggleList('makes_worse', item)}>
                {item}
              </Pill>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Makes Discomfort Better</div>
          <div className="flex flex-wrap gap-2">
            {AGGRAVATING_FACTORS.map((item) => (
              <Pill key={item} active={(activities.makes_better ?? []).includes(item)} onClick={() => toggleList('makes_better', item)}>
                {item}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#98A1B2]">Hip Tightness (Front)</div>
        <div className="flex flex-wrap gap-2">
          {['No', 'Yes-Right', 'Yes-Left', 'Yes-Both'].map((item) => (
            <Pill key={item} active={activities.hip_tightness === item} onClick={() => onUpdate('hip_tightness', item)} tone="tan">
              {item}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepRemarks({ notes, onNotesChange, canGenerate, loading, onGenerate }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-[#ECE7E1] bg-white p-5">
        <div className="mb-8 text-[12px] font-black uppercase tracking-[0.28em] text-[#A7AFBE]">Any missing remarks to be reported?</div>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Enter your remarks here"
          className="riq-textarea !rounded-[22px] !border-[#E6EAF0] !bg-white text-sm"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-[#8B93A5]">Step 4 of 4</span>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          className="inline-flex items-center gap-2 rounded-[18px] bg-[#1C303A] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_rgba(28,48,58,0.15)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={14} />
          {loading ? 'Generating...' : 'Generate AI Report'}
        </button>
      </div>
    </div>
  );
}

export default function GuidedAssessment({ patientName, onComplete, scanData, voiceData }) {
  const [step, setStep] = useState(voiceData?.notes ? 4 : 1);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState(voiceData?.zones || []);
  const [zoneDetails, setZoneDetails] = useState(() => {
    const next = {};
    (voiceData?.zones || []).forEach((zone) => {
      next[zone] = {
        discomfort: voiceData?.discomfort ?? 5,
        behavior: voiceData?.behavior ?? BEHAVIORS[1],
        duration: voiceData?.duration ?? DURATIONS[2],
        notes: '',
      };
    });
    return next;
  });
  const [contraAcknowledged, setContraAcknowledged] = useState(false);
  const [romFindings, setRomFindings] = useState([]);
  const [activities, setActivities] = useState({
    ranked: [],
    sleep_posture: '',
    makes_worse: [],
    makes_better: [],
    position_tolerance: '',
    hip_tightness: 'No',
  });
  const [notes, setNotes] = useState(voiceData?.notes || '');

  const hasContra = useMemo(() => zones.some((zone) => CONTRAINDICATION_ZONES.includes(zone)), [zones]);
  const canAdvanceStep1 = zones.length > 0 && (!hasContra || contraAcknowledged);

  function toggleZone(id) {
    setZones((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((zone) => zone !== id) : [...prev, id];
    });

    setZoneDetails((prev) => {
      if (prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          discomfort: 5,
          behavior: BEHAVIORS[1],
          duration: DURATIONS[2],
          notes: '',
        },
      };
    });
  }

  function updateZoneDetail(id, field, value) {
    setZoneDetails((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  }

  function canAdvance() {
    if (step === 1) return canAdvanceStep1;
    if (step === 2) return romFindings.length > 0;
    return true;
  }

  async function handleGenerate() {
    if (zones.length === 0) return;
    setLoading(true);
    onComplete({
      name: patientName,
      zones,
      zoneDetails,
      romFindings,
      activities,
      notes,
      primaryDiscomfort: zoneDetails[zones[0]]?.discomfort ?? 5,
      primaryBehavior: zoneDetails[zones[0]]?.behavior ?? BEHAVIORS[1],
      primaryDuration: zoneDetails[zones[0]]?.duration ?? DURATIONS[2],
      scanData,
    });
    setLoading(false);
  }

  return (
    <section className="rounded-[32px] border border-[#ECE7E1] bg-white px-4 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#17303A]">
          <Search size={12} />
          Guided Assessment
        </div>
        <StepProgress currentStep={step} />
      </div>

      {step === 1 ? (
        <StepArea
          zones={zones}
          zoneDetails={zoneDetails}
          onToggleZone={toggleZone}
          onUpdateDetail={updateZoneDetail}
          contraAcknowledged={contraAcknowledged}
          onContraChange={setContraAcknowledged}
        />
      ) : null}

      {step === 2 ? (
        <StepRom
          romFindings={romFindings}
          onAddFinding={(finding) => setRomFindings((prev) => [...prev, finding])}
          onRemoveFinding={(index) => setRomFindings((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
        />
      ) : null}

      {step === 3 ? (
        <StepActivities
          activities={activities}
          onUpdate={(field, value) => setActivities((prev) => ({ ...prev, [field]: value }))}
        />
      ) : null}

      {step === 4 ? (
        <StepRemarks
          notes={notes}
          onNotesChange={setNotes}
          canGenerate={zones.length > 0}
          loading={loading}
          onGenerate={handleGenerate}
        />
      ) : null}

      {step !== 4 ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-[14px] bg-[#EEF1F5] px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-[#6E7787] transition-all disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <span className="text-xs font-medium text-[#8B93A5]">Step {step} of 4</span>

          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-2 rounded-[14px] bg-[#CBA989] px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
