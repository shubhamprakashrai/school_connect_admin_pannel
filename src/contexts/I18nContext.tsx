/**
 * Lightweight i18n. No external dependency.
 *
 * - `useT()` returns `t(key)` where key is dotted, e.g. `t('nav.students')`.
 * - Falls back from active locale → English → the key itself.
 * - Locale persists in localStorage; defaults to browser language ('hi' if
 *   the user prefers Hindi, otherwise 'en').
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { translations, type Dictionary, type Locale } from '../i18n/translations';

const STORAGE_KEY = 'sc_locale';

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  available: Locale[];
}

const I18nContext = createContext<I18nValue | null>(null);

function detectInitial(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'hi') return stored;
  return navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

function get(dict: Dictionary, key: string): string | undefined {
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitial());

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string) => get(translations[locale] as Dictionary, key)
      ?? get(translations.en, key)
      ?? key,
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t, available: ['en', 'hi'] }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used inside <I18nProvider>');
  return ctx;
}
