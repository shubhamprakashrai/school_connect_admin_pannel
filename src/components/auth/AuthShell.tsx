/**
 * Shared visual shell for auth pages — gradient hero on the left,
 * form panel on the right (stacked on mobile).
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Footer link, e.g. "Remembered your password? Sign in" */
  footer?: ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden flex-1 bg-brand-gradient text-white p-12">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob [animation-delay:6s]" />
        <div className="absolute inset-0 bg-grid-light opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">
            SC
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold font-display">School Connect</div>
            <div className="text-[11px] uppercase tracking-wider text-white/70">
              Admin Console
            </div>
          </div>
        </Link>

        <div className="relative z-10 max-w-md">
          <GraduationCap className="w-10 h-10 mb-4" />
          <h2 className="text-3xl font-bold font-display leading-tight">
            The school OS your team will love.
          </h2>
          <p className="text-white/80 mt-3 text-sm leading-relaxed">
            Students, teachers, attendance, exams, calendar — one platform for the
            entire school. Trusted by 500+ institutions.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} School Connect · Secure auth · ISO 27001
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-bold text-sm shadow-glow-brand">
              SC
            </div>
            <span className="text-base font-bold text-ink-900 dark:text-slate-100 font-display">
              School Connect
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-ink-900 dark:text-slate-100 font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-500 dark:text-slate-400 mt-1.5">{subtitle}</p>
          )}

          <div className="mt-6">{children}</div>

          {footer && (
            <div className="mt-6 text-sm text-ink-500 dark:text-slate-400 text-center">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
