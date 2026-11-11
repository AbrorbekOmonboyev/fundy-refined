import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Lock } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { pickText } from '@/features/projects/api';
import { useMyProjects } from '@/features/projects/hooks';
import { BasicsStep } from '@/features/wizard/steps/BasicsStep';
import {
  ORGANIZERS,
  allowedModels,
  isOrganizer,
  paysAfterRegistration,
  type OrganizerType,
} from '@/features/wizard/organizer';
import { usePageMeta } from '@/lib/usePageMeta';
import { DONATION_ONLY } from '@/lib/focus';

/** What each kind of organiser adds when applying, after the identity check. Same rules as submit_project(). */
const APPLY_EXTRA = {
  individual: [],
  yatt: ['organizer.yatt.apply'],
  mchj: ['organizer.mchj.apply'],
  ngo: ['organizer.ngo.apply'],
} as const satisfies Record<OrganizerType, readonly string[]>;

/**
 * /start — open to everyone. First asks who is raising the money, then shows only what
 * that kind of organiser needs (to apply, and before the money is paid out), how long it
 * takes and what it costs, BEFORE asking them to sign up. The button leads to /start/new.
 */
export function StartLandingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const myProjects = useMyProjects();
  const [params, setParams] = useSearchParams();
  usePageMeta(t('start.title'), t('start.intro'));

  const asParam = params.get('as');
  const who: OrganizerType = isOrganizer(asParam) ? asParam : 'individual';
  const choose = (o: OrganizerType) => setParams({ as: o }, { replace: true, preventScrollReset: true });

  const draft = myProjects.data?.find(p => p.status === 'draft' || p.status === 'changes_requested');
  const draftTitle = draft
    ? (pickText(draft.translations, i18n.resolvedLanguage ?? 'uz', draft.originalLanguage).text?.title ?? draft.slug)
    : null;

  const applyItems = [
    'start.needId',
    ...APPLY_EXTRA[who],
    'start.needBudget',
    'start.needStages',
    'start.needStory',
  ] as const;
  const models = allowedModels(who);

  const cta = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-3">
      <Link
        to={`${paths.newProject}?as=${who}`}
        className="px-6 py-3.5 text-sm font-semibold text-white bg-brand hover:bg-brand-deep rounded-full inline-flex items-center justify-center gap-2"
      >
        {t('start.cta')}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
      {draft ? (
        <Link
          to={paths.editProject(draft.id, 'review')}
          className="text-sm font-medium text-ink underline underline-offset-4 decoration-slate-300 hover:decoration-ink"
        >
          {t('start.continueDraft', { title: draftTitle })}
        </Link>
      ) : (
        !user && <p className="text-sm text-slate-500">{t('start.ctaHint')}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <header className="space-y-3 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl text-ink text-balance">{t('start.title')}</h1>
        <p className="text-base text-slate-600">{t('start.intro')}</p>
      </header>

      {/* Step zero: who is raising the money decides everything below */}
      <fieldset className="space-y-4">
        <legend className="text-xl text-ink mb-1">{t('start.whoTitle')}</legend>
        <p className="text-sm text-slate-600 max-w-2xl">{t('start.whoHint')}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ORGANIZERS.map(o => (
            <label
              key={o}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                who === o ? 'border-ink bg-brand-soft' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="organizer"
                value={o}
                checked={who === o}
                onChange={() => choose(o)}
                className="mt-1 accent-ink"
              />
              <span>
                <span className="block font-semibold text-ink">{t(`organizer.${o}.name`)}</span>
                <span className="block text-sm text-slate-600 mt-1">{t(`organizer.${o}.short`)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {cta}

      {/* Plain columns separated by lines, no boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
        <section className="lg:col-span-3 pt-5 border-t border-slate-200 space-y-6">
          <h2 className="text-xl text-ink">{t('start.needTitle')}</h2>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ink">{t('start.applyTitle')}</h3>
            <ul className="divide-y divide-slate-200">
              {applyItems.map(key => (
                <li key={key} className="py-3 text-base text-slate-700">
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ink">{t('start.payoutTitle')}</h3>
            <p className="py-3 text-base text-slate-700">{t(`organizer.${who}.payout`)}</p>
          </div>

          {DONATION_ONLY ? (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">{t('start.modelsTitle')}</h3>
              <p className="py-3 text-base text-slate-700">{t('start.donationOnly')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">{t('start.modelsTitle')}</h3>
              <ul className="space-y-1.5 text-base text-slate-700">
                {(['donation', 'reward', 'equity'] as const).map(m =>
                  models.includes(m) ? (
                    <li key={m}>
                      {t(`models.${m}.name`)}
                      {paysAfterRegistration(who, m) && (
                        <span className="block text-sm text-slate-600">{t('organizer.payLaterShort')}</span>
                      )}
                    </li>
                  ) : (
                    <li key={m} className="flex items-baseline gap-1.5 text-slate-500">
                      <Lock className="w-3.5 h-3.5 shrink-0 self-center" aria-hidden />
                      <span>
                        {t(`models.${m}.name`)}
                        <span className="text-sm">
                          {' · '}
                          {t('organizer.ngoDonationOnly')}
                        </span>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </section>

        <div className="lg:col-span-2 space-y-10">
          <section className="pt-5 border-t border-slate-200 space-y-4">
            <h2 className="text-xl text-ink">{t('start.timeTitle')}</h2>
            <ol className="space-y-4">
              {([1, 2, 3, 4] as const).map(i => (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="w-6 shrink-0 font-bold text-slate-500 font-mono-numbers">0{i}</span>
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

      {cta}
    </div>
  );
}

/** /start/new — first step of a brand-new project. Saving it creates the draft. */
export function StartProjectPage() {
  const { t } = useTranslation();
  usePageMeta(t('nav.startProject'));
  return <BasicsStep draft={null} />;
}
