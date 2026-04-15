/**
 * i18next configuration.
 *
 * - Default language: zh (Chinese Simplified)
 * - Secondary language: en (English)
 * - Translations are loaded from GET /api/language/{key}; on failure the
 *   embedded fallback bundles are used instead.
 * - User's language choice is persisted in localStorage under "language".
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh';
import en from './locales/en';

const STORAGE_KEY = 'language';
const DEFAULT_LANG = 'zh';
const SUPPORTED = ['zh', 'en'] as const;
type Lang = (typeof SUPPORTED)[number];

function getSavedLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'zh' || saved === 'en') return saved;
  return DEFAULT_LANG;
}

/** Attempt to fetch translations from the backend. Returns null on any error. */
async function fetchBackendTranslations(
  lang: Lang,
): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`/api/language/${lang}`);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, string>;
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
    zh: { translation: zh },
    en: { translation: en },
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
