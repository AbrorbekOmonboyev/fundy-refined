import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { errorKey } from '@/features/auth/errors';
import { clearIdentity, confirmIdentity, confirmRegistration } from '@/features/admin/api';
import { getIdentity, identityKey, type Draft } from '@/features/wizard/api';
import { Alert, Button, TextAreaField } from '@/components/ui';
import { formatDate } from '@/lib/money';

/**
 * Is the founder who they say they are? OneID fills this in on its own; until it is
 * connected, the admin confirms it after a short video call with the founder's ID.
 */
export function IdentityPanel({ ownerId }: { ownerId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const identity = useQuery({ queryKey: identityKey(ownerId), queryFn: () => getIdentity(ownerId) });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: identityKey(ownerId) });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm(t('admin.identity.confirmAsk'))) return;
    void run(() => confirmIdentity(ownerId, note.trim() || null));
  }

  if (identity.isPending) return null;
  const id = identity.data;

  return (
    <section className="bg-card rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3">
      <h2 className="text-base text-ink flex items-center gap-2">
        <ShieldCheck className={`w-5 h-5 ${id ? 'text-brand-deep' : 'text-slate-400'}`} aria-hidden />
        {t('admin.identity.title')}
      </h2>
      {id ? (
        <>
          <p className="text-sm text-slate-700">
            {t(`identity.confirmedBy.${id.method}`, { date: formatDate(id.verified_at) })}
          </p>
          {id.full_name && <p className="text-sm font-semibold text-ink">{id.full_name}</p>}
          {id.company_name && <p className="text-sm text-slate-700">{id.company_name}</p>}
          {id.note && <p className="text-sm text-slate-600 whitespace-pre-line">{id.note}</p>}
          {id.method === 'video_call' && (
            <Button variant="link" loading={busy} onClick={() => void run(() => clearIdentity(ownerId))}>
              {t('admin.identity.undo')}
            </Button>
          )}
        </>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3">
          <p className="text-sm text-slate-700">{t('admin.identity.howTo')}</p>
          <TextAreaField
            label={t('admin.identity.note')}
            hint={t('admin.identity.noteHint')}
            rows={2}
            maxLength={1000}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <Button type="submit" variant="secondary" loading={busy} fullWidth>
            {t('admin.identity.confirm')}
          </Button>
        </form>
      )}
      {error && <Alert variant="error">{error}</Alert>}
    </section>
  );
}

/** Goal reached without a company: the founder added an MChJ number; the admin checks it. */
export function RegistrationPanel({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = draft.project;
  const number = draft.founder?.registration_number?.trim();

  async function confirm() {
    if (!window.confirm(t('admin.registration.confirmAsk'))) return;
    setBusy(true);
    setError(null);
    try {
      await confirmRegistration(p.id);
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-brand rounded-2xl p-5 sm:p-6 space-y-3">
      <h2 className="text-base text-ink">{t('admin.registration.title')}</h2>
      <p className="text-sm text-ink">{t('admin.registration.due', { date: formatDate(p.registration_due_at) })}</p>
      {number ? (
        <>
          <p className="text-sm text-ink">
            {t('admin.registration.number')}: <strong>{number}</strong>
          </p>
          <p className="text-sm text-ink">{t('admin.registration.howTo')}</p>
          <Button loading={busy} onClick={confirm} fullWidth>
            {t('admin.registration.confirm')}
          </Button>
        </>
      ) : (
        <p className="text-sm text-ink">{t('admin.registration.waiting')}</p>
      )}
      {error && <Alert variant="error">{error}</Alert>}
    </section>
  );
}
