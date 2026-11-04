import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Rocket } from 'lucide-react';
import { paths } from '@/app/routes';
import { pickText } from '@/features/projects/api';
import { useMyProjects } from '@/features/projects/hooks';
import { Alert, PageSpinner } from '@/components/ui';
import { formatMoney } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_review: 'bg-amber-100 text-amber-800',
  changes_requested: 'bg-orange-100 text-orange-800',
  rejected: 'bg-rose-100 text-rose-800',
  active: 'bg-emerald-100 text-emerald-800',
  funded: 'bg-emerald-600 text-white',
  unsuccessful: 'bg-slate-200 text-slate-700',
  completed: 'bg-sky-100 text-sky-800',
};

/**
 * "My projects": the projects the signed-in user owns, from the database.
 * Editing, updates and milestone reports arrive with the project wizard (Phase 4).
 */
export function FounderDashboardPage() {
  const { t, i18n } = useTranslation();
  const { data = [], isPending, isError } = useMyProjects();
  usePageMeta(t('account.projects'));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('account.projects')}</h1>
        <Link
          to={paths.startProject}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg self-start sm:self-auto"
        >
          {t('nav.startProject')}
        </Link>
      </header>

      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Rocket className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden />
          <h2 className="text-lg font-bold text-slate-900">{t('dashboard.founder.emptyTitle')}</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">{t('dashboard.founder.emptyText')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map(p => {
            const title =
              pickText(p.translations, i18n.resolvedLanguage ?? 'uz', p.originalLanguage).text?.title ?? p.slug;
            const isPublic = ['active', 'funded', 'unsuccessful', 'completed'].includes(p.status);
            return (
              <li
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${STATUS_STYLE[p.status]}`}>
                    {t(`status.${p.status}`)}
                  </span>
                  <p className="mt-1.5 font-semibold text-slate-900 truncate">
                    {isPublic ? (
                      <Link to={paths.project(p.slug)} className="hover:text-emerald-700">
                        {title}
                      </Link>
                    ) : (
                      title
                    )}
                  </p>
                </div>
                <p className="text-sm font-mono-numbers text-slate-700 shrink-0">
                  {formatMoney(p.raisedAmount, true)} / {formatMoney(p.targetAmount, true)} · {p.fundedPercent}%
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
