import { ArrowRight, Search, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/AppChrome';
import { useApp } from '../context/AppContext';

export default function Clients() {
  const navigate = useNavigate();
  const { patients, patientsLoading } = useApp();
  const [query, setQuery] = useState('');

  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return patients;
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(normalized) ||
      patient.condition.toLowerCase().includes(normalized)
    );
  }, [patients, query]);

  return (
    <PageShell
      eyebrow="Client Directory"
      title="Clients"
      subtitle="Browse existing client records, jump into a session workflow, or open the recovery journey view."
      actions={
        <button type="button" onClick={() => navigate('/intake')} className="riq-button">
          <UserPlus size={16} />
          New Client Intake
        </button>
      }
    >
      <section className="riq-panel p-5 sm:p-6">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients by name or condition..."
            className="riq-input pl-12"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {patientsLoading ? (
          <div className="riq-card px-6 py-10 text-center text-slate-500 xl:col-span-3">
            Loading client records...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="riq-card px-6 py-10 text-center text-slate-500 xl:col-span-3">
            No clients match this search.
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const latestScore = patient.recovery_scores?.[patient.recovery_scores.length - 1]?.score || 0;
            return (
              <article key={patient.id} className="riq-card px-5 py-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 font-semibold text-sky-700">
                      {patient.avatar || patient.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{patient.name}</h3>
                      <p className="text-sm text-slate-500">{patient.condition}</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    Age {patient.age || 'n/a'}
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="text-2xl font-semibold text-slate-950">{latestScore}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Latest Score
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="text-2xl font-semibold text-slate-950">{patient.sessions?.length || 0}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Sessions
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/intake?patient=${patient.id}`)}
                    className="riq-button flex-1"
                  >
                    Open Session
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
          })
        )}
      </section>

      <section className="mt-6 riq-panel riq-mesh px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Users className="text-sky-600" size={20} />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-950">{patients.length} clients in directory</div>
            <div className="text-sm text-slate-500">
              New client records created in intake now appear here automatically.
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
