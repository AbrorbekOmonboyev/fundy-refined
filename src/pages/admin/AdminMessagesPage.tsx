import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { errorKey } from '@/features/auth/errors';
import { listContactMessages, setMessageHandled } from '@/features/contact/api';
import { listFeedback, setFeedbackHandled, type PageFeedback } from '@/features/feedback/api';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

type Filter = 'new' | 'handled' | 'all';
type Tab = 'contact' | 'feedback';

/**
 * Two inboxes: messages from the Contact page (reply by email) and quick notes
 * about a page ("Shu sahifada nima kamchilik koʻrdingiz?"). Mark each handled when done.
 */
export function AdminMessagesPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'feedback' ? 'feedback' : 'contact';
  const [filter, setFilter] = useState<Filter>('new');
  usePageMeta(t('admin.nav.messages'));

  const pill = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-semibold ${active ? 'bg-night text-white' : 'bg-card text-slate-600 border border-slate-200 hover:border-ink'}`;

  return (
    <>
      <AdminHeader
        title={t('admin.nav.messages')}
        hint={tab === 'feedback' ? t('admin.feedback.hint') : t('admin.messages.hint')}
      />
      <div className="flex gap-1 mb-4 border-b border-slate-200" role="tablist">
        {(['contact', 'feedback'] as const).map(k => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setParams(k === 'feedback' ? { tab: 'feedback' } : {}, { replace: true })}
            className={`-mb-px px-3 py-2 text-sm font-semibold border-b-[3px] cursor-pointer ${
              tab === k ? 'border-brand text-ink' : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {t(`admin.feedback.tabs.${k}`)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-4" role="group">
        {(['new', 'handled', 'all'] as const).map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={pill(filter === f)}
          >
            {t(`admin.messages.filter.${f}`)}
          </button>
        ))}
      </div>
      {tab === 'contact' ? <ContactInbox filter={filter} /> : <FeedbackInbox filter={filter} />}
    </>
  );
}

function useToggle(queryKey: string[], action: (id: string, handled: boolean) => Promise<void>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function toggle(id: string, handled: boolean) {
    setBusyId(id);
    setError(null);
    try {
      await action(id, handled);
      await queryClient.invalidateQueries({ queryKey });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusyId(null);
    }
  }
  return { busyId, error, toggle };
}

function StatusBadge({ status }: { status: 'new' | 'handled' }) {
  const { t } = useTranslation();
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'new' ? 'bg-brand text-ink' : 'bg-page text-slate-600'}`}
    >
      {t(`admin.messages.status.${status}`)}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="p-10 text-center text-sm text-slate-500 bg-card rounded-2xl border border-slate-200">{text}</p>;
}

function ContactInbox({ filter }: { filter: Filter }) {
  const { t, i18n } = useTranslation();
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'messages', filter],
    queryFn: () => listContactMessages(filter),
  });
  const { busyId, error, toggle } = useToggle(['admin', 'messages'], setMessageHandled);
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' });

  if (isPending) return <PageSpinner />;
  if (isError) return <Alert variant="error">{t('errors.generic')}</Alert>;
  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}
      {data.length === 0 ? (
        <Empty text={t('admin.messages.empty')} />
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
                <StatusBadge status={m.status} />
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{m.message}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent('Fundy')}`}
                  className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep"
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

/** "uz · 390px · dark · app" — how the visitor saw the page. */
function contextLine(c: PageFeedback['context']): string {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return '';
  const o = c as Record<string, unknown>;
  return [
    o.script === 'cyrl' ? 'uz-Cyrl' : o.lang,
    typeof o.width === 'number' ? `${o.width}px` : null,
    o.dark ? 'dark' : null,
    o.app ? 'app' : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function FeedbackInbox({ filter }: { filter: Filter }) {
  const { t, i18n } = useTranslation();
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['admin', 'feedback', filter],
    queryFn: () => listFeedback(filter),
  });
  const { busyId, error, toggle } = useToggle(['admin', 'feedback'], setFeedbackHandled);
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' });

  if (isPending) return <PageSpinner />;
  if (isError) return <Alert variant="error">{t('errors.generic')}</Alert>;
  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}
      {data.length === 0 ? (
        <Empty text={t('admin.feedback.empty')} />
      ) : (
        <ul className="space-y-3">
          {data.map(f => {
            const kind = (['bug', 'confusing', 'idea', 'other'] as const).find(k => k === f.kind) ?? 'other';
            return (
              <li
                key={f.id}
                className={`bg-card rounded-2xl border p-5 space-y-3 ${f.status === 'new' ? 'border-ink' : 'border-slate-200'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink break-all">
                      <span className="mr-2 inline-block rounded-full bg-page px-2 py-0.5 text-xs font-semibold text-slate-700 align-middle">
                        {t(`feedback.kinds.${kind}`)}
                      </span>
                      {f.page}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {time.format(new Date(f.created_at))} ·{' '}
                      {f.user_id ? t('admin.messages.signedIn') : t('admin.feedback.guest')}
                      {contextLine(f.context) && <> · {contextLine(f.context)}</>}
                    </p>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-line">{f.message}</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={/^\/(?![/\\])/.test(f.page) ? f.page : '/'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                    {t('admin.feedback.openPage')}
                  </a>
                  {f.email && (
                    <a
                      href={`mailto:${f.email}?subject=${encodeURIComponent('Fundy')}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-ink"
                    >
                      {t('admin.messages.reply')} · {f.email}
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    className="!px-3 !py-1.5 text-xs"
                    loading={busyId === f.id}
                    onClick={() => toggle(f.id, f.status === 'new')}
                  >
                    {f.status === 'new' ? t('admin.messages.markHandled') : t('admin.messages.reopen')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
