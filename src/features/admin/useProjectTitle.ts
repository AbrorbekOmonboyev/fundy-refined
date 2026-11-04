import { useTranslation } from 'react-i18next';
import { pickText } from '@/features/projects/api';
import type { AdminProjectRow } from '@/features/admin/api';

/** Project title in the admin's language (or the original). */
export function useProjectTitle() {
  const { i18n } = useTranslation();
  return (p: Pick<AdminProjectRow, 'project_translations' | 'original_language' | 'slug'>) =>
    pickText(p.project_translations, i18n.resolvedLanguage ?? 'uz', p.original_language).text?.title ?? p.slug;
}
