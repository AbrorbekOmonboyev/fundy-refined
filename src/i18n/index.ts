/**
 * Translations setup.
 *
 * - Texts live in ./locales/{uz,ru,en}.json — same keys in every file.
 * - Uzbek is the default; the visitor's choice is remembered in localStorage.
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
export const DEFAULT_LANGUAGE: Language = 'uz';

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
      // Only a choice the visitor made counts; otherwise Uzbek.
      order: ['localStorage'],
      lookupLocalStorage: 'fundy_language',
      caches: ['localStorage'],
    },
  });

// Keep <html lang="…"> in sync for screen readers and search engines.
const syncHtmlLang = (lng: string) => document.documentElement.setAttribute('lang', lng);
syncHtmlLang(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
