import { useTranslation } from 'react-i18next';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

/** Top strip that marks the site as a demo (no real money). */
export function DemoBanner() {
  const { t } = useTranslation();
  const { resetToDefaultData } = useApp();

  return (
    <aside
      aria-label={t('banner.label')}
      className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs py-2 px-4"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-200">{t('banner.label')}</span>
          <span className="text-slate-400 hidden sm:inline">{t('banner.full')}</span>
          <span className="text-slate-400 sm:hidden">{t('banner.short')}</span>
        </div>

        {/* TODO(Phase 5): remove once dashboards use real data — this only resets the browser's demo data. */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('banner.resetConfirm'))) resetToDefaultData();
          }}
          title={t('banner.resetTitle')}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('banner.reset')}</span>
        </button>
      </div>
    </aside>
  );
}
