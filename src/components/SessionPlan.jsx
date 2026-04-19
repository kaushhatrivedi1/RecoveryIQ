import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  ChevronDown,
  ChevronRight,
  Download,
  Dumbbell,
  Eye,
  FileText,
  MessageCircle,
  Network,
  Play,
  Send,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BODY_ZONES,
  HOME_EXERCISES_MAP,
  PAD_PLACEMENT_MAP,
  PROTOCOLS,
  SESSION_GOALS,
} from '../data/mockData';
import { VoicePanel } from './VoiceAndASL';
// ── Progress tracking (localStorage) ────────────────────────────────────────
const PROGRESS_KEY = (name) => `riq_progress_${(name || 'guest').toLowerCase().replace(/\s+/g, '_')}`;

function _saveProgressSnapshot(patientName, assessmentData, measuredAngles) {
  if (!measuredAngles || !Object.keys(measuredAngles).length) return;
  try {
    const key = PROGRESS_KEY(patientName);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const snapshot = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ts: Date.now(),
      angles: Object.fromEntries(
        Object.entries(measuredAngles).map(([j, d]) => [j, d.range])
      ),
      zones: assessmentData?.zones || [],
    };
    const updated = [...existing.slice(-11), snapshot];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

function _loadProgressHistory(patientName) {
  try {
    const key = PROGRESS_KEY(patientName);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

const TABS = [
  { id: 'pad', label: 'Pad Placement', Icon: Sun },
  { id: 'analysis1', label: 'Analysis 1', Icon: Brain },
  { id: 'analysis2', label: 'Analysis 2', Icon: Activity },
  { id: 'kinetic_chain', label: 'Kinetic Chain', Icon: Network },
  { id: 'exercises', label: 'At Home Exercises', Icon: Dumbbell },
];

function zoneName(zoneId) {
  return BODY_ZONES.find((zone) => zone.id === zoneId)?.label || zoneId?.replace(/_/g, ' ') || 'Selected area';
}

function titleCase(value) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatPadZoneTitle(zoneId) {
  const label = zoneName(zoneId);
  const sideMatch = label.match(/^(Left|Right)\s+(.*)$/i);
  if (!sideMatch) return titleCase(label);
  return `${sideMatch[1].toUpperCase()} ${sideMatch[2].toUpperCase()}`;
}

const PAD_MARKER_OVERRIDES = {
  left_shoulder: {
    1: { frontSun: { x: 41, y: 37 }, rearMoon: { x: 31, y: 34 } },
    2: { frontSun: { x: 44, y: 41 }, rearMoon: { x: 34, y: 28 } },
  },
  right_shoulder: {
    1: { frontSun: { x: 59, y: 37 }, rearMoon: { x: 69, y: 34 } },
    2: { frontSun: { x: 56, y: 41 }, rearMoon: { x: 66, y: 28 } },
  },
  left_hip: {
    1: { frontSun: { x: 43, y: 57 }, rearMoon: { x: 42, y: 60 } },
    2: { frontSun: { x: 45, y: 52 }, rearMoon: { x: 44, y: 54 } },
  },
  right_hip: {
    1: { frontSun: { x: 57, y: 57 }, rearMoon: { x: 58, y: 60 } },
    2: { frontSun: { x: 55, y: 52 }, rearMoon: { x: 56, y: 54 } },
  },
  upper_back: {
    1: { frontSun: { x: 46, y: 38 }, rearMoon: { x: 54, y: 38 } },
    2: { frontSun: { x: 48, y: 36 }, rearMoon: { x: 52, y: 36 } },
  },
  lower_back: {
    1: { frontSun: { x: 47, y: 48 }, rearMoon: { x: 53, y: 48 } },
    2: { frontSun: { x: 45, y: 49 }, rearMoon: { x: 55, y: 49 } },
  },
  chest: {
    1: { frontSun: { x: 46, y: 35 }, rearMoon: { x: 54, y: 35 } },
    2: { frontSun: { x: 44, y: 36 }, rearMoon: { x: 56, y: 36 } },
  },
  neck: {
    1: { frontSun: { x: 46, y: 21 }, rearMoon: { x: 54, y: 21 } },
    2: { frontSun: { x: 45, y: 22 }, rearMoon: { x: 55, y: 18 } },
  },
  left_knee: {
    1: { frontSun: { x: 45, y: 72 }, rearMoon: { x: 44, y: 72 } },
    2: { frontSun: { x: 43, y: 72 }, rearMoon: { x: 41, y: 72 } },
  },
  right_knee: {
    1: { frontSun: { x: 55, y: 72 }, rearMoon: { x: 56, y: 72 } },
    2: { frontSun: { x: 57, y: 72 }, rearMoon: { x: 59, y: 72 } },
  },
  left_calf: {
    1: { frontSun: { x: 44, y: 83 }, rearMoon: { x: 44, y: 83 } },
    2: { frontSun: { x: 42, y: 83 }, rearMoon: { x: 40, y: 83 } },
  },
  right_calf: {
    1: { frontSun: { x: 56, y: 83 }, rearMoon: { x: 56, y: 83 } },
    2: { frontSun: { x: 58, y: 83 }, rearMoon: { x: 60, y: 83 } },
  },
  left_foot: {
    1: { frontSun: { x: 45, y: 94 }, rearMoon: { x: 45, y: 94 } },
    2: { frontSun: { x: 43, y: 93 }, rearMoon: { x: 41, y: 93 } },
  },
  right_foot: {
    1: { frontSun: { x: 55, y: 94 }, rearMoon: { x: 55, y: 94 } },
    2: { frontSun: { x: 57, y: 93 }, rearMoon: { x: 59, y: 93 } },
  },
  left_arm: {
    1: { frontSun: { x: 31, y: 46 }, rearMoon: { x: 28, y: 46 } },
    2: { frontSun: { x: 29, y: 55 }, rearMoon: { x: 27, y: 55 } },
  },
  right_arm: {
    1: { frontSun: { x: 69, y: 46 }, rearMoon: { x: 72, y: 46 } },
    2: { frontSun: { x: 71, y: 55 }, rearMoon: { x: 73, y: 55 } },
  },
};

function buildPlacementMarkers(zoneId, options, selectedOption, showAllPlacements) {
  const zone = BODY_ZONES.find((entry) => entry.id === zoneId);
  if (!zone || !options?.length) return [];

  const fallbackX = (zone.x / 390) * 100;
  const fallbackY = (zone.y / 395) * 100;
  const overrides = PAD_MARKER_OVERRIDES[zoneId] || {};
  const optionList = showAllPlacements
    ? options
    : options.filter((option) => option.option === selectedOption);

  return optionList.flatMap((option) => {
    const coords = overrides[option.option] || {
      frontSun: { x: fallbackX, y: fallbackY },
      rearMoon: { x: fallbackX, y: fallbackY },
    };

    return [
      {
        id: `${zoneId}-sun-${option.option}`,
        option: option.option,
        face: 'front',
        type: 'sun',
        label: `S${option.option}`,
        title: option.sun,
        x: coords.frontSun.x,
        y: coords.frontSun.y,
      },
      {
        id: `${zoneId}-moon-${option.option}`,
        option: option.option,
        face: 'rear',
        type: 'moon',
        label: `M${option.option}`,
        title: option.moon,
        x: coords.rearMoon.x,
        y: coords.rearMoon.y,
      },
    ];
  });
}

function PlacementOptionCard({ option, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[30px] border p-5 text-left transition-all ${
        active
          ? 'border-sky-200 bg-sky-50/70 shadow-[0_16px_36px_rgba(59,130,246,0.08)]'
          : 'border-slate-200/70 bg-white hover:border-sky-200'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-700">Option {option.option}</div>
          <div className="mt-1 text-[22px] font-black leading-none text-slate-950">{option.name}</div>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border text-xl ${
            active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-300'
          }`}
        >
          {active ? '✓' : '+'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-white px-3 py-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-amber-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FACC15] text-[#6B4C00]">
              <Sun size={12} />
            </div>
            Sun
          </div>
          <div className="text-sm font-black text-slate-950">{option.sun}</div>
          <div className="mt-1 text-[10px] font-medium text-slate-400">Click to assign</div>
        </div>
        <div className="rounded-[18px] bg-white px-3 py-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-indigo-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6366F1] text-white">◔</div>
            Moon
          </div>
          <div className="text-sm font-black text-slate-950">{option.moon}</div>
          <div className="mt-1 text-[10px] font-medium text-slate-400">Click to assign</div>
        </div>
      </div>

      <div className="mt-4 text-xs leading-6 text-slate-500">
        <span className="font-bold text-slate-600">Description:</span> {option.desc}
      </div>
    </button>
  );
}

function MovementIntelligencePanel({ innovation }) {
  if (!innovation) return null;

  return (
    <div className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <div className="riq-stat p-6">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          <Sparkles size={13} />
          Movement Intelligence
        </div>
        <div className="text-base font-semibold leading-7 text-slate-950">{innovation.summary}</div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4">
            <div className="text-3xl font-black text-slate-950">{innovation.restrictionScore}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Restriction Score</div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4">
            <div className="text-3xl font-black text-slate-950">{innovation.readiness.score}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Readiness Score</div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white p-4">
            <div className="text-xl font-black text-slate-950">{innovation.readiness.label}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Session Bias</div>
          </div>
        </div>
      </div>

      <div className="riq-stat p-6">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          <Brain size={13} />
          Recommendation Engine
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Suggested Protocol</div>
          <div className="mt-2 text-lg font-black text-slate-950">{innovation.recommendedProtocol.name}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">{innovation.recommendedProtocol.duration} min recommended duration</div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Target Zones</div>
            <div className="mt-2 space-y-2">
              {innovation.targetZones.map((zone) => (
                <div key={zone.zoneId} className="rounded-[16px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                  {zone.label}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Compensation Flags</div>
            <div className="mt-2 space-y-2">
              {(innovation.compensationFlags.length ? innovation.compensationFlags : innovation.asymmetrySignals).slice(0, 3).map((item) => (
                <div key={item} className="rounded-[16px] border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BodyPlacementCanvas({ title, markers, rear = false }) {
  const imageSrc = rear ? '/images/human-body-rear.jpg' : '/images/human-body-frontal.jpg';
  const visibleMarkers = (markers || []).filter((marker) => (rear ? marker.face === 'rear' : marker.face === 'front'));

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative flex h-[460px] w-full items-center justify-center rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.88))] p-6">
        <img
          src={imageSrc}
          alt={title}
          className="h-full max-h-[390px] w-auto object-contain pointer-events-none"
          draggable="false"
        />

        {visibleMarkers.map((marker) => {
          return (
            <div
              key={`${title}-${marker.id}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              title={marker.title}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[9px] font-black shadow-sm ${
                  marker.type === 'sun'
                    ? 'border-amber-500 bg-[#FACC15] text-[#6B4C00]'
                    : 'border-sky-600 bg-sky-500 text-white'
                }`}
              >
                {marker.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="-mt-5 rounded-[18px] border border-slate-200/70 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        {title}
      </div>
    </div>
  );
}

function extractMeasuredAngles(romFindings) {
  const merged = {};
  romFindings.forEach((finding) => {
    if (finding.range_of_motion && Object.keys(finding.range_of_motion).length > 0) {
      Object.entries(finding.range_of_motion).forEach(([joint, data]) => {
        if (!merged[joint] || (data.range || 0) > (merged[joint].range || 0)) {
          merged[joint] = { ...data, test: finding.test_label };
        }
      });
    }
  });
  return merged;
}

function deriveAnalysis(assessmentData, planData, variant = 1) {
  const zoneLabels = (assessmentData?.zones || []).map(zoneName);
  const romFindings = assessmentData?.romFindings || [];
  const _notes = assessmentData?.notes || '';
  const hasTrunkRotation = romFindings.some((item) => item.test === 'trunk_rotation');
  const hasMidBack = zoneLabels.some((label) => /mid back|upper back|lower back/i.test(label));
  const hasHip = zoneLabels.some((label) => /hip/i.test(label));
  const measuredAngles = extractMeasuredAngles(romFindings);
  const hasAngles = Object.keys(measuredAngles).length > 0;

  if (variant === 1 && (hasTrunkRotation || hasMidBack)) {
    return {
      probability: '78%',
      title: 'Thoracolumbar Fascial Restriction with Bilateral Lumbar Stabilizer Compensation',
      driver: 'Thoracolumbar fascia (T6-L2) with deep layer rotator restriction',
      direction: 'Proximal to Distal',
      summary:
        'Mid-thoracic restriction drives compensatory lumbar stabilizer overload during rotational movement. Thoracic mobility limitation forces the lumbar spine to rotate beyond its preferred role, creating bilateral lower-back tension.',
      narrative:
        'The primary driver in this pattern is thoracolumbar fascial restriction centered at T6-T9 with deep segmental rotator limitation. This restriction develops from sustained positioning that maintains the thoracic spine in relative flexion without enough rotational stimulus. During trunk rotation testing, the thoracic spine under-contributes and the lumbar stabilizers become overloaded as they attempt to stabilize and rotate at the same time.',
      chainMap: [
        ['Thoracolumbar fascia (deep and superficial layers)', 'Primary restriction limiting thoracic rotation and tensile load transfer.'],
        ['Rotatores and multifidus (T6-T12)', 'Deep segmental rotators become restricted and reduce intersegmental thoracic mobility.'],
        ['Erector spinae (thoracic and lumbar portions)', 'Bilateral overload develops as spinal extensors compensate for lost thoracic motion.'],
        ['Quadratus lumborum (bilateral)', 'Lateral stabilizers overwork to control rotation when thoracic contribution is limited.'],
        ['Latissimus dorsi', 'Fascial continuity can spread tension through the lateral chain.'],
        ['Iliocostalis (lumbar portion)', 'Contributes to bilateral lumbar stiffness when thoracic rotation is lost.'],
      ],
      compensations: [
        'Lumbar spine (L1-L5): forced to provide rotational range that thoracic spine cannot contribute.',
        'Sacroiliac joints: potential downstream compensation if lumbar rotation becomes excessive.',
        'Scapulothoracic region: may develop secondary tension if thoracic restriction persists.',
      ],
      retests: [
        'Seated trunk rotation ROM: look for bilateral improvement and less lumbar substitution.',
        'Thoracic extension in sphinx pose: look for better segmental extension with less lumbar hyperextension.',
        'Quadruped cat-cow with rotation: look for smoother thoracic rotation and reduced lower-back guarding.',
      ],
      confidence:
        'Confidence is moderate-high because the complaint location, trunk-rotation response, sitting aggravation, and stretching relief all point to a thoracic mobility-driven compensation pattern. Confidence would increase further with manual palpation or quantified sitting exposure.',
      sourceText: planData?.analysis_1 || '',
      measuredAngles,
      hasAngles,
      findings: [
        'Primary complaint centers on the mid-back with limited ROM and intermittent symptoms.',
        'Trunk rotation reproduces bilateral lower-back stiffness, tightness, and achiness.',
        'Sitting longer than 30 minutes aggravates the pattern by reinforcing thoracic flexion.',
        'Stretching provides relief, which supports a movement-responsive tissue restriction rather than structural damage.',
        'Hip flexor tightness is absent, which argues against a psoas-driven anterior chain pattern.',
        'Duration is under 6 weeks, favoring an acute adaptation rather than chronic remodeling.',
        ...(hasAngles
          ? Object.entries(measuredAngles)
              .slice(0, 3)
              .map(([joint, data]) => `Camera capture — ${joint.replaceAll('_', ' ')}: ${data.range}° total excursion (${data.min}°–${data.max}°) during ${data.test || 'movement test'}.`)
          : []),
      ],
    };
  }

  if (variant === 2 && (hasTrunkRotation || hasMidBack || hasHip)) {
    return {
      probability: '45%',
      title: 'Bilateral Lumbar Stabilizer Fatigue with Secondary Thoracic Restriction',
      driver: 'Lumbar stabilizers (L1-L5) with core endurance deficit',
      direction: 'Distal to Proximal',
      summary:
        'Pattern B proposes that lumbar stabilizer fatigue is primary, with thoracic stiffness developing secondarily to reduce movement demand on a less stable lumbar base.',
      narrative:
        'This alternative pattern remains plausible because bilateral lower-back discomfort appears during trunk rotation and sustained sitting can amplify postural fatigue. It is less favored because the primary complaint is mid-back, thoracic ROM is clearly limited, and the lumbar symptoms appear mainly during rotation rather than across multiple loading tasks.',
      chainMap: [
        ['Multifidus (lumbar)', 'Primary segmental stabilizer may be inhibited and reduce lumbar control during rotation.'],
        ['Quadratus lumborum (bilateral)', 'Lateral stabilizers overwork to compensate for multifidus weakness.'],
        ['Transversus abdominis', 'Reduced deep-core contribution can lower intra-abdominal support.'],
        ['Erector spinae (lumbar)', 'Superficial extensors compensate for deeper stabilizer deficit.'],
        ['Thoracolumbar fascia', 'Secondary restriction may develop to limit motion when lumbar control is insufficient.'],
      ],
      compensations: [
        'Mid-thoracic spine (T6-T9): protective stiffness to reduce trunk rotation demands.',
        'Hip stabilizers: may compensate during functional movement when lumbar support is reduced.',
      ],
      findings: [
        'Bilateral lower-back symptoms during trunk rotation could reflect primary lumbar stabilizer fatigue.',
        'Sitting aggravation could reflect sustained postural demand on the lumbar stabilizers.',
        'The pattern is contradicted by the mid-back being the primary complaint.',
        'Thoracic ROM loss suggests a true thoracic restriction rather than only lumbar guarding.',
        'No clear lumbar instability signs such as catching or giving way were reported.',
        'Duration under 6 weeks makes substantial stabilizer deconditioning less likely.',
        ...(hasAngles
          ? Object.entries(measuredAngles)
              .slice(0, 2)
              .map(([joint, data]) => `Camera capture — ${joint.replaceAll('_', ' ')}: ${data.range}° excursion (${data.min}°–${data.max}°) during ${data.test || 'movement test'}.`)
          : []),
      ],
      retests: [
        'Quadruped bird-dog endurance: compare side-to-side control and trunk drift.',
        'Side plank endurance: look for early fatigue or asymmetric collapse.',
        'Controlled seated trunk rotation: assess whether lumbar symptoms appear before thoracic motion improves.',
      ],
      confidence:
        'Confidence is lower because the evidence fits compensation better than a primary lumbar driver. This pattern would move up if instability testing, core-endurance testing, or broader lumbar symptom provocation supported it.',
      sourceText: planData?.analysis_2 || '',
      measuredAngles,
      hasAngles,
    };
  }

  const fallbackText = variant === 1 ? planData?.analysis_1 : planData?.analysis_2;

  return {
    probability: variant === 1 ? '68%' : '41%',
    title: variant === 1 ? 'Primary Movement Restriction Pattern' : 'Alternative Compensatory Pattern',
    driver: variant === 1 ? 'Regional restriction and compensatory overload' : 'Secondary compensation model',
    direction: variant === 1 ? 'Primary' : 'Alternative',
    summary:
      fallbackText ||
      'Session analysis is available, but no structured interpretation was returned. The practitioner-facing layout still supports findings, placements, and follow-up discussion.',
    narrative: fallbackText || '',
    chainMap: [],
    compensations: [],
    findings: hasAngles
      ? Object.entries(measuredAngles)
          .slice(0, 4)
          .map(([joint, data]) => `Camera capture — ${joint.replaceAll('_', ' ')}: ${data.range}° excursion (${data.min}°–${data.max}°) during ${data.test || 'movement test'}.`)
      : [],
    retests: [],
    confidence: 'Confidence depends on the available intake detail, ROM findings, and activity history.',
    sourceText: fallbackText || '',
    measuredAngles,
    hasAngles,
  };
}

function buildAssistantReply(question, primaryAnalysis, secondaryAnalysis) {
  const lower = question.toLowerCase();

  if (lower.includes('kinetic chain')) {
    return 'Kinetic chain means one restricted area is forcing other regions to compensate. In this report, the thoracic region appears to be influencing the lumbar region during rotation.';
  }
  if (lower.includes('primary driver') || lower.includes('main issue')) {
    return `The leading pattern is ${primaryAnalysis.title.toLowerCase()}. In plain terms, the upper-to-mid back is not rotating well enough, so the lower back is doing extra work.`;
  }
  if (lower.includes('tell my practitioner') || lower.includes('what should i say')) {
    return 'Tell your practitioner that mid-back motion feels limited, trunk rotation brings on bilateral lower-back tightness, and sitting seems to aggravate the pattern while stretching helps.';
  }
  if (lower.includes('difference') || lower.includes('analysis 1') || lower.includes('analysis 2')) {
    return `Analysis 1 is the higher-confidence pattern at ${primaryAnalysis.probability}, while Analysis 2 is a lower-confidence alternative at ${secondaryAnalysis.probability}. The main difference is whether the thoracic restriction is driving the lumbar symptoms, or the lumbar stabilizers are driving the thoracic guarding.`;
  }
  if (lower.includes('exercise') || lower.includes('home')) {
    return 'The retests and home exercises focus on restoring thoracic rotation, improving extension control, and reducing lower-back compensation during trunk movement.';
  }

  return `The strongest takeaway is that ${primaryAnalysis.summary.charAt(0).toLowerCase() + primaryAnalysis.summary.slice(1)} If you want, ask about the driver, the compensations, or what to retest after treatment.`;
}

function ChatAssistant({ primaryAnalysis, secondaryAnalysis, assessmentData }) {
  const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_KEY || '';
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text:
        `Hello! I've reviewed this biomechanical analysis. Here's a quick summary:\n\n` +
        `Primary concern: ${primaryAnalysis.title}\n` +
        `Key finding: ${primaryAnalysis.summary}\n\n` +
        `Ask me about the kinetic chain, primary driver, suggested retests, or what to tell the patient.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setSending(true);

    let reply;
    if (CLAUDE_KEY) {
      try {
        const zones = (assessmentData?.zones || []).map((z) => z.replaceAll('_', ' ')).join(', ');
        const systemPrompt = `You are a kinetic chain analysis assistant for Hydrawav3 practitioners.
Patient assessment context:
- Primary pattern: ${primaryAnalysis.title} (${primaryAnalysis.probability} confidence)
- Driver: ${primaryAnalysis.driver}
- Summary: ${primaryAnalysis.summary}
- Alternative pattern: ${secondaryAnalysis.title} (${secondaryAnalysis.probability} confidence)
- Focus zones: ${zones || 'not specified'}

Keep responses to 2-3 sentences. Use wellness language — you support practitioners, never replace them. Avoid clinical diagnosis language.`;

        const history = messages.filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0);
        const apiMessages = [
          ...history.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text })),
          { role: 'user', content: trimmed },
        ];

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 250, system: systemPrompt, messages: apiMessages }),
        });
        const data = await res.json();
        reply = data.content?.[0]?.text || buildAssistantReply(trimmed, primaryAnalysis, secondaryAnalysis);
      } catch {
        reply = buildAssistantReply(trimmed, primaryAnalysis, secondaryAnalysis);
      }
    } else {
      reply = buildAssistantReply(trimmed, primaryAnalysis, secondaryAnalysis);
    }

    setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setSending(false);
  }

  return (
    <section className="riq-card p-8">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-950">Chat With AI Assistant</div>
      <p className="mb-5 text-sm text-slate-500">Ask questions about this analysis and the full report.</p>

      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="flex gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] ${
                message.role === 'assistant' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {message.role === 'assistant' ? <MessageCircle size={18} /> : <Sparkles size={18} />}
            </div>
            <div className="flex-1 rounded-[24px] border border-slate-200/70 bg-slate-50/70 px-6 py-5 text-sm leading-8 text-slate-800 whitespace-pre-line">
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage();
          }}
          placeholder="Ask about this analysis…"
          disabled={sending}
          className="riq-input !rounded-full !bg-white text-sm disabled:opacity-60"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={sending}
          className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--riq-primary)] text-white transition-colors hover:bg-[var(--riq-primary-deep)] disabled:opacity-60"
        >
          {sending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send size={18} />}
        </button>
        <button
          type="button"
          onClick={() => setMessages((prev) => prev.slice(0, 1))}
          className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </section>
  );
}

