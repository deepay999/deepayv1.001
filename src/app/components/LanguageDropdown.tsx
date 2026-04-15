import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, type Lang, SUPPORTED } from '../../i18n';

/** Flag SVG for a given language code. */
function FlagIcon({ lang }: { lang: Lang }) {
  if (lang === 'zh') {
    return (
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
        <rect width="20" height="14" rx="1" fill="#DE2910" />
        <polygon points="4,2 4.9,4.8 7.8,4.8 5.5,6.5 6.4,9.3 4,7.6 1.6,9.3 2.5,6.5 0.2,4.8 3.1,4.8" fill="#FFDE00" />
        <polygon points="8,1 8.5,2.5 10,2.5 8.8,3.3 9.3,4.8 8,4 6.7,4.8 7.2,3.3 6,2.5 7.5,2.5" fill="#FFDE00" />
        <polygon points="10,3 10.5,4.5 12,4.5 10.8,5.3 11.3,6.8 10,6 8.7,6.8 9.2,5.3 8,4.5 9.5,4.5" fill="#FFDE00" />
        <polygon points="8,6 8.5,7.5 10,7.5 8.8,8.3 9.3,9.8 8,9 6.7,9.8 7.2,8.3 6,7.5 7.5,7.5" fill="#FFDE00" />
      </svg>
    );
  }
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
      <rect width="20" height="14" rx="1" fill="#012169" />
      <path d="M0,0 L20,14 M20,0 L0,14" stroke="white" strokeWidth="3" />
      <path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M10,0 L10,14 M0,7 L20,7" stroke="white" strokeWidth="4.5" />
      <path d="M10,0 L10,14 M0,7 L20,7" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
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
