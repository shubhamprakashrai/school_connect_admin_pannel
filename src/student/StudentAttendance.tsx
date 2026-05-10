/**
 * Student attendance — own attendance breakdown with period switcher,
 * donut, stat tiles, and day-by-day calendar grid.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { studentAttendanceService } from '../services/attendance.service';
import { PageSpinner } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import type { AttendanceSummaryResponse } from '../types/attendance';

type Period = 'week' | 'month' | 'quarter';
const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#a855f7', '#6366f1'];

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function rangeFor(p: Period) {
  const today = new Date();
  const days = p === 'week' ? 7 : p === 'month' ? 30 : 90;
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate: ymd(start), endDate: ymd(today) };
}

export default function StudentAttendance() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('month');
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    studentAttendanceService.studentSummary(user.id, rangeFor(period))
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [user, period]);

  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Present', value: summary.presentDays },
      { name: 'Absent',  value: summary.absentDays },
      { name: 'Late',    value: summary.lateDays },
      { name: 'Half',    value: summary.halfDays },
      { name: 'Leave',   value: summary.leaveDays },
    ].filter((s) => s.value > 0);
  }, [summary]);

  if (loading) return <PageSpinner />;
  if (!user) return <EmptyState title="Not signed in" />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-card-soft">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div>
            <div className="text-sm text-ink-500 dark:text-slate-400">My attendance</div>
            <div className="text-xl font-semibold text-ink-900 dark:text-slate-100 font-display">
              {summary
                ? `${summary.presentDays + summary.lateDays} of ${summary.totalWorkingDays} working days`
                : 'No data'}
            </div>
          </div>
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700">
            {(['week', 'month', 'quarter'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                    : 'text-ink-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {!summary ? (
          <div className="text-sm text-ink-300 dark:text-slate-500 py-8 text-center">
            No attendance recorded for this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <div className="h-48">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-ink-300 text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name"
                        innerRadius={42} outerRadius={64} paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="text-center text-3xl font-bold text-ink-900 dark:text-slate-100 font-display">
                {summary.attendancePercentage?.toFixed(1) ?? '0'}%
              </div>
              <div className="text-center text-xs text-ink-500 dark:text-slate-400">Overall</div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SummaryStat label="Present"   value={summary.presentDays}      accent="#10b981" />
              <SummaryStat label="Absent"    value={summary.absentDays}       accent="#ef4444" />
              <SummaryStat label="Late"      value={summary.lateDays}         accent="#f59e0b" />
              <SummaryStat label="Half day"  value={summary.halfDays}         accent="#06b6d4" />
              <SummaryStat label="Leave"     value={summary.leaveDays}        accent="#a855f7" />
              <SummaryStat label="Working"   value={summary.totalWorkingDays} accent="#6366f1" />
            </div>
          </div>
        )}
      </div>

      {/* Day-by-day */}
      {summary?.dailyBreakdown && Object.keys(summary.dailyBreakdown).length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
          <div className="text-sm text-ink-500 dark:text-slate-400 mb-1">Daily breakdown</div>
          <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display mb-3">
            Day-by-day
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(summary.dailyBreakdown).sort(([a], [b]) => a.localeCompare(b)).map(([date, status]) => (
              <div
                key={date}
                title={`${date} — ${status}`}
                className={`w-9 h-9 rounded-lg text-[10px] font-semibold flex flex-col items-center justify-center text-white ${
                  status === 'PRESENT' ? 'bg-emerald-500'
                  : status === 'ABSENT'  ? 'bg-rose-500'
                  : status === 'LATE'    ? 'bg-amber-500'
                  : status === 'HALF_DAY' ? 'bg-cyan-500'
                  : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span>{new Date(date).getDate()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="rounded-xl border border-slate-100 dark:border-slate-800 p-3"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="text-2xl font-bold text-ink-900 dark:text-slate-100 font-display">{value}</div>
      <div className="text-[11px] uppercase text-ink-500 dark:text-slate-400 tracking-wide">{label}</div>
    </div>
  );
}
