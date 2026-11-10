import { useTranslation } from 'react-i18next';

/** Top strip that marks the site as a demo (no real money). Remove before a real launch. */
export function DemoBanner() {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('banner.label')}
      className="print:hidden bg-night text-slate-300 border-b border-white/10 text-xs py-2 px-4"
    >
      <p className="max-w-7xl mx-auto">
        <span className="font-medium text-slate-200">{t('banner.label')}</span> {t('banner.full')}
      </p>
    </aside>
  );
}
