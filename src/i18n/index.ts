/**
 * i18next configuration.
 *
 * - Default language: it (Italian — DeePay S.r.l. is an Italian platform)
 * - Supported: it, en, fr, de, es, pt, ar, zh
 * - Auto-detects browser language on first visit
 * - Translations are loaded from GET /api/language/{key}; on failure the
 *   embedded fallback bundles are used instead.
 * - User's language choice is persisted in localStorage under "language".
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh';
import en from './locales/en';
import it from './locales/it';
import fr from './locales/fr';
import de from './locales/de';
import es from './locales/es';
import pt from './locales/pt';
import ar from './locales/ar';

const STORAGE_KEY = 'language';
const DEFAULT_LANG = 'it';
const SUPPORTED = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ar', 'zh'] as const;
type Lang = (typeof SUPPORTED)[number];

function getSavedLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED.includes(saved as Lang)) return saved as Lang;
  // Auto-detect browser language on first visit
  const browserLang = navigator.language.split('-')[0] as Lang;
  if (SUPPORTED.includes(browserLang)) return browserLang;
  return DEFAULT_LANG;
}

/** Attempt to fetch translations from the backend. Returns null on any error. */
async function fetchBackendTranslations(
  lang: Lang,
): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`/api/language/${lang}`);
    if (!res.ok) return null;
    const body: unknown = await res.json();
    // The API wraps translations under { data: { file: { key: value, ... } } }
    if (
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      'data' in body
    ) {
      const data = (body as Record<string, unknown>).data;
      if (data && typeof data === 'object' && !Array.isArray(data) && 'file' in data) {
        const file = (data as Record<string, unknown>).file;
        if (file && typeof file === 'object' && !Array.isArray(file)) {
          return file as Record<string, string>;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

const savedLang = getSavedLang();

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: DEFAULT_LANG,
  resources: {
    it: { translation: it },
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    pt: { translation: pt },
    ar: { translation: ar },
    zh: { translation: zh },
  },
  interpolation: {
    escapeValue: false,
  },
});

// Asynchronously overlay backend translations (if available) for both languages
for (const lang of SUPPORTED) {
  fetchBackendTranslations(lang).then((translations) => {
    if (translations) {
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    }
  });
}

/**
 * Change the active language, persist the selection and (lazily) reload
 * backend translations for that language.
 */
export function changeLanguage(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
  fetchBackendTranslations(lang).then((translations) => {
    if (translations) {
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    }
  });
}

export type { Lang };
export { SUPPORTED };
export default i18n;
