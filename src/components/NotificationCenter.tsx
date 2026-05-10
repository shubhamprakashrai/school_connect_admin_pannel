/**
 * Notification center — slide-in drawer triggered by the top-bar bell.
 *
 * Storage-only for now: items are persisted to localStorage so they
 * survive a refresh. When a real backend channel exists (SSE/WebSocket
 * via NotificationService), wire `addNotification` from there.
 *
 * Public API:
 *   - <NotificationCenter />     (mounted globally, listens for events)
 *   - dispatchNotification(...)  (anywhere in the app)
 *   - useUnreadCount()           (hook for badges)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Bell, BellOff, CheckCircle, Info, Trash2, X,
} from 'lucide-react';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  level: NotificationLevel;
  title: string;
  body?: string;
  createdAt: number; // epoch ms
  read: boolean;
  to?: string;
}

const STORAGE_KEY = 'sc_notifications';
const TOGGLE_EVENT = 'notifications:toggle';
const PUSH_EVENT   = 'notifications:push';

function readStored(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeStored(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

/** Programmatically add a notification from anywhere. */
export function dispatchNotification(n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
  const item: NotificationItem = {
    ...n,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    read: false,
  };
  window.dispatchEvent(new CustomEvent(PUSH_EVENT, { detail: item }));
}

/** Open/close the notification panel from anywhere. */
export function toggleNotifications() {
  window.dispatchEvent(new CustomEvent(TOGGLE_EVENT));
}

/** Hook to badge the bell with unread count. */
export function useUnreadCount(): number {
  const [items, setItems] = useState<NotificationItem[]>(() => readStored());
  useEffect(() => {
    const refresh = () => setItems(readStored());
    window.addEventListener(PUSH_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PUSH_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return useMemo(() => items.filter((i) => !i.read).length, [items]);
}

const LEVEL_ICON = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error:   AlertTriangle,
};

const LEVEL_COLOR: Record<NotificationLevel, string> = {
  info:    'text-brand-600 bg-brand-100 dark:bg-brand-500/20',
  success: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20',
  warning: 'text-amber-600 bg-amber-100 dark:bg-amber-500/20',
  error:   'text-rose-600 bg-rose-100 dark:bg-rose-500/20',
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(() => readStored());

  // Subscribe to global events
  useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    const onPush = (e: Event) => {
      const item = (e as CustomEvent<NotificationItem>).detail;
      setItems((prev) => {
        const next = [item, ...prev].slice(0, 50);
        writeStored(next);
        return next;
      });
    };
    const onServerError = (e: Event) => {
      const detail = (e as CustomEvent<{ status: number; path?: string; message?: string }>).detail;
      dispatchNotification({
        level: 'error',
        title: `Server error · ${detail.status}`,
        body: detail.message || `${detail.path || 'API'} couldn't be reached after retries.`,
      });
    };
    window.addEventListener(TOGGLE_EVENT, onToggle);
    window.addEventListener(PUSH_EVENT, onPush);
    window.addEventListener('api:server-error', onServerError);
    return () => {
      window.removeEventListener(TOGGLE_EVENT, onToggle);
      window.removeEventListener(PUSH_EVENT, onPush);
      window.removeEventListener('api:server-error', onServerError);
    };
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((i) => ({ ...i, read: true }));
      writeStored(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    writeStored([]);
  }, []);

  const removeOne = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      writeStored(next);
      return next;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, read: true } : i);
      writeStored(next);
      return next;
    });
  }, []);

  if (typeof document === 'undefined') return null;

  const unread = items.filter((i) => !i.read).length;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 bottom-0 z-[60] w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Notifications"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-ink-900 dark:text-slate-100">Notifications</div>
                  <div className="text-[11px] text-ink-500 dark:text-slate-400">
                    {unread > 0 ? `${unread} unread` : 'All caught up'}
                  </div>
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

            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={markAllRead}
                disabled={unread === 0}
                className="text-xs text-brand-600 dark:text-brand-300 disabled:opacity-40 hover:underline"
              >
                Mark all read
              </button>
              <span className="text-ink-300 dark:text-slate-600">·</span>
              <button
                onClick={clearAll}
                disabled={items.length === 0}
                className="text-xs text-rose-500 disabled:opacity-40 hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                  <BellOff className="w-10 h-10 text-ink-300 dark:text-slate-600 mb-3" />
                  <div className="text-sm font-medium text-ink-900 dark:text-slate-100">
                    No notifications
                  </div>
                  <p className="text-xs text-ink-500 dark:text-slate-400 mt-1 max-w-xs">
                    System alerts and announcements will appear here.
                  </p>
                </div>
              ) : (
                <ul className="py-1">
                  {items.map((n) => {
                    const Icon = LEVEL_ICON[n.level];
                    return (
                      <li key={n.id}
                        className={`group relative flex gap-3 px-5 py-3 border-b border-slate-50 dark:border-slate-800/60 transition-colors ${
                          !n.read ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${LEVEL_COLOR[n.level]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0"
                          onClick={() => markRead(n.id)}>
                          <div className="text-sm font-medium text-ink-900 dark:text-slate-100">
                            {n.title}
                            {!n.read && (
                              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-brand-500 align-middle" />
                            )}
                          </div>
                          {n.body && (
                            <div className="text-xs text-ink-500 dark:text-slate-400 mt-0.5">
                              {n.body}
                            </div>
                          )}
                          <div className="text-[10px] text-ink-300 dark:text-slate-500 mt-1">
                            {timeAgo(n.createdAt)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeOne(n.id)}
                          className="opacity-0 group-hover:opacity-100 text-ink-300 dark:text-slate-500 hover:text-rose-500 transition flex-shrink-0"
                          aria-label="Dismiss"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60)   return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}
