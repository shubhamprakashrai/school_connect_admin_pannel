/**
 * Dashboard ops panel — fee collection + pending leave approvals at a glance.
 *
 * Both backends are currently stubs returning zero/empty until the fee and
 * leave domains are modelled. We render the cards anyway so the layout is
 * stable, and add a small "Coming soon" badge when figures are zero — that
 * way admins aren't confused about whether the data is missing or just absent.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, CalendarClock, Hourglass } from 'lucide-react';
import { feeService } from '../../services/fee.service';
import { leaveService } from '../../services/leave.service';
import { useT } from '../../contexts/I18nContext';
import type { CollectionReportResponse } from '../../types/fee';

function inr(n: number | undefined): string {
  if (typeof n !== 'number' || !isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function OperationsPanel() {
  const { t } = useT();
  const [report, setReport] = useState<CollectionReportResponse | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      feeService.collectionReport(),
      leaveService.pending(),
    ]).then(([feeRes, leaveRes]) => {
      if (!alive) return;
      if (feeRes.status === 'fulfilled') setReport(feeRes.value);
      if (leaveRes.status === 'fulfilled') setPendingLeaves(leaveRes.value.length);
      setLoaded(true);
    });
    return () => { alive = false; };
  }, []);

  if (!loaded) return null;
  const isStubFee = !report || (report.totalCollected === 0 && report.totalPending === 0 && report.overdueCount === 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        icon={Banknote}
        tint="emerald"
        label={t('ops.collectedThisPeriod')}
        value={inr(report?.totalCollected)}
        sub={isStubFee
          ? t('ops.modulePending')
          : t('ops.pendingAmount', { amount: inr(report?.totalPending) })}
        soonLabel={t('ops.soon')}
        to="/dashboard/tenant"
        showStub={isStubFee}
      />
      <Card
        icon={Hourglass}
        tint="amber"
        label={t('ops.overduePayments')}
        value={isStubFee ? '—' : String(report?.overdueCount ?? 0)}
        sub={report?.monthlyCollection
          ? t('ops.monthly', { amount: inr(report.monthlyCollection) })
          : t('ops.monthlyPending')}
        soonLabel={t('ops.soon')}
        to="/dashboard/tenant"
        showStub={isStubFee}
      />
      <Card
        icon={CalendarClock}
        tint="violet"
        label={t('ops.pendingLeaveRequests')}
        value={String(pendingLeaves)}
        sub={pendingLeaves === 0 ? t('ops.workflowPending') : t('ops.tapToReview')}
        soonLabel={t('ops.soon')}
        to="/dashboard/tenant"
        showStub={pendingLeaves === 0}
      />
    </div>
  );
}

interface CardProps {
  icon: typeof Banknote;
  tint: 'emerald' | 'amber' | 'violet';
  label: string;
  value: string;
  sub: string;
  to: string;
  showStub?: boolean;
  soonLabel: string;
}

const TINT: Record<CardProps['tint'], { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-300' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-300' },
  violet:  { bg: 'bg-violet-100 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-300' },
};

function Card({ icon: Icon, tint, label, value, sub, to, showStub, soonLabel }: CardProps) {
  const t = TINT[tint];
  return (
    <Link to={to}
      className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 hover:shadow-card-soft transition relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${t.bg} ${t.text} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {showStub && (
          <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-ink-500 dark:text-slate-400">
            {soonLabel}
          </span>
        )}
      </div>
      <div className="mt-3 text-sm text-ink-500 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 text-2xl font-bold text-ink-900 dark:text-slate-100 font-display">{value}</div>
      <div className="mt-1 text-xs text-ink-500 dark:text-slate-400 flex items-center gap-1">
        {sub}
        <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition" />
      </div>
    </Link>
  );
}
