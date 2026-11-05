import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { REPORT_REASONS, reportContent, type ReportReason, type ReportTarget } from '@/features/community/api';
import { Alert, Button, ChoiceGroup, TextAreaField } from '@/components/ui';

/** "Report" link that opens a small form. Only for signed-in users, never on their own content. */
export function ReportButton({
  target,
  targetId,
  compact = false,
  label,
}: {
  target: ReportTarget;
  targetId: string;
  compact?: boolean;
  /** Button text instead of "Report" (e.g. "Report founder"). */
  label?: string;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<'ok' | 'duplicate' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setDone(await reportContent({ reporterId: user!.id, target, targetId, reason, details }));
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="w-full text-xs text-slate-500">
        {done === 'ok' ? t('community.reported') : t('community.alreadyReported')}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label ?? t('community.report')}
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600"
      >
        <Flag className="w-3.5 h-3.5" aria-hidden />
        {compact ? <span className="sr-only">{label ?? t('community.report')}</span> : (label ?? t('community.report'))}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mt-2 space-y-3 rounded-2xl border border-slate-200 bg-page p-4 text-left"
    >
      <ChoiceGroup
        label={t('community.reportReason')}
        value={reason}
        onChange={setReason}
        options={REPORT_REASONS.map(r => ({ value: r, label: t(`community.reasons.${r}`) }))}
      />
      <TextAreaField
        label={t('community.reportDetails')}
        rows={2}
        maxLength={2000}
        value={details}
        onChange={e => setDetails(e.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" variant="danger" loading={busy} className="!px-3 !py-1.5 text-xs">
          {t('community.sendReport')}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)} className="!px-3 !py-1.5 text-xs">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
