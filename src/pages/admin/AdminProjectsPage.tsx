import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Star } from 'lucide-react';
import { paths } from '@/app/routes';
import { errorKey } from '@/features/auth/errors';
import { listAdminProjects, setFeatured, type ProjectStatus } from '@/features/admin/api';
import { useProjectTitle } from '@/features/admin/useProjectTitle';
import { Alert, PageSpinner } from '@/components/ui';
import { formatMoney } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

const FILTERS: (ProjectStatus | 'all')[] = [
  'all',
  'pending_review',
  'active',
  'funded',
  'changes_requested',
  'draft',
  'rejected',
  'unsuccessful',
  'completed',
];

/** Every project in every status, with the "featured on home page" switch. */
export function AdminProjectsPage() {
  const { t } = useTranslation();
  const titleOf = useProjectTitle();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'projects', status],
    queryFn: () => listAdminProjects(status),
  });
  usePageMeta(t('admin.nav.projects'));

  async function toggleFeatured(id: string, featured: boolean) {
    setError(null);
    try {
      await setFeatured(id, featured);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (e) {
      setError(t(errorKey(e)));
    }
  }

  return (
    <>
      <AdminHeader title={t('admin.nav.projects')} hint={t('admin.projects.hint')} />
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3" role="group" aria-label={t('explore.statusLabel')}>
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={status === f}
            onClick={() => setStatus(f)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ${
              status === f ? 'bg-night text-white' : 'bg-card text-slate-600 border border-slate-200 hover:border-ink'
            }`}
          >
            {f === 'all' ? t('explore.all') : t(`status.${f}`)}
          </button>
        ))}
      </div>
      {error && <Alert variant="error">{error}</Alert>}

      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <p className="p-10 text-center text-sm text-slate-500 bg-card rounded-2xl border border-slate-200">
          {t('explore.emptyTitle')}
        </p>
      ) : (
        <div className="bg-card rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('dashboard.backer.project')}</th>
                <th className="py-3 px-4">{t('explore.statusLabel')}</th>
                <th className="py-3 px-4 text-right">{t('admin.projects.raised')}</th>
                <th className="py-3 px-4 text-right">{t('project.score')}</th>
                <th className="py-3 px-4 text-center">{t('admin.projects.featured')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(p => {
                const founder = p.owner?.founder_profiles;
                const isPublic = ['active', 'funded', 'unsuccessful', 'completed'].includes(p.status);
                return (
                  <tr key={p.id} className="align-top">
                    <td className="py-3 px-4 min-w-60">
                      <Link to={paths.adminReviewProject(p.id)} className="font-semibold text-ink hover:underline">
                        {titleOf(p)}
                      </Link>
                      <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        {founder?.display_name ?? p.owner?.full_name}
                        {founder?.is_verified && (
                          <BadgeCheck
                            className="w-3.5 h-3.5 text-brand-deep"
                            aria-label={t('project.verifiedFounder')}
                          />
                        )}
                        · {t(`models.${p.model}.name`)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">{t(`status.${p.status}`)}</td>
                    <td className="py-3 px-4 text-right font-mono-numbers whitespace-nowrap">
                      {formatMoney(p.raised_amount, true)}
                      <span className="block text-xs text-slate-500">{Math.round(p.funded_percent ?? 0)}%</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-numbers">{p.evaluations?.overall_score ?? '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        disabled={!isPublic}
                        aria-pressed={p.is_featured}
                        title={isPublic ? t('admin.projects.featureToggle') : t('admin.projects.featureOnlyLive')}
                        onClick={() => toggleFeatured(p.id, !p.is_featured)}
                        className="p-1.5 rounded-full hover:bg-page disabled:opacity-30"
                      >
                        <Star
                          className={`w-5 h-5 ${p.is_featured ? 'fill-gold text-gold' : 'text-slate-400'}`}
                          aria-hidden
                        />
                        <span className="sr-only">{t('admin.projects.featureToggle')}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
