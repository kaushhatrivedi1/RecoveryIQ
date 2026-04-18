import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { PageShell } from '../components/AppChrome';

const FREE_FEATURES = [
  'Basic session logging',
  'Up to 10 sessions per month',
  'Client list management',
  'Session history view',
];

const PRO_FEATURES = [
  'Smart Intake form with AI client brief',
  'ElevenLabs voice readout for practitioners',
  'Gamified patient recovery journey',
  'Daily check-in and recovery score',
  'Practitioner outcomes dashboard',
  'Protocol effectiveness analytics',
  'Client RAG status monitoring',
  'AI wellness insights per client',
  'PDF export via S3',
  'Real MQTT device control',
  'Unlimited sessions and clients',
  'Priority support',
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <PageShell
      eyebrow="Pricing Architecture"
      title="Transparent plans for a premium recovery workflow."
      subtitle="The redesign extends beyond colors. Pricing now feels like part of the same product system: cleaner hierarchy, brighter surfaces, and more confidence in every conversion step."
      backTo="/login"
      contentWidth="max-w-6xl"
    >
      <section className="riq-panel riq-mesh mb-8 px-6 py-8 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Average competing software', value: '$200-500/mo' },
            { label: 'RecoveryIQ Pro', value: '$49/mo' },
            { label: 'Device workflow', value: 'Built on Hydrawav3' },
          ].map((item) => (
            <div key={item.label} className="riq-stat px-4 py-5">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="riq-card px-6 py-7 sm:px-8">
          <div className="mb-8">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Free</div>
            <div className="mt-4 text-5xl font-semibold tracking-tight text-slate-950">$0</div>
            <div className="mt-2 text-sm text-slate-500">Forever free for simple practice tracking.</div>
          </div>

          <div className="mb-8 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Check size={18} className="mt-0.5 shrink-0 text-slate-500" />
                <span className="text-sm leading-6 text-slate-600">{feature}</span>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => navigate('/login')} className="riq-button-secondary w-full">
            Get Started Free
          </button>
        </article>

        <article className="riq-card riq-mesh relative overflow-hidden border-sky-200 px-6 py-7 sm:px-8">
          <div className="absolute right-6 top-6">
            <div className="riq-eyebrow">
              <Sparkles size={14} />
              Most Popular
            </div>
          </div>

          <div className="mb-8">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Pro</div>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-tight text-slate-950">$49</span>
              <span className="pb-2 text-sm text-slate-500">per practitioner / month</span>
            </div>
            <div className="mt-2 text-sm text-slate-500">The full light-theme intelligence layer for modern clinics.</div>
          </div>

          <div className="mb-8 grid gap-3">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3">
                <Check size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                <span className="text-sm leading-6 text-slate-600">{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              alert('Stripe checkout will be wired here via Vector AI integration. For demo: credentials at the workshop.');
              navigate('/login');
            }}
            className="riq-button w-full"
          >
            Start Free Trial
            <ArrowRight size={16} />
          </button>
          <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-slate-400">
            No credit card required
          </p>
        </article>
      </section>

      <section className="mt-10">
        <h2 className="riq-section-title text-3xl font-semibold text-slate-950">Designed for Hydrawav3 practitioners</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          The new visual system gives every audience a more premium first impression without losing
          clinical credibility.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Physical Therapists',
              desc: 'Post-surgical recovery, chronic wellness support, and neurological rehab.',
            },
            {
              title: 'Sports Trainers',
              desc: 'Pre-game prep, post-game recovery, and athletic performance tracking.',
            },
            {
              title: 'Wellness Centers',
              desc: 'Medspa integration, retention, and a stronger premium-service story.',
            },
          ].map((item) => (
            <div key={item.title} className="riq-card px-5 py-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">{item.title}</div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
