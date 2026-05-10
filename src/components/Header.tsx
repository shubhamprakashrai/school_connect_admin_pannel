/**
 * Public landing header.
 * - Frosted glass after a small scroll, transparent at top.
 * - Mobile drawer on <md.
 * - Sign in / Get started CTAs.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
];

export default function Header({ onLoginClick, isAuthenticated, onLogout }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock scroll while drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0)',
          borderBottomColor: scrolled ? 'rgba(15,23,42,0.06)' : 'rgba(15,23,42,0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 inset-x-0 z-40 border-b"
        style={{ WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)' }}
      >
        <div className="container mx-auto px-6">
          <div className={`flex items-center justify-between transition-all ${scrolled ? 'h-16' : 'h-20'}`}>
            {/* Brand */}
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-bold text-sm shadow-glow-brand group-hover:opacity-90 transition">
                SC
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-base font-bold text-ink-900 font-display">School Connect</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-400">School OS</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition"
                >
                  {n.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={onLogout}
                  className="text-sm font-medium text-ink-700 hover:text-ink-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    className="text-sm font-medium text-ink-700 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                  >
                    Sign in
                  </button>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition text-sm"
                  >
                    Get started <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile trigger */}
            <button
              className="md:hidden p-2 rounded-lg text-ink-700 hover:bg-slate-100 transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
                <span className="font-bold text-ink-900 font-display">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 overflow-y-auto">
                {NAV.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-ink-700 rounded-lg hover:bg-slate-50"
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-100 space-y-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMobileOpen(false); onLogout(); }}
                    className="w-full py-2.5 rounded-lg border border-slate-200 text-ink-700 font-semibold"
                  >
                    Sign out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); onLoginClick(); }}
                      className="w-full py-2.5 rounded-lg border border-slate-200 text-ink-700 font-semibold"
                    >
                      Sign in
                    </button>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center w-full py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
