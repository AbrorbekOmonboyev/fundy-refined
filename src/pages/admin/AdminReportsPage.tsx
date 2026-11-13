import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { hidePost, listReports, resolveReport, type AdminReport, type ReportStatus } from '@/features/community/api';
import { setUserBlocked } from '@/features/admin/api';
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
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-night text-white' : 'bg-card text-slate-600 border border-slate-200 hover:border-ink'}`}
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
        <p className="p-10 text-center text-sm text-slate-500 bg-card rounded-2xl border border-slate-200">
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
  const { user: me } = useAuth();
  const reasonKey = (['spam', 'abuse', 'misleading', 'other'] as const).find(x => x === r.reason) ?? 'other';
  const { post, person } = r;

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
      className={`bg-card rounded-2xl border p-5 space-y-3 ${r.status === 'open' ? 'border-ink' : 'border-slate-200'}`}
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
        {post ? (
          <>
            <p className="text-xs text-slate-500 mb-1">
              {post.author_name}
              {post.is_hidden && <> · {t('admin.reports.hidden')}</>}
            </p>
            {post.title && <p className="font-semibold text-ink">{post.title}</p>}
            <p className="text-slate-700 whitespace-pre-line break-words line-clamp-6">{post.body}</p>
            {post.project_slug && (
              <Link to={paths.project(post.project_slug)} className="text-xs underline text-slate-500 hover:text-ink">
                {t('admin.reports.open')}
              </Link>
            )}
          </>
        ) : r.project ? (
          <Link to={paths.project(r.project.slug)} className="font-semibold text-ink underline">
            {r.project.title}
          </Link>
        ) : person ? (
          <p>
            <span className="font-semibold text-ink">{person.full_name || '—'}</span>
            {person.role === 'admin' && <> · {t('admin.users.admin')}</>}
            {person.is_blocked && <> · {t('admin.users.blocked')}</>}
          </p>
        ) : (
          <p className="text-xs text-slate-500">{t('admin.reports.gone')}</p>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {r.status === 'open' ? (
        <div className="flex flex-wrap gap-2">
          {post && !post.is_hidden && (r.target_type === 'comment' || r.target_type === 'update') && (
            <Button
              variant="danger"
              loading={busy}
              onClick={() =>
                act(async () => {
                  await hidePost(r.target_type as 'comment' | 'update', post.id);
                  await resolveReport(r.id, 'resolved');
                })
              }
            >
              {t(r.target_type === 'update' ? 'admin.reports.hideUpdate' : 'admin.reports.hideAndResolve')}
            </Button>
          )}
          {person && !person.is_blocked && person.id !== me?.id && (
            <Button
              variant="danger"
              loading={busy}
              onClick={() => {
                if (!window.confirm(t('admin.users.confirmBlock', { name: person.full_name }))) return;
                void act(async () => {
                  await setUserBlocked(person.id, true);
                  await resolveReport(r.id, 'resolved');
                });
              }}
            >
              {t('admin.reports.blockUser')}
            </Button>
          )}
          {r.project && (
            <Link
              to={paths.adminProjects}
              className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
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
