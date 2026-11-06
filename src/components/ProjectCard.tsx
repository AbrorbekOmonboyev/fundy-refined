import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bookmark, CheckCircle, ImageOff, Users } from 'lucide-react';
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
    <article className="group relative bg-card rounded-3xl border border-slate-200/70 overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {project.coverUrl ? (
          <img
            {...responsiveImage(project.coverUrl)}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff className="w-8 h-8" aria-hidden />
          </div>
        )}

        <button
          type="button"
          onClick={() => saved.toggle(project.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? t('project.unsave') : t('project.save')}
          title={isSaved ? t('project.unsave') : t('project.save')}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <span className="absolute bottom-3 left-3 text-xs font-semibold text-ink px-2.5 py-1 rounded-full bg-brand">
          {t(`models.${project.model}.name`)}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mb-2">
            <span>{nameOf(project.categoryId)}</span>
            {project.location && (
              <>
                <span aria-hidden>·</span>
                <span>{project.location.split(',')[0]}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="font-mono-numbers">
              {project.status === 'active' ? t('project.daysLeft', { count: days }) : t(`status.${project.status}`)}
            </span>
          </div>

          <h3 className="text-base font-bold text-ink group-hover:text-ink transition-colors line-clamp-2 leading-snug">
            {/* The whole card is clickable through this link's stretched area. */}
            <Link to={href} className="after:absolute after:inset-0 after:z-10">
              {title}
            </Link>
          </h3>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">{text?.tagline}</p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span>{t('project.by', { name: project.founderName })}</span>
            {project.founderVerified && (
              <CheckCircle className="w-3.5 h-3.5 text-ink" aria-label={t('project.verifiedFounder')} />
            )}
            {project.score !== null && (
              <>
                <span aria-hidden className="text-slate-300">
                  ·
                </span>
                <span
                  className="text-xs text-slate-500 font-mono-numbers underline decoration-dotted underline-offset-2 cursor-help"
                  title={t('project.scoreHint')}
                >
                  {t('project.score')}: <strong className="font-semibold text-slate-700">{project.score}/100</strong>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <div
            className="w-full bg-track rounded-full h-2 overflow-hidden mb-2.5"
            role="progressbar"
            aria-valuenow={project.fundedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('project.funded', { percent: project.fundedPercent })}
          >
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.min(project.fundedPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="font-bold text-ink font-mono-numbers text-sm">
                {formatMoney(project.raisedAmount, true)}
              </span>
              <span className="text-slate-500 text-xs ml-1">
                {t('project.ofGoal', { goal: formatMoney(project.targetAmount, true) })}
              </span>
            </div>
            <span className="font-bold text-ink font-mono-numbers">{project.fundedPercent}%</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 font-mono-numbers">
            <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden />
            <span>
              {t('project.backers', { count: project.backerCount, formatted: formatNumber(project.backerCount) })}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Grey outline of a card, shown while projects load (feels faster than a spinner). */
export function ProjectCardSkeleton() {
  return (
    <div aria-hidden className="bg-card rounded-3xl border border-slate-200/70 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-slate-100" />
      <div className="p-5 space-y-3">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="…">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={i >= 1 ? 'hidden md:block' : ''}>
          <ProjectCardSkeleton />
        </div>
      ))}
    </div>
  );
}
