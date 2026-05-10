/**
 * `useState` that persists to localStorage under a stable key.
 *
 *   const [filter, setFilter] = usePersistedState('students.filter', { class: 'ALL' });
 *
 * - Reads the stored value on first render (typed via the initial value).
 * - Writes back on every change (sync — fine for small filter objects).
 * - Survives reloads, dev-mode HMR, and tab switches.
 */

import { useEffect, useRef, useState } from 'react';

export default function usePersistedState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  // Skip the first write so we don't overwrite a freshly-read value.
  const skipFirstWrite = useRef(true);
  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled — silent.
    }
  }, [key, value]);

  return [value, setValue];
}
