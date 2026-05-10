/** Compact language switcher — EN ⇄ हि. */

import { Languages } from 'lucide-react';
import { useT } from '../../contexts/I18nContext';

export default function LanguageToggle() {
  const { locale, setLocale, available } = useT();
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className="hidden sm:inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700"
    >
      <Languages className="w-4 h-4 ml-2 mr-1 text-ink-500 dark:text-slate-400" />
      {available.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={l === 'en' ? 'English' : 'हिंदी'}
            onClick={() => setLocale(l)}
            className={`px-2 py-1 rounded-full text-xs font-semibold uppercase transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
              active
                ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                : 'text-ink-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200'
            }`}
          >
            {l === 'en' ? 'EN' : 'हि'}
          </button>
        );
      })}
    </div>
  );
}
