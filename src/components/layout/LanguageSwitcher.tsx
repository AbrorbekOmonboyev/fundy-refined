import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, type Language } from '@/i18n';

/** Compact language picker: UZ · RU · EN. */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? 'uz') as Language;

  return (
    <div
      role="group"
      aria-label={t('header.language')}
      className={`flex items-center gap-1 text-xs font-semibold ${className}`}
    >
      <Globe className="w-4 h-4 text-slate-400 mr-0.5" aria-hidden />
      {LANGUAGES.map(lng => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          title={t(`languages.${lng}`)}
          className={`px-1.5 py-1 rounded uppercase transition-colors cursor-pointer ${
            current === lng ? 'bg-brand-soft text-ink' : 'text-slate-500 hover:text-ink'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}

/** One small dropdown for the header: "UZ ▾". */
export function LanguageMenu({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? 'uz') as Language;
  return (
    <label className={`relative flex items-center text-xs font-semibold text-slate-600 hover:text-ink ${className}`}>
      <Globe className="w-4 h-4 absolute left-2 pointer-events-none" aria-hidden />
      <span className="sr-only">{t('header.language')}</span>
      <select
        value={current}
        onChange={e => void i18n.changeLanguage(e.target.value)}
        className="appearance-none bg-transparent pl-7 pr-2 py-2 rounded-lg uppercase cursor-pointer hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {LANGUAGES.map(lng => (
          <option key={lng} value={lng} className="normal-case text-ink bg-card">
            {lng.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
