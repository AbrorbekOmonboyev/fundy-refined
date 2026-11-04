import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui';

/** Warns that the prototype project form does not save to the database yet. */
export function PreviewNotice() {
  const { t } = useTranslation();
  return (
    <Alert variant="warning">
      <strong>{t('dashboard.founder.previewTitle')}</strong> {t('dashboard.founder.previewText')}
    </Alert>
  );
}
