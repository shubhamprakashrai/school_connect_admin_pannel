/**
 * Sidebar usage widget — compact view of current tenant's student/teacher/storage usage.
 * Pulls /tenants/current once on mount; silent on failure (e.g. for super-admin).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { tenantService } from '../../services/tenant.service';
import type { TenantResponse } from '../../types/tenant';

function pct(curr: number, max: number) {
  if (!max) return 0;
  return Math.min(100, Math.round((curr / max) * 100));
}

function tone(p: number) {
  return p > 90 ? '#ef4444' : p > 75 ? '#f59e0b' : '#2563eb';
}

export default function UsageWidget() {
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    tenantService.current()
      .then((t) => { setTenant(t); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || !tenant?.limits) return null;
  const { currentStudents = 0, maxStudents = 0,
    currentTeachers = 0, maxTeachers = 0,
    currentStorageMb = 0, maxStorageGb = 0 } = tenant.limits;

  const sPct = pct(currentStudents, maxStudents);
  const tPct = pct(currentTeachers, maxTeachers);
  const stPct = pct(currentStorageMb / 1024, maxStorageGb);

  return (
    <Link
      to="/dashboard/tenant"
      className="block mx-3 mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3.5 h-3.5 text-ink-400 dark:text-slate-500" />
        <span className="text-[10px] uppercase tracking-widest text-ink-300 dark:text-slate-500 font-semibold">
          Usage
        </span>
        <span className="ml-auto text-[10px] text-brand-600 dark:text-brand-300 group-hover:underline">
          View
        </span>
      </div>
      <UsageRow label="Students" current={currentStudents} max={maxStudents} pct={sPct} />
      <UsageRow label="Teachers" current={currentTeachers} max={maxTeachers} pct={tPct} />
      <UsageRow
        label="Storage"
        current={Math.round(currentStorageMb / 1024)}
        max={maxStorageGb}
        pct={stPct}
        suffix="GB"
      />
    </Link>
  );
}

function UsageRow({ label, current, max, pct: p, suffix }: {
  label: string; current: number; max: number; pct: number; suffix?: string;
}) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="flex justify-between text-[10px] text-ink-500 dark:text-slate-400 mb-0.5">
        <span>{label}</span>
        <span>{current}{suffix ? ` ${suffix}` : ''} / {max || '—'}{suffix ? ` ${suffix}` : ''}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, background: tone(p) }}
        />
      </div>
    </div>
  );
}
