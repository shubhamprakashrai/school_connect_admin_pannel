/**
 * Account dropdown — replaces the inline username + logout in the topbar.
 * Shows the user's identity and links to profile / change password / logout.
 *
 * `personaPath` lets the parent portal reuse the menu with /parent/* links.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, KeyRound, LogOut, ShieldCheck, User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  personaPath?: 'dashboard' | 'parent' | 'student';
  onLogout: () => void;
}

export default function AccountMenu({ personaPath = 'dashboard', onLogout }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
      (user.username?.[0] || 'U').toUpperCase()
    : 'U';
  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
    : 'Account';
  const avatarGrad = personaPath === 'parent'
    ? 'from-pink-500 via-rose-500 to-amber-500'
    : personaPath === 'student'
      ? 'from-cyan-500 via-emerald-500 to-amber-500'
      : 'from-brand-500 via-accent-violet to-accent-pink';
  const basePath = personaPath === 'parent' ? '/parent'
    : personaPath === 'student' ? '/student'
    : '/dashboard';
  const profilePath = `${basePath}/profile`;
  const changePwPath = `${basePath}/change-password`;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="hidden md:flex flex-col items-end leading-tight pr-1">
          <span className="text-sm font-semibold text-ink-900 dark:text-slate-100 max-w-[140px] truncate">
            {fullName}
          </span>
          <span className="text-[11px] text-ink-300 dark:text-slate-500 uppercase tracking-wider">
            {user?.role || 'User'}
          </span>
        </div>
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad} text-white text-sm font-semibold flex items-center justify-center shadow-glow-brand`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-300 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={popRef}
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad} text-white text-sm font-semibold flex items-center justify-center`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink-900 dark:text-slate-100 truncate">
                {fullName}
              </div>
              <div className="text-xs text-ink-500 dark:text-slate-400 truncate">
                {user?.email || '—'}
              </div>
              {user?.tenantId && (
                <div className="text-[10px] text-ink-300 dark:text-slate-500 font-mono truncate mt-0.5">
                  Tenant · {user.tenantId}
                </div>
              )}
            </div>
          </div>

          <div className="py-1">
            <MenuLink to={profilePath} icon={UserIcon} label="My profile" onClick={() => setOpen(false)} />
            <MenuLink to={changePwPath} icon={KeyRound} label="Change password" onClick={() => setOpen(false)} />
            {user?.emailVerified === false && (
              <MenuLink to="/verify-email" icon={ShieldCheck} label="Verify email" onClick={() => setOpen(false)} />
            )}
          </div>

          <div className="py-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              role="menuitem"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuLinkProps {
  to: string;
  icon: typeof UserIcon;
  label: string;
  onClick: () => void;
}

function MenuLink({ to, icon: Icon, label, onClick }: MenuLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
    >
      <Icon className="w-4 h-4 text-ink-500 dark:text-slate-400" />
      {label}
    </Link>
  );
}
