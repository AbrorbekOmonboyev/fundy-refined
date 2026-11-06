import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/app/routes';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { MusharakahCalculator } from '@/features/education/MusharakahCalculator';
import { useProjectList } from '@/features/projects/hooks';
import type { FundingModel } from '@/features/projects/api';
import { usePageMeta } from '@/lib/usePageMeta';

const exploreModel = (model: FundingModel) => `${paths.explore}?model=${model}`;
const PAYMENT_METHODS = ['Click', 'Payme', 'Uzcard', 'Humo'];

/**
 * Five sections, one job each:
 * what Fundy is → projects raising now → how the money moves → Musharakah, tried out → start yours.
 */
export function HomePage() {
  const { t } = useTranslation();
  const [model, setModel] = useState<FundingModel | null>(null);
  const top = useProjectList({ featured: true, status: 'live', sort: 'most_funded', pageSize: 1 });
  const featured = useProjectList({ featured: true, model, status: 'live', sort: 'most_funded', pageSize: 6 });
  usePageMeta(t('home.hero.title'), t('home.hero.text'));
  const heroProject = top.data?.items[0];

  return (
    <div className="pb-16">
      {/* 1. What Fundy is */}
      <section className="relative overflow-hidden bg-brand">
        {/* Ikat texture: the dye "bleeds" along the threads, like hand-tied abrbandi silk */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:url(/images/ikat-brand.svg)] [background-size:120px_160px] [mask-image:linear-gradient(to_left,black,transparent_70%)]"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl text-ink text-balance">
              {t('home.hero.title')}
            </h1>
            <p className="text-base sm:text-lg text-ink/80 leading-relaxed max-w-xl">{t('home.hero.text')}</p>
            <div className="pt-2 grid grid-cols-1 sm:flex gap-3">
              <Link
                to={paths.explore}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-night hover:bg-night-soft rounded-full inline-flex items-center justify-center gap-2"
              >
                {t('home.hero.explore')}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                to={paths.startProject}
                className="px-6 py-3 text-sm font-semibold text-ink border-2 border-ink hover:bg-ink/5 rounded-full inline-flex items-center justify-center"
              >
                {t('home.hero.start')}
              </Link>
            </div>
          </div>

          {/* A real project instead of a stock photo */}
          {heroProject && (
            <div className="hidden lg:block lg:col-span-5">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-ink">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-night opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-night" />
                </span>
                {t('home.hero.cardKicker')}
              </p>
              <div className="rotate-[1.5deg] shadow-[12px_12px_0_0_var(--color-brand-deep)] rounded-3xl">
                <ProjectCard project={heroProject} />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="space-y-16 lg:space-y-24 pt-12 lg:pt-16">
        {/* 2. Projects raising now */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl text-ink">{t('home.featured.title')}</h2>
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
            <ProjectGridSkeleton />
          ) : featured.data && featured.data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.data.items.map((project, i) => (
                // Phones show three; the rest are one tap away in "All projects".
                <div key={project.id} className={i >= 3 ? 'hidden md:block' : ''}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">{t('explore.emptyTitle')}</p>
          )}
          <div className="mt-8">
            <Link
              to={model ? exploreModel(model) : paths.explore}
              className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 hover:underline underline-offset-4"
            >
              {t('home.featured.viewAll')}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* 3. How the money moves — verification, scoring and staged payouts, in one place */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl text-ink mb-8">{t('home.how.title')}</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200">
            {([1, 2, 3, 4] as const).map(i => (
              <li key={i} className="bg-card p-6 space-y-3">
                <span className="w-8 h-8 rounded-full bg-brand text-ink font-bold text-sm flex items-center justify-center font-mono-numbers">
                  {i}
                </span>
                <h3 className="text-base font-bold text-ink">{t(`home.how.step${i}Title`)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t(`home.how.step${i}Text`)}</p>
                {i === 3 && (
                  <ul className="flex flex-wrap gap-1.5 pt-1" aria-label={t('contribute.method')}>
                    {PAYMENT_METHODS.map(m => (
                      <li
                        key={m}
                        className="px-2 py-0.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* 4. Musharakah, explained by trying it */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4 lg:pt-6">
            <h2 className="text-2xl sm:text-3xl text-ink">{t('home.musharakah.title')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t('home.musharakah.text')}</p>
            <Link
              to={paths.education}
              className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 hover:underline underline-offset-4"
            >
              {t('home.musharakah.more')}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <MusharakahCalculator showHeader={false} />
          </div>
        </section>

        {/* 5. Start yours */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-night text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div
              aria-hidden
              className="absolute inset-0 opacity-25 [background-image:url(/images/ikat-brand.svg)] [background-size:120px_160px] [mask-image:linear-gradient(to_left,black,transparent_60%)]"
            />
            <div className="relative space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl">{t('home.cta.title')}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{t('home.cta.text')}</p>
            </div>
            <Link
              to={paths.startProject}
              className="relative shrink-0 px-6 py-3.5 text-sm font-semibold text-ink bg-brand hover:bg-brand-deep rounded-full inline-flex items-center justify-center gap-2"
            >
              {t('home.cta.start')}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
