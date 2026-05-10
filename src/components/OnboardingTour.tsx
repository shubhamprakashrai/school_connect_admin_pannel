/**
 * Welcome / onboarding tour shown the first time a user lands on the
 * dashboard. Full-screen modal, 4 slides, dismissable, persisted in
 * localStorage so it never re-appears for the same user.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, X,
  GraduationCap, ClipboardCheck, FileSpreadsheet, Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY_PREFIX = 'sc_onboarded_';

type Slide = {
  icon: typeof Sparkles;
  title: string;
  body: string;
  accent: string;
};

const SLIDES: Slide[] = [
  {
    icon: Sparkles,
    title: 'Welcome to School Connect',
    body: 'You\'re all set up. Let\'s do a 30-second tour so you know where the most-used tools live.',
    accent: 'from-brand-500 to-accent-cyan',
  },
  {
    icon: GraduationCap,
    title: 'Bring in your students',
    body: 'Add students one-by-one or upload a CSV with thousands of rows. Validation runs before anything is saved.',
    accent: 'from-accent-violet to-accent-pink',
  },
  {
    icon: ClipboardCheck,
    title: 'Mark attendance in seconds',
    body: 'Pick a class, the roster loads, toggle anyone who\'s not present. "All present" handles the common case in one click.',
    accent: 'from-emerald-500 to-accent-cyan',
  },
  {
    icon: Users,
    title: 'Search anything with ⌘K',
    body: 'Press ⌘K (or Ctrl+K) anywhere in the app to jump to a page or trigger an action. The bell icon collects notifications.',
    accent: 'from-amber-500 to-accent-pink',
  },
];

export default function OnboardingTour() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Show only once per user, gated by user id in localStorage.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    // Skip parents — they get a different layout.
    if (user.role && /^PARENT$/i.test(String(user.role))) return;
    const key = `${STORAGE_KEY_PREFIX}${user.id}`;
    if (localStorage.getItem(key)) return;
    // Slight delay so it feels intentional, not a flash on mount.
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [isAuthenticated, user]);

  const close = () => {
    if (user) localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, '1');
    setOpen(false);
  };

  const next = () => {
    if (step < SLIDES.length - 1) setStep((s) => s + 1);
    else close();
  };

  if (!isAuthenticated || !user) return null;

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog" aria-label="Welcome tour"
        >
          <motion.div
            initial={{ y: 16, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Hero band */}
            <div className={`relative h-32 bg-gradient-to-br ${slide.accent} overflow-hidden`}>
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/15 blur-3xl" />
              <button
                onClick={close}
                aria-label="Skip tour"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${slide.accent} text-white flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="px-6 pt-10 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <h2 className="text-xl font-bold text-ink-900 dark:text-slate-100 font-display">
                    {slide.title}
                  </h2>
                  <p className="text-sm text-ink-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {slide.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Footer / dots / actions */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((_, i) => (
                    <span
                      key={i}
                      className={`block h-1.5 rounded-full transition-all ${
                        i === step ? 'w-6 bg-brand-gradient' :
                        i < step ? 'w-1.5 bg-brand-300' :
                        'w-1.5 bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="p-1.5 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={close}
                    className="text-sm text-ink-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-100 px-2"
                  >
                    Skip
                  </button>
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition text-sm"
                  >
                    {step === SLIDES.length - 1 ? 'Get started' : 'Next'}
                    {step === SLIDES.length - 1
                      ? <ArrowRight className="w-3.5 h-3.5" />
                      : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
