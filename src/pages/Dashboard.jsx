import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  LogOut,
  Minus,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { PageShell } from '../components/AppChrome';
import { useApp } from '../context/AppContext';
import { generateDashboardInsight } from '../services/insights';
import { getPatientStatus, PROTOCOLS } from '../data/mockData';

function StatusBadge({ status }) {
  const map = {
    green: {
      label: 'Improving',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle size={14} />,
    },
    amber: {
      label: 'Plateaued',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Minus size={14} />,
    },
    red: {
      label: 'Needs Attention',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: <AlertCircle size={14} />,
    },
  };

  const current = map[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${current.className}`}>
      {current.icon}
      {current.label}
    </span>
  );
}

export default function Dashboard() {
  const { patients, practitioner } = useApp();
  const navigate = useNavigate();
  const [insights, setInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      setLoadingInsights(true);
      const results = {};
      for (const patient of patients) {
        results[patient.id] = await generateDashboardInsight(patient);
      }
      setInsights(results);
      setLoadingInsights(false);
    }

    loadInsights();
  }, [patients]);

  const totalSessions = patients.reduce((sum, patient) => sum + patient.sessions.length, 0);
  const avgMobilityGain = Math.round(
    (patients.reduce((sum, patient) => {
      const gains = patient.sessions.map((session) => session.after_score - session.before_score);
      return sum + gains.reduce((acc, gain) => acc + gain, 0) / (gains.length || 1);
    }, 0) /
      patients.length) *
      10
  );

  const trendData = patients[0].recovery_scores.map((score, index) => ({
    day: `Day ${index + 1}`,
    [patients[0].name.split(' ')[0]]: score.score,
    [patients[1].name.split(' ')[0]]: patients[1].recovery_scores[index]?.score,
    [patients[2].name.split(' ')[0]]: patients[2].recovery_scores[index]?.score,
  }));

  const protocolStats = PROTOCOLS.slice(0, 6)
    .map((protocol, index) => ({
      name: protocol.name.split('(')[0].split('—')[0].trim().slice(0, 14),
      avg: Number((4.8 - index * 0.42).toFixed(1)),
    }))
    .sort((a, b) => b.avg - a.avg);

  function handleLogout() {
    localStorage.removeItem('riq_auth');
    navigate('/login');
  }

  return (
    <PageShell
      eyebrow="Clinic Command Center"
      title={`Welcome back, ${practitioner.name.split(' ')[1]}`}
      subtitle={`Practice analytics for ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}.`}
      actions={
        <>
          <button type="button" onClick={() => navigate('/intake')} className="riq-button">
            New Intake
            <ArrowRight size={16} />
          </button>
          <button type="button" onClick={handleLogout} className="riq-button-secondary">
            <LogOut size={16} />
            Sign Out
          </button>
        </>
      }
    >
      <section className="riq-panel riq-mesh mb-8 overflow-hidden px-6 py-6 sm:px-8">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="riq-eyebrow mb-4">
              <Sparkles size={14} />
              Live Practice Snapshot
            </div>
            <h2 className="riq-section-title text-3xl font-semibold text-slate-950">
              Future-clinic analytics with less visual noise.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              RecoveryIQ now presents outcomes, patient movement, and smart recommendations in a
              light interface that feels premium in-session and easier to scan across the room.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {[
              { label: 'Practice', value: practitioner.practice, icon: <Activity size={18} className="text-sky-600" /> },
              { label: 'Patients in motion', value: `${patients.length} active`, icon: <Users size={18} className="text-cyan-600" /> },
              { label: 'Momentum', value: 'Trending upward', icon: <TrendingUp size={18} className="text-emerald-600" /> },
            ].map((item) => (
              <div key={item.label} className="riq-stat px-4 py-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  {item.icon}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          {
            label: 'Total Sessions',
            value: totalSessions,
            sub: '+3 this week',
            icon: <Activity size={20} className="text-sky-600" />,
          },
          {
            label: 'Avg Mobility Gain',
            value: `${avgMobilityGain}%`,
            sub: 'Per session',
            icon: <TrendingUp size={20} className="text-emerald-600" />,
          },
          {
            label: 'Active Clients',
            value: patients.length,
            sub: 'Currently enrolled',
            icon: <Users size={20} className="text-cyan-600" />,
          },
        ].map((card) => (
          <div key={card.label} className="riq-stat px-5 py-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              {card.icon}
            </div>
            <div className="text-4xl font-semibold tracking-tight text-slate-950">{card.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-500">{card.label}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{card.sub}</div>
          </div>
        ))}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="riq-card px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="riq-section-title text-2xl font-semibold text-slate-950">Recovery Score Trends</h3>
              <p className="mt-1 text-sm text-slate-500">Seven-day movement across active clients</p>
            </div>
            <span className="riq-pill text-slate-500">Live mock data</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 90]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: 18,
                  boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
                }}
              />
              <Line type="monotone" dataKey="Maria" stroke="#1f7ae0" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Marcus" stroke="#ea5b7a" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Elena" stroke="#13c3b0" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex flex-wrap gap-4">
            {[
              { name: 'Maria', color: '#1f7ae0' },
              { name: 'Marcus', color: '#ea5b7a' },
              { name: 'Elena', color: '#13c3b0' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="riq-card px-5 py-5 sm:px-6">
          <div className="mb-5">
            <h3 className="riq-section-title text-2xl font-semibold text-slate-950">Protocol Effectiveness</h3>
            <p className="mt-1 text-sm text-slate-500">Average mobility gain per session</p>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={protocolStats} layout="vertical">
              <XAxis type="number" domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: 18,
                  boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
                }}
              />
              <Bar dataKey="avg" radius={[0, 10, 10, 0]}>
                {protocolStats.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === 0 ? '#1f7ae0' : index === 1 ? '#13c3b0' : '#f5a54a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="riq-section-title text-2xl font-semibold text-slate-950">Client Status</h3>
            <p className="mt-1 text-sm text-slate-500">Each card combines score momentum, adherence, and AI insight.</p>
          </div>
          <span className="riq-pill text-slate-500">RAG monitoring</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {patients.map((patient) => {
            const status = getPatientStatus(patient);
            const latestScore = patient.recovery_scores[patient.recovery_scores.length - 1]?.score || 0;
            const streak = patient.recovery_scores[patient.recovery_scores.length - 1]?.streak || 0;

            return (
              <article key={patient.id} className="riq-card px-5 py-5 transition-transform duration-200 hover:-translate-y-1">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 font-semibold text-sky-700">
                      {patient.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950">{patient.name}</h4>
                      <p className="text-sm text-slate-500">{patient.condition}</p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-3 py-4 text-center">
                    <div className="text-2xl font-semibold text-slate-950">{latestScore}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Score</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-4 text-center">
                    <div className="text-2xl font-semibold text-amber-700">{streak}d</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-amber-500">Streak</div>
                  </div>
                  <div className="rounded-2xl bg-cyan-50 px-3 py-4 text-center">
                    <div className="text-2xl font-semibold text-cyan-700">{patient.sessions.length}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-500">Sessions</div>
                  </div>
                </div>

                {loadingInsights ? (
                  <div className="mb-4 rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                    <div className="mb-2 h-3 w-full animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
                  </div>
                ) : insights[patient.id] ? (
                  <div className="mb-4 rounded-3xl border border-cyan-100 bg-cyan-50/70 px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-700">
                      <Zap size={15} />
                      AI insight
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{insights[patient.id]}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/intake?patient=${patient.id}`)}
                    className="riq-button flex-1"
                  >
                    New Session
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/journey/${patient.id}`)}
                    className="riq-button-secondary"
                  >
                    Journey
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
