import { Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/routes';
import { Alert, PageSpinner } from '@/components/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useDraft } from '@/features/wizard/hooks';
import { STEPS, isEditable, type Step } from '@/features/wizard/checks';
import { BasicsStep } from '@/features/wizard/steps/BasicsStep';
import { StoryStep } from '@/features/wizard/steps/StoryStep';
import { BudgetStep } from '@/features/wizard/steps/BudgetStep';
import { MilestonesStep } from '@/features/wizard/steps/MilestonesStep';
import { TermsStep } from '@/features/wizard/steps/TermsStep';
import { FounderStep } from '@/features/wizard/steps/FounderStep';
import { ReviewStep } from '@/features/wizard/steps/ReviewStep';
import { usePageMeta } from '@/lib/usePageMeta';

/** /dashboard/founder/:projectId/:step — edit one step of the owner's project. */
export function ProjectEditorPage() {
  const { t } = useTranslation();
  const { projectId, step } = useParams();
  const { data: draft, isPending, isError } = useDraft(projectId);
  usePageMeta(draft?.text?.title ?? t('nav.startProject'));

  if (isPending) return <PageSpinner />;
  if (isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Alert variant="error">{t('errors.generic')}</Alert>
      </div>
    );
  }
  if (!draft) return <NotFoundPage />;
  if (!STEPS.includes(step as Step)) return <Navigate to={paths.editProject(draft.project.id)} replace />;

  // Under review, live or finished projects can't be edited: show the status page.
  const current: Step = isEditable(draft) ? (step as Step) : 'review';
  // key: start each step with fresh form state from the latest draft
  const key = `${current}-${draft.project.updated_at}`;
  switch (current) {
    case 'basics':
      return <BasicsStep key={key} draft={draft} />;
    case 'story':
      return <StoryStep key={key} draft={draft} />;
    case 'budget':
      return <BudgetStep key={key} draft={draft} />;
    case 'milestones':
      return <MilestonesStep key={key} draft={draft} />;
    case 'terms':
      return <TermsStep key={key} draft={draft} />;
    case 'founder':
      return <FounderStep key={key} draft={draft} />;
    case 'review':
      return <ReviewStep key={key} draft={draft} />;
  }
}
