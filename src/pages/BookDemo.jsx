import { useEffect, useState } from 'react';
import { ArrowRight, CalendarClock, CheckCircle2 } from 'lucide-react';
import { PageShell } from '../components/AppChrome';
import { submitLead, trackEvent } from '../services/marketing';

const INITIAL_FORM = {
  name: '',
  email: '',
  clinic: '',
  role: '',
  source: 'website',
  interest: 'clinic demo',
  notes: '',
};

export default function BookDemo() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent('book_demo_page_view', { source: 'book-demo' });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await submitLead(form);
      await trackEvent('submitted_book_demo', { source: 'book-demo', interest: form.interest });
      setSubmitted(true);
      setForm(INITIAL_FORM);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      eyebrow="Book Demo"
      title="Request a live RecoveryIQ walkthrough."
      subtitle="Share your clinic details and what you want to solve. We’ll use that context to tailor the demo around intake, movement capture, and recovery workflow."
      backTo="/"
      contentWidth="max-w-5xl"
    >
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="riq-panel riq-mesh px-6 py-8 sm:px-8">
          <div className="riq-eyebrow mb-5">
            <CalendarClock size={14} />
            Demo outcome
          </div>
          <div className="space-y-4">
            {[
              'See the full intake-to-session workflow live',
              'Review how movement capture can support practitioner decision-making',
              'Discuss pilot use cases for lower back, hip, shoulder, gait, or mobility',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-4">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                <span className="text-sm leading-6 text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="riq-card px-6 py-8 sm:px-8">
          {submitted ? (
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/80 px-5 py-10 text-center">
              <CheckCircle2 size={42} className="mx-auto text-emerald-600" />
              <div className="mt-4 text-2xl font-semibold text-emerald-800">Demo request received</div>
              <p className="mt-3 text-sm leading-6 text-emerald-700/90">
                Thank you. We received your request and will get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Full name"
                  className="riq-input"
                  required
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  placeholder="Work email"
                  className="riq-input"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.clinic}
                  onChange={(e) => setForm((current) => ({ ...current, clinic: e.target.value }))}
                  placeholder="Clinic / organization"
                  className="riq-input"
                />
                <input
                  value={form.role}
                  onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
                  placeholder="Role"
                  className="riq-input"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={form.interest}
                  onChange={(e) => setForm((current) => ({ ...current, interest: e.target.value }))}
                  className="riq-input"
                >
                  <option value="clinic demo">Clinic demo</option>
                  <option value="pilot program">Pilot program</option>
                  <option value="movement capture">Movement capture</option>
                  <option value="recovery workflow">Recovery workflow</option>
                </select>
                <select
                  value={form.source}
                  onChange={(e) => setForm((current) => ({ ...current, source: e.target.value }))}
                  className="riq-input"
                >
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="founder outreach">Founder outreach</option>
                </select>
              </div>

              <textarea
                value={form.notes}
                onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                placeholder="What do you want the demo to focus on?"
                rows={5}
                className="riq-textarea"
              />

              <button type="submit" disabled={submitting || !form.name.trim() || !form.email.trim()} className="riq-button">
                {submitting ? 'Submitting...' : 'Request Demo'}
                {!submitting ? <ArrowRight size={16} /> : null}
              </button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
