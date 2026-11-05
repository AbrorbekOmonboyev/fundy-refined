import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { listAudit } from '@/features/admin/api';
import { Alert, PageSpinner } from '@/components/ui';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

/** Every admin action, newest first. Written by the database; can't be edited or deleted. */
export function AdminAuditPage() {
  const { t, i18n } = useTranslation();
  const { data = [], isPending, isError } = useQuery({ queryKey: ['admin', 'audit'], queryFn: listAudit });
  usePageMeta(t('admin.nav.audit'));
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <AdminHeader title={t('admin.nav.audit')} hint={t('admin.audit.hint')} />
      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <p className="p-10 text-center text-sm text-slate-500 bg-card rounded-3xl border border-slate-200">
          {t('admin.audit.empty')}
        </p>
      ) : (
        <div className="bg-card rounded-3xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('admin.audit.when')}</th>
                <th className="py-3 px-4">{t('admin.audit.who')}</th>
                <th className="py-3 px-4">{t('admin.audit.what')}</th>
                <th className="py-3 px-4">{t('admin.audit.details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(e => (
                <tr key={e.id} className="align-top">
                  <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                    {time.format(new Date(e.created_at))}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-ink">{e.actor?.full_name ?? '—'}</td>
                  <td className="py-3 px-4">
                    <code className="rounded bg-page px-1.5 py-0.5 text-xs">{e.action}</code>
                    <span className="block text-[11px] text-slate-400 mt-1 break-all">
                      {e.target_type} {e.target_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 break-words max-w-xs">
                    {Object.entries(e.details ?? {})
                      .filter(([, v]) => v !== null && v !== '')
                      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                      .join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
