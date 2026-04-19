import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles, Stethoscope, TrendingUp, Video } from 'lucide-react';
import { PageShell } from '../components/AppChrome';
import { trackEvent } from '../services/marketing';

const VALUE_POINTS = [
  {
    title: 'Capture movement',
    desc: 'Guide a client through intake and movement tasks directly inside the app.',
    Icon: Video,
  },
  {
    title: 'Generate recovery insight',
    desc: 'Turn intake signals, motion, and session data into structured recovery guidance.',
    Icon: Sparkles,
  },
  {
    title: 'Start better sessions faster',
    desc: 'Move from assessment to protocol selection without fragmented notes or guesswork.',
    Icon: Stethoscope,
  },
];

const PROOF_POINTS = [
  'Guided intake with voice and camera-based motion capture',
  'Recovery score, patient journey, and session-history tracking',
  'MQTT-backed session launch flow already wired into the product',
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('landing_page_view', { source: 'homepage' });
  }, []);

  return (
    <PageShell
      eyebrow="Practitioner Growth"
      title="Turn movement capture into better recovery sessions."
      subtitle="RecoveryIQ helps practitioners guide intake, capture movement, generate structured recovery feedback, and start targeted sessions faster."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/pricing" className="riq-button-secondary">
            Pricing
          </Link>
          <Link to="/login" className="riq-button-secondary">
            Practitioner Login
          </Link>
          <Link
            to="/book-demo"
            className="riq-button"
            onClick={() => trackEvent('clicked_book_demo', { source: 'homepage_topbar' })}
          >
            Book Demo
          </Link>
        </div>
      }
      contentWidth="max-w-7xl"
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="riq-panel riq-mesh px-6 py-8 sm:px-8">
          <div className="riq-eyebrow mb-5">
            <TrendingUp size={14} />
            Outcome-first workflow
          </div>
          <h2 className="riq-section-title max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Give every new client a clearer starting point before the session begins.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Instead of relying on fragmented notes and subjective descriptions, practitioners can
            guide intake, record movement, generate recovery feedback, and move into session setup
            inside one connected workflow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent('clicked_try_demo', { source: 'homepage_hero' });
                navigate('/demo');
              }}
              className="riq-button"
            >
              <PlayCircle size={17} />
              Try Demo Intake
            </button>
            <button
              type="button"
              onClick={() => {
                trackEvent('clicked_book_demo', { source: 'homepage_hero' });
                navigate('/book-demo');
              }}
              className="riq-button-secondary"
            >
              Book Live Demo
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {VALUE_POINTS.map(({ title, desc, Icon }) => (
              <div key={title} className="riq-stat p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
                  <Icon size={18} className="text-[var(--riq-primary)]" />
                </div>
                <div className="text-lg font-semibold text-slate-950">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="riq-card px-6 py-8 sm:px-8">
          <div className="riq-eyebrow mb-4">What the demo shows</div>
          <div className="space-y-4">
            {[
              'Select a guest or client and start guided intake',
              'Use voice or camera-based movement capture',
              'Generate recovery feedback and session planning output',
              'See how the journey and dashboard update over time',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                <span className="text-sm leading-6 text-slate-600">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80 p-5">
            <div className="text-sm font-semibold text-slate-900">Why clinics care</div>
            <div className="mt-3 space-y-3">
              {PROOF_POINTS.map((item) => (
                <div key={item} className="text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'For practitioners',
            desc: 'Reduce intake ambiguity and start sessions with more structured signal.',
          },
          {
            title: 'For clinics',
            desc: 'Standardize how staff capture movement, document progress, and explain recovery.',
          },
          {
            title: 'For pilots',
            desc: 'Run a focused workflow trial with lower back, hip, shoulder, gait, or mobility cases.',
          },
        ].map((item) => (
          <article key={item.title} className="riq-card px-5 py-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{item.title}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
