/**
 * Theme toggle — 3-mode switch (light / dark / system).
 * Used in the dashboard top bar.
 */

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../contexts/ThemeContext';

const MODES: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: 'light',  icon: Sun,     label: 'Light theme' },
  { value: 'system', icon: Monitor, label: 'System theme' },
  { value: 'dark',   icon: Moon,    label: 'Dark theme' },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700"
    >
      {MODES.map(({ value, icon: Icon, label }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setMode(value)}
            className={`p-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
              active
                ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                : 'text-ink-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
