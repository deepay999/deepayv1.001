import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './fallback';

const STORAGE_KEY = 'deepay_lang';

function getInitialLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'zh';
  } catch {
    return 'zh';
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

/** Persist language choice and change i18n language */
export function setLanguage(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  void i18n.changeLanguage(lang);
}

export default i18n;
