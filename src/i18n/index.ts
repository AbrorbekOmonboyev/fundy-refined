/**
 * Translations setup.
 *
 * - Texts live in ./locales/{uz,ru,en}.json — same keys in every file.
 * - English is the default for a first visit (owner's request, 2026-11-08); the visitor's
 *   choice is remembered in localStorage. Signed-in users get the language saved in their profile.
 * - In components: `const { t } = useTranslation();` then `t('nav.explore')`.
 * - en.json is the reference: TypeScript flags any key that doesn't exist there.
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export const LANGUAGES = ['uz', 'ru', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

export const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    nonExplicitSupportedLngs: true, // "ru-RU" → "ru"
    interpolation: { escapeValue: false }, // React already escapes output
    detection: {
      // Only a choice the visitor made counts; otherwise English.
      // New key (was fundy_language): the old one also held Uzbek saved automatically
      // for visitors who never chose, so everyone starts again from English once.
      order: ['localStorage'],
      lookupLocalStorage: 'fundy_lang',
      caches: ['localStorage'],
    },
  });

// Keep <html lang="…"> in sync for screen readers and search engines.
const syncHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', lng);
};
syncHtmlLang(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
