import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { errorKey } from '@/features/auth/errors';
import { listContactMessages, setMessageHandled } from '@/features/contact/api';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

type Filter = 'new' | 'handled' | 'all';

/** Messages sent through the Contact page. Reply by email, then mark them handled. */
export function AdminMessagesPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('new');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'messages', filter],
    queryFn: () => listContactMessages(filter),
  });
  usePageMeta(t('admin.nav.messages'));
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' });

  async function toggle(id: string, handled: boolean) {
    setBusyId(id);
    setError(null);
    try {
      await setMessageHandled(id, handled);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader title={t('admin.nav.messages')} hint={t('admin.messages.hint')} />
      <div className="flex gap-2 mb-4" role="group">
        {(['new', 'handled', 'all'] as const).map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-night text-white' : 'bg-card text-slate-600 border border-slate-200 hover:border-ink'}`}
          >
            {t(`admin.messages.filter.${f}`)}
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
          {t('admin.messages.empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map(m => (
            <li
              key={m.id}
              className={`bg-card rounded-2xl border p-5 space-y-3 ${m.status === 'new' ? 'border-ink' : 'border-slate-200'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">
                    {m.name} ·{' '}
                    <a href={`mailto:${m.email}`} className="underline font-normal">
                      {m.email}
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(`contact.topics.${m.topic}`)} · {time.format(new Date(m.created_at))}
                    {m.user_id && <> · {t('admin.messages.signedIn')}</>}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.status === 'new' ? 'bg-brand text-ink' : 'bg-page text-slate-600'}`}
                >
                  {t(`admin.messages.status.${m.status}`)}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{m.message}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent('Fundy')}`}
                  className="rounded-md bg-night px-3 py-1.5 text-xs font-semibold text-white hover:bg-night-soft"
                >
                  {t('admin.messages.reply')}
                </a>
                <Button
                  variant="secondary"
                  className="!px-3 !py-1.5 text-xs"
                  loading={busyId === m.id}
                  onClick={() => toggle(m.id, m.status === 'new')}
                >
                  {m.status === 'new' ? t('admin.messages.markHandled') : t('admin.messages.reopen')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
