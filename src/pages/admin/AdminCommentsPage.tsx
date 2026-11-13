import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paths } from '@/app/routes';
import { errorKey } from '@/features/auth/errors';
import { listRecentComments, setCommentHidden } from '@/features/admin/api';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { formatDate } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

/** Newest comments on all projects; hide anything inappropriate (it can be shown again). */
export function AdminCommentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [onlyHidden, setOnlyHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'comments', onlyHidden],
    queryFn: () => listRecentComments(onlyHidden),
  });
  usePageMeta(t('admin.nav.comments'));

  async function toggle(id: string, hidden: boolean) {
    setBusyId(id);
    setError(null);
    try {
      await setCommentHidden(id, hidden);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader title={t('admin.nav.comments')} hint={t('admin.comments.hint')}>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onlyHidden}
            onChange={e => setOnlyHidden(e.target.checked)}
            className="accent-ink"
          />
          {t('admin.comments.onlyHidden')}
        </label>
      </AdminHeader>
      {error && <Alert variant="error">{error}</Alert>}
      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <p className="p-10 text-center text-sm text-slate-500 bg-card rounded-2xl border border-slate-200">
          {t('project.noComments')}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map(c => (
            <li
              key={c.id}
              className={`bg-card rounded-2xl border p-4 space-y-2 ${c.is_hidden ? 'border-rose-200 opacity-75' : 'border-slate-200'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  <strong className="text-ink">{c.author_name}</strong> · {formatDate(c.created_at)} ·{' '}
                  <Link to={paths.project(c.project_slug)} className="underline hover:text-ink">
                    {c.project_slug}
                  </Link>
                  {c.parent_id && <> · {t('project.reply')}</>}
                </span>
                {c.is_hidden && (
                  <span className="rounded-md bg-rose-100 text-rose-800 px-2 py-0.5 font-semibold">
                    {t('admin.comments.hidden')}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{c.body}</p>
              <Button
                variant={c.is_hidden ? 'secondary' : 'danger'}
                loading={busyId === c.id}
                onClick={() => toggle(c.id, !c.is_hidden)}
                className="!px-3 !py-1.5 text-xs"
              >
                {c.is_hidden ? t('admin.comments.show') : t('admin.comments.hide')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
