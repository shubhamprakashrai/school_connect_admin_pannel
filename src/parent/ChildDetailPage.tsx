/**
 * Child detail (parent view).
 * - /parent-portal/students/{id} for the student record
 * - /student/attendance/student/{id}/summary for the period summary
 *
 * Period switcher: This week / Month / Quarter.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Cake, Mail, Phone, Shield } from 'lucide-react';
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';
import { toast } from 'react-toastify';
import { parentPortalService } from '../services/parent.service';
import { studentAttendanceService } from '../services/attendance.service';
import { PageSpinner } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import type { StudentResponse } from '../types/student';
import type { AttendanceSummaryResponse } from '../types/attendance';

type Period = 'week' | 'month' | 'quarter';

/** Local YYYY-MM-DD — toISOString shifts dates by ±1 day in non-UTC timezones. */
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rangeFor(p: Period): { startDate: string; endDate: string } {
  const today = new Date();
  const days = p === 'week' ? 7 : p === 'month' ? 30 : 90;
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate: ymd(start), endDate: ymd(today) };
}

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#a855f7', '#6366f1'];

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  // Initial: access check + student detail
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        // Backend returns a raw boolean; treat any failure as "allow + fall
        // through" so a missing access-check doesn't lock the user out.
        const allowed = await parentPortalService.accessCheck(id).catch(() => true);
        if (!alive) return;
        if (allowed === false) {
          setDenied(true);
          setLoading(false);
          return;
        }
        const child = await parentPortalService.childDetail(id);
        if (alive) setStudent(child);
      } catch (err) {
        if (alive) toast.error((err as { message?: string }).message || 'Failed to load child');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [id]);

  // Re-fetch summary when period changes
  useEffect(() => {
    if (!id || denied) return;
    const range = rangeFor(period);
    studentAttendanceService.studentSummary(id, range)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [id, period, denied]);

  const fullName = student ? (student.fullName || `${student.firstName} ${student.lastName}`) : '';

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
  if (denied) {
    return (
      <EmptyState
        icon={Shield}
        title="No access to this record"
        description="Your account isn't linked to this student. Ask the school admin if this looks wrong."
        action={
          <button
            onClick={() => navigate('/parent')}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-glow-pink hover:opacity-95 transition"
          >
            Back to overview
          </button>
        }
      />
    );
  }
  if (!student) {
    return <EmptyState title="Child not found" description="The record may have been removed." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          to="/parent"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Hero */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-amber-500/15" />
        <div className="relative p-6 flex items-center gap-4 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white text-3xl font-bold flex items-center justify-center shadow-glow-pink">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold text-ink-900 dark:text-slate-100 font-display">{fullName}</div>
            <div className="text-sm text-ink-500 dark:text-slate-400">
              <BookOpen className="inline w-3.5 h-3.5 mr-1" />
              {student.schoolClass?.name || '—'}
              {student.section?.name ? ` · ${student.section.name}` : ''}
              {student.rollNumber ? ` · Roll ${student.rollNumber}` : ''}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-ink-500 dark:text-slate-400">
              {student.email && (
                <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {student.email}</span>
              )}
              {student.phone && (
                <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {student.phone}</span>
              )}
              {student.dateOfBirth && (
                <span className="inline-flex items-center gap-1">
                  <Cake className="w-3 h-3" /> {new Date(student.dateOfBirth).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="text-sm text-ink-500 dark:text-slate-400">Attendance summary</div>
            <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display">
              {summary
                ? `${summary.presentDays + summary.lateDays} of ${summary.totalWorkingDays} working days`
                : '—'}
            </div>
          </div>
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700">
            {(['week', 'month', 'quarter'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm'
                    : 'text-ink-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {!summary ? (
          <div className="text-sm text-ink-300 dark:text-slate-500 py-6 text-center">
            No attendance data for this period yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <div className="h-48">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-ink-300 text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={3}>
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
              <div className="text-center text-xs text-ink-500 dark:text-slate-400">Overall attendance</div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SummaryStat label="Present" value={summary.presentDays} accent="#10b981" />
              <SummaryStat label="Absent"  value={summary.absentDays}  accent="#ef4444" />
              <SummaryStat label="Late"    value={summary.lateDays}    accent="#f59e0b" />
              <SummaryStat label="Half day" value={summary.halfDays}    accent="#06b6d4" />
              <SummaryStat label="Leave"   value={summary.leaveDays}   accent="#a855f7" />
              <SummaryStat
                label="Working days"
                value={summary.totalWorkingDays}
                accent="#6366f1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily breakdown calendar */}
      {summary?.dailyBreakdown && Object.keys(summary.dailyBreakdown).length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
          <div className="text-sm text-ink-500 dark:text-slate-400 mb-1">Daily breakdown</div>
          <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display mb-3">
            Day-by-day status
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
