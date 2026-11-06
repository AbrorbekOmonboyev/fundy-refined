import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { paths } from '@/app/routes';
import { listAdminProjects } from '@/features/admin/api';
import { useProjectTitle } from '@/features/admin/useProjectTitle';
import { Alert, PageSpinner } from '@/components/ui';
import { formatDate, formatMoney } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

/** Projects waiting for a decision, oldest submission first. */
export function ReviewQueuePage() {
  const { t } = useTranslation();
  const titleOf = useProjectTitle();
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'projects', 'pending_review'],
    queryFn: () => listAdminProjects('pending_review'),
  });
  usePageMeta(t('admin.nav.review'));

  return (
    <>
      <AdminHeader title={t('admin.nav.review')} hint={t('admin.review.queueHint')} />
      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-slate-200">
          <CheckCircle className="w-10 h-10 mx-auto text-brand-deep" aria-hidden />
          <p className="mt-3 text-sm text-slate-600">{t('admin.review.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map(p => (
            <li key={p.id}>
              <Link
                to={paths.adminReviewProject(p.id)}
                className="block bg-card rounded-2xl border border-slate-200 p-5 hover:border-ink transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{titleOf(p)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t(`models.${p.model}.name`)} · {p.owner?.founder_profiles?.display_name ?? p.owner?.full_name} ·{' '}
                      {formatMoney(p.target_amount, true)}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">
                    {t('admin.review.submittedOn', { date: formatDate(p.submitted_at) })}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
