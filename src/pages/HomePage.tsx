import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Clock,
  Gift,
  Handshake,
  HeartHandshake,
  Leaf,
  ListChecks,
  Palette,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Users,
  Utensils,
  Cpu,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { PHOTO_CREDITS } from '@/data/photoCredits';
import { useProjectList } from '@/features/projects/hooks';
import { useCategories } from '@/features/reference/useReference';
import { usePageMeta } from '@/lib/usePageMeta';
import { DONATION_ONLY } from '@/lib/focus';

/**
 * Home page in the donation-site standard (GoFundMe, charity: water, Kitabisa, JustGiving):
 * a donor-first hero with real photos → causes close to their goal → browse by cause →
 * how a donation stays safe (shown as a real stage trail, not claimed) → a closing band.
 * Phone first. Research notes live in src/index.css and PRODUCT.md.
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
        <section className="mt-10 lg:mt-24" aria-labelledby="home-projects">
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
                className="mt-4 inline-flex items-center gap-2 min-h-11 px-5 rounded-full border-2 border-ink text-ink font-semibold hover:bg-page cursor-pointer"
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
                className="sm:hidden mt-8 flex items-center justify-center gap-2 min-h-12 rounded-full border border-slate-300 bg-card text-base font-semibold text-ink"
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

        <SafeGiving />

        {DONATION_ONLY && <ComingSoon />}
      </div>

      {/* Closing band for organisers and donors */}
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
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to={paths.startProject}
              className="inline-flex items-center justify-center min-h-12 px-8 text-base font-semibold text-white bg-brand hover:bg-brand-deep rounded-full"
            >
              {t('nav.startProject')}
            </Link>
            <Link
              to={paths.explore}
              className="inline-flex items-center justify-center min-h-12 px-8 text-base font-semibold text-white border border-white/40 hover:border-white rounded-full"
            >
              {t('home.hero.give')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Free-licence photos from the sample campaigns, credited below the hero. */
const PHOTOS = [
  { src: '/images/projects/rashidov-classroom', alt: '' },
  { src: '/images/projects/aral-saxaul', alt: '' },
  { src: '/images/projects/registan', alt: '' },
  { src: '/images/projects/zarafshan-fruit', alt: '' },
  { src: '/images/projects/chust-knives', alt: '' },
] as const;

function Hero() {
  const { t } = useTranslation();
  const [showCredits, setShowCredits] = useState(false);

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 lg:pb-4 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-center">
        <div className="text-left">
          <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.04] font-extrabold tracking-[-0.03em] text-ink text-balance">
            {t('home.hero.title')}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-700 leading-relaxed max-w-xl">{t('home.hero.text')}</p>

          {/* One clear action; starting a fundraiser is a quiet second path on phones */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3">
            <Link
              to={paths.explore}
              className="inline-flex items-center justify-center gap-2 min-h-13 px-8 text-[1.0625rem] font-semibold text-white bg-brand hover:bg-brand-deep rounded-full shadow-sm transition-[transform,background-color] duration-150 active:scale-[0.97]"
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
              className="hidden sm:inline-flex items-center justify-center min-h-13 px-8 text-[1.0625rem] font-semibold text-ink bg-card border border-slate-300 hover:border-ink rounded-full transition-colors"
            >
              {t('nav.startProject')}
            </Link>
          </div>

          {/* Why it is safe: checked, stage by stage, receipts */}
          {/* Wide screens only: on phones the safety story has its own section further down */}
          <ul className="hidden sm:flex mt-6 flex-wrap gap-2 text-sm font-semibold text-ink">
            {(
              [
                [ShieldCheck, 'trust2'],
                [ListChecks, 'trust3'],
                [Receipt, 'trust4'],
              ] as const
            ).map(([Icon, key]) => (
              <li key={key} className="inline-flex items-center gap-1.5 min-h-9 rounded-full bg-brand-soft px-3 py-1.5">
                <Icon className="w-4 h-4 shrink-0 text-brand dark:text-brand-light" aria-hidden />
                {t(`home.hero.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Real faces and places: one large photo and four small, like the big giving sites */}
        <div aria-hidden className="hidden lg:grid grid-cols-3 grid-rows-[repeat(2,minmax(0,1fr))] gap-3 h-[520px]">
          {PHOTOS.map((p, i) => (
            <img
              key={p.src}
              src={`${p.src}-${i === 0 ? '1280' : '640'}.webp`}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`w-full h-full object-cover rounded-2xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* CC BY / CC BY-SA need the authors named */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 text-sm text-slate-600 text-right">
        <button
          type="button"
          onClick={() => setShowCredits(v => !v)}
          aria-expanded={showCredits}
          className="min-h-11 underline underline-offset-2 hover:text-ink cursor-pointer"
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

/** How a donation stays safe: the three steps beside an example of a real stage trail. */
function SafeGiving() {
  const { t } = useTranslation();
  const steps = [
    [1, ClipboardCheck],
    [2, Users],
    [3, ListChecks],
  ] as const;

  return (
    <section
      id="how-it-works"
      className="mt-16 lg:mt-28 scroll-mt-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      aria-labelledby="home-simple"
    >
      <div>
        <h2 id="home-simple" className="text-[1.625rem] sm:text-3xl text-ink">
          {t('home.simple.title')}
        </h2>
        <ol className="mt-8 space-y-6">
          {steps.map(([i, Icon]) => (
            <li key={i} className="flex gap-4">
              <span className="w-12 h-12 shrink-0 rounded-2xl bg-brand-soft text-brand dark:text-brand-light flex items-center justify-center">
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">{t(`home.simple.s${i}Title`)}</h3>
                <p className="mt-1 text-base text-slate-700 leading-relaxed">{t(`home.simple.s${i}Text`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <SeeAll to={`${paths.education}#how-it-works`} label={t('home.simple.more')} />
        </div>
      </div>

      {/* An example trail, built from the same parts as a campaign page. Marked as an example. */}
      <figure className="rounded-3xl bg-card border border-slate-200 shadow-md p-6 sm:p-8">
        <figcaption className="flex items-center justify-between gap-3">
          <span className="text-base font-bold text-ink">{t('home.safe.title')}</span>
          <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-semibold">
            {t('home.safe.example')}
          </span>
        </figcaption>
        <ol className="mt-6">
          <TrailStep done icon={Check} title={t('home.safe.collected')} note={t('home.safe.collectedNote')} />
          <TrailStep done icon={Receipt} title={t('home.safe.stage1')} note={t('home.safe.stage1Note')} />
          <TrailStep last title={t('home.safe.stage2')} note={t('home.safe.stage2Note')} />
        </ol>
      </figure>
    </section>
  );
}

function TrailStep({
  done = false,
  last = false,
  icon: Icon,
  title,
  note,
}: {
  done?: boolean;
  last?: boolean;
  icon?: LucideIcon;
  title: string;
  note: string;
}) {
  return (
    <li className="relative flex gap-4 pb-7 last:pb-0">
      {/* Solid line = done, dashed = still to come, so the state never depends on colour alone */}
      {!last && (
        <span
          aria-hidden
          className={`absolute left-[15px] top-9 bottom-1 w-0 border-l-[3px] ${done ? 'border-brand' : 'border-dashed border-slate-300'}`}
        />
      )}
      <span
        className={`relative w-[33px] h-[33px] shrink-0 rounded-full flex items-center justify-center ${
          done ? 'bg-brand text-white' : 'border-[3px] border-dashed border-slate-300 bg-card'
        }`}
      >
        {Icon && <Icon className="w-4 h-4" aria-hidden />}
      </span>
      <div className="pt-1 min-w-0">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-slate-600">{note}</p>
      </div>
    </li>
  );
}

/** On the roadmap: shown so visitors (and reviewers) see what comes after donations. Not selectable yet. */
function ComingSoon() {
  const { t } = useTranslation();
  const items = [
    ['reward', Gift],
    ['equity', Handshake],
  ] as const;
  return (
    <section className="mt-16 lg:mt-28" aria-labelledby="home-soon">
      <h2 id="home-soon" className="text-[1.625rem] sm:text-3xl text-ink">
        {t('soon.homeTitle')}
      </h2>
      <p className="mt-2 text-base text-slate-600 max-w-2xl">{t('soon.homeText')}</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map(([m, Icon]) => (
          <li key={m} className="rounded-3xl border border-dashed border-slate-300 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-warm-soft text-warm-ink px-2.5 py-1 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                {t('soon.tag')}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-bold text-ink">{t(`models.${m}.name`)}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{t(`models.${m}.subtitle`)}</p>
            <p className="mt-3 text-base text-slate-700 leading-relaxed">{t(`models.${m}.text`)}</p>
          </li>
        ))}
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
