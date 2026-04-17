import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { setLanguage } from './i18n';
import type { Lang } from './index';

const LANGUAGES: Array<{ code: Lang; flag: string; name: string }> = [
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
];

/**
 * Language selector dropdown — shows the current language flag + name + ▾.
 * Clicking opens a small menu to switch between zh and en.
 */
export function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(code: Lang) {
    setLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="font-medium">{current.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1 w-40 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#111]/95 backdrop-blur-xl shadow-xl z-50"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === i18n.language}
              onClick={() => select(lang.code)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/8 ${
                lang.code === i18n.language ? 'text-white font-semibold' : 'text-white/60'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
