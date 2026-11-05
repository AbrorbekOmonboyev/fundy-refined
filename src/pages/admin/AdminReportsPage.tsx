import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paths } from '@/app/routes';
import { errorKey } from '@/features/auth/errors';
import { hideComment, listReports, resolveReport, type AdminReport, type ReportStatus } from '@/features/community/api';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

type Filter = ReportStatus | 'all';
const FILTERS: Filter[] = ['open', 'resolved', 'dismissed', 'all'];

/** Content people reported: hide it, or dismiss the report. */
export function AdminReportsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('open');
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'reports', filter],
    queryFn: () => listReports(filter),
  });
  usePageMeta(t('admin.nav.reports'));

  return (
    <>
      <AdminHeader title={t('admin.nav.reports')} hint={t('admin.reports.hint')} />
      <div className="flex flex-wrap gap-2 mb-4" role="group">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-ink text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-ink'}`}
          >
            {t(`admin.reports.filter.${f}`)}
          </button>
        ))}
      </div>
      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <p className="p-10 text-center text-sm text-slate-500 bg-white rounded-3xl border border-slate-200">
          {t('admin.reports.empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map(r => (
            <ReportItem key={r.id} report={r} />
          ))}
        </ul>
      )}
    </>
  );
}

function ReportItem({ report: r }: { report: AdminReport }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' });
  const reasonKey = (['spam', 'abuse', 'misleading', 'other'] as const).find(x => x === r.reason) ?? 'other';

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      className={`bg-white rounded-2xl border p-5 space-y-3 ${r.status === 'open' ? 'border-ink' : 'border-slate-200'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 text-xs text-slate-500">
        <p>
          <span className="font-semibold text-ink">{t(`admin.reports.target.${r.target_type}`)}</span> ·{' '}
          {t(`community.reasons.${reasonKey}`)}
        </p>
        <time>{time.format(new Date(r.created_at))}</time>
      </div>
      {r.details && <p className="text-sm text-slate-700 whitespace-pre-line break-words">“{r.details}”</p>}

      <div className="rounded-xl bg-page p-3 text-sm">
        {r.comment ? (
          <>
            <p className="text-xs text-slate-500 mb-1">
              {r.comment.author_name}
              {r.comment.is_hidden && <> · {t('admin.reports.hidden')}</>}
            </p>
            <p className="text-slate-700 whitespace-pre-line break-words">{r.comment.body}</p>
            {r.comment.project_slug && (
              <Link
                to={paths.project(r.comment.project_slug)}
                className="text-xs underline text-slate-500 hover:text-ink"
              >
                {t('admin.reports.open')}
              </Link>
            )}
          </>
        ) : r.project ? (
          <Link to={paths.project(r.project.slug)} className="font-semibold text-ink underline">
            {r.project.title}
          </Link>
        ) : (
          <p className="text-xs text-slate-500">{t('admin.reports.gone')}</p>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {r.status === 'open' ? (
        <div className="flex flex-wrap gap-2">
          {r.comment && !r.comment.is_hidden && (
            <Button
              variant="danger"
              loading={busy}
              onClick={() =>
                act(async () => {
                  await hideComment(r.comment!.id);
                  await resolveReport(r.id, 'resolved');
                })
              }
            >
              {t('admin.reports.hideAndResolve')}
            </Button>
          )}
          {r.project && (
            <Link
              to={paths.adminProjects}
              className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {t('admin.reports.manageProject')}
            </Link>
          )}
          <Button variant="secondary" loading={busy} onClick={() => act(() => resolveReport(r.id, 'resolved'))}>
            {t('admin.reports.resolve')}
          </Button>
          <Button variant="link" loading={busy} onClick={() => act(() => resolveReport(r.id, 'dismissed'))}>
            {t('admin.reports.dismiss')}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-slate-500">{t(`admin.reports.filter.${r.status}`)}</p>
      )}
    </li>
  );
}
