import type { TFunction } from 'i18next';
import { errorKey } from '@/features/auth/errors';

/** Error codes from the wizard (uploads) and from submit_project() in the database. */
const WIZARD_ERRORS = [
  'image_type',
  'image_size',
  'document_type',
  'document_size',
  'slug_unavailable',
  'founder_profile_missing',
  'project_text_incomplete',
  'cover_image_missing',
  'budget_total_mismatch',
  'milestones_must_total_100',
  'reward_tiers_missing',
  'equity_terms_missing',
  'project_not_editable',
] as const;
type WizardError = (typeof WIZARD_ERRORS)[number];

/** A translated message for any error a wizard step can run into. */
export function wizardErrorText(t: TFunction, error: unknown): string {
  const code = (error as Error)?.message as WizardError;
  if (WIZARD_ERRORS.includes(code)) {
    return t(`wizard.errors.${code}`, { mb: code.startsWith('image') ? 5 : 10 });
  }
  return t(errorKey(error));
}
