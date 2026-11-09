import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Footprints, HandHeart, Rocket } from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { PHOTO_CREDITS } from '@/data/photoCredits';
import { useProjectList } from '@/features/projects/hooks';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * The first page, kept short on purpose (visitors said the old one had too much on it):
 * one line about what Fundy is → projects to support → three words on how → "Have an idea?".
 * Everything else (calculator, the full steps, ending-soon, filters) lives on Learn and Explore.
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
        <section className="mt-16 lg:mt-24" aria-labelledby="home-projects">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 id="home-projects" className="text-2xl sm:text-[1.75rem] text-ink">
              {t('home.projects.title')}
            </h2>
            {items.length > 0 && <SeeAll to={paths.explore} label={t('home.featured.viewAll')} />}
          </div>
          {projects.isPending ? (
            <ProjectGridSkeleton />
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
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
              <p className="text-slate-600">{t('home.projects.empty')}</p>
              <Link
                to={paths.startProject}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline underline-offset-4 decoration-brand-deep decoration-2"
              >
                {t('home.projects.emptyCta')}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
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
                [1, Rocket],
                [2, HandHeart],
                [3, Footprints],
              ] as const
            ).map(([i, Icon]) => (
              <li key={i} className="text-center">
                <span className="mx-auto w-14 h-14 rounded-full bg-brand-soft text-ink flex items-center justify-center">
                  <Icon className="w-6 h-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{t(`home.simple.s${i}Title`)}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
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

      {/* Have an idea? */}
      <section className="mt-20 lg:mt-28 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl sm:text-4xl text-ink">{t('home.final.title')}</h2>
          <Link
            to={paths.startProject}
            className="px-8 py-3.5 text-base font-semibold text-white bg-night hover:bg-night-soft rounded-full"
          >
            {t('home.final.start')}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Round photos around the headline (computers), a small row above it (phones). Free-licence, credited. */
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
      {/* Computers: photos float around the text */}
      <div aria-hidden className="hidden lg:block">
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

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 lg:py-28 text-center">
        {/* Phones and tablets: a small row of photos */}
        <div aria-hidden className="lg:hidden flex justify-center -space-x-3 mb-8">
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
        <p className="mt-5 text-lg sm:text-xl text-slate-600">{t('home.hero.text')}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={paths.startProject}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-night bg-brand hover:bg-brand-deep rounded-full"
          >
            {t('home.hero.start')}
          </Link>
          <Link
            to={paths.explore}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-ink border border-slate-300 hover:border-ink rounded-full"
          >
            {t('home.hero.explore')}
          </Link>
        </div>

        {/* CC BY / CC BY-SA need the authors named */}
        <div className="mt-8 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setShowCredits(v => !v)}
            aria-expanded={showCredits}
            className="underline underline-offset-2 hover:text-slate-600 cursor-pointer"
          >
            {t('home.hero.photos')}
          </button>
          {showCredits && (
            <ul className="mt-2 space-y-0.5">
              {PHOTOS.map(p => {
                const c = PHOTO_CREDITS[`${p.src}.jpg`];
                return c ? (
                  <li key={p.src}>
                    <a href={c.source} target="_blank" rel="noreferrer" className="hover:text-slate-600">
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
      className="shrink-0 text-sm font-semibold text-ink inline-flex items-center gap-1.5 underline underline-offset-4 decoration-slate-300 hover:decoration-ink"
    >
      {label}
      <ArrowRight className="w-4 h-4" aria-hidden />
    </Link>
  );
}
