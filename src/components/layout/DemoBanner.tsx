import { useTranslation } from 'react-i18next';

/** Top strip that marks the site as a demo (no real money). Remove before a real launch. */
export function DemoBanner() {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('banner.label')}
      className="bg-night text-slate-300 border-b border-white/10 text-xs py-2 px-4"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <span className="font-medium text-slate-200">{t('banner.label')}</span>
        <span className="text-slate-400 hidden sm:inline">{t('banner.full')}</span>
        <span className="text-slate-400 sm:hidden">{t('banner.short')}</span>
      </div>
    </aside>
  );
}
