import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bookmark, CheckCircle, ImageOff } from 'lucide-react';
import { responsiveImage } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { daysLeft, pickText, type ProjectCardData } from '@/features/projects/api';
import { useSavedProjects } from '@/features/projects/hooks';
import { useCategories } from '@/features/reference/useReference';
import { formatMoney, formatNumber } from '@/lib/money';

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const { t, i18n } = useTranslation();
  const { nameOf } = useCategories();
  const saved = useSavedProjects();
  const { text } = pickText(project.translations, i18n.resolvedLanguage ?? 'uz', project.originalLanguage);
  const title = text?.title ?? project.slug;
  const isSaved = saved.isSaved(project.id);
  const href = paths.project(project.slug);
  const days = daysLeft(project.endsAt);

  return (
    // Plain card in the style of the big platforms: the photo and the numbers do the work.
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
        {project.coverUrl ? (
          <img
            {...responsiveImage(project.coverUrl)}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff className="w-8 h-8" aria-hidden />
          </div>
        )}

        {project.isDemo && (
          <span className="absolute top-2 left-2 z-20 rounded-md bg-night px-2 py-1 text-xs font-semibold text-white">
            {t('project.demoBadge')}
          </span>
        )}

        <button
          type="button"
          onClick={() => saved.toggle(project.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? t('project.unsave') : t('project.save')}
          title={isSaved ? t('project.unsave') : t('project.save')}
          className="absolute top-2 right-2 z-20 w-10 h-10 rounded-md bg-card flex items-center justify-center text-slate-700 hover:text-ink cursor-pointer"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-ink text-ink' : ''}`} />
        </button>
      </div>

      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 mb-1.5">
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

          <h3 lang={text?.language} className="text-[1.0625rem] font-bold text-ink line-clamp-2 leading-snug">
            {/* The whole card is clickable through this link's stretched area. */}
            <Link
              to={href}
              className="after:absolute after:inset-0 after:z-10 group-hover:underline underline-offset-4 decoration-2 decoration-brand-deep"
            >
              {title}
            </Link>
          </h3>

          <p lang={text?.language} className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {text?.tagline}
          </p>

          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span>{t('project.by', { name: project.founderName })}</span>
            {project.founderVerified && (
              <CheckCircle className="w-3.5 h-3.5 text-ink" aria-label={t('project.verifiedFounder')} />
            )}
            {project.score !== null && (
              <>
                <span aria-hidden className="text-slate-300">
                  ·
                </span>
                <span className="font-mono-numbers" title={t('project.scoreHint')}>
                  {t('project.score')} {project.score}/100
                </span>
              </>
            )}
          </p>
        </div>

        <div className="mt-4">
          <div
            className="w-full bg-track rounded-full h-1.5 overflow-hidden"
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
          <p className="mt-2.5 font-mono-numbers">
            <span className="text-base font-bold text-ink">{formatMoney(project.raisedAmount, true)}</span>
            <span className="text-sm text-slate-500 ml-1.5">
              {t('project.ofGoal', { goal: formatMoney(project.targetAmount, true) })}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-slate-600 font-mono-numbers">
            <strong className="font-semibold text-ink">{project.fundedPercent}%</strong>
            <span aria-hidden className="mx-1.5 text-slate-300">
              ·
            </span>
            {project.status === 'active' ? t('project.daysLeft', { count: days }) : t(`status.${project.status}`)}
            <span aria-hidden className="mx-1.5 text-slate-300">
              ·
            </span>
            {t('project.backers', { count: project.backerCount, formatted: formatNumber(project.backerCount) })}
          </p>
        </div>
      </div>
    </article>
  );
}

/** Grey outline of a card, shown while projects load (feels faster than a spinner). */
export function ProjectCardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="aspect-[16/10] rounded-2xl bg-slate-100" />
      <div className="pt-4 space-y-3">
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-5 w-4/5 rounded bg-slate-100" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-2 w-full rounded-full bg-slate-100 mt-6" />
      </div>
    </div>
  );
}

/** A grid of skeleton cards. */
export function ProjectGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10" role="status" aria-label="…">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={i >= 1 ? 'hidden md:block' : ''}>
          <ProjectCardSkeleton />
        </div>
      ))}
    </div>
  );
}
