import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, type Lang, SUPPORTED } from '../../i18n';

/** Compact flag SVGs indexed by language code. */
const FLAGS: Record<Lang, JSX.Element> = {
  zh: (
    /* China — red field with large yellow star + four small stars */
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
      <rect width="20" height="14" rx="1" fill="#DE2910" />
      <polygon points="4,2 5,4.8 8,4.8 5.6,6.5 6.5,9.3 4,7.5 1.5,9.3 2.4,6.5 0,4.8 3,4.8" fill="#FFDE00" />
      <polygon points="8,1.5 8.6,3 10.1,3 8.9,3.8 9.4,5.3 8,4.5 6.6,5.3 7.1,3.8 5.9,3 7.4,3" fill="#FFDE00" />
      <polygon points="10,3.5 10.6,5 12.1,5 10.9,5.8 11.4,7.3 10,6.5 8.6,7.3 9.1,5.8 7.9,5 9.4,5" fill="#FFDE00" />
      <polygon points="8,6.5 8.6,8 10.1,8 8.9,8.8 9.4,10.3 8,9.5 6.6,10.3 7.1,8.8 5.9,8 7.4,8" fill="#FFDE00" />
    </svg>
  ),
  en: (
    /* Union Jack (simplified) */
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
      <rect width="20" height="14" rx="1" fill="#012169" />
      <path d="M0 0L20 14M20 0L0 14" stroke="white" strokeWidth="3" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M10 0V14M0 7H20" stroke="white" strokeWidth="5" />
      <path d="M10 0V14M0 7H20" stroke="#C8102E" strokeWidth="3" />
    </svg>
  ),
};

/** Flag icon for a given language code. */
function FlagIcon({ lang }: { lang: Lang }) {
  return FLAGS[lang];
}

interface LanguageDropdownProps {
  /** Visual theme: dark (for the landing page) or light (for the mobile app). */
  theme?: 'dark' | 'light';
}

export function LanguageDropdown({ theme = 'dark' }: LanguageDropdownProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language === 'en' ? 'en' : 'zh') as Lang;

  const handleSelect = (lang: Lang) => {
    changeLanguage(lang);
    setOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 select-none',
          isDark
            ? 'text-white/70 hover:text-white hover:bg-white/8 border border-white/10 hover:border-white/20'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FlagIcon lang={currentLang} />
        <span>{t(`lang.${currentLang}`)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={[
            'absolute right-0 mt-2 w-36 rounded-xl border shadow-xl overflow-hidden z-50',
            isDark
              ? 'bg-[#111] border-white/10 shadow-black/40'
              : 'bg-white border-neutral-200 shadow-neutral-200/60',
          ].join(' ')}
        >
          {SUPPORTED.map((lang) => {
            const active = lang === currentLang;
            return (
              <button
                key={lang}
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(lang)}
                className={[
                  'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                  isDark
                    ? active
                      ? 'bg-white/8 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    : active
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                ].join(' ')}
              >
                <FlagIcon lang={lang} />
                <span>{t(`lang.${lang}`)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Click-outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
