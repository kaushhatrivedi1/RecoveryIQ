import { Activity, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function BrandLockup({ subtitle = 'Adaptive Recovery Intelligence' }) {
  return (
    <Link to="/dashboard" className="riq-brand no-underline">
      <span className="riq-brand-mark">
        <Activity className="text-[#1f7ae0]" size={22} />
      </span>
      <span>
        <span className="riq-wordmark">RecoveryIQ</span>
        <span className="riq-wordmark-sub">{subtitle}</span>
      </span>
    </Link>
  );
}

export function PageShell({
  title,
  subtitle,
  eyebrow,
  backTo,
  actions,
  children,
  contentWidth = 'max-w-7xl',
}) {
  const navigate = useNavigate();

  return (
    <div className="riq-shell px-2 py-4 sm:px-4 sm:py-6">
      <div className="riq-container">
        <header className="riq-topbar">
          <div className="flex min-w-0 items-center gap-3">
            {backTo ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="riq-button-secondary !min-h-0 !rounded-2xl !px-3 !py-3"
              >
                <ChevronLeft size={18} />
              </button>
            ) : null}
            <BrandLockup />
          </div>
          {actions ? <div className="flex flex-wrap items-center justify-end gap-3">{actions}</div> : null}
        </header>

        <main className={`mx-auto ${contentWidth} pb-10 pt-8 sm:pt-10`}>
          {(title || subtitle || eyebrow) && (
            <section className="mb-8">
              {eyebrow ? <div className="riq-eyebrow mb-4">{eyebrow}</div> : null}
              {title ? (
                <h1 className="riq-section-title text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  {subtitle}
                </p>
              ) : null}
            </section>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
