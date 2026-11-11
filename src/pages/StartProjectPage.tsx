import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  HandCoins,
  Landmark,
  Lock,
  Receipt,
  Store,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
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

const ORGANIZER_ICONS: Record<OrganizerType, LucideIcon> = {
  ngo: Landmark,
  individual: UserRound,
  yatt: Store,
  mchj: Building2,
};

/** While Fundy is donation-only, registered funds come first: they are who Fundy partners with. */
const ORDER: readonly OrganizerType[] = DONATION_ONLY ? ['ngo', 'individual', 'yatt', 'mchj'] : ORGANIZERS;

/**
 * /start — open to everyone. A fundraiser landing page in the donation-site standard:
 * the promise and the button first, then who is raising the money (which decides the
 * documents), the four steps with their timing, what to prepare, what donors will see,
 * and the fees. The button leads to /start/new (sign-in first when needed).
 */
export function StartLandingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const myProjects = useMyProjects();
  const [params, setParams] = useSearchParams();
  usePageMeta(t('start.title'), t('start.intro'));

  const asParam = params.get('as');
  const who: OrganizerType = isOrganizer(asParam) ? asParam : DONATION_ONLY ? 'ngo' : 'individual';
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
        className="inline-flex items-center justify-center gap-2 min-h-13 px-8 text-[1.0625rem] font-semibold text-white bg-brand hover:bg-brand-deep rounded-full shadow-sm transition-colors"
      >
        {t('start.cta')}
        <ArrowRight className="w-5 h-5" aria-hidden />
      </Link>
      {draft ? (
        <Link
          to={paths.editProject(draft.id, 'review')}
          className="min-h-11 inline-flex items-center text-base font-semibold text-ink underline underline-offset-4 decoration-slate-300 hover:decoration-ink"
        >
          {t('start.continueDraft', { title: draftTitle })}
        </Link>
      ) : (
        !user && <p className="text-sm text-slate-600">{t('start.ctaHint')}</p>
      )}
    </div>
  );

  return (
    <div>
      {/* The promise and the button */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-4">
        <div className="max-w-3xl">
          <h1 className="text-[2.5rem] sm:text-5xl leading-[1.04] font-extrabold tracking-[-0.03em] text-ink text-balance">
            {t('start.title')}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-700 leading-relaxed">{t('start.intro')}</p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-ink">
            {(
              [
                [HandCoins, 'start.perk1'],
                [BadgeCheck, 'start.perk2'],
                [Receipt, 'start.perk3'],
              ] as const
            ).map(([Icon, key]) => (
              <li key={key} className="inline-flex items-center gap-1.5 min-h-9 rounded-full bg-brand-soft px-3 py-1.5">
                <Icon className="w-4 h-4 shrink-0 text-brand dark:text-brand-light" aria-hidden />
                {t(key)}
              </li>
            ))}
          </ul>
          <div className="mt-8">{cta}</div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24 mt-12 lg:mt-16">
        {/* Who is raising the money: decides the documents below */}
        <fieldset>
          <legend className="text-[1.625rem] sm:text-3xl text-ink font-bold">{t('start.whoTitle')}</legend>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">{t('start.whoHint')}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ORDER.map(o => {
              const Icon = ORGANIZER_ICONS[o];
              const on = who === o;
              return (
                <label
                  key={o}
                  className={`relative flex flex-col gap-3 rounded-2xl border bg-card p-5 cursor-pointer transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink ${
                    on ? 'border-brand ring-1 ring-brand bg-brand-soft' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="organizer"
                    value={o}
                    checked={on}
                    onChange={() => choose(o)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        on ? 'bg-brand text-white' : 'bg-slate-100 text-ink'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        on ? 'border-brand bg-brand text-white' : 'border-slate-300'
                      }`}
                    >
                      {on && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-ink">{t(`organizer.${o}.name`)}</span>
                    <span className="block text-sm text-slate-600 mt-1 leading-relaxed">
                      {t(`organizer.${o}.short`)}
                    </span>
                  </span>
                  {DONATION_ONLY && o === 'ngo' && (
                    <span className="inline-flex self-start items-center gap-1 text-brand-deep dark:text-brand-light text-xs font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" aria-hidden />
                      {t('start.fundBadge')}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* What to prepare, and what comes before the payout */}
        <section className="grid lg:grid-cols-2 gap-10 lg:gap-16" aria-labelledby="start-need">
          <div>
            <h2 id="start-need" className="text-[1.625rem] sm:text-3xl text-ink">
              {t('start.needTitle')}
            </h2>
            <h3 className="mt-6 text-base font-semibold text-slate-600">{t('start.applyTitle')}</h3>
            <ul className="mt-3 space-y-3">
              {applyItems.map(key => (
                <li key={key} className="flex gap-3 text-base text-ink leading-relaxed">
                  <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-brand-soft text-brand dark:text-brand-light flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" aria-hidden />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-card border border-slate-200 shadow-md p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Landmark className="w-5 h-5 text-brand dark:text-brand-light" aria-hidden />
                {t('start.payoutTitle')}
              </h3>
              <p className="mt-2 text-base text-slate-700 leading-relaxed">{t(`organizer.${who}.payout`)}</p>
            </div>

            {DONATION_ONLY ? (
              <div className="rounded-3xl bg-card border border-slate-200 p-6 sm:p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                  <HandCoins className="w-5 h-5 text-brand dark:text-brand-light" aria-hidden />
                  {t('start.modelsTitle')}
                </h3>
                <p className="mt-2 text-base text-slate-700 leading-relaxed">{t('start.donationOnly')}</p>
              </div>
            ) : (
              <div className="rounded-3xl bg-card border border-slate-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-ink">{t('start.modelsTitle')}</h3>
                <ul className="mt-3 space-y-2 text-base text-slate-700">
                  {(['donation', 'reward', 'equity'] as const).map(m =>
                    models.includes(m) ? (
                      <li key={m}>
                        {t(`models.${m}.name`)}
                        {paysAfterRegistration(who, m) && (
                          <span className="block text-sm text-slate-600">{t('organizer.payLaterShort')}</span>
                        )}
                      </li>
                    ) : (
                      <li key={m} className="flex items-center gap-1.5 text-slate-500">
                        <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        <span>
                          {t(`models.${m}.name`)} <span className="text-sm">({t('organizer.ngoDonationOnly')})</span>
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* The four steps, with how long each takes */}
        <section aria-labelledby="start-time">
          <h2 id="start-time" className="text-[1.625rem] sm:text-3xl text-ink">
            {t('start.timeTitle')}
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                [1, FileText],
                [2, ClipboardCheck],
                [3, HandCoins],
                [4, Receipt],
              ] as const
            ).map(([i, Icon]) => (
              <li key={i} className="rounded-2xl bg-card border border-slate-200 p-5">
                <span className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-brand-soft text-brand dark:text-brand-light flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-slate-500 font-mono-numbers">
                    {t('start.step', { n: i })}
                  </span>
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{t(`start.time${i}Title`)}</h3>
                <p className="mt-1 text-base text-slate-700">{t(`start.time${i}Text`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Fees, plainly */}
        <section className="rounded-3xl bg-brand-soft px-6 py-8 sm:px-10 sm:py-10" aria-labelledby="start-fees">
          <h2 id="start-fees" className="text-[1.625rem] sm:text-3xl text-ink">
            {t('start.feesTitle')}
          </h2>
          <p className="mt-3 text-lg text-slate-700 leading-relaxed max-w-3xl">{t('start.fees')}</p>
        </section>
      </div>

      {/* Closing band */}
      <section className="mt-16 lg:mt-24 bg-night text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <h2 className="text-3xl sm:text-4xl text-white max-w-xl text-balance">{t('start.closing')}</h2>
          <Link
            to={`${paths.newProject}?as=${who}`}
            className="inline-flex items-center justify-center gap-2 min-h-13 px-8 text-[1.0625rem] font-semibold text-white bg-brand hover:bg-brand-deep rounded-full shrink-0"
          >
            {t('start.cta')}
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

/** /start/new — first step of a brand-new project. Saving it creates the draft. */
export function StartProjectPage() {
  const { t } = useTranslation();
  usePageMeta(t('nav.startProject'));
  return <BasicsStep draft={null} />;
}
