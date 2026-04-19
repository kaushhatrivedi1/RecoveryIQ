import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Activity,
  Flame,
  Minus,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { PageShell } from '../components/AppChrome';
import { useApp } from '../context/AppContext';
import { BODY_ZONES, HOME_EXERCISES_MAP, calcRecoveryScore } from '../data/mockData';

const LEVELS = [
  { level: 1, label: 'Beginner', xp: 0 },
  { level: 2, label: 'Recovering', xp: 200 },
  { level: 3, label: 'Consistent', xp: 500 },
  { level: 4, label: 'Optimized', xp: 1000 },
  { level: 5, label: 'Peak', xp: 2000 },
];

function getLevel(xp) {
  return [...LEVELS].reverse().find((entry) => xp >= entry.xp) || LEVELS[0];
}

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 70 ? '#13c3b0' : score >= 40 ? '#f5a54a' : '#ea5b7a';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="148" height="148" className="-rotate-90">
        <circle cx="74" cy="74" r={radius} stroke="#dbe8f7" strokeWidth="12" fill="none" />
        <circle
          cx="74"
          cy="74"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-semibold tracking-tight text-slate-950">{score}</div>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Recovery Score</div>
      </div>
    </div>
  );
}

function zoneLabel(zoneId) {
  return BODY_ZONES.find((entry) => entry.id === zoneId)?.label || zoneId;
}

function bodyContextSummary(patient) {
  const unitSystem = patient.unit_system || 'imperial';
  const parts = [];
  if (patient.height) parts.push(unitSystem === 'metric' ? `${patient.height} cm tall` : `${patient.height} in tall`);
  if (patient.weight) parts.push(unitSystem === 'metric' ? `${patient.weight} kg` : `${patient.weight} lb`);
  return parts.join(' and ');
}

function deriveJourneyInsights(patient, latest, delta) {
  const sessions = patient.sessions || [];
  const latestSession = sessions[sessions.length - 1] || null;
  const recentGains = sessions.slice(-3).map((session) => session.after_score - session.before_score);
  const avgGain = recentGains.length
    ? Number((recentGains.reduce((sum, gain) => sum + gain, 0) / recentGains.length).toFixed(1))
    : 0;
  const activeZones = (latestSession?.zones || []).map(zoneLabel);
  const bodyContext = bodyContextSummary(patient);

  let momentum = 'Your recovery is stable right now.';
  if (delta > 0) momentum = `Recovery is trending upward by ${delta} points since the last score update.`;
  else if (delta < 0) momentum = `Recovery dipped by ${Math.abs(delta)} points, so today should bias toward easier recovery work.`;

  let recommendation = 'Keep sessions consistent and stay with the current recovery rhythm.';
  if (avgGain >= 2) recommendation = `Recent sessions are helping. Average lift is ${avgGain} points per session, so keep the current protocol family and build consistency.`;
  else if (sessions.length === 0) recommendation = 'No session history yet. The next priority is building a first clean baseline and tracking how the body responds after one complete session.';
  else if (avgGain <= 0.5) recommendation = 'Session gains are modest so far, which usually means the next plan should focus on tighter targeting, better consistency, or gentler recovery intensity.';

  const consistency =
    sessions.length >= 3
      ? `You have ${sessions.length} recorded sessions, which is enough to start seeing a pattern instead of one-off changes.`
      : sessions.length > 0
        ? `You only have ${sessions.length} recorded ${sessions.length === 1 ? 'session' : 'sessions'}, so this is still an early baseline phase.`
        : 'No recovery sessions are stored yet, so the next milestone is completing a first full session and response check.';

  const bottleneck = activeZones.length
    ? `${activeZones[0]} is the clearest active focus from the latest session, so the recovery plan should stay targeted there before broadening the routine.`
    : 'No focused body region is stored yet, so the next assessment should identify the main area driving compensation.';

  const nextStep =
    avgGain >= 2
      ? 'Next step: keep the same protocol family and increase consistency before making big changes.'
      : avgGain > 0
        ? 'Next step: keep sessions regular, but tighten pad placement and reassess the same movement pattern after the next session.'
        : sessions.length
          ? 'Next step: reduce complexity, focus on one primary area, and compare before/after movement after the next session.'
          : 'Next step: complete one guided intake, one session, and one follow-up check-in so the recovery model has enough signal to adapt.';

  const loadContext =
    bodyContext && activeZones.some((zone) => /hip|knee|back/i.test(zone))
      ? `Body-load context is available (${bodyContext}), which helps interpret how hip, knee, and lower-back demand may show up across sessions.`
      : bodyContext
        ? `Body context is available (${bodyContext}) and can help personalize recovery planning over time.`
        : 'Add height and weight to the client profile if you want more personalized body-load context in the recovery feedback.';

  return {
    latestSession,
    avgGain,
    activeZones,
    momentum,
    recommendation,
    consistency,
    bottleneck,
    nextStep,
    loadContext,
    adherenceText:
      latest?.check_in === 'great'
        ? 'Self-check feedback is strong today, which supports progressing carefully.'
        : latest?.check_in === 'rough'
          ? 'Today’s self-check suggests backing off intensity and prioritizing comfort.'
          : 'Current self-check suggests a moderate recovery dose is appropriate.',
  };
}

