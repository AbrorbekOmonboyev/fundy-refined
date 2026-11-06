import { useSyncExternalStore } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getScript, onScriptChange, setScript } from '@/lib/script';

/**
 * Four choices: Uzbek (Latin), Uzbek (Cyrillic), Russian, English.
 * Cyrillic Uzbek is still Uzbek — same texts and data, shown in the other alphabet.
 */
const CHOICES = [
  { id: 'uz', label: 'UZ', title: 'languages.uz' },
  { id: 'uz-cyrl', label: 'ЎЗ', title: 'languages.uzCyrl' },
  { id: 'ru', label: 'RU', title: 'languages.ru' },
  { id: 'en', label: 'EN', title: 'languages.en' },
] as const;
type Choice = (typeof CHOICES)[number]['id'];

function useChoice(): [Choice, (c: Choice) => void] {
  const { i18n } = useTranslation();
  const script = useSyncExternalStore(onScriptChange, getScript, () => 'latn' as const);
  const lang = i18n.resolvedLanguage ?? 'uz';
  const current: Choice = lang === 'uz' && script === 'cyrl' ? 'uz-cyrl' : (lang as Choice);
  const choose = (c: Choice) => {
    setScript(c === 'uz-cyrl' ? 'cyrl' : 'latn');
    void i18n.changeLanguage(c === 'uz-cyrl' ? 'uz' : c);
  };
  return [current, choose];
}

/** Buttons: UZ · ЎЗ · RU · EN (menu on phones, settings). */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const [current, choose] = useChoice();

  return (
    <div
      role="group"
      aria-label={t('header.language')}
      data-no-translit
      className={`flex items-center gap-1 text-xs font-semibold ${className}`}
    >
      <Globe className="w-4 h-4 text-slate-400 mr-0.5" aria-hidden />
      {CHOICES.map(c => (
        <button
          key={c.id}
          type="button"
          onClick={() => choose(c.id)}
          aria-pressed={current === c.id}
          title={t(c.title)}
          className={`min-w-10 px-2 py-2 rounded-lg transition-colors cursor-pointer ${
            current === c.id ? 'bg-brand-soft text-ink' : 'text-slate-500 hover:text-ink'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** One small dropdown for the header: "UZ ▾". */
export function LanguageMenu({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const [current, choose] = useChoice();
  return (
    <label
      data-no-translit
      className={`relative flex items-center text-xs font-semibold text-slate-600 hover:text-ink ${className}`}
    >
      <Globe className="w-4 h-4 absolute left-2 pointer-events-none" aria-hidden />
      <span className="sr-only">{t('header.language')}</span>
      <select
        value={current}
        onChange={e => choose(e.target.value as Choice)}
        className="appearance-none bg-transparent pl-7 pr-2 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {CHOICES.map(c => (
          <option key={c.id} value={c.id} className="text-ink bg-card">
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
