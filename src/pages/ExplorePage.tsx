import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ProjectCard, ProjectGridSkeleton } from '@/components/ProjectCard';
import { Alert } from '@/components/ui';
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
  // The header search box can change ?q= while this page is open.
  const urlQuery = params.get('q') ?? '';
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    if (urlQuery !== searchInput.trim()) setSearchInput(urlQuery);
  }

  const { data, isPending, isError, isPlaceholderData } = useProjectList(filters);
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = ['q', 'model', 'category', 'region', 'status', 'sort'].some(k => params.has(k));

  const clearAll = () => {
    setSearchInput('');
    setParams(new URLSearchParams());
  };

  // The filter is one readable sentence (Kickstarter's idea); each bold word is a dropdown.
  const pickers: Record<string, ReactNode> = {
    status: (
      <InlineSelect
        label={t('explore.statusLabel')}
        value={filters.status ?? 'all'}
        onChange={v => setFilter('status', v === 'all' ? null : v)}
        options={STATUSES.map(s => ({ value: s, label: t(`explore.sentence.status.${s}`) }))}
      />
    ),
    category: (
      <InlineSelect
        label={t('explore.category')}
        value={filters.category ?? ''}
        onChange={v => setFilter('category', v || null)}
        options={[{ value: '', label: t('explore.sentence.allCategories') }, ...categories.options]}
      />
    ),
    region: (
      <InlineSelect
        label={t('explore.region')}
        value={filters.region ?? ''}
        onChange={v => setFilter('region', v || null)}
        options={[{ value: '', label: t('explore.sentence.allRegions') }, ...regions.options]}
      />
    ),
    sort: (
      <InlineSelect
        label={t('explore.sortLabel')}
        value={filters.sort ?? 'most_funded'}
        onChange={v => setFilter('sort', v === 'most_funded' ? null : v)}
        options={SORTS.map(s => ({ value: s, label: t(`explore.sentence.sort.${s}`) }))}
      />
    ),
  };
  const sentence = t('explore.sentence.text')
    .split(/(\{\w+\})/)
    .map((part, i) => {
      const key = /^\{(\w+)\}$/.exec(part)?.[1];
      return key && pickers[key] ? <span key={i}>{pickers[key]}</span> : <span key={i}>{part}</span>;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <header className="space-y-1">
        <h1 className="text-[1.75rem] sm:text-4xl text-ink">{t('explore.title')}</h1>
        <p className="text-base text-slate-600">{t('explore.subtitle')}</p>
      </header>

      <div className="space-y-6">
        {/* Funding model: plain underline tabs, same as the home page */}
        <div
          className="flex gap-6 overflow-x-auto border-b border-slate-200 text-sm [scrollbar-width:none]"
          role="group"
          aria-label={t('explore.model')}
        >
          {[null, ...MODELS].map(model => (
            <button
              key={model ?? 'all'}
              type="button"
              aria-pressed={filters.model === model}
              onClick={() => setFilter('model', model)}
              className={`py-3 -mb-px whitespace-nowrap border-b-[3px] cursor-pointer ${
                filters.model === model
                  ? 'border-brand-deep text-ink font-semibold'
                  : 'border-transparent text-slate-600 hover:text-ink'
              }`}
            >
              {model ? t(`models.${model}.name`) : t('explore.allModels')}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <p className="text-lg sm:text-xl text-slate-600 leading-[2.1] max-w-4xl">{sentence}</p>

          <div className="relative w-full lg:w-72 shrink-0 lg:mt-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={t('explore.search')}
              aria-label={t('explore.search')}
              className="w-full h-11 pl-9 pr-9 text-base sm:text-sm rounded-md border border-slate-200 bg-card text-ink placeholder:text-slate-500 focus:outline-none focus:border-ink"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label={t('explore.clearSearch')}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="text-slate-500" aria-live="polite">
            {isPending
              ? t('common.loading')
              : t('explore.resultCount', { count: total, formatted: formatNumber(total) })}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="font-semibold text-ink underline underline-offset-4 decoration-slate-300 hover:decoration-ink cursor-pointer"
            >
              {t('explore.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : isPending ? (
        <ProjectGridSkeleton count={6} />
      ) : total === 0 ? (
        <div className="py-16 border-y border-slate-200 text-center space-y-3">
          <h2 className="text-xl text-ink">{t('explore.emptyTitle')}</h2>
          <p className="text-sm text-slate-600">{t('explore.emptyText')}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-semibold text-ink underline underline-offset-4 decoration-slate-300 hover:decoration-ink cursor-pointer"
            >
              {t('explore.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
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
            className="p-2.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-card"
            aria-label={t('explore.previous')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-600 font-mono-numbers">{t('explore.pageOf', { page: filters.page, pages })}</span>
          <button
            type="button"
            disabled={filters.page === pages}
            onClick={() => setFilter('page', String(filters.page! + 1))}
            className="p-2.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-card"
            aria-label={t('explore.next')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

/**
 * A word inside the filter sentence that opens a dropdown. The real <select> lies invisibly on top
 * of the word, so it sizes to the chosen option and phones show their native picker.
 */
function InlineSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const current = options.find(o => o.value === value)?.label ?? options[0]?.label ?? '';
  return (
    <span className="relative inline-flex items-center gap-0.5 font-semibold text-ink border-b-2 border-brand-deep leading-tight whitespace-nowrap focus-within:outline-2 focus-within:outline-ink focus-within:outline-offset-2 rounded-[1px] hover:border-ink">
      {current}
      <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}
