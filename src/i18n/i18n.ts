import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Examples of language resources
const resources = {
  zh: {
    translation: {
      Home: '首页',
      Wallet: '钱包',
      Transfer: '转账',
      IBAN: '国际银行账号',
      Activity: '活动'
    }
  },
  en: {
    translation: {} // Placeholder for fetching from the API
  }
};

// Initialize i18n
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem('language') || 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;