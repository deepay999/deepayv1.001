import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

/** Wraps the app with the i18next provider so all components can call useTranslation(). */
export function LanguageProvider({ children }: LanguageProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
