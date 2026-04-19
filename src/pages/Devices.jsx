import { KeyRound, Play, Radio, Server, Wifi } from 'lucide-react';
import { useState } from 'react';
import { PageShell } from '../components/AppChrome';
import { getHydrawavBaseUrl, hydrawavLogin } from '../services/hydrawav';

export default function Devices() {
  const [baseUrl, setBaseUrl] = useState(getHydrawavBaseUrl());
  const [username, setUsername] = useState('testpractitioner');
  const [password, setPassword] = useState('1234');
  const [status, setStatus] = useState({ tone: 'idle', text: 'Not connected yet' });
  const [connecting, setConnecting] = useState(false);

  async function handleTestConnection() {
    setConnecting(true);
    try {
      await hydrawavLogin({ baseUrl, username, password });
      setStatus({ tone: 'ok', text: 'Authenticated successfully against the Hydrawav device API.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error?.message || 'Connection failed.',
      });
    } finally {
      setConnecting(false);
    }
  }

  const toneClasses = {
    idle: 'border-slate-200 bg-slate-50 text-slate-600',
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <PageShell
      eyebrow="Device Control"
      title="Devices"
      subtitle="Manage Hydrawav API connectivity and confirm the session-control credentials used by the session workflow."
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="riq-card px-6 py-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Server size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Hydrawav API</h2>
              <p className="text-sm text-slate-500">Used for device auth and MQTT publish commands.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Base URL</div>
              <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="riq-input" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Username</div>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="riq-input" />
              </div>
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Password</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="riq-input"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleTestConnection} disabled={connecting} className="riq-button">
              <Wifi size={16} />
              {connecting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          <div className={`mt-5 rounded-[1.4rem] border px-4 py-4 text-sm ${toneClasses[status.tone]}`}>
            {status.text}
          </div>
        </div>

        <div className="space-y-5">
          <div className="riq-stat px-5 py-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Radio className="text-cyan-600" size={18} />
            </div>
            <div className="text-lg font-semibold text-slate-950">Session Commands</div>
            <div className="mt-2 text-sm leading-6 text-slate-500">
              Start, pause, resume, and stop commands are sent from the session page through the same API.
            </div>
          </div>

          <div className="riq-stat px-5 py-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Play className="text-emerald-600" size={18} />
            </div>
            <div className="text-lg font-semibold text-slate-950">Live Workflow</div>
            <div className="mt-2 text-sm leading-6 text-slate-500">
              Once auth succeeds here, use the session page to publish real device actions against the configured MAC.
            </div>
          </div>

          <div className="riq-stat px-5 py-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <KeyRound className="text-amber-600" size={18} />
            </div>
            <div className="text-lg font-semibold text-slate-950">Current Defaults</div>
            <div className="mt-2 text-sm leading-6 text-slate-500">
              The app is currently seeded with the hackathon test practitioner credentials and the default Hydrawav endpoint.
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
