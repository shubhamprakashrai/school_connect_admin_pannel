/**
 * Dashboard usage panel — 3 horizontal usage bars (students, teachers, storage)
 * with current/max + percent. Clicks through to tenant settings.
 *
 * Used at the top of the admin dashboard. Replaces the older sidebar widget.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, HardDrive, Users } from 'lucide-react';
import { tenantService } from '../../services/tenant.service';
import type { TenantResponse } from '../../types/tenant';

function pct(curr: number, max: number) {
  if (!max) return 0;
  return Math.min(100, Math.round((curr / max) * 100));
}

function tone(p: number) {
  return p > 90 ? '#ef4444' : p > 75 ? '#f59e0b' : '#2563eb';
}

interface BarProps {
  icon: typeof Users;
  label: string;
  current: number;
  max: number;
  suffix?: string;
}

function Bar({ icon: Icon, label, current, max, suffix }: BarProps) {
  const p = pct(current, max);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-ink-700 dark:text-slate-200">
          <Icon className="w-4 h-4 text-ink-400 dark:text-slate-500" />
          <span>{label}</span>
        </div>
        <span className="text-xs text-ink-500 dark:text-slate-400">
          <span className="font-semibold text-ink-900 dark:text-slate-100">{current}{suffix ? ` ${suffix}` : ''}</span>
          {' '} / {max || '—'}{suffix ? ` ${suffix}` : ''}
        </span>
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

export default function UsagePanel() {
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    tenantService.current()
      .then((t) => { setTenant(t); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || !tenant?.limits) return null;
  const {
    currentStudents = 0, maxStudents = 0,
    currentTeachers = 0, maxTeachers = 0,
    currentStorageMb = 0, maxStorageGb = 0,
  } = tenant.limits;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-ink-900 dark:text-slate-100">Plan usage</div>
          <div className="text-xs text-ink-500 dark:text-slate-400">
            {tenant.name} · {tenant.subscriptionPlan}
          </div>
        </div>
        <Link
          to="/dashboard/tenant"
          className="text-xs font-medium text-brand-600 dark:text-brand-300 hover:underline inline-flex items-center gap-0.5"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <Bar icon={GraduationCap} label="Students"     current={currentStudents}                       max={maxStudents} />
        <Bar icon={Users}         label="Teachers"     current={currentTeachers}                       max={maxTeachers} />
        <Bar icon={HardDrive}     label="Storage"      current={Math.round((currentStorageMb / 1024) * 10) / 10} max={maxStorageGb} suffix="GB" />
      </div>
    </div>
  );
}
