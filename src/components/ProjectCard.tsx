import { useEffect, useRef, type PointerEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Bookmark, Flame, ImageOff, MapPin } from 'lucide-react';
import { DONATION_ONLY } from '@/lib/focus';
import { responsiveImage } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { pickText, type ProjectCardData } from '@/features/projects/api';
import { useSavedProjects } from '@/features/projects/hooks';
import { formatMoney } from '@/lib/money';

/**
 * Phones have no hover: the card passing through the middle of the screen while scrolling
 * gets the glass instead (data-focus). Wide screens use :hover in CSS (.card-glass).
 */
function useCenterFocus() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.focus = '';
        else delete el.dataset.focus;
      },
      { rootMargin: '-42% 0px -42% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** The light catches the glass where the pointer is. */
function followPointer(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
  e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const { t, i18n } = useTranslation();
  const glassRef = useCenterFocus();
  const saved = useSavedProjects();
  const { text } = pickText(project.translations, i18n.resolvedLanguage ?? 'uz', project.originalLanguage);
  const title = text?.title ?? project.slug;
  const isSaved = saved.isSaved(project.id);
  const href = paths.project(project.slug);
  // Goal-gradient: campaigns close to their goal draw more gifts, so say so plainly.
  const almost = project.status === 'active' && project.fundedPercent >= 75 && project.fundedPercent < 100;

  return (
    // Plain card in the style of the big platforms: the photo and the numbers do the work.
    <article ref={glassRef} onPointerMove={followPointer} className="card-glass group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
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

        {(almost || project.verifiedFund !== null) && (
          <div className="absolute left-2.5 bottom-2.5 z-20 flex flex-wrap gap-1.5">
            {almost && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warm-soft text-warm-ink px-2.5 py-1 text-xs font-semibold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-warm" aria-hidden />
                {t('project.almostThere')}
              </span>
            )}
            {project.verifiedFund !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-card text-brand-deep px-2.5 py-1 text-xs font-semibold shadow-sm">
                <BadgeCheck className="w-3.5 h-3.5" aria-hidden />
                {t('project.verifiedFund')}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => saved.toggle(project.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? t('project.unsave') : t('project.save')}
          title={isSaved ? t('project.unsave') : t('project.save')}
          className="absolute top-2.5 right-2.5 z-20 w-11 h-11 rounded-full bg-card/95 shadow-sm flex items-center justify-center text-slate-700 hover:text-ink cursor-pointer"
        >
          <Bookmark className={`w-[18px] h-[18px] ${isSaved ? 'fill-brand text-brand' : ''}`} />
        </button>
      </div>

      {/* Only what a donor needs to choose: where, what, how far along. Details live on the campaign page. */}
      <div className="pt-3.5 flex-1 flex flex-col justify-between">
        <div>
          {(project.location || !DONATION_ONLY) && (
            <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600 mb-1">
              {!DONATION_ONLY && <span className="font-semibold text-ink">{t(`models.${project.model}.name`)}</span>}
              {project.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden />
                  {project.location.split(',')[0]}
                </span>
              )}
            </p>
          )}
          <h3 lang={text?.language} className="text-[1.0625rem] font-bold text-ink line-clamp-2 leading-snug">
            {/* The whole card is clickable through this link's stretched area. */}
            <Link
              to={href}
              className="after:absolute after:inset-0 after:z-10 group-hover:underline underline-offset-4 decoration-2 decoration-brand-deep"
            >
              {title}
            </Link>
          </h3>
        </div>

        <div className="mt-3">
          <div
            className="w-full bg-track rounded-full h-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={project.fundedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('project.funded', { percent: project.fundedPercent })}
          >
            <div
              className="progress-fill h-full rounded-full bg-brand"
              style={{ width: `${Math.min(project.fundedPercent, 100)}%` }}
            />
          </div>
          <p className="mt-2 flex items-baseline justify-between gap-3 font-mono-numbers">
            <span className="text-base font-bold text-ink">
              {formatMoney(project.raisedAmount, true)}
              <span className="sr-only"> {t('project.ofGoal', { goal: formatMoney(project.targetAmount, true) })}</span>
            </span>
            <span className="text-sm font-semibold text-slate-600">
              {project.status === 'active' ? `${project.fundedPercent}%` : t(`status.${project.status}`)}
            </span>
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
      <div className="aspect-[4/3] rounded-2xl bg-slate-100" />
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
