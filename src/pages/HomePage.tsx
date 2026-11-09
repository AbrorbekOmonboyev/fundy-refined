import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BadgePercent, ClipboardCheck, ListChecks, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { PHOTO_CREDITS } from '@/data/photoCredits';
import { useProjectList } from '@/features/projects/hooks';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * The first page, kept short on purpose (visitors said the old one had too much on it):
 * what Fundy is + why it is safe → projects to support → three short steps → a closing band
 * for founders and backers. Everything else (calculator, full steps, filters) lives on
 * Learn and Explore. Critique 2026-11-09 (.impeccable/critique) drove the trust row,
 * the "being checked" panel and the accessibility fixes.
 */
export function HomePage() {
  const { t } = useTranslation();
  const projects = useProjectList({ status: 'live', sort: 'most_funded', pageSize: 6 });
  usePageMeta(t('home.hero.title'), t('home.hero.text'));
  const items = projects.data?.items ?? [];

  return (
    <div>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Projects to support */}
        <section className="mt-12 lg:mt-20" aria-labelledby="home-projects">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 id="home-projects" className="text-2xl sm:text-[1.75rem] text-ink">
              {t('home.projects.title')}
            </h2>
            {items.length > 0 && <SeeAll to={paths.explore} label={t('home.featured.viewAll')} />}
          </div>
          {projects.isPending ? (
            <ProjectGridSkeleton />
          ) : projects.isError ? (
            <div role="alert" className="rounded-2xl border border-slate-300 bg-card px-6 py-8 text-center">
              <p className="font-semibold text-ink">{t('home.projects.errorTitle')}</p>
              <p className="mt-1 text-slate-600">{t('home.projects.errorText')}</p>
              <button
                type="button"
                onClick={() => void projects.refetch()}
                className="mt-4 inline-flex items-center gap-2 min-h-11 px-5 rounded-full border-2 border-ink text-ink font-semibold hover:bg-page cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden />
                {t('home.projects.retry')}
              </button>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {items.map((project, i) => (
                // Phones show three; the rest are one tap away.
                <div key={project.id} className={i >= 3 ? 'hidden md:block' : ''}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            // No live projects yet: say what is happening, not "nothing here".
            <div className="rounded-2xl bg-brand-soft px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row gap-5 sm:gap-8 sm:items-center">
              <span className="shrink-0 w-14 h-14 rounded-full bg-card text-brand flex items-center justify-center">
                <ClipboardCheck className="w-7 h-7" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-ink">{t('home.projects.soonTitle')}</p>
                <p className="mt-1 text-base text-slate-700 leading-relaxed max-w-2xl">{t('home.projects.soonText')}</p>
                <Link
                  to={paths.trustSafety}
                  className="mt-3 inline-flex items-center gap-1.5 min-h-11 font-semibold text-ink underline underline-offset-4 decoration-brand decoration-2"
                >
                  {t('home.projects.soonHow')}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* How, in three short lines */}
        <section id="how-it-works" className="mt-20 lg:mt-28 scroll-mt-24" aria-labelledby="home-simple">
          <h2 id="home-simple" className="text-2xl sm:text-[1.75rem] text-ink text-center">
            {t('home.simple.title')}
          </h2>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto">
            {(
              [
                [1, ClipboardCheck],
                [2, Users],
                [3, ListChecks],
              ] as const
            ).map(([i, Icon]) => (
              <li key={i} className="text-center">
                <span className="mx-auto w-14 h-14 rounded-full bg-brand-soft text-brand ring-1 ring-brand/20 flex items-center justify-center">
                  <Icon className="w-6 h-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{t(`home.simple.s${i}Title`)}</h3>
                <p className="mt-1.5 text-base text-slate-700 leading-relaxed max-w-xs mx-auto">
                  {t(`home.simple.s${i}Text`)}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <SeeAll to={`${paths.education}#how-it-works`} label={t('home.simple.more')} />
          </div>
        </section>
      </div>

      {/* Closing band: for founders AND backers, light so it doesn't run into the navy footer */}
      <section className="mt-20 lg:mt-28 bg-brand-soft border-t border-brand/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl sm:text-4xl text-ink text-balance max-w-2xl">{t('home.final.title')}</h2>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={paths.startProject}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-brand hover:bg-brand-deep rounded-full"
            >
              {t('nav.startProject')}
            </Link>
            <Link
              to={paths.explore}
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-ink border-2 border-ink hover:bg-card rounded-full"
            >
              {t('home.hero.explore')}
            </Link>
          </div>
          <p className="text-base text-slate-700">
            {t('home.final.text')}{' '}
            <Link
              to={paths.contact}
              className="font-semibold text-ink underline underline-offset-4 decoration-brand decoration-2"
            >
              {t('home.final.contact')}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

/** Round photos around the headline (big screens), a small row above it (smaller ones). Free-licence, credited. */
const PHOTOS = [
  { src: '/images/projects/chust-knives', pos: 'left-[4%] top-[14%] w-28 h-28' },
  { src: '/images/projects/zarafshan-fruit', pos: 'left-[11%] bottom-[10%] w-36 h-36' },
  { src: '/images/projects/registan', pos: 'right-[5%] top-[10%] w-36 h-36' },
  { src: '/images/projects/aral-saxaul', pos: 'right-[12%] bottom-[12%] w-28 h-28' },
  { src: '/images/projects/andijan-trike', pos: 'left-[22%] top-[4%] w-20 h-20' },
] as const;

function Hero() {
  const { t } = useTranslation();
  const [showCredits, setShowCredits] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* Big screens: photos float around the text (only where there is room for them) */}
      <div aria-hidden className="hidden xl:block">
        {PHOTOS.map(p => (
          <img
            key={p.src}
            src={`${p.src}-640.webp`}
            alt=""
            loading="lazy"
            decoding="async"
            className={`absolute ${p.pos} rounded-full object-cover ring-4 ring-card shadow-lg`}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-16 xl:py-24 text-center">
        {/* Smaller screens: a row of photos above the headline */}
        <div aria-hidden className="xl:hidden flex justify-center -space-x-3 mb-8">
          {PHOTOS.slice(0, 4).map(p => (
            <img
              key={p.src}
              src={`${p.src}-640.webp`}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-page"
            />
          ))}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-ink text-balance">
          {t('home.hero.title')}
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-slate-700 text-balance">{t('home.hero.text')}</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={paths.startProject}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-brand hover:bg-brand-deep rounded-full"
          >
            {t('nav.startProject')}
          </Link>
          <Link
            to={paths.explore}
            className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-ink border-2 border-ink hover:bg-card rounded-full"
          >
            {t('home.hero.explore')}
          </Link>
        </div>

        {/* Why it is safe, in three plain points */}
        <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-base font-medium text-ink">
          {(
            [
              [BadgePercent, 'trust1'],
              [ShieldCheck, 'trust2'],
              [ListChecks, 'trust3'],
            ] as const
          ).map(([Icon, key]) => (
            <li key={key} className="inline-flex items-center gap-2">
              <Icon className="w-5 h-5 text-brand shrink-0" aria-hidden />
              {t(`home.hero.${key}`)}
            </li>
          ))}
        </ul>

        {/* CC BY / CC BY-SA need the authors named */}
        <div className="mt-6 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => setShowCredits(v => !v)}
            aria-expanded={showCredits}
            className="min-h-11 px-2 underline underline-offset-2 hover:text-ink cursor-pointer"
          >
            {t('home.hero.photos')}
          </button>
          {showCredits && (
            <ul className="mt-1 space-y-1">
              {PHOTOS.map(p => {
                const c = PHOTO_CREDITS[`${p.src}.jpg`];
                return c ? (
                  <li key={p.src}>
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink underline-offset-2 hover:underline"
                    >
                      {c.author} · {c.license}
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function SeeAll({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="shrink-0 min-h-11 text-base font-semibold text-ink inline-flex items-center gap-1.5 underline underline-offset-4 decoration-slate-400 hover:decoration-ink"
    >
      {label}
      <ArrowRight className="w-4 h-4" aria-hidden />
    </Link>
  );
}
