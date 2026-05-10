/**
 * Cmd/Ctrl+K command palette.
 *
 * - Global keyboard shortcut: Cmd+K (mac) / Ctrl+K (other).
 * - Listens to a `command-palette:open` window event so any UI button can trigger it.
 * - Fuzzy-matches navigation commands; arrow keys + Enter to navigate.
 * - Recently visited items appear at the top when the query is empty.
 */

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowRight, GraduationCap, Users, BookOpen, Calendar, Settings,
  School, ClipboardCheck, FileSpreadsheet, CalendarRange, Clock, BookMarked,
  Library, Heart, Shield, UserCog, Building2, Network,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: 'Navigate' | 'Actions';
  to: string;
  icon: typeof Search;
  keywords?: string[];
}

const COMMANDS: Command[] = [
  // Navigation
  { id: 'dashboard',        group: 'Navigate', label: 'Dashboard',        to: '/dashboard',                  icon: BookOpen,        keywords: ['home', 'overview'] },
  { id: 'schools',          group: 'Navigate', label: 'Schools',          to: '/dashboard/schools',           icon: School,          keywords: ['tenants', 'orgs'] },
  { id: 'students',         group: 'Navigate', label: 'Students',         to: '/dashboard/students',          icon: GraduationCap,   keywords: ['pupils', 'kids'] },
  { id: 'teachers',         group: 'Navigate', label: 'Teachers',         to: '/dashboard/teachers',          icon: Users,           keywords: ['staff'] },
  { id: 'classes',          group: 'Navigate', label: 'Classes',          to: '/dashboard/classes',           icon: BookMarked,      keywords: ['grades', 'sections'] },
  { id: 'subjects',         group: 'Navigate', label: 'Subjects',         to: '/dashboard/subjects',          icon: Library,     keywords: ['courses'] },
  { id: 'attendance',       group: 'Navigate', label: 'Attendance',       to: '/dashboard/attendance',        icon: ClipboardCheck,  keywords: ['present', 'absent'] },
  { id: 'calendar',         group: 'Navigate', label: 'Calendar',         to: '/dashboard/calendar',          icon: Calendar,        keywords: ['events', 'holidays'] },
  { id: 'academic-years',   group: 'Navigate', label: 'Academic years',   to: '/dashboard/academic-years',    icon: CalendarRange,   keywords: ['session'] },
  { id: 'parents',          group: 'Navigate', label: 'Parents',          to: '/dashboard/parents',           icon: Heart,           keywords: ['guardians', 'family'] },
  { id: 'admins',           group: 'Navigate', label: 'Admins',           to: '/dashboard/admins',            icon: Shield,          keywords: ['administrators'] },
  { id: 'users',            group: 'Navigate', label: 'Users',            to: '/dashboard/users',             icon: UserCog,         keywords: ['accounts', 'roles'] },
  { id: 'class-teachers',   group: 'Navigate', label: 'Class teachers',   to: '/dashboard/class-teachers',    icon: Users,           keywords: ['homeroom'] },
  { id: 'assignments',      group: 'Navigate', label: 'Teacher assignments', to: '/dashboard/teacher-assignments', icon: Network,    keywords: ['subject mapping'] },
  { id: 'tenant',           group: 'Navigate', label: 'School settings',  to: '/dashboard/tenant',            icon: Building2,       keywords: ['organization', 'tenant'] },
  { id: 'profile',          group: 'Navigate', label: 'My profile',       to: '/dashboard/profile',           icon: UserCog,         keywords: ['account', 'me'] },
  { id: 'settings',         group: 'Navigate', label: 'Settings',         to: '/dashboard/settings',          icon: Settings,        keywords: ['config', 'preferences'] },

  // Quick actions
  { id: 'add-school',       group: 'Actions', label: 'Add school',        hint: 'New tenant',           to: '/dashboard/schools/add',         icon: School },
  { id: 'add-student',      group: 'Actions', label: 'Enroll student',    hint: 'Single record',        to: '/dashboard/students/add',        icon: GraduationCap },
  { id: 'bulk-students',    group: 'Actions', label: 'Bulk import students', hint: 'CSV upload',        to: '/dashboard/students/bulk-import', icon: FileSpreadsheet },
  { id: 'add-teacher',      group: 'Actions', label: 'Add teacher',       hint: 'Onboard',              to: '/dashboard/teachers/add',        icon: Users },
  { id: 'mark-attendance',  group: 'Actions', label: 'Mark attendance',   hint: 'Today',                to: '/dashboard/attendance/mark',     icon: ClipboardCheck },
  { id: 'add-class',        group: 'Actions', label: 'Add class',         hint: 'New class',            to: '/dashboard/classes/add',         icon: BookMarked },
  { id: 'add-subject',      group: 'Actions', label: 'Add subject',       hint: 'Curriculum',           to: '/dashboard/subjects/add',        icon: Library },
  { id: 'bulk-subjects',    group: 'Actions', label: 'Bulk import subjects', hint: 'CSV upload',        to: '/dashboard/subjects/bulk-import', icon: FileSpreadsheet },
  { id: 'teacher-attendance', group: 'Actions', label: 'Mark teacher attendance', hint: 'Bulk', to: '/dashboard/teachers/attendance',  icon: ClipboardCheck },
];

