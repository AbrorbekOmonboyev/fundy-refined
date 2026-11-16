import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  HeartHandshake,
  Leaf,
  ListChecks,
  Palette,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Utensils,
  Cpu,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { useProjectList } from '@/features/projects/hooks';
import { useCategories } from '@/features/reference/useReference';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Home page in the donation-site standard (GoFundMe, charity: water, Kitabisa, JustGiving):
 * a donor-first hero with real photos → causes close to their goal → browse by cause →
 * one quiet nudge for would-be organisers. Phone first; the safety promise lives in the hero
 * chips and on the Trust & Safety / How-it-works pages. Research notes in src/index.css and PRODUCT.md.
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
        {/* Causes to support, nearest to their goal first */}
        <section className="mt-8 lg:mt-14" aria-labelledby="home-projects">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 id="home-projects" className="text-[1.625rem] sm:text-3xl text-ink">
                {t('home.projects.title')}
              </h2>
              <p className="hidden sm:block mt-1 text-base text-slate-600">{t('home.projects.sub')}</p>
            </div>
            {items.length > 0 && (
              <span className="hidden sm:block">
                <SeeAll to={paths.explore} label={t('home.featured.viewAll')} />
              </span>
            )}
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
                className="mt-4 inline-flex items-center gap-2 min-h-11 px-5 rounded-md border-2 border-ink text-ink font-semibold hover:bg-page cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden />
                {t('home.projects.retry')}
              </button>
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {items.map((project, i) => (
                  // Phones show three; the rest are one tap away.
                  <div key={project.id} className={i >= 3 ? 'hidden md:block' : ''}>
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
              <Link
                to={paths.explore}
                className="sm:hidden mt-8 flex items-center justify-center gap-2 min-h-12 rounded-md border border-slate-300 bg-card text-base font-semibold text-ink"
              >
                {t('home.featured.viewAll')}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </>
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

        <Causes />
      </div>

      {/* Closing band: a single nudge for would-be organisers */}
      <section className="mt-16 lg:mt-28 bg-night text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl text-white text-balance">{t('home.final.title')}</h2>
            <p className="mt-3 text-lg text-slate-300">
              {t('home.final.text')}{' '}
              <Link
                to={paths.contact}
                className="font-semibold text-white underline underline-offset-4 decoration-brand-light decoration-2"
              >
                {t('home.final.contact')}
              </Link>
            </p>
          </div>
          <Link
            to={paths.startProject}
            className="shrink-0 inline-flex items-center justify-center min-h-12 px-8 text-base font-semibold text-white bg-brand hover:bg-brand-deep rounded-md"
          >
            {t('nav.startProject')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-8 lg:pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4.5rem] leading-[1.02] font-extrabold tracking-[-0.03em] text-ink text-balance">
            {t('home.hero.title')}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
            {t('home.hero.text')}
          </p>

          {/* One clear action; starting a fundraiser is a quiet second path on phones */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-3">
            <Link
              to={paths.explore}
              className="inline-flex items-center justify-center gap-2 min-h-13 px-8 text-[1.0625rem] font-semibold text-white bg-brand hover:bg-brand-deep rounded-[10px] shadow-sm transition-[transform,background-color] duration-150 active:scale-[0.97]"
            >
              {t('home.hero.give')}
              <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
            <Link
              to={paths.startProject}
              className="sm:hidden self-center inline-flex items-center min-h-11 text-base font-semibold text-ink underline underline-offset-4 decoration-slate-300"
            >
              {t('home.hero.orStart')}
            </Link>
            <Link
              to={paths.startProject}
              className="hidden sm:inline-flex items-center justify-center min-h-13 px-8 text-[1.0625rem] font-semibold text-ink bg-card border border-slate-300 hover:border-ink rounded-[10px] transition-colors"
            >
              {t('nav.startProject')}
            </Link>
          </div>

          {/* Why it is safe: checked, stage by stage, receipts */}
          {/* Wide screens only: on phones the safety story has its own section further down */}
          <ul className="hidden sm:flex mt-6 flex-wrap justify-center gap-2 text-sm font-semibold text-ink">
            {(
              [
                [ShieldCheck, 'trust2'],
                [ListChecks, 'trust3'],
                [Receipt, 'trust4'],
              ] as const
            ).map(([Icon, key]) => (
              <li key={key} className="inline-flex items-center gap-1.5 min-h-9 rounded-md bg-brand-soft px-3 py-1.5">
                <Icon className="w-4 h-4 shrink-0 text-brand dark:text-brand-light" aria-hidden />
                {t(`home.hero.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const CAUSE_ICONS: Record<string, LucideIcon> = {
  education: BookOpen,
  social: HeartHandshake,
  health: Stethoscope,
  healthcare: Stethoscope,
  agriculture: Sprout,
  crafts: Palette,
  food: Utensils,
  technology: Cpu,
  'clean-energy': Sun,
  environment: Leaf,
};

/** Browse by cause: big, tappable chips straight into Explore. */
function Causes() {
  const { t } = useTranslation();
  const { options } = useCategories();
  if (options.length === 0) return null;
  return (
    <section className="mt-16 lg:mt-24" aria-labelledby="home-causes">
      <h2 id="home-causes" className="text-[1.625rem] sm:text-3xl text-ink">
        {t('home.causes.title')}
      </h2>
      <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {options.map(c => {
          const Icon = CAUSE_ICONS[c.value] ?? HeartHandshake;
          return (
            <li key={c.value}>
              <Link
                to={`${paths.explore}?category=${encodeURIComponent(c.value)}`}
                className="flex items-center gap-3 min-h-14 rounded-2xl border border-slate-200 bg-card px-4 py-3 text-base font-semibold text-ink hover:border-brand hover:bg-brand-soft transition-colors"
              >
                <Icon className="w-5 h-5 shrink-0 text-brand dark:text-brand-light" aria-hidden />
                <span className="min-w-0 leading-tight">{c.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
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
