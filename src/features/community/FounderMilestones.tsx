import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { errorKey } from '@/features/auth/errors';
import { listMilestones, submitMilestone, type Milestone } from '@/features/community/api';
import { Alert, Button, TextAreaField } from '@/components/ui';
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
  const [open, setOpen] = useState(false);
  const [evidence, setEvidence] = useState(m.evidence ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (evidence.trim().length < MIN_EVIDENCE) {
      setError(t('milestones.evidenceTooShort', { count: MIN_EVIDENCE }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitMilestone(m.id, evidence);
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
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={busy}>
              {t('milestones.send')}
            </Button>
          </div>
        </form>
      )}
    </li>
  );
}