const RECENT_KEY = 'sc_palette_recent';
const RECENT_LIMIT = 4;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, RECENT_LIMIT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function score(cmd: Command, q: string): number {
  if (!q) return 0;
  const lq = q.toLowerCase();
  const haystack = `${cmd.label} ${cmd.hint || ''} ${(cmd.keywords || []).join(' ')}`.toLowerCase();
  if (haystack.startsWith(lq)) return 100;
  if (cmd.label.toLowerCase().includes(lq)) return 60;
  if (haystack.includes(lq)) return 30;
  // Fuzzy: every char of q appears in order in label
  let i = 0;
  for (const ch of cmd.label.toLowerCase()) {
    if (ch === lq[i]) i += 1;
    if (i === lq.length) return 10;
  }
  return -1;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global shortcut + custom event hook
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isPaletteShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isPaletteShortcut) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onCustom = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('command-palette:open', onCustom);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('command-palette:open', onCustom);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      const recentIds = readRecent();
      const recents = recentIds
        .map((id) => COMMANDS.find((c) => c.id === id))
        .filter(Boolean) as Command[];
      const rest = COMMANDS.filter((c) => !recentIds.includes(c.id));
      return [
        ...(recents.length ? [{ heading: 'Recent', items: recents }] : []),
        { heading: 'Navigate', items: rest.filter((c) => c.group === 'Navigate') },
        { heading: 'Actions',  items: rest.filter((c) => c.group === 'Actions') },
      ];
    }
    const ranked = COMMANDS
      .map((c) => ({ c, s: score(c, query) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
    return [{ heading: 'Results', items: ranked }];
  }, [query]);

  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);
  useEffect(() => { setActiveIdx(0); }, [query]);

  const run = useCallback((cmd: Command) => {
    pushRecent(cmd.id);
    setOpen(false);
    navigate(cmd.to);
  }, [navigate]);

  const onKeyNav = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = flat[activeIdx];
      if (cmd) run(cmd);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -8, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-ink-300 dark:text-slate-500 mr-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyNav}
                placeholder="Search pages and actions…"
                className="flex-1 bg-transparent border-0 outline-none text-ink-900 dark:text-slate-100 placeholder:text-ink-300 dark:placeholder:text-slate-500"
              />
              <kbd className="ml-2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-ink-500 dark:text-slate-400">
                ESC
              </kbd>
            </div>
            <div className="max-h-[55vh] overflow-y-auto py-2">
              {flat.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-ink-500 dark:text-slate-400">
                  No matches for "{query}"
                </div>
              ) : (
                filtered.map((g) => (
                  <div key={g.heading}>
                    <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-ink-300 dark:text-slate-500 font-semibold">
                      {g.heading === 'Recent' ? <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Recent</span> : g.heading}
                    </div>
                    {g.items.map((cmd) => {
                      const idx = flat.indexOf(cmd);
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={cmd.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => run(cmd)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                            active
                              ? 'bg-brand-gradient text-white'
                              : 'text-ink-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <cmd.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 text-sm">{cmd.label}</span>
                          {cmd.hint && (
                            <span className={`text-xs ${active ? 'text-white/80' : 'text-ink-300 dark:text-slate-500'}`}>
                              {cmd.hint}
                            </span>
                          )}
                          {active && <ArrowRight className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-ink-300 dark:text-slate-500 flex items-center justify-between">
              <span>↑↓ navigate · ↵ open</span>
              <span>School Connect · ⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
