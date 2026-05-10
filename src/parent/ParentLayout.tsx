/**
 * Parent portal layout — own sidebar + topbar.
 * Sits under `/parent/*` and is gated to users with the PARENT role.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Heart, Home, Bell, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageToggle from '../components/ui/LanguageToggle';
import AccountMenu from '../components/ui/AccountMenu';

interface ParentNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const NAV: ParentNavItem[] = [
  { to: '/parent',          label: 'Overview', icon: <Home className="w-5 h-5" />, end: true },
  { to: '/parent/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
  { to: '/parent/notices',  label: 'Notices',  icon: <Bell className="w-5 h-5" /> },
  { to: '/parent/profile',  label: 'My profile', icon: <User className="w-5 h-5" /> },
];

export default function ParentLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 relative">
      {/* mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${drawerOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}
      >
        <div className="h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-amber-500/10 pointer-events-none" />
          {/* Brand */}
          <div className="relative flex items-center justify-between gap-2 h-16 px-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-glow-pink font-bold text-sm">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-bold text-ink-900 dark:text-slate-100 font-display">School Connect</div>
                <div className="text-[10px] text-ink-300 dark:text-slate-500 uppercase tracking-wider">Parent portal</div>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden p-1 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="relative flex-1 px-3 py-4 overflow-y-auto">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-300 dark:text-slate-500 px-3 mb-2">
              Main
            </div>
            <ul className="space-y-0.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-glow-pink'
                          : 'text-ink-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-ink-900 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`mr-3 ${isActive ? 'text-white' : 'text-ink-500 dark:text-slate-400'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="relative p-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => logout()}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${drawerOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Topbar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-20 sticky top-0">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <AccountMenu personaPath="parent" onLogout={() => logout()} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950 text-ink-900 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
