import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bookmark, ImageOff, Search } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { useProjectList, useSavedProjectCards } from '@/features/projects/hooks';
import { daysLeft, pickText, type ProjectCardData } from '@/features/projects/api';
import { useCategories } from '@/features/reference/useReference';
import { responsiveImage } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';

/*
 * Screens used only inside the Android app (see src/lib/appMode.ts).
 * The app is for using Fundy, not reading about it: no hero texts or explanations here.
 */

const WELCOMED = 'fundy_app_welcomed';
const wasWelcomed = () => {
  try {
    return localStorage.getItem(WELCOMED) === '1';
  } catch {
    return true;
  }
};

/** First launch (not logged in): big "f", one line, Get started / I have an account. */
function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const finish = (to?: string) => {
    try {
      localStorage.setItem(WELCOMED, '1');
    } catch {
      /* fine: shows again next time */
    }
    onDone();
    if (to) navigate(to);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-brand flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <img src="/brand/fundy-symbol-on-chartreuse.svg" alt="Fundy" className="w-40 h-40" />
      </div>
      <div className="bg-card rounded-t-2xl px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-4">
        <h1 className="text-[2rem] leading-[1.1] text-ink">{t('appWelcome.title')}</h1>
        <p className="text-base text-slate-600">{t('appWelcome.text')}</p>
        <button
          type="button"
          onClick={() => finish()}
          className="w-full mt-2 py-4 rounded-md bg-night text-brand-light text-base font-semibold cursor-pointer"
        >
          {t('appWelcome.start')}
        </button>
        <button
          type="button"
          onClick={() => finish(paths.login)}
          className="w-full py-2 text-sm font-semibold text-ink underline underline-offset-4 cursor-pointer"
        >
          {t('appWelcome.haveAccount')}
        </button>
      </div>
    </div>
  );
}

/** One compact project row: photo, title, progress, "45% · 10 days left". */
export function ProjectRow({ project }: { project: ProjectCardData }) {
  const { t, i18n } = useTranslation();
  const { text } = pickText(project.translations, i18n.resolvedLanguage ?? 'uz', project.originalLanguage);
  const title = text?.title ?? project.slug;
  const img = responsiveImage(project.coverUrl);
  return (
    <Link to={paths.project(project.slug)} className="flex items-center gap-4 py-3 active:bg-slate-50">
      <div className="w-[4.5rem] h-[4.5rem] shrink-0 rounded-xl overflow-hidden bg-slate-100">
        {img ? (
          <img {...img} sizes="72px" alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="w-6 h-6 m-auto mt-6 text-slate-300" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink line-clamp-1">{title}</p>
        <div className="mt-2 h-1.5 rounded-full bg-track overflow-hidden" aria-hidden>
          <div
            className="h-full rounded-full bg-brand-deep"
            style={{ width: `${Math.min(project.fundedPercent, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500 font-mono-numbers">
          {t('project.funded', { percent: project.fundedPercent })} ·{' '}
          {project.status === 'active'
            ? t('project.daysLeft', { count: daysLeft(project.endsAt) })
            : t(`status.${project.status}`)}
        </p>
      </div>
    </Link>
  );
}

function RowsSkeleton() {
  return (
    <div aria-hidden className="space-y-4 py-3 animate-pulse">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex gap-4 items-center">
          <div className="w-[4.5rem] h-[4.5rem] rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-1.5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The app's home: search, category chips, trending projects. */
export function AppHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { options } = useCategories();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [welcomeDone, setWelcomeDone] = useState(wasWelcomed);
  const list = useProjectList({ status: 'live', sort: 'most_funded', category, pageSize: 12 });
  usePageMeta(t('appNav.home'));

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${paths.explore}?q=${encodeURIComponent(q)}` : paths.explore);
  };
  const chip = (active: boolean) =>
    `shrink-0 px-4 py-2 rounded-md text-sm font-semibold cursor-pointer ${
      active ? 'bg-night text-white dark:bg-brand dark:text-night' : 'bg-card border border-slate-200 text-ink'
    }`;

  return (
    <div className="px-4 pt-3 pb-6">
      {!loading && !user && !welcomeDone && <WelcomeScreen onDone={() => setWelcomeDone(true)} />}

      <form role="search" onSubmit={search} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('header.search')}
          aria-label={t('header.search')}
          className="w-full h-12 pl-11 pr-4 rounded-md bg-slate-100 border-0 text-base text-ink placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ink"
        />
      </form>

      <div className="mt-4 -mx-4 px-4 flex gap-2 overflow-x-auto [scrollbar-width:none]" role="group">
        <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>
          {t('explore.all')}
        </button>
        {options.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={chip(category === c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <h1 className="text-xl text-ink">{t('appHome.trending')}</h1>
        <Link
          to={category ? `${paths.explore}?category=${category}` : paths.explore}
          className="text-sm font-semibold text-ink underline underline-offset-4"
        >
          {t('appHome.seeAll')}
        </Link>
      </div>

      {list.isPending ? (
        <RowsSkeleton />
      ) : list.data && list.data.items.length > 0 ? (
        <div className="mt-1 divide-y divide-slate-200">
          {list.data.items.map(p => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">{t('explore.emptyTitle')}</p>
      )}
    </div>
  );
}

/** Saved projects (bookmarks). Needs an account, like on the website. */
export function SavedPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const saved = useSavedProjectCards();
  usePageMeta(t('appNav.saved'));

  return (
    <div className="px-4 pt-4 pb-6 max-w-2xl mx-auto">
      <h1 className="text-2xl text-ink">{t('appNav.saved')}</h1>
      {loading ? (
        <RowsSkeleton />
      ) : !user ? (
        <div className="py-16 text-center space-y-4">
          <Bookmark className="w-10 h-10 mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-600">{t('appSaved.loginText')}</p>
          <Link
            to={`${paths.login}?next=${encodeURIComponent('/saved')}`}
            className="inline-block px-6 py-3 rounded-md bg-night text-white text-sm font-semibold dark:bg-brand dark:text-night"
          >
            {t('account.login')}
          </Link>
        </div>
      ) : saved.isPending ? (
        <RowsSkeleton />
      ) : saved.items.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <Bookmark className="w-10 h-10 mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-600">{t('appSaved.empty')}</p>
          <Link to={paths.explore} className="text-sm font-semibold text-ink underline underline-offset-4">
            {t('home.hero.explore')}
          </Link>
        </div>
      ) : (
        <div className="mt-2 divide-y divide-slate-200">
          {saved.items.map(p => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
