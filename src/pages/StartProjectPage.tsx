import { useTranslation } from 'react-i18next';
import { BasicsStep } from '@/features/wizard/steps/BasicsStep';
import { usePageMeta } from '@/lib/usePageMeta';

/** /start — first step of a brand-new project. Saving it creates the draft. */
export function StartProjectPage() {
  const { t } = useTranslation();
  usePageMeta(t('nav.startProject'));
  return <BasicsStep draft={null} />;
}
