import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { BasicsStep } from '@/features/wizard/steps/BasicsStep';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * /start — open to everyone: what a founder needs, how long it takes and what it costs,
 * BEFORE asking them to sign up. The button leads to the application (/start/new).
 */
export function StartLandingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  usePageMeta(t('start.title'), t('start.intro'));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <header className="space-y-3 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl text-ink text-balance">{t('start.title')}</h1>
        <p className="text-base text-slate-600">{t('start.intro')}</p>
      </header>

      {/* Plain columns separated by lines, no boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
        <section className="lg:col-span-3 pt-5 border-t border-slate-200 space-y-4">
          <h2 className="text-xl text-ink">{t('start.needTitle')}</h2>
          <ul className="divide-y divide-slate-200">
            {([1, 2, 3, 4, 5, 6] as const).map(i => (
              <li key={i} className="py-3 text-base text-slate-700">
                {t(`start.need${i}`)}
              </li>
            ))}
          </ul>
        </section>

        <div className="lg:col-span-2 space-y-10">
          <section className="pt-5 border-t border-slate-200 space-y-4">
            <h2 className="text-xl text-ink">{t('start.timeTitle')}</h2>
            <ol className="space-y-4">
              {([1, 2, 3, 4] as const).map(i => (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="w-6 shrink-0 font-bold text-slate-400 font-mono-numbers">0{i}</span>
                  <span>
                    <span className="block font-semibold text-ink">{t(`start.time${i}Title`)}</span>
                    <span className="text-slate-600">{t(`start.time${i}Text`)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="pt-5 border-t border-slate-200 space-y-2">
            <h2 className="text-xl text-ink">{t('start.feesTitle')}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{t('start.fees')}</p>
          </section>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Link
          to={paths.newProject}
          className="px-6 py-3.5 text-sm font-semibold text-white bg-night hover:bg-night-soft rounded-md inline-flex items-center justify-center gap-2"
        >
          {t('start.cta')}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
        {!user && <p className="text-sm text-slate-500">{t('start.ctaHint')}</p>}
      </div>
    </div>
  );
}

/** /start/new — first step of a brand-new project. Saving it creates the draft. */
export function StartProjectPage() {
  const { t } = useTranslation();
  usePageMeta(t('nav.startProject'));
  return <BasicsStep draft={null} />;
}