function deriveHomeRoutine(patient) {
  const sessions = patient.sessions || [];
  const latestSession = sessions[sessions.length - 1];
  const sourceZones = latestSession?.zones || [];
  const exercises = sourceZones
    .flatMap((zoneId) => HOME_EXERCISES_MAP[zoneId] || [])
    .slice(0, 4);

  if (exercises.length) {
    return exercises.map((exercise) => `${exercise.name} — ${exercise.reps}`);
  }

  return [
    'Mobility reset — 8 slow reps',
    'Supported stretch — 30 seconds per side',
    'Breathing reset — 5 controlled breaths',
    'Light activation drill — 2 sets',
  ];
}

export default function Journey() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients, updatePatientScores } = useApp();
  const [checkedIn, setCheckedIn] = useState(false);

  const patient = patients.find((entry) => entry.id === patientId) || patients[0] || null;

  if (!patient) {
    return (
      <PageShell
        backTo="/dashboard"
        eyebrow="Patient Journey"
        title="No patient selected"
        subtitle="Create or select a client before opening the journey view."
        contentWidth="max-w-5xl"
      >
        <div className="riq-card px-6 py-10 text-center text-slate-500">
          No journey data is available yet.
        </div>
      </PageShell>
    );
  }

  const scores = patient.recovery_scores || [];
  const latest = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const delta = latest && prev ? latest.score - prev.score : 0;
  const streak = latest?.streak || 0;
  const xp = latest?.xp || 0;
  const level = getLevel(xp);
  const nextLevel = LEVELS.find((entry) => entry.xp > xp) || LEVELS[LEVELS.length - 1];
  const xpProgress = ((xp - level.xp) / ((nextLevel.xp - level.xp) || 1)) * 100;
  const todayCheckedIn = latest?.check_in !== null;

  const chartData = scores.map((score, index) => ({ day: `D${index + 1}`, score: score.score }));
  const homeRoutine = deriveHomeRoutine(patient);
  const journeyInsights = deriveJourneyInsights(patient, latest, delta);

  async function handleCheckIn(type) {
    const mobilityMap = { great: 8, okay: 6, rough: 4 };
    const mobility = mobilityMap[type];
    const sessionRecency = 25;
    const xpEarned = type === 'great' ? 50 : type === 'okay' ? 20 : 10;
    const newScore = calcRecoveryScore({
      mobility,
      sessionRecency,
      streak: streak + 1,
      hrv: null,
    });
    const newStreak = type === 'rough' ? 0 : streak + 1;

    updatePatientScores(patient.id, {
      score: newScore,
      check_in: type,
      streak: newStreak,
      xp: xp + xpEarned,
    });

    setCheckedIn(true);
  }

  return (
    <PageShell
      backTo="/dashboard"
      eyebrow="Patient Journey"
      title={`${patient.name}'s recovery flow`}
      subtitle={`A lighter, more encouraging patient-facing screen with progress, streaks, and home routine guidance for ${patient.condition.toLowerCase()}.`}
      contentWidth="max-w-5xl"
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="riq-panel riq-mesh px-6 py-7 text-center sm:px-8">
            <div className="riq-eyebrow mb-4">
              <Sparkles size={14} />
              Recovery Momentum
            </div>
            <ScoreRing score={latest?.score || 0} />

            <div className="mt-5 text-sm font-medium">
              {delta > 0 ? (
                <span className="text-emerald-600">Up {delta} points from yesterday</span>
              ) : delta < 0 ? (
                <span className="text-rose-600">Down {Math.abs(delta)} points from yesterday</span>
              ) : (
                <span className="text-slate-500">Holding steady from yesterday</span>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-amber-50 px-4 py-4">
                <div className="mb-2 flex items-center justify-center gap-2 text-amber-700">
                  <Flame size={18} />
                  <span className="text-2xl font-semibold">{streak}</span>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-amber-500">Day Streak</div>
              </div>
              <div className="rounded-[1.5rem] bg-cyan-50 px-4 py-4">
                <div className="mb-2 flex items-center justify-center gap-2 text-cyan-700">
                  <Zap size={18} />
                  <span className="text-2xl font-semibold">{xp}</span>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-500">XP Earned</div>
              </div>
              <div className="rounded-[1.5rem] bg-sky-50 px-4 py-4">
                <div className="mb-2 flex items-center justify-center gap-2 text-sky-700">
                  <Star size={18} />
                  <span className="text-2xl font-semibold">Lv.{level.level}</span>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-sky-500">{level.label}</div>
              </div>
            </div>

            <div className="mt-6 text-left">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>{level.label}</span>
                <span>
                  {xp} / {nextLevel.xp} XP
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="riq-card px-5 py-5 sm:px-6">
            <h3 className="riq-section-title text-2xl font-semibold text-slate-950">7-day trend</h3>
            <p className="mt-1 text-sm text-slate-500">A fast view of consistency across recent check-ins.</p>
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[30, 100]} hide />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: 18,
                      boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1f7ae0"
                    strokeWidth={3}
                    dot={{ fill: '#13c3b0', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="riq-card px-5 py-5 sm:px-6">
            <h3 className="riq-section-title text-2xl font-semibold text-slate-950">Session history</h3>
            <div className="mt-4 space-y-3">
              {(patient.sessions || []).length === 0 ? (
                <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/85 px-4 py-6 text-sm text-slate-500">
                  No sessions recorded yet for this client.
                </div>
              ) : (
                (patient.sessions || [])
                  .slice()
                  .reverse()
                  .map((session) => (
                  <div key={session.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/85 px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-900">{session.protocol}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {session.date} · {session.duration} min
                        </div>
                        {(session.zones || []).length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {session.zones.slice(0, 3).map((zone) => (
                              <span key={zone} className="riq-pill !border-slate-200 !bg-white !text-slate-600">
                                {zoneLabel(zone)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-600">
                          +{session.after_score - session.before_score}
                        </div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {session.before_score}→{session.after_score}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="riq-card px-5 py-5 sm:px-6">
            <h3 className="riq-section-title text-2xl font-semibold text-slate-950">Today&apos;s check-in</h3>
            <p className="mt-1 text-sm text-slate-500">How is mobility feeling today?</p>

            {checkedIn || todayCheckedIn ? (
              <div className="mt-6 rounded-[1.75rem] border border-emerald-200 bg-emerald-50/80 px-5 py-8 text-center">
                <div className="text-lg font-semibold text-emerald-700">Checked in for today</div>
                <div className="mt-2 text-sm leading-6 text-emerald-700/80">
                  Great work keeping the recovery routine active.
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      type: 'great',
                      label: 'Great',
                      icon: <ThumbsUp size={22} />,
                      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    },
                    {
                      type: 'okay',
                      label: 'Okay',
                      icon: <Minus size={22} />,
                      className: 'border-amber-200 bg-amber-50 text-amber-700',
                    },
                    {
                      type: 'rough',
                      label: 'Rough',
                      icon: <TrendingDown size={22} />,
                      className: 'border-rose-200 bg-rose-50 text-rose-700',
                    },
                  ].map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleCheckIn(option.type)}
                      className={`rounded-[1.4rem] border px-4 py-5 text-center transition-transform duration-200 hover:-translate-y-1 ${option.className}`}
                    >
                      <div className="mb-2 flex justify-center">{option.icon}</div>
                      <div className="font-semibold">{option.label}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="riq-card px-5 py-5 sm:px-6">
            <h3 className="riq-section-title text-2xl font-semibold text-slate-950">Today&apos;s home routine</h3>
            <p className="mt-1 text-sm text-slate-500">
              Supports {patient.condition.split('/')[0].trim().toLowerCase()} recovery between sessions.
            </p>

            <div className="mt-5 space-y-3">
              {homeRoutine.map((exercise, index) => (
                <div key={exercise} className="flex items-center gap-3 rounded-[1.4rem] bg-slate-50 px-4 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <span className="text-sm leading-6 text-slate-600">{exercise}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="riq-card px-5 py-5 sm:px-6">
            <div className="riq-eyebrow mb-4">Recovery Feedback</div>
            <div className="space-y-4">
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <TrendingUp size={16} className="text-sky-600" />
                  Momentum
                </div>
                <p className="text-sm leading-6 text-slate-600">{journeyInsights.momentum}</p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Activity size={16} className="text-cyan-600" />
                  Session Response
                </div>
                <p className="text-sm leading-6 text-slate-600">{journeyInsights.recommendation}</p>
                {journeyInsights.latestSession ? (
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                    Last session: {journeyInsights.latestSession.protocol} · focused on{' '}
                    {(journeyInsights.activeZones.length ? journeyInsights.activeZones : ['general mobility']).join(', ')}
                  </div>
                ) : null}
              </div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles size={16} className="text-violet-600" />
                  Recovery Pattern
                </div>
                <p className="text-sm leading-6 text-slate-600">{journeyInsights.consistency}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{journeyInsights.bottleneck}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{journeyInsights.loadContext}</p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Daily Guidance
                </div>
                <p className="text-sm leading-6 text-slate-600">{journeyInsights.adherenceText}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{journeyInsights.nextStep}</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/dashboard')} className="riq-button-secondary mt-5 w-full">
              Back to dashboard
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
