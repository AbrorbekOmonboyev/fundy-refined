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
