import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, ImageOff } from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { MusharakahCalculator } from '@/features/education/MusharakahCalculator';
import { usePlatformStats, useProjectList } from '@/features/projects/hooks';
import { daysLeft, pickText, type FundingModel, type ProjectCardData } from '@/features/projects/api';
import { useCategories } from '@/features/reference/useReference';
import { responsiveImage } from '@/lib/supabase';
import { formatMoney, formatNumber } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

const exploreModel = (model: FundingModel) => `${paths.explore}?model=${model}`;

/**
 * Home page as a curated feed, the way the big crowdfunding sites do it:
 * one short line + real numbers → one featured project → rows of projects → how the money moves →
 * Musharakah, tried out → a plain note for founders.
 */
export function HomePage() {
  const { t } = useTranslation();
  const [model, setModel] = useState<FundingModel | null>(null);
  const top = useProjectList({ featured: true, status: 'live', sort: 'most_funded', pageSize: 1 });
  const heroProject = top.data?.items[0];
  // Every live project, not only featured ones: the featured one is already shown big above.
  const featured = useProjectList({
    model,
    status: 'live',
    sort: 'most_funded',
    excludeId: heroProject?.id,
    pageSize: 6,
  });
  const ending = useProjectList({ status: 'live', sort: 'ending_soon', excludeId: heroProject?.id, pageSize: 3 });
  usePageMeta(t('home.hero.title'), t('home.hero.text'));

  return (
    <div className="pb-16">
      <IntroBand />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. One featured project, big */}
        {heroProject ? (
          <FeaturedProject project={heroProject} />
        ) : top.isPending ? (
          <div aria-hidden className="mt-10 aspect-[16/7] rounded-2xl bg-slate-100 animate-pulse" />
        ) : null}

        {/* 2. Projects raising now */}
        <section className="mt-16 lg:mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 border-b border-slate-200">
            <h2 className="text-2xl sm:text-[1.75rem] text-ink pb-3">{t('home.featured.title')}</h2>
            <div className="flex gap-5 overflow-x-auto text-sm [scrollbar-width:none]" role="group">
              {([null, 'equity', 'reward', 'donation'] as const).map(m => (
                <button
                  key={m ?? 'all'}
                  type="button"
                  aria-pressed={model === m}
                  onClick={() => setModel(m)}
                  className={`pb-3 -mb-px whitespace-nowrap border-b-[3px] cursor-pointer ${
                    model === m
                      ? 'border-brand-deep text-ink font-semibold'
                      : 'border-transparent text-slate-600 hover:text-ink'
                  }`}
                >
                  {m ? t(`models.${m}.name`) : t('explore.allModels')}
                </button>
              ))}
            </div>
          </div>
          {featured.isPending ? (
            <ProjectGridSkeleton />
          ) : featured.data && featured.data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {featured.data.items.map((project, i) => (
                // Phones show three; the rest are one tap away in "All projects".
                <div key={project.id} className={i >= 3 ? 'hidden md:block' : ''}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-8">{t('explore.emptyTitle')}</p>
          )}
          <SeeAll to={model ? exploreModel(model) : paths.explore} label={t('home.featured.viewAll')} />
        </section>

        {/* 3. Ending soon */}
        {ending.data && ending.data.items.length > 0 && (
          <section className="mt-16 lg:mt-20">
            <h2 className="text-2xl sm:text-[1.75rem] text-ink pb-3 mb-6 border-b border-slate-200">
              {t('home.ending.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {ending.data.items.map((project, i) => (
                <div key={project.id} className={i >= 2 ? 'hidden lg:block' : ''}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
            <SeeAll to={`${paths.explore}?sort=ending_soon`} label={t('home.featured.viewAll')} />
          </section>
        )}

        {/* 4. How the money moves: a plain numbered list, no boxes */}
        <section id="how-it-works" className="mt-16 lg:mt-24 scroll-mt-24">
          <h2 className="text-2xl sm:text-[1.75rem] text-ink pb-3 mb-8 border-b border-slate-200">
            {t('home.how.title')}
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
            {([1, 2, 3, 4] as const).map(i => (
              <li key={i}>
                <p className="text-sm font-bold text-slate-400 font-mono-numbers">0{i}</p>
                <h3 className="mt-2 text-base font-bold text-ink">{t(`home.how.step${i}Title`)}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t(`home.how.step${i}Text`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. Musharakah, explained by trying it */}
        <section className="mt-16 lg:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4 lg:pt-2">
            <h2 className="text-2xl sm:text-[1.75rem] text-ink">{t('home.musharakah.title')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t('home.musharakah.text')}</p>
            <Link
              to={paths.education}
              className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 underline underline-offset-4 decoration-slate-300 hover:decoration-ink"
            >
              {t('home.musharakah.more')}
            </Link>
          </div>
          <div className="lg:col-span-8">
            <MusharakahCalculator showHeader={false} />
          </div>
        </section>

        {/* 6. For founders: a plain strip between two lines, not a banner */}
        <section className="mt-16 lg:mt-24 py-8 border-y border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-2xl sm:text-[1.75rem] text-ink">{t('home.cta.title')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t('home.cta.text')}</p>
          </div>
          <Link
            to={paths.startProject}
            className="shrink-0 px-6 py-3 text-sm font-semibold text-white bg-night hover:bg-night-soft rounded-md inline-flex items-center justify-center"
          >
            {t('home.cta.start')}
          </Link>
        </section>
      </div>
    </div>
  );
}

/** The single brand moment: a chartreuse band with one line about Fundy and the real totals. */
function IntroBand() {
  const { t } = useTranslation();
  const stats = usePlatformStats();
  const s = stats.data;

  return (
    <section className="bg-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
        <div className="lg:col-span-7 space-y-3">
          <h1 className="text-[1.75rem] leading-tight sm:text-4xl text-ink text-balance">{t('home.hero.title')}</h1>
          <p className="text-sm sm:text-base text-ink/80 leading-relaxed max-w-xl">{t('home.hero.text')}</p>
        </div>
        <dl className="lg:col-span-5 grid grid-cols-3 gap-4 border-t border-ink/15 pt-4 lg:border-t-0 lg:pt-0">
          {(
            [
              ['statsRaised', s ? formatMoney(s.raised, true) : '—'],
              ['statsBackers', s ? formatNumber(s.backers) : '—'],
              ['statsLive', s ? formatNumber(s.live_projects) : '—'],
            ] as const
          ).map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs text-ink/70">{t(`home.hero.${key}`)}</dt>
              <dd className="mt-1 text-lg sm:text-2xl font-bold text-ink font-mono-numbers leading-tight whitespace-nowrap">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {/* Thin ikat edge: the dye "bleeds" along the threads, like hand-tied abrbandi silk */}
      <div
        aria-hidden
        className="h-3 bg-brand-deep [background-image:url(/images/ikat-brand.svg)] [background-size:60px_80px]"
      />
    </section>
  );
}

/** One project shown large: photo on the left, the numbers and one button on the right. */
function FeaturedProject({ project }: { project: ProjectCardData }) {
  const { t, i18n } = useTranslation();
  const { nameOf } = useCategories();
  const { text } = pickText(project.translations, i18n.resolvedLanguage ?? 'uz', project.originalLanguage);
  const title = text?.title ?? project.slug;
  const href = paths.project(project.slug);
  const days = daysLeft(project.endsAt);

  return (
    <section className="mt-10 lg:mt-12" aria-labelledby="pick-title">
      <p className="text-xs font-semibold text-slate-500 mb-3">{t('home.pick.label')}</p>
      <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
          {project.coverUrl ? (
            <img
              {...responsiveImage(project.coverUrl)}
              sizes="(min-width: 1024px) 720px, 100vw"
              alt={title}
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageOff className="w-10 h-10" aria-hidden />
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
            <span className="font-semibold text-ink">{t(`models.${project.model}.name`)}</span>
            {nameOf(project.categoryId) && (
              <>
                <span aria-hidden>·</span>
                <span>{nameOf(project.categoryId)}</span>
              </>
            )}
            {project.location && (
              <>
                <span aria-hidden>·</span>
                <span>{project.location.split(',')[0]}</span>
              </>
            )}
          </p>
          <h2 id="pick-title" lang={text?.language} className="mt-2 text-2xl sm:text-3xl text-ink leading-tight">
            <Link
              to={href}
              className="after:absolute after:inset-0 group-hover:underline underline-offset-4 decoration-2 decoration-brand-deep"
            >
              {title}
            </Link>
          </h2>
          <p lang={text?.language} className="mt-3 text-base text-slate-600 leading-relaxed">
            {text?.tagline}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
            {t('project.by', { name: project.founderName })}
            {project.founderVerified && (
              <CheckCircle className="w-4 h-4 text-ink" aria-label={t('project.verifiedFounder')} />
            )}
          </p>

          <div className="mt-6 lg:mt-auto pt-2">
            <div
              className="w-full bg-track rounded-full h-2 overflow-hidden"
              role="progressbar"
              aria-valuenow={project.fundedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('project.funded', { percent: project.fundedPercent })}
            >
              <div
                className="h-full rounded-full bg-brand-deep"
                style={{ width: `${Math.min(project.fundedPercent, 100)}%` }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-[1.4fr_1fr_1fr] gap-3 sm:gap-4 font-mono-numbers">
              <div className="flex flex-col-reverse">
                <dt className="text-xs text-slate-500">
                  {t('project.ofGoal', { goal: formatMoney(project.targetAmount, true) })}
                </dt>
                <dd className="text-lg sm:text-xl font-bold text-ink whitespace-nowrap">
                  {formatMoney(project.raisedAmount, true)}
                </dd>
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-xs text-slate-500">{t('project.backersLabel')}</dt>
                <dd className="text-lg sm:text-xl font-bold text-ink whitespace-nowrap">
                  {formatNumber(project.backerCount)}
                </dd>
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-xs text-slate-500">{t('project.timeLeft')}</dt>
                <dd className="text-lg sm:text-xl font-bold text-ink whitespace-nowrap">
                  {project.status === 'active' ? t('project.daysLeft', { count: days }) : '—'}
                </dd>
              </div>
            </dl>
            <span className="relative mt-6 w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-night group-hover:bg-night-soft dark:bg-brand dark:text-night dark:group-hover:bg-brand-deep rounded-md inline-flex items-center justify-center gap-2 pointer-events-none">
              {t('home.pick.view')}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}

function SeeAll({ to, label }: { to: string; label: string }) {
  return (
    <div className="mt-8">
      <Link
        to={to}
        className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 underline underline-offset-4 decoration-slate-300 hover:decoration-ink"
      >
        {label}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  );
}
