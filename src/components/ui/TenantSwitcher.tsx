/**
 * Tenant switcher — only mounted for users with the SUPERADMIN role.
 * Lets a super-admin scope subsequent API calls to a chosen tenant by
 * updating the TenantContext (the axios interceptor reads it).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import superAdminTenantService from '../../services/superAdminTenant.service';
import type { TenantResponse } from '../../types/tenant';

export default function TenantSwitcher() {
  const { hasRole } = useAuth();
  const { tenantId, setTenantId } = useTenant();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Only super-admins see this widget at all.
  const isSuper = hasRole('SUPERADMIN', 'SUPER_ADMIN');

  // Lazy-load the tenant list the first time the menu opens.
  useEffect(() => {
    if (!open || !isSuper || tenants.length > 0) return;
    setLoading(true);
    superAdminTenantService.list({ size: 100 })
      .then((res) => setTenants(res?.content || []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, [open, isSuper, tenants.length]);

  // Close on outside click / Esc
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

  const filtered = useMemo(() => {
    if (!query.trim()) return tenants;
    const q = query.toLowerCase();
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) ||
             t.subdomain?.toLowerCase().includes(q),
    );
  }, [tenants, query]);

  const current = tenants.find((t) => t.id === tenantId || t.identifier === tenantId);
  const label = current?.name ?? (tenantId === 'default' ? 'All tenants' : tenantId);

  if (!isSuper) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm text-ink-700 dark:text-slate-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Building2 className="w-4 h-4 text-brand-600" />
        <span className="font-medium truncate max-w-[160px]">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-300 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden"
          role="listbox"
        >
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-300 dark:text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tenant…"
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-ink-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {/* Default / "All" option */}
            <button
              onClick={() => { setTenantId('default'); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                tenantId === 'default'
                  ? 'bg-brand-gradient text-white'
                  : 'text-ink-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="flex-1">All tenants <span className="text-[10px] opacity-70 ml-1">(default)</span></span>
              {tenantId === 'default' && <Check className="w-4 h-4" />}
            </button>

            {loading ? (
              <div className="px-3 py-4 text-xs text-ink-300 dark:text-slate-500 text-center">
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-ink-300 dark:text-slate-500 text-center">
                {query ? `No tenants match "${query}"` : 'No tenants yet'}
              </div>
            ) : (
              filtered.map((t) => {
                const active = t.id === tenantId || t.identifier === tenantId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      // Backend usually expects the identifier (slug) in X-Tenant-ID,
                      // not the UUID. Prefer `identifier`, fall back to id.
                      setTenantId(t.identifier || t.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                      active
                        ? 'bg-brand-gradient text-white'
                        : 'text-ink-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                    }`}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{t.name}</div>
                      <div className={`text-[10px] truncate ${active ? 'text-white/70' : 'text-ink-300 dark:text-slate-500'} font-mono`}>
                        {t.subdomain}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-ink-300 dark:text-slate-500">
            Switching scopes the next API call only for super-admins.
          </div>
        </div>
      )}
    </div>
  );
}
