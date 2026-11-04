import { useTranslation } from 'react-i18next';
import { RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

/** Top strip that marks the site as a demo and lets you switch the demo user's role. */
export function DemoBanner() {
  const { t } = useTranslation();
  const { userProfile, setUserRole, resetToDefaultData } = useApp();

  const roleButton = (role: 'backer' | 'founder') => (
    <button
      type="button"
      onClick={() => setUserRole(role)}
      aria-pressed={userProfile.role === role}
      className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
        userProfile.role === role ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
      }`}
    >
      {t(`roles.${role}`)}
    </button>
  );

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

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-md px-2 py-1 border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">{t('banner.viewAs')}</span>
            {roleButton('backer')}
            <span className="text-slate-600">/</span>
            {roleButton('founder')}
          </div>

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
      </div>
    </aside>
  );
}
