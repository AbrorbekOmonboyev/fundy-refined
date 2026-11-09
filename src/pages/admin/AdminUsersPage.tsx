import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { listUsers, setUserBlocked, setUserRole, USERS_PAGE_SIZE, type AdminUser } from '@/features/admin/api';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { formatDate, formatMoney, formatNumber } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

/** Find users; block/unblock them or change admin rights. */
export function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  usePageMeta(t('admin.nav.users'));

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(input);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [input]);

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin', 'users', search, page],
    queryFn: () => listUsers(search, page),
    placeholderData: keepPreviousData,
  });
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / USERS_PAGE_SIZE));

  async function act(u: AdminUser, action: () => Promise<void>, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusyId(u.id);
    setError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader
        title={t('admin.nav.users')}
        hint={data ? t('admin.users.count', { count: data.total, formatted: formatNumber(data.total) }) : undefined}
      >
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">{t('admin.users.search')}</span>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden />
          <input
            type="search"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('admin.users.search')}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 bg-card focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink"
          />
        </label>
      </AdminHeader>
      {error && <Alert variant="error">{error}</Alert>}

      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : (
        <div className="bg-card rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('admin.users.user')}</th>
                <th className="py-3 px-4">{t('admin.users.activity')}</th>
                <th className="py-3 px-4">{t('admin.users.joined')}</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users.map(u => {
                const isMe = u.id === me?.id;
                return (
                  <tr key={u.id} className={`align-top ${u.is_blocked ? 'bg-rose-50/50' : ''}`}>
                    <td className="py-3 px-4 min-w-56">
                      <p className="font-semibold text-ink">
                        {u.full_name || '—'}
                        {u.role === 'admin' && (
                          <span className="ml-2 rounded-full bg-night text-brand-light px-2 py-0.5 text-xs font-semibold align-middle">
                            {t('admin.users.admin')}
                          </span>
                        )}
                        {u.is_blocked && (
                          <span className="ml-2 rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-xs font-semibold align-middle">
                            {t('admin.users.blocked')}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {t('admin.users.projects', { count: Number(u.project_count) })}
                      <span className="block">{formatMoney(Number(u.contribution_total), true)}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="py-3 px-4">
                      {!isMe && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant={u.is_blocked ? 'secondary' : 'danger'}
                            loading={busyId === u.id}
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() =>
                              act(
                                u,
                                () => setUserBlocked(u.id, !u.is_blocked),
                                t(u.is_blocked ? 'admin.users.confirmUnblock' : 'admin.users.confirmBlock', {
                                  name: u.full_name,
                                }),
                              )
                            }
                          >
                            {u.is_blocked ? t('admin.users.unblock') : t('admin.users.block')}
                          </Button>
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() =>
                              act(
                                u,
                                () => setUserRole(u.id, u.role === 'admin' ? 'member' : 'admin'),
                                t(
                                  u.role === 'admin'
                                    ? 'admin.users.confirmRemoveAdmin'
                                    : 'admin.users.confirmMakeAdmin',
                                  { name: u.full_name },
                                ),
                              )
                            }
                          >
                            {u.role === 'admin' ? t('admin.users.removeAdmin') : t('admin.users.makeAdmin')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm mt-4" aria-label={t('explore.pagination')}>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-full border border-slate-200 bg-card disabled:opacity-40"
            aria-label={t('explore.previous')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-600 font-mono-numbers">{t('explore.pageOf', { page, pages })}</span>
          <button
            type="button"
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-full border border-slate-200 bg-card disabled:opacity-40"
            aria-label={t('explore.next')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </>
  );
}