function AnalysisPanel({ analysis, emphasis = 'primary' }) {
  const pillClasses =
    emphasis === 'primary'
      ? 'bg-sky-100 text-sky-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-5">
      <section className="riq-card p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              {emphasis === 'primary' ? 'Primary Pattern' : 'Alternative Pattern'}
            </div>
            <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">{analysis.title}</h3>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-black ${pillClasses}`}>{analysis.probability}</div>
        </div>

        <div className="rounded-[24px] border border-sky-100 bg-sky-50/60 p-5">
          <div className="text-sm font-black text-slate-950">Primary Driver: {analysis.driver}</div>
          <div className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">{analysis.direction}</div>
          <p className="mt-3 text-sm leading-7 text-slate-700">{analysis.summary}</p>
        </div>

        {analysis.chainMap.length ? (
          <div className="mt-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Structural Kinetic Chain Map
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {analysis.chainMap.map(([label, detail]) => (
                <div key={label} className="riq-stat p-4">
                  <div className="text-sm font-black text-slate-950">{label}</div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {analysis.compensations.length ? (
          <div className="mt-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Secondary Compensatory Regions
            </div>
            <div className="space-y-2">
              {analysis.compensations.map((item) => (
                <div key={item} className="rounded-[18px] border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {analysis.findings.length ? (
          <div className="mt-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Supporting Findings
            </div>
            <div className="space-y-2">
              {analysis.findings.map((item) => (
                <div key={item} className="rounded-[18px] border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {analysis.retests.length ? (
          <div className="mt-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Suggested Retests
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {analysis.retests.map((item) => (
                <div key={item} className="riq-stat p-4 text-sm leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-[20px] border border-slate-200/70 bg-slate-50/80 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Confidence Justification</div>
          <p className="mt-3 text-sm leading-7 text-slate-700">{analysis.confidence}</p>
        </div>

        {analysis.hasAngles ? (
          <div className="mt-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
              Measured ROM — Camera Capture
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(analysis.measuredAngles).map(([joint, data]) => (
                <div key={joint} className="riq-stat p-4">
                  <div className="text-sm font-black text-slate-950">{joint.replaceAll('_', ' ')}</div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-2xl font-black text-sky-600">{data.range}°</span>
                    <span className="mb-0.5 text-xs text-slate-400">excursion</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Min {data.min}° · Max {data.max}° · {data.test || 'movement test'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

// ── Kinetic Chain Visualization ──────────────────────────────────────────────

const CHAIN_COLORS = {
  primary:     { fill: '#EF4444', label: 'Primary',     textClass: 'text-red-600',    bgClass: 'bg-red-50',    borderClass: 'border-red-200' },
  secondary:   { fill: '#F97316', label: 'Secondary',   textClass: 'text-orange-600', bgClass: 'bg-orange-50', borderClass: 'border-orange-200' },
  stabilizing: { fill: '#22C55E', label: 'Stabilizing', textClass: 'text-green-600',  bgClass: 'bg-green-50',  borderClass: 'border-green-200' },
  chain_flow:  { fill: '#3B82F6', label: 'Chain Flow',  textClass: 'text-blue-600',   bgClass: 'bg-blue-50',   borderClass: 'border-blue-200' },
};

// 200×420 viewBox, front-facing silhouette
const MUSCLE_REGIONS = {
  neck:             { cx: 100, cy: 68,  rx: 13, ry: 11, rear: false, label: 'Neck' },
  left_shoulder:    { cx: 52,  cy: 86,  rx: 20, ry: 14, rear: false, label: 'L. Shoulder' },
  right_shoulder:   { cx: 148, cy: 86,  rx: 20, ry: 14, rear: false, label: 'R. Shoulder' },
  left_chest:       { cx: 74,  cy: 118, rx: 24, ry: 20, rear: false, label: 'L. Chest' },
  right_chest:      { cx: 126, cy: 118, rx: 24, ry: 20, rear: false, label: 'R. Chest' },
  left_lat:         { cx: 60,  cy: 148, rx: 17, ry: 26, rear: false, label: 'L. Lat' },
  right_lat:        { cx: 140, cy: 148, rx: 17, ry: 26, rear: false, label: 'R. Lat' },
  thoracic_spine:   { cx: 100, cy: 145, rx: 15, ry: 34, rear: true,  label: 'Thoracic' },
  lumbar:           { cx: 100, cy: 192, rx: 20, ry: 22, rear: true,  label: 'Lumbar' },
  left_hip:         { cx: 70,  cy: 218, rx: 25, ry: 20, rear: false, label: 'L. Hip Flexor' },
  right_hip:        { cx: 130, cy: 218, rx: 25, ry: 20, rear: false, label: 'R. Hip Flexor' },
  left_glute:       { cx: 68,  cy: 214, rx: 24, ry: 20, rear: true,  label: 'L. Glute' },
  right_glute:      { cx: 132, cy: 214, rx: 24, ry: 20, rear: true,  label: 'R. Glute' },
  left_piriformis:  { cx: 66,  cy: 210, rx: 17, ry: 13, rear: true,  label: 'L. Piriformis' },
  right_piriformis: { cx: 134, cy: 210, rx: 17, ry: 13, rear: true,  label: 'R. Piriformis' },
  left_quad:        { cx: 70,  cy: 258, rx: 20, ry: 40, rear: false, label: 'L. Quad' },
  right_quad:       { cx: 130, cy: 258, rx: 20, ry: 40, rear: false, label: 'R. Quad' },
  left_hamstring:   { cx: 70,  cy: 258, rx: 18, ry: 38, rear: true,  label: 'L. Hamstring' },
  right_hamstring:  { cx: 130, cy: 258, rx: 18, ry: 38, rear: true,  label: 'R. Hamstring' },
  left_tibialis:    { cx: 63,  cy: 332, rx: 10, ry: 28, rear: false, label: 'L. Tibialis' },
  right_tibialis:   { cx: 137, cy: 332, rx: 10, ry: 28, rear: false, label: 'R. Tibialis' },
  left_peroneus:    { cx: 77,  cy: 330, rx: 9,  ry: 26, rear: false, label: 'L. Peroneus' },
  right_peroneus:   { cx: 123, cy: 330, rx: 9,  ry: 26, rear: false, label: 'R. Peroneus' },
  left_calf:        { cx: 70,  cy: 338, rx: 13, ry: 28, rear: true,  label: 'L. Calf' },
  right_calf:       { cx: 130, cy: 338, rx: 13, ry: 28, rear: true,  label: 'R. Calf' },
  left_ankle:       { cx: 65,  cy: 368, rx: 12, ry: 11, rear: false, label: 'L. Ankle' },
  right_ankle:      { cx: 135, cy: 368, rx: 12, ry: 11, rear: false, label: 'R. Ankle' },
};

const MUSCLE_KEYWORD_MAP = [
  { keys: ['piriformis'],                                           regions: ['left_piriformis', 'right_piriformis'] },
  { keys: ['hip external rotator', 'external rotator', 'deep hip'], regions: ['left_piriformis', 'right_piriformis', 'left_glute', 'right_glute'] },
  { keys: ['hip capsule', 'posterior hip capsule'],                  regions: ['left_glute', 'right_glute'] },
  { keys: ['gluteus medius', 'glute med'],                           regions: ['left_glute', 'right_glute'] },
  { keys: ['gluteus maximus', 'gluteal', 'glute max'],               regions: ['left_glute', 'right_glute'] },
  { keys: ['tibialis anterior', 'tibialis'],                         regions: ['left_tibialis', 'right_tibialis'] },
  { keys: ['peroneus', 'fibularis'],                                 regions: ['left_peroneus', 'right_peroneus'] },
  { keys: ['gastrocnemius', 'gastroc', 'soleus'],                    regions: ['left_calf', 'right_calf'] },
  { keys: ['ankle joint', 'ankle capsule', 'ankle'],                 regions: ['left_ankle', 'right_ankle'] },
  { keys: ['quadricep', 'rectus femoris', 'vastus'],                 regions: ['left_quad', 'right_quad'] },
  { keys: ['hamstring', 'biceps femoris'],                           regions: ['left_hamstring', 'right_hamstring'] },
  { keys: ['hip flexor', 'iliopsoas', 'psoas', 'iliacus'],           regions: ['left_hip', 'right_hip'] },
  { keys: ['thoracolumbar', 'thoracic fascia', 'thoracic spine'],    regions: ['thoracic_spine'] },
  { keys: ['multifidus', 'rotatores', 'segmental rotator'],          regions: ['thoracic_spine', 'lumbar'] },
  { keys: ['erector spinae', 'iliocostalis'],                        regions: ['thoracic_spine', 'lumbar'] },
  { keys: ['quadratus lumborum'],                                    regions: ['lumbar'] },
  { keys: ['transversus abdominis', 'core stabilizer'],              regions: ['lumbar'] },
  { keys: ['latissimus', 'lat dorsi'],                               regions: ['left_lat', 'right_lat'] },
  { keys: ['shoulder', 'deltoid', 'rotator cuff', 'supraspinatus'],  regions: ['left_shoulder', 'right_shoulder'] },
  { keys: ['trapezius', 'traps', 'neck', 'cervical'],                regions: ['neck'] },
  { keys: ['chest', 'pec', 'pectoralis'],                            regions: ['left_chest', 'right_chest'] },
  { keys: ['hip'],                                                   regions: ['left_hip', 'right_hip'] },
];

function getRegionsForMuscle(muscleName, side) {
  const lower = (muscleName || '').toLowerCase();
  const matched = new Set();
  for (const { keys, regions } of MUSCLE_KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) {
      regions.forEach((r) => matched.add(r));
      break;
    }
  }
  const all = [...matched];
  if (side === 'right') return all.filter((r) => !r.startsWith('left_'));
  if (side === 'left') return all.filter((r) => !r.startsWith('right_'));
  return all;
}

function getDefaultChainData(assessmentData) {
  const zones = assessmentData?.zones || [];
  const hasHip = zones.some((z) => z.includes('hip'));
  const hasShoulder = zones.some((z) => z.includes('shoulder'));
  const hasBack = zones.some((z) => z.includes('back'));

  if (hasHip) {
    return {
      patternName: 'Hip Mobility Restriction with Lower Limb Compensation',
      description: 'Reduced hip mobility is driving compensatory loading patterns through the knee and ankle joints. The kinetic chain disruption begins at the hip complex and propagates distally through the lower extremity.',
      chain: [
        { name: 'Piriformis', side: 'bilateral', role: 'primary', detail: 'Primary restriction limiting hip external rotation and proximal force transfer.' },
        { name: 'Deep hip external rotators', side: 'bilateral', role: 'primary', detail: 'Contributing to hip capsule stiffness and rotational mobility deficit.' },
        { name: 'Gluteus medius', side: 'bilateral', role: 'secondary', detail: 'Lateral stabilizer overload as it compensates for restricted rotational movement.' },
        { name: 'Quadriceps', side: 'bilateral', role: 'stabilizing', detail: 'Increased anterior chain loading compensating for reduced hip contribution.' },
        { name: 'Tibialis anterior', side: 'bilateral', role: 'chain_flow', detail: 'Distal compensation maintaining balance under restricted hip mechanics.' },
        { name: 'Ankle joint capsule', side: 'bilateral', role: 'chain_flow', detail: 'Secondary adaptation site absorbing force not dispersed at the hip.' },
      ],
    };
  }
  if (hasShoulder || hasBack) {
    return {
      patternName: 'Thoracic Restriction with Shoulder Compensation',
      description: 'Thoracic spine mobility limitation is driving compensatory patterns through the shoulder complex and lumbar region. The restriction propagates both proximally into the shoulder and distally into the lumbar spine.',
      chain: [
        { name: 'Thoracolumbar fascia', side: 'bilateral', role: 'primary', detail: 'Primary restriction limiting thoracic rotation and tensile force distribution.' },
        { name: 'Erector spinae', side: 'bilateral', role: 'primary', detail: 'Bilateral overload as spinal extensors compensate for lost thoracic mobility.' },
        { name: 'Latissimus dorsi', side: 'bilateral', role: 'secondary', detail: 'Tension transmission through lateral chain affecting shoulder mechanics.' },
        { name: 'Rotator cuff', side: 'bilateral', role: 'secondary', detail: 'Compensatory loading as shoulder accommodates thoracic restriction.' },
        { name: 'Quadratus lumborum', side: 'bilateral', role: 'stabilizing', detail: 'Lateral stabilizers overwork when thoracic mobility is limited.' },
      ],
    };
  }
  return {
    patternName: 'Regional Movement Restriction Pattern',
    description: 'Assessment reveals a regional movement restriction with compensatory load distribution across adjacent structures. The primary driver is creating downstream kinetic chain adaptation.',
    chain: [
      { name: 'Hip flexors', side: 'bilateral', role: 'primary', detail: 'Primary restriction affecting anterior chain mobility and load transfer.' },
      { name: 'Gluteus medius', side: 'bilateral', role: 'secondary', detail: 'Lateral hip stabilizers in compensatory overload.' },
      { name: 'Quadratus lumborum', side: 'bilateral', role: 'stabilizing', detail: 'Core stabilizers maintaining spinal position during compensatory movement.' },
      { name: 'Quadriceps', side: 'bilateral', role: 'chain_flow', detail: 'Distal chain adaptation responding to proximal restriction.' },
    ],
  };
}

async function fetchKineticChainData(assessmentData) {
  const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_KEY || '';
  if (!CLAUDE_KEY) return getDefaultChainData(assessmentData);

  const zones = (assessmentData?.zones || []).map((z) => z.replaceAll('_', ' ')).join(', ');
  const romFindings = assessmentData?.romFindings || [];
  const romSummary = romFindings.map((f) => `${f.test.replace(/_/g, ' ')}: ${f.body_part} (${f.side})`).join('; ');

  const prompt = `Patient zones of concern: ${zones || 'not specified'}. ROM findings: ${romSummary || 'not specified'}.

Generate a kinetic chain analysis. Return ONLY this JSON (no markdown):
{
  "patternName": "<short pattern name>",
  "description": "<2-3 sentence description of the kinetic chain dysfunction>",
  "chain": [
    { "name": "<anatomical structure name>", "side": "<left|right|bilateral>", "role": "<primary|secondary|stabilizing|chain_flow>", "detail": "<1 sentence role description>" }
  ]
}

Include 5-8 structures flowing logically from primary driver to compensatory regions.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 700, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return getDefaultChainData(assessmentData);
  }
}

function BodySVGSilhouette() {
  return (
    <g fill="#1e293b" opacity="0.1">
      <ellipse cx="100" cy="36" rx="22" ry="26" />
      <rect x="91" y="60" width="18" height="18" rx="5" />
      <ellipse cx="100" cy="84" rx="52" ry="16" />
      <path d="M52 76 C42 90 40 135 42 220 L158 220 C160 135 158 90 148 76 Z" />
      <path d="M50 80 C34 92 18 128 16 170 L28 172 C30 140 44 108 56 92 Z" />
      <path d="M16 170 C12 190 14 212 18 228 L28 226 C26 212 26 192 28 172 Z" />
      <path d="M150 80 C166 92 182 128 184 170 L172 172 C170 140 156 108 144 92 Z" />
      <path d="M184 170 C188 190 186 212 182 228 L172 226 C174 212 174 192 172 172 Z" />
      <ellipse cx="100" cy="226" rx="50" ry="18" />
      <path d="M68 226 C54 244 50 282 54 308 L76 308 C74 284 72 250 80 230 Z" />
      <path d="M54 308 C52 334 54 360 60 376 L76 376 C72 360 70 334 76 308 Z" />
      <ellipse cx="66" cy="384" rx="18" ry="9" />
      <path d="M132 226 C146 244 150 282 146 308 L124 308 C126 284 128 250 120 230 Z" />
      <path d="M146 308 C148 334 146 360 140 376 L124 376 C128 360 130 334 124 308 Z" />
      <ellipse cx="134" cy="384" rx="18" ry="9" />
    </g>
  );
}

function KineticChainTab({ assessmentData }) {
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchKineticChainData(assessmentData).then((data) => {
      setChainData(data);
      setLoading(false);
    });
  }, [assessmentData]);

  const regionRoleMap = useMemo(() => {
    if (!chainData) return {};
    const priority = { primary: 4, secondary: 3, stabilizing: 2, chain_flow: 1 };
    const map = {};
    chainData.chain.forEach((item) => {
      getRegionsForMuscle(item.name, item.side).forEach((r) => {
        if (!map[r] || priority[item.role] > priority[map[r]]) map[r] = item.role;
      });
    });
    return map;
  }, [chainData]);

  const activeRegionEntries = Object.entries(MUSCLE_REGIONS).filter(([id]) => regionRoleMap[id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Kinetic Chain Visualization</div>
          <h3 className="mt-1 text-xl font-black leading-tight text-slate-950">
            {loading ? 'Analyzing kinetic chain…' : (chainData?.patternName || 'Movement Pattern')}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowLabels((v) => !v)}
          className="riq-button-secondary !min-h-0 !px-4 !py-2 text-[10px] uppercase tracking-[0.18em]"
        >
          <Eye size={13} />
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        {/* SVG body map */}
        <div className="riq-card flex flex-col items-center p-5">
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(CHAIN_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: val.fill }} />
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{val.label}</span>
              </div>
            ))}
          </div>

          <svg viewBox="0 0 200 420" className="w-full max-w-[200px]" aria-label="Kinetic chain body map">
            <BodySVGSilhouette />

            {activeRegionEntries.map(([id, region]) => {
              const role = regionRoleMap[id];
              const color = CHAIN_COLORS[role]?.fill ?? '#94a3b8';
              return (
                <ellipse
                  key={id}
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx}
                  ry={region.ry}
                  fill={color}
                  fillOpacity={region.rear ? 0.3 : 0.68}
                  stroke={color}
                  strokeWidth={region.rear ? 1.5 : 0}
                  strokeDasharray={region.rear ? '3 2' : undefined}
                />
              );
            })}

            {showLabels
              ? activeRegionEntries.map(([id, region]) => (
                  <text
                    key={`lbl-${id}`}
                    x={region.cx}
                    y={region.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="4.5"
                    fontWeight="700"
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {region.label}
                  </text>
                ))
              : null}

            {!loading && chainData?.chain.map((item, i) => {
              const regions = getRegionsForMuscle(item.name, item.side);
              const r = regions.find((rid) => MUSCLE_REGIONS[rid]);
              if (!r) return null;
              const reg = MUSCLE_REGIONS[r];
              const color = CHAIN_COLORS[item.role]?.fill ?? '#94a3b8';
              return (
                <g key={`step-${i}`}>
                  <circle cx={reg.cx + reg.rx - 5} cy={reg.cy - reg.ry + 5} r="6.5" fill={color} stroke="white" strokeWidth="1" />
                  <text
                    x={reg.cx + reg.rx - 5}
                    y={reg.cy - reg.ry + 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="5"
                    fontWeight="900"
                    fill="white"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-3 text-center text-[9px] leading-5 text-slate-400">Dashed = posterior region</div>
        </div>

        {/* Chain pathway */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-3 rounded-[24px] border border-slate-100 bg-white p-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              <span className="text-sm text-slate-500">Generating kinetic chain analysis…</span>
            </div>
          ) : (
            <>
              <div className="riq-card p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Pattern Overview</div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{chainData?.description}</p>
              </div>

              <div className="riq-card p-5">
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Chain Pathway</div>
                <div className="space-y-1">
                  {chainData?.chain.map((item, i) => {
                    const colors = CHAIN_COLORS[item.role] ?? CHAIN_COLORS.chain_flow;
                    const sideLabel = item.side === 'bilateral' ? 'Bilateral' : item.side === 'right' ? 'Right' : 'Left';
                    return (
                      <div key={`chain-${i}`}>
                        <div className="flex items-start gap-3 py-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white shadow-sm"
                            style={{ backgroundColor: colors.fill }}
                          >
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-slate-950">{item.name}</span>
                              <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${colors.bgClass} ${colors.textClass} ${colors.borderClass}`}>
                                {colors.label}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">{sideLabel}</span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                          </div>
                        </div>
                        {i < chainData.chain.length - 1 ? (
                          <div className="ml-4 h-4 w-px translate-x-3.5 bg-slate-200" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportModal({ open, onClose, assessmentData, planData }) {
  const primaryAnalysis = useMemo(() => deriveAnalysis(assessmentData, planData, 1), [assessmentData, planData]);
  const secondaryAnalysis = useMemo(() => deriveAnalysis(assessmentData, planData, 2), [assessmentData, planData]);

  if (!open) return null;

  const concernLabel = assessmentData?.zones?.length ? zoneName(assessmentData.zones[0]) : 'Selected area';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[40px] border border-white/10 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[linear-gradient(135deg,var(--riq-primary),var(--riq-accent))] px-8 py-7 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-[18px] bg-white/20 p-3 text-white">
              <Brain size={24} />
            </div>
            <div>
              <div className="text-2xl font-black uppercase tracking-tight">AI Kinetic Chain Report</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#E8D8C8]">Complete AI Analysis Report</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto bg-[#F7F5F2] px-8 py-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <div className="flex justify-center gap-2">
              <button type="button" className="riq-button-secondary !min-h-0 !px-6 !py-2.5 text-[10px] uppercase tracking-[0.18em]">
                Your Report
              </button>
              <button type="button" className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                Practitioner Report
              </button>
            </div>

            <section className="rounded-[30px] border border-[#ECEFF4] bg-white p-8">
              <div className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                <Activity size={16} className="text-sky-600" />
                Personal Snapshot
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="riq-stat p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Age</div>
                  <div className="mt-1 text-3xl font-black text-slate-950">32</div>
                </div>
                <div className="riq-stat p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gender</div>
                  <div className="mt-1 text-3xl font-black text-slate-950">Female</div>
                </div>
                <div className="riq-stat p-5 sm:col-span-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Concern</div>
                  <div className="mt-2 text-sm font-medium leading-7 text-slate-700">
                    {`${concernLabel} discomfort with limited range of motion, intermittent movement sensitivity, and compensation during testing.`}
                  </div>
                </div>
                <div className="riq-stat p-5 sm:col-span-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secondary Concerns</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(assessmentData?.romFindings || []).slice(0, 4).map((finding, index) => (
                      <span key={`${finding.body_part}-${index}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {finding.body_part} {finding.sensations?.length ? `(${finding.sensations.join(', ')})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="riq-stat p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pain Duration</div>
                  <div className="mt-1 text-2xl font-black text-sky-700">{assessmentData?.primaryDuration || 'Acute'}</div>
                </div>
                {primaryAnalysis.hasAngles ? (
                  <div className="riq-stat p-5 sm:col-span-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Measured ROM — Camera Capture</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {Object.entries(primaryAnalysis.measuredAngles).slice(0, 6).map(([joint, data]) => (
                        <div key={joint} className="rounded-[14px] bg-sky-50 px-3 py-2 text-center">
                          <div className="text-xl font-black text-sky-700">{data.range}°</div>
                          <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-sky-500">{joint.replaceAll('_', ' ')}</div>
                          <div className="mt-0.5 text-[10px] text-slate-500">{data.min}°–{data.max}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="riq-card p-8">
              <div className="mb-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                <Brain size={16} className="text-sky-600" />
                Clinical Insight Summary
              </div>
              <p className="text-sm leading-7 text-slate-700">{primaryAnalysis.summary}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="riq-stat p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Movement Bias</div>
                  <div className="mt-2 text-sm font-black text-slate-950">{assessmentData?.primaryBehavior || 'Mobility limited'}</div>
                </div>
                <div className="riq-stat p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dominant Chain</div>
                  <div className="mt-2 text-sm font-black text-slate-950">{primaryAnalysis.driver}</div>
                </div>
                <div className="riq-stat p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Symptom Region</div>
                  <div className="mt-2 text-sm font-black text-slate-950">{concernLabel}</div>
                </div>
              </div>
            </section>

            <AnalysisPanel analysis={primaryAnalysis} emphasis="primary" />
            <AnalysisPanel analysis={secondaryAnalysis} emphasis="secondary" />

            <ChatAssistant primaryAnalysis={primaryAnalysis} secondaryAnalysis={secondaryAnalysis} assessmentData={assessmentData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionPlan({
  assessmentData,
  planData,
  scanData,
  onStartSession,
  onProtocolChange,
}) {
  const [activeTab, setActiveTab] = useState('pad');
  const [expanded, setExpanded] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [connectionMode, setConnectionMode] = useState('wifi');
  const [selectionMode, setSelectionMode] = useState('manual');
  const [showAllPlacements, setShowAllPlacements] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(SESSION_GOALS[0].id);
  const [placements, setPlacements] = useState({});

  const [selectedProtocol, setSelectedProtocol] = useState(() => {
    const recommended = PROTOCOLS.find((protocol) =>
      planData?.protocol_recommendation?.toLowerCase().includes(protocol.name.toLowerCase().split(' ')[0])
    );
    return recommended || PROTOCOLS[0];
  });

  useEffect(() => {
    if (onProtocolChange) onProtocolChange(selectedProtocol);
  }, [onProtocolChange, selectedProtocol]);

  const selectedZones = assessmentData?.zones || [];
  const activeCount = selectedZones.length;
  const activePadZone = useMemo(() => selectedZones.find((zoneId) => PAD_PLACEMENT_MAP[zoneId]) || null, [selectedZones]);
  const activePadOptions = activePadZone ? PAD_PLACEMENT_MAP[activePadZone] : [];
  const activePlacementOption = activePadZone ? placements[activePadZone] || activePadOptions[0]?.option || 1 : 1;
  const primaryAnalysis = useMemo(() => deriveAnalysis(assessmentData, planData, 1), [assessmentData, planData]);
  const secondaryAnalysis = useMemo(() => deriveAnalysis(assessmentData, planData, 2), [assessmentData, planData]);

  function selectPlacement(zoneId, optionNumber) {
    setPlacements((prev) => ({ ...prev, [zoneId]: optionNumber }));
  }

  function getSelectedPlacement(zoneId) {
    const options = PAD_PLACEMENT_MAP[zoneId] || [];
    return options.find((option) => option.option === (placements[zoneId] || options[0]?.option || 1));
  }

  const _visiblePlacementZones = selectedZones.filter((zoneId) => PAD_PLACEMENT_MAP[zoneId]);
  const displayMarkers = activePadZone
    ? buildPlacementMarkers(
        activePadZone,
        activePadOptions,
        activePlacementOption,
        showAllPlacements,
      )
    : [];

  return (
    <>
      <section className="riq-card">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="riq-eyebrow !mb-0">
              <FileText size={14} />
              Session Plan
            </div>
            <span className="riq-pill text-slate-500">AI</span>
            <div className="riq-pill text-slate-500">Active Areas: <span className="text-slate-950">{activeCount}</span></div>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="riq-button-secondary !min-h-0 !px-5 !py-2.5 text-[10px] uppercase tracking-[0.18em]"
            >
              <Sparkles size={14} />
              View Detailed Report
            </button>
          </div>
          <button type="button" onClick={() => setExpanded((prev) => !prev)} className="text-slate-400 transition-colors hover:text-slate-900">
            {expanded ? '⌃' : '⌄'}
          </button>
        </div>

        {expanded ? (
  <div className="border-t border-[#F3F4F6] px-6 py-6">
    <MovementIntelligencePanel innovation={planData?.innovation} />

    {planData?.session_focus && (
      <div className="mb-5">
        <VoicePanel
          text={`${planData.session_focus}. ${planData.analysis_1 || ''}`}
          label="Read Session Brief"
        />
      </div>
    )}

    <div className="mb-5 flex flex-wrap gap-2 border-b border-[#ECEFF4] pb-3">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex items-center gap-2 rounded-t-[14px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                    activeTab === id ? 'bg-[var(--riq-primary)] text-white shadow-sm' : 'bg-white text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'pad' ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectionMode('manual')}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${selectionMode === 'manual' ? 'bg-[var(--riq-primary)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}
                    >
                      Manual Selection
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionMode('ai')}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${selectionMode === 'ai' ? 'bg-[var(--riq-primary)] text-white' : 'border border-slate-200 bg-white text-slate-700'}`}
                    >
                      AI Recommended
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllPlacements((prev) => !prev)}
                    className="riq-button-secondary !min-h-0 !px-4 !py-2 text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Eye size={13} />
                    {showAllPlacements ? 'Hide All Placements' : 'Show All Placements'}
                  </button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                  <div className="space-y-4 xl:max-h-[820px] xl:overflow-y-auto xl:pr-2">
                    {activePadZone ? (
                      <div className="riq-card overflow-hidden">
                        <div className="flex items-center justify-between gap-3 bg-[linear-gradient(135deg,#0f2942,#123d63)] px-5 py-5 text-white">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-[#D6B190] p-2 text-[#0f2942]">
                              <Activity size={16} />
                            </div>
                            <div>
                              <div className="text-xl font-black uppercase leading-tight">
                                {formatPadZoneTitle(activePadZone)}
                              </div>
                              <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                                {activePadOptions.length} muscle options available
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAllPlacements((prev) => !prev)}
                            className="rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                          >
                            {showAllPlacements ? 'Focused Placement' : 'Show All Placements'}
                          </button>
                        </div>

                        <div className="space-y-4 p-5">
                          {activePadOptions.map((option) => (
                            <PlacementOptionCard
                              key={option.option}
                              option={option}
                              active={activePlacementOption === option.option}
                              onSelect={() => selectPlacement(activePadZone, option.option)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[28px] border border-dashed border-[#E5E7EB] bg-white p-8 text-sm text-[#98A1B2]">
                        Select an assessment area to see pad placements.
                      </div>
                    )}
                  </div>

                    <div className="riq-card p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <BodyPlacementCanvas
                        title="Front view"
                        markers={displayMarkers}
                      />
                      <BodyPlacementCanvas
                        title="Rear view"
                        rear
                        markers={displayMarkers}
                      />
                    </div>

                    {activePadZone ? (
                      <div className="riq-stat mt-6 p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Sun</div>
                            <div className="mt-1 text-lg font-black text-slate-950">{getSelectedPlacement(activePadZone)?.sun}</div>
                            <div className="mt-1 text-xs text-slate-500">{zoneName(activePadZone)} · Front / primary placement</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Moon</div>
                            <div className="mt-1 text-lg font-black text-slate-950">{getSelectedPlacement(activePadZone)?.moon}</div>
                            <div className="mt-1 text-xs text-slate-500">{zoneName(activePadZone)} · Posterior / balancing placement</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'analysis1' ? <AnalysisPanel analysis={primaryAnalysis} emphasis="primary" /> : null}
            {activeTab === 'analysis2' ? <AnalysisPanel analysis={secondaryAnalysis} emphasis="secondary" /> : null}
            {activeTab === 'kinetic_chain' ? <KineticChainTab assessmentData={assessmentData} planData={planData} /> : null}

            {activeTab === 'exercises' ? (
              <div className="space-y-5">
                {selectedZones.map((zoneId) => {
                  const exercises = HOME_EXERCISES_MAP[zoneId] || [];
                  if (exercises.length === 0) return null;
                  return (
                    <div key={zoneId} className="riq-card p-6">
                      <div className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{zoneName(zoneId)}</div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {exercises.map((exercise, index) => (
                          <div key={`${exercise.name}-${index}`} className="riq-stat p-5">
                            <div className="text-sm font-black text-slate-950">{exercise.name}</div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                              {exercise.sets} sets · {exercise.reps}
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-500">{exercise.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="riq-card px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#F4F5F7] pb-6">
          <div className="flex flex-wrap items-center gap-6">
            <h3 className="riq-section-title text-[32px] font-black uppercase leading-none text-slate-950">Device Manager</h3>
            <div className="flex rounded-[18px] border border-slate-200 bg-slate-50 p-1">
              {['1 Device', '2 Devices', '3 Devices'].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`rounded-[14px] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] ${index === 0 ? 'bg-[var(--riq-primary)] text-white shadow-sm' : 'text-slate-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex rounded-[18px] border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setConnectionMode('wifi')}
              className={`inline-flex items-center gap-2 rounded-[14px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${connectionMode === 'wifi' ? 'bg-[var(--riq-primary)] text-white shadow-sm' : 'text-slate-500'}`}
            >
              <Wifi size={14} />
              WiFi
            </button>
            <button
              type="button"
              onClick={() => setConnectionMode('bt')}
              className={`rounded-[14px] px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${connectionMode === 'bt' ? 'bg-[var(--riq-primary)] text-white shadow-sm' : 'text-slate-500'}`}
            >
              BT
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-lg font-black uppercase text-slate-950">Available WiFi Devices</div>
          <p className="mt-1 text-sm text-slate-500">Click a device to assign it to a slot below</p>
          <div className="mt-5 flex flex-row gap-4 overflow-x-auto pb-1">
            {[
              { name: 'Hydra-19 (Blue Crystal)', mac: 'EC:DA:3B:61:9D:68' },
              { name: 'Hydra-11', mac: 'EC:DA:3B:55:0C:AC' },
            ].map((device) => (
              <button key={device.mac} type="button" className="min-w-[190px] rounded-[22px] border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-sky-200 hover:shadow-lg">
                <div className="mb-2 h-3 w-3 rounded-full bg-[#F1F5F9]" />
                <div className="text-sm font-bold text-slate-950">{device.name}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{device.mac}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Choose Session Goal:</span>
            <div className="flex flex-wrap gap-2 rounded-[16px] border border-slate-200 bg-slate-50/80 p-2">
              {SESSION_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => {
                    setSelectedGoal(goal.id);
                    const nextProtocol = PROTOCOLS.find((protocol) => protocol.id === goal.protocols[0]);
                    if (nextProtocol) setSelectedProtocol(nextProtocol);
                  }}
                  className={`rounded-[12px] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all ${
                    selectedGoal === goal.id ? 'bg-[var(--riq-primary)] text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {goal.label.replace(' — ', ' - ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Choose Protocol:</span>
            <div className="flex gap-2 overflow-x-auto rounded-[16px] border border-slate-200 bg-slate-50/80 p-2">
              {(SESSION_GOALS.find((goal) => goal.id === selectedGoal)?.protocols || []).map((protocolId) => {
                const protocol = PROTOCOLS.find((item) => item.id === protocolId);
                if (!protocol) return null;
                const active = protocol.id === selectedProtocol.id;
                return (
                  <button
                    key={protocol.id}
                    type="button"
                    onClick={() => setSelectedProtocol(protocol)}
                    className={`shrink-0 rounded-[18px] border px-5 py-3 text-center transition-all ${
                      active ? 'border-sky-200 bg-white shadow-sm' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="text-[13px] font-bold leading-tight text-slate-950">{protocol.name}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{protocol.duration} Min</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="riq-stat p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-slate-950">Device 1</div>
                <span className="mt-1 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Active</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Select Device</label>
                <select className="riq-select !rounded-[16px] !border-[#EEF1F4] !bg-white text-sm">
                  <option>-- Select Hardware --</option>
                  <option>Hydra-19 (Blue Crystal)</option>
                  <option>Hydra-11</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Body Part</label>
                <select className="riq-select !rounded-[16px] !border-[#EEF1F4] !bg-white text-sm">
                  <option>{activePadZone ? zoneName(activePadZone) : '-- No Assignment --'}</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Protocol</label>
                <select className="riq-select !rounded-[16px] !border-[#EEF1F4] !bg-white text-sm">
                  <option>{selectedProtocol.name}</option>
                </select>
              </div>
            </div>
          </div>

          {scanData?.vitals ? (
            <div className="riq-stat p-7 lg:col-span-2">
              <div className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Readiness Snapshot</div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Heart Rate', value: `${scanData.vitals.hr_bpm} BPM` },
                  { label: 'HRV', value: `${scanData.vitals.hrv_sdnn_ms} ms` },
                  { label: 'Breath Rate', value: `${scanData.vitals.breath_rate_bpm}/min` },
                ].map((item) => (
                  <div key={item.label} className="riq-stat p-5">
                    <div className="text-2xl font-black text-slate-950">{item.value}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#F4F5F7] pt-6">
          <button
            type="button"
            onClick={() => onStartSession(selectedProtocol)}
            className="riq-button"
          >
            <Play size={16} fill="currentColor" />
            Start Session
          </button>
        </div>
      </section>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        assessmentData={assessmentData}
        planData={planData}
        primaryAnalysis={primaryAnalysis}
        secondaryAnalysis={secondaryAnalysis}
      />
    </>
  );
}
