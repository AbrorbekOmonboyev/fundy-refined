import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CircleAlert, Clock } from 'lucide-react';
import { paths } from '@/app/routes';
import { wizardErrorText } from '@/features/wizard/errors';
import { submitDraft, withdrawSubmission, type Draft } from '@/features/wizard/api';
import { STEPS, budgetTotal, founderGaps, isEditable, releaseTotal, stepComplete } from '@/features/wizard/checks';
import { draftKey } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button } from '@/components/ui';
import { formatMoney } from '@/lib/money';

/** Step 7: checklist, then send for review. Also shown read-only while the project is under review. */
export function ReviewStep({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = isEditable(draft);
  const ready = stepComplete(draft, 'review');
  const status = draft.project.status;

  const problem = (step: (typeof STEPS)[number]): string | null => {
    if (stepComplete(draft, step)) return null;
    switch (step) {
      case 'budget':
        return t('wizard.review.budgetProblem', {
          total: formatMoney(budgetTotal(draft)),
          goal: formatMoney(draft.project.target_amount),
        });
      case 'milestones':
        return t('wizard.review.milestonesProblem', { total: releaseTotal(draft) });
      case 'founder':
        return founderGaps(draft)
          .map(g => t(`wizard.founder.gap.${g}`))
          .join(' ');
      default:
        return t(`wizard.review.problem.${step as 'basics' | 'story' | 'terms'}`);
    }
  };

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await submitDraft(draft.project.id);
      await queryClient.invalidateQueries({ queryKey: draftKey(draft.project.id) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(paths.founderDashboard, { state: { submitted: true } });
    } catch (e) {
      setError(wizardErrorText(t, e));
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!window.confirm(t('dashboard.founder.withdrawConfirm'))) return;
    setBusy(true);
    setError(null);
    try {
      await withdrawSubmission(draft.project.id);
      await queryClient.invalidateQueries({ queryKey: draftKey(draft.project.id) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (e) {
      setError(wizardErrorText(t, e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <WizardShell
      draft={draft}
      step="review"
      title={t('wizard.review.title')}
      hint={editable ? t('wizard.review.hint') : undefined}
      error={error}
    >
      {!editable && (
        <Alert variant={status === 'rejected' ? 'error' : 'info'}>
          <p className="font-semibold">{t(`status.${status}`)}</p>
          <p>{t(`wizard.review.statusText.${status}`, { defaultValue: '' })}</p>
          {draft.project.review_note && <p className="mt-1">“{draft.project.review_note}”</p>}
        </Alert>
      )}

      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
        {STEPS.filter(s => s !== 'review').map(step => {
          const issue = problem(step);
          return (
            <li key={step} className="flex items-start justify-between gap-3 p-3">
              <span className="flex items-start gap-2 text-sm">
                {issue ? (
                  <CircleAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" aria-hidden />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-ink mt-0.5 shrink-0" aria-hidden />
                )}
                <span>
                  <span className="font-medium text-ink">{t(`wizard.step.${step}`)}</span>
                  {issue && <span className="block text-xs text-amber-700">{issue}</span>}
                </span>
              </span>
              {editable && (
                <Link
                  to={paths.editProject(draft.project.id, step)}
                  className="text-xs font-semibold text-ink hover:underline shrink-0"
                >
                  {t('wizard.review.edit')}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {editable && (
        <div className="space-y-3 pt-2">
          <Alert variant="info">{t('wizard.review.whatNext')}</Alert>
          <Button onClick={submit} loading={busy} disabled={!ready} fullWidth>
            {status === 'changes_requested' ? t('wizard.review.resubmit') : t('wizard.review.submit')}
          </Button>
          {!ready && <p className="text-xs text-center text-slate-500">{t('wizard.review.notReady')}</p>}
        </div>
      )}

      {status === 'pending_review' && (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" aria-hidden />
          {t('wizard.review.waiting')}
        </p>
      )}
      {status === 'pending_review' && (
        <div className="space-y-2">
          <Button variant="secondary" loading={busy} onClick={withdraw}>
            {t('dashboard.founder.withdraw')}
          </Button>
          <p className="text-xs text-slate-500">{t('dashboard.founder.withdrawHint')}</p>
        </div>
      )}
    </WizardShell>
  );
}
