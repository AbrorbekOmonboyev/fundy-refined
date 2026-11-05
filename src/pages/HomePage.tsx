import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Gift,
  HeartHandshake,
  Layers,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard } from '@/components/ProjectCard';
import { PageSpinner } from '@/components/ui';
import { usePlatformStats, useProjectList } from '@/features/projects/hooks';
import type { FundingModel } from '@/features/projects/api';
import { formatMoney, formatNumber } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

const exploreModel = (model: FundingModel) => `${paths.explore}?model=${model}`;

export function HomePage() {
  const { t } = useTranslation();
  const [model, setModel] = useState<FundingModel | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const stats = usePlatformStats();
  const featured = useProjectList({ featured: true, model, status: 'live', sort: 'most_funded', pageSize: 6 });
  usePageMeta(t('home.hero.title'), t('home.hero.text'));

  const s = stats.data;
  const statTiles = [
    {
      label: t('home.stats.raised'),
      value: s ? formatMoney(s.raised, true) : '…',
      hint: t('home.stats.raisedHint', { count: s?.public_projects ?? 0 }),
    },
    {
      label: t('home.stats.backers'),
      value: s ? formatNumber(s.backers) : '…',
      hint: t('home.stats.backersHint', { count: s?.regions ?? 0 }),
    },
    { label: t('home.stats.live'), value: s ? formatNumber(s.live_projects) : '…', hint: t('home.stats.liveHint') },
    {
      label: t('home.stats.equity'),
      value: s ? formatNumber(s.equity_projects) : '…',
      hint: t('home.stats.equityHint'),
    },
  ];

  const modelCards = [
    { id: 'donation' as const, Icon: HeartHandshake },
    { id: 'reward' as const, Icon: Gift },
  ];
  const steps = [1, 2, 3, 4] as const;
  const trustItems = [
    { key: 1, Icon: CheckCircle2 },
    { key: 2, Icon: Layers },
    { key: 3, Icon: Sparkles },
    { key: 4, Icon: Building2 },
  ] as const;
  const faqs = [1, 2, 3, 4, 5] as const;
  const voices = [
    { key: 1, initials: 'AR', color: 'bg-brand text-ink' },
    { key: 2, initials: 'SY', color: 'bg-night text-brand' },
    { key: 3, initials: 'JB', color: 'bg-track text-ink' },
  ] as const;

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero — chartreuse, in the style of the brand's link preview */}
      <section className="relative overflow-hidden bg-brand">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-night text-brand px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" aria-hidden />
              {t('home.hero.kicker')}
            </p>
            <h1 className="text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl text-ink text-balance">
              {t('home.hero.title')}
            </h1>
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed max-w-xl">{t('home.hero.text')}</p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={paths.explore}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-night hover:bg-night-soft rounded-full flex items-center gap-2"
              >
                {t('home.hero.explore')}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                to={paths.startProject}
                className="px-6 py-3.5 text-sm font-semibold text-ink bg-card hover:bg-card/80 rounded-full"
              >
                {t('nav.startProject')}
              </Link>
            </div>
            <dl className="pt-6 grid grid-cols-3 gap-4 text-xs text-ink/75 max-w-xl">
              {([1, 2, 3] as const).map(i => (
                <div key={i} className="border-t-2 border-ink/15 pt-3">
                  <dt className="font-bold text-ink text-sm">{t(`home.hero.trust${i}Title`)}</dt>
                  <dd>{t(`home.hero.trust${i}Text`)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <figure className="relative z-10 rounded-[2rem] overflow-hidden aspect-[4/3] bg-night shadow-[12px_12px_0_0_var(--color-brand-deep)]">
              <img src="/images/hero.jpg" alt="" className="w-full h-full object-cover" />
              <figcaption className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs text-brand font-semibold">{t('home.hero.imageKicker')}</span>
                <span className="text-base font-bold mt-1">{t('home.hero.imageTitle')}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Platform numbers (live from the database) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-night text-white rounded-2xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3 gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand">{t('home.stats.title')}</h2>
            <span className="text-[11px] text-slate-400">{t('home.stats.demoNote')}</span>
          </div>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {statTiles.map(tile => (
              <div key={tile.label}>
                <dt className="text-xs text-slate-400">{tile.label}</dt>
                <dd className="text-2xl lg:text-3xl font-extrabold mt-1 font-mono-numbers">{tile.value}</dd>
                <dd className="text-[11px] text-slate-400 mt-1">{tile.hint}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The three models */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-ink">{t('home.models.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 text-balance">{t('home.models.title')}</h2>
          <p className="text-sm text-slate-600 mt-2">{t('home.models.text')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelCards.map(({ id, Icon }) => (
            <div
              key={id}
              className="bg-card p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-brand text-ink`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-ink">{t(`models.${id}.name`)}</h3>
                <p className="text-xs text-slate-500 mt-1">{t(`models.${id}.subtitle`)}</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{t(`models.${id}.text`)}</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  {([1, 2] as const).map(i => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 text-ink`} aria-hidden />
                      {t(`models.${id}.point${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={exploreModel(id)}
                className={`mt-6 text-xs font-semibold flex items-center gap-1.5 text-ink hover:underline`}
              >
                {t(`models.${id}.cta`)}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </div>
          ))}
          <div className="bg-night text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-night-soft text-brand flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" aria-hidden />
              </div>
              <h3 className="text-lg font-bold">{t('models.equity.name')}</h3>
              <p className="text-xs text-brand mt-1">{t('models.equity.subtitle')}</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">{t('models.equity.text')}</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                {([1, 2] as const).map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden />
                    {t(`models.equity.point${i}`)}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to={paths.education}
              className="mt-6 text-xs font-semibold text-brand hover:text-white flex items-center gap-1.5"
            >
              {t('models.equity.cta')}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink">{t('home.featured.kicker')}</p>
            <h2 className="text-2xl font-extrabold text-ink mt-1">{t('home.featured.title')}</h2>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto" role="group">
            {([null, 'equity', 'reward', 'donation'] as const).map(m => (
              <button
                key={m ?? 'all'}
                type="button"
                aria-pressed={model === m}
                onClick={() => setModel(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                  model === m ? 'bg-card text-ink shadow-sm' : 'text-slate-600 hover:text-ink'
                }`}
              >
                {m ? t(`models.${m}.name`) : t('explore.allModels')}
              </button>
            ))}
          </div>
        </div>
        {featured.isPending ? (
          <PageSpinner />
        ) : featured.data && featured.data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.data.items.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 py-8">{t('explore.emptyTitle')}</p>
        )}
        <div className="text-center mt-10">
          <Link
            to={model ? exploreModel(model) : paths.explore}
            className="px-6 py-2.5 text-xs font-semibold text-ink bg-card hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm inline-flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" aria-hidden />
            {t('home.featured.viewAll')}
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">{t('home.how.kicker')}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 text-balance">{t('home.how.title')}</h2>
            <p className="text-sm text-slate-600 mt-2">{t('home.how.text')}</p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(i => (
              <li key={i} className="space-y-3">
                <span className="text-xs font-bold text-ink font-mono-numbers">0{i}</span>
                <h3 className="text-base font-bold text-ink">{t(`home.how.step${i}Title`)}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t(`home.how.step${i}Text`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-night to-night-soft text-white rounded-3xl p-8 lg:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-brand uppercase">
              <Lock className="w-4 h-4" aria-hidden />
              {t('home.trust.kicker')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{t('home.trust.title')}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t('home.trust.text')}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to={paths.trustSafety}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-night hover:bg-night-soft rounded-lg text-center"
              >
                {t('home.trust.standards')}
              </Link>
              <Link
                to={paths.education}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-night-soft hover:bg-card/10 rounded-lg border border-white/10 text-center"
              >
                {t('home.trust.learn')}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {trustItems.map(({ key, Icon }) => (
              <div key={key} className="bg-night-soft p-4 rounded-xl border border-white/10">
                <Icon className="w-5 h-5 text-brand mb-2" aria-hidden />
                <h3 className="font-bold text-sm">{t(`home.trust.item${key}Title`)}</h3>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{t(`home.trust.item${key}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Illustrative voices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-ink">{t('home.voices.kicker')}</p>
          <h2 className="text-2xl font-extrabold text-ink mt-1">{t('home.voices.title')}</h2>
          <p className="text-xs text-slate-500 mt-1">{t('home.voices.note')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {voices.map(v => (
            <figure
              key={v.key}
              className="bg-card p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <blockquote className="text-xs text-slate-700 leading-relaxed italic">
                “{t(`home.voices.quote${v.key}`)}”
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${v.color}`}
                  aria-hidden
                >
                  {v.initials}
                </span>
                <span className="text-xs">
                  <span className="block font-bold text-ink">{t(`home.voices.name${v.key}`)}</span>
                  <span className="text-slate-500">{t(`home.voices.role${v.key}`)}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-ink">{t('home.faq.kicker')}</p>
          <h2 className="text-2xl font-extrabold text-ink mt-1">{t('home.faq.title')}</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((i, idx) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-card">
              <h3>
                <button
                  type="button"
                  aria-expanded={openFaq === idx}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left text-sm font-semibold text-ink flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer"
                >
                  {t(`home.faq.q${i}`)}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-ink' : ''}`}
                    aria-hidden
                  />
                </button>
              </h3>
              {openFaq === idx && (
                <p className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {t(`home.faq.a${i}`)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-soft border border-brand rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
          <h2 className="text-xl sm:text-3xl font-extrabold text-ink">{t('home.cta.title')}</h2>
          <p className="text-xs sm:text-sm text-ink max-w-xl mx-auto leading-relaxed">{t('home.cta.text')}</p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={paths.startProject}
              className="px-6 py-3 text-xs font-semibold text-white bg-night hover:bg-night-soft rounded-lg shadow-sm"
            >
              {t('home.cta.start')}
            </Link>
            <Link
              to={paths.explore}
              className="px-6 py-3 text-xs font-semibold text-ink bg-card hover:bg-brand border border-brand rounded-lg"
            >
              {t('home.cta.browse')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
