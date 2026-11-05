import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { Alert, PageSpinner } from '@/components/ui';
import { useProjectList } from '@/features/projects/hooks';
import type { FundingModel, ProjectFilters, ProjectSort } from '@/features/projects/api';
import { useCategories, useRegions } from '@/features/reference/useReference';
import { usePageMeta } from '@/lib/usePageMeta';
import { formatNumber } from '@/lib/money';

const PAGE_SIZE = 12;
const MODELS: FundingModel[] = ['equity', 'reward', 'donation'];
const SORTS: ProjectSort[] = ['most_funded', 'newest', 'ending_soon', 'most_backers', 'target_low'];
const STATUSES = ['all', 'live', 'funded'] as const;

/** Read a value from the URL only if it's one of the allowed ones. */
const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | null =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : null;

export function ExplorePage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const regions = useRegions();
  usePageMeta(t('explore.title'), t('explore.subtitle'));

  // All filters live in the URL (?q=…&model=…), so a filtered view can be shared or bookmarked.
  const filters: ProjectFilters = {
    search: params.get('q') ?? '',
    model: oneOf(params.get('model'), MODELS),
    category: params.get('category'),
    region: params.get('region'),
    status: oneOf(params.get('status'), STATUSES) ?? 'all',
    sort: oneOf(params.get('sort'), SORTS) ?? 'most_funded',
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: PAGE_SIZE,
  };

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page'); // new filter → back to page 1
    setParams(next, { replace: key === 'q' });
  };

  // Search box: update the URL shortly after typing stops.
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchInput.trim() !== (params.get('q') ?? '')) setFilter('q', searchInput.trim() || null);
    }, 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, isPending, isError, isPlaceholderData } = useProjectList(filters);
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = ['q', 'model', 'category', 'region', 'status'].some(k => params.has(k));

  const clearAll = () => {
    setSearchInput('');
    setParams(new URLSearchParams(params.get('sort') ? { sort: params.get('sort')! } : {}));
  };

  const chip = (active: boolean) =>
    `px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
      active ? 'bg-night text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
  const select =
    'text-xs font-medium bg-card border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{t('explore.title')}</h1>
        <p className="text-sm text-slate-600 mt-1">{t('explore.subtitle')}</p>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={t('explore.searchPlaceholder')}
              aria-label={t('explore.search')}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-card placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label={t('explore.clearSearch')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto"
            role="group"
            aria-label={t('explore.model')}
          >
            {[null, ...MODELS].map(model => (
              <button
                key={model ?? 'all'}
                type="button"
                aria-pressed={filters.model === model}
                onClick={() => setFilter('model', model)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  filters.model === model ? 'bg-card text-ink shadow-sm' : 'text-slate-600 hover:text-ink'
                }`}
              >
                {model ? t(`models.${model}.name`) : t('explore.allModels')}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.region ?? ''}
              onChange={e => setFilter('region', e.target.value || null)}
              aria-label={t('explore.region')}
              className={select}
            >
              <option value="">{t('explore.allRegions')}</option>
              {regions.options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={e => setFilter('status', e.target.value === 'all' ? null : e.target.value)}
              aria-label={t('explore.statusLabel')}
              className={select}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {t(`explore.status.${s}`)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" aria-hidden />
              <span className="sr-only">{t('explore.sortLabel')}</span>
              <select
                value={filters.sort}
                onChange={e => setFilter('sort', e.target.value === 'most_funded' ? null : e.target.value)}
                className={select}
              >
                {SORTS.map(s => (
                  <option key={s} value={s}>
                    {t(`explore.sort.${s}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium shrink-0">{t('explore.category')}:</span>
          <button type="button" onClick={() => setFilter('category', null)} className={chip(!filters.category)}>
            {t('explore.all')}
          </button>
          {categories.options.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter('category', c.value)}
              className={chip(filters.category === c.value)}
            >
              {c.label}
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto shrink-0 flex items-center gap-1 p-1"
            >
              <X className="w-3 h-3" aria-hidden />
              {t('explore.clearFilters')}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500" aria-live="polite">
        {isPending ? t('common.loading') : t('explore.resultCount', { count: total, formatted: formatNumber(total) })}
      </p>

      {isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : isPending ? (
        <PageSpinner />
      ) : total === 0 ? (
        <div className="bg-card rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">{t('explore.emptyTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('explore.emptyText')}</p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 text-xs font-semibold text-ink bg-brand-soft hover:bg-brand rounded-lg"
            >
              {t('explore.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          {data.items.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm" aria-label={t('explore.pagination')}>
          <button
            type="button"
            disabled={filters.page === 1}
            onClick={() => setFilter('page', String(filters.page! - 1))}
            className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            aria-label={t('explore.previous')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-600 font-mono-numbers">{t('explore.pageOf', { page: filters.page, pages })}</span>
          <button
            type="button"
            disabled={filters.page === pages}
            onClick={() => setFilter('page', String(filters.page! + 1))}
            className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            aria-label={t('explore.next')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
