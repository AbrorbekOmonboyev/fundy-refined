import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { wizardErrorText } from '@/features/wizard/errors';
import { errorKey } from '@/features/auth/errors';
import { RECEIPTS_MAX, listMilestones, submitMilestone, uploadReceipt, type Milestone } from '@/features/community/api';
import { Alert, Button, NumberField, TextAreaField } from '@/components/ui';
import { publicFileUrl } from '@/lib/supabase';
import { formatDate } from '@/lib/money';

const MIN_EVIDENCE = 20;

/** Founder's milestone list for a funded project: report each one as done. */
export function FounderMilestones({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => listMilestones(projectId),
  });

  if (isPending) return <p className="text-xs text-slate-500">{t('common.loading')}</p>;
  if (isError) return <Alert variant="error">{t('errors.generic')}</Alert>;
  if (data.length === 0) return <p className="text-xs text-slate-500">{t('milestones.none')}</p>;

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-600">{t('milestones.founderIntro')}</p>
      <ol className="space-y-3">
        {data.map(m => (
          <MilestoneItem key={m.id} projectId={projectId} milestone={m} />
        ))}
      </ol>
    </div>
  );
}

function MilestoneItem({ projectId, milestone: m }: { projectId: string; milestone: Milestone }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [evidence, setEvidence] = useState(m.evidence ?? '');
  const [spent, setSpent] = useState(m.spent_amount ?? 0);
  const [receipts, setReceipts] = useState<string[]>(m.receipt_paths ?? []);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addReceipts(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, RECEIPTS_MAX - receipts.length);
    e.target.value = '';
    if (!user || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const path = await uploadReceipt(user.id, m.id, file);
        setReceipts(r => [...r, path]);
      }
    } catch (err) {
      setError(wizardErrorText(t, err));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (evidence.trim().length < MIN_EVIDENCE) {
      setError(t('milestones.evidenceTooShort', { count: MIN_EVIDENCE }));
      return;
    }
    if (!spent || spent <= 0) {
      setError(t('milestones.spentRequired'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitMilestone(m.id, evidence, spent, receipts);
      await queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  const Icon = m.status === 'approved' ? CheckCircle2 : m.status === 'submitted' ? Clock : Circle;
  const iconColor =
    m.status === 'approved' ? 'text-ink' : m.status === 'submitted' ? 'text-amber-600' : 'text-slate-300';

  return (
    <li className="rounded-lg border border-slate-200 p-3 space-y-2">
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">
            {m.position}. {m.title}
          </p>
          <p className="text-xs text-slate-500">
            {t(`milestones.status.${m.status}`)} · {t('milestones.release', { percent: m.release_percent })}
            {m.approved_at && <> · {formatDate(m.approved_at)}</>}
          </p>
        </div>
        {m.status === 'pending' && !open && (
          <Button variant="secondary" className="!px-3 !py-1.5 text-xs shrink-0" onClick={() => setOpen(true)}>
            {t('milestones.report')}
          </Button>
        )}
      </div>

      {m.status === 'pending' && m.review_note && (
        <Alert variant="warning">
          <strong>{t('milestones.returnedNote')}</strong> {m.review_note}
        </Alert>
      )}
      {m.status === 'submitted' && <p className="text-xs text-slate-500">{t('milestones.waiting')}</p>}

      {open && (
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          <TextAreaField
            label={t('milestones.evidence')}
            hint={t('milestones.evidenceHint')}
            rows={4}
            maxLength={8000}
            minChars={MIN_EVIDENCE}
            value={evidence}
            onChange={e => setEvidence(e.target.value)}
          />
          <NumberField
            label={t('milestones.spent')}
            hint={t('milestones.spentHint', { percent: m.release_percent })}
            value={spent}
            onValue={v => setSpent(Math.max(0, Math.round(v)))}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">{t('milestones.receipts')}</p>
            <p className="text-xs text-slate-500">{t('milestones.receiptsHint', { count: RECEIPTS_MAX })}</p>
            {receipts.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {receipts.map((path, i) => (
                  <li key={path} className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200">
                    <img
                      src={publicFileUrl('project-images', path) ?? ''}
                      alt={t('spending.receiptAlt', { n: i + 1 })}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setReceipts(r => r.filter(p => p !== path))}
                      aria-label={t('milestones.removeReceipt', { n: i + 1 })}
                      className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-night/80 text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {receipts.length < RECEIPTS_MAX && (
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={e => void addReceipts(e)}
                  disabled={uploading}
                />
                {uploading ? t('common.loading') : t('milestones.addReceipts')}
              </label>
            )}
          </div>
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={busy} disabled={uploading}>
              {t('milestones.send')}
            </Button>
          </div>
        </form>
      )}
    </li>
  );
}
