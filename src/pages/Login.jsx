import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { BrandLockup } from '../components/AppChrome';

const VALUE_POINTS = [
  'Live patient recovery intelligence',
  'Frictionless intake and guided protocol setup',
  'A brighter practitioner experience built for trust',
];

export default function Login() {
  const [email, setEmail] = useState('annie@hydrawav3demo.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('riq_auth', 'true');
      navigate('/dashboard');
    }, 800);
  }

  return (
    <div className="riq-shell flex items-center px-3 py-6 sm:px-6">
      <div className="riq-container">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="riq-panel riq-mesh riq-grid relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-200/40 to-transparent" />
            <div className="relative">
              <BrandLockup subtitle="Future-ready practitioner console" />

              <div className="mt-8 max-w-2xl">
                <div className="riq-eyebrow mb-5">
                  <Sparkles size={14} />
                  Light Interface System
                </div>
                <h1 className="riq-section-title max-w-xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                  A cleaner, calmer clinic dashboard for recovery teams.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  RecoveryIQ now opens with a brighter, more modern visual system designed to
                  feel premium, trustworthy, and easy to scan during live sessions.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Intelligence Layer', value: 'AI-guided', icon: <Sparkles size={18} className="text-cyan-600" /> },
                  { label: 'Session Workflow', value: '3 steps', icon: <Stethoscope size={18} className="text-blue-600" /> },
                  { label: 'Demo Security', value: 'Protected', icon: <ShieldCheck size={18} className="text-emerald-600" /> },
                ].map((item) => (
                  <div key={item.label} className="riq-stat px-4 py-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="text-sm text-slate-500">{item.label}</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  Why this redesign works
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {VALUE_POINTS.map((point) => (
                    <div key={point} className="rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-4 text-sm leading-6 text-slate-600">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="riq-panel px-6 py-8 sm:px-8 sm:py-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Practitioner Access
                </div>
                <h2 className="riq-section-title mt-3 text-3xl font-semibold text-slate-950">
                  Sign in to continue
                </h2>
              </div>
              <span className="riq-pill text-slate-500">Demo ready</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="riq-input"
                  placeholder="practitioner@clinic.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="riq-input"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading} className="riq-button w-full">
                {loading ? 'Signing in...' : 'Open Dashboard'}
                {!loading ? <ArrowRight size={17} /> : null}
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600">
              Demo credentials are already filled. This project uses local mock auth so the visual
              flow stays uninterrupted while reviewing the new UI.
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-4">
                <Link to="/pricing" className="font-semibold text-sky-700 transition hover:text-sky-900">
                  View pricing
                </Link>
                <Link to="/hackathon" className="font-semibold text-sky-700 transition hover:text-sky-900">
                  Hackathon resources
                </Link>
              </div>
              <span className="text-slate-400">GlobeHack Season 1 · April 2026</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
