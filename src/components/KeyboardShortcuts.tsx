/**
 * Keyboard shortcuts help dialog. Press `?` (or Shift+/) anywhere to open.
 * Lists known shortcuts grouped by area.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

interface Group {
  name: string;
  items: Shortcut[];
}

const GROUPS: Group[] = [
  {
    name: 'Global',
    items: [
      { keys: ['⌘', 'K'],         description: 'Open command palette' },
      { keys: ['Ctrl', 'K'],      description: 'Open command palette (Win/Linux)' },
      { keys: ['?'],              description: 'Show this dialog' },
      { keys: ['Esc'],            description: 'Close any dialog or panel' },
    ],
  },
  {
    name: 'Navigation',
    items: [
      { keys: ['G', 'D'],         description: 'Go to Dashboard' },
      { keys: ['G', 'S'],         description: 'Go to Students' },
      { keys: ['G', 'T'],         description: 'Go to Teachers' },
      { keys: ['G', 'C'],         description: 'Go to Classes' },
      { keys: ['G', 'A'],         description: 'Go to Attendance' },
    ],
  },
  {
    name: 'Lists',
    items: [
      { keys: ['/'],              description: 'Focus the search field' },
      { keys: ['↑', '↓'],         description: 'Move selection in palette / lists' },
      { keys: ['Enter'],          description: 'Open the selected item' },
    ],
  },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // `?` is Shift+/ on most keyboards.
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField = tag === 'input' || tag === 'textarea' ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (e.key === '?' && !inField) { e.preventDefault(); setOpen(true); return; }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Simple "G then X" navigator.
  useEffect(() => {
    let g = false;
    let timer: number | null = null;
    const navTo = (path: string) => { window.location.assign(path); };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' ||
          (e.target as HTMLElement | null)?.isContentEditable) return;

      if (g) {
        switch (e.key.toLowerCase()) {
          case 'd': navTo('/dashboard'); break;
          case 's': navTo('/dashboard/students'); break;
          case 't': navTo('/dashboard/teachers'); break;
          case 'c': navTo('/dashboard/classes'); break;
          case 'a': navTo('/dashboard/attendance'); break;
        }
        g = false;
        if (timer) window.clearTimeout(timer);
        return;
      }
      if (e.key.toLowerCase() === 'g') {
        g = true;
        timer = window.setTimeout(() => { g = false; }, 1200);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 16, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            role="dialog" aria-label="Keyboard shortcuts"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-ink-900 dark:text-slate-100">Keyboard shortcuts</div>
                  <div className="text-[11px] text-ink-500 dark:text-slate-400">Press ? to reopen</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </header>
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
              {GROUPS.map((g) => (
                <div key={g.name}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-300 dark:text-slate-500 mb-2">
                    {g.name}
                  </div>
                  <ul className="space-y-1.5">
                    {g.items.map((s) => (
                      <li key={s.description} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink-700 dark:text-slate-200">{s.description}</span>
                        <span className="flex items-center gap-1">
                          {s.keys.map((k, i) => (
                            <span key={i}>
                              {i > 0 && <span className="text-ink-300 dark:text-slate-500 mx-0.5 text-xs">then</span>}
                              <kbd className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-ink-700 dark:text-slate-300">
                                {k}
                              </kbd>
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
