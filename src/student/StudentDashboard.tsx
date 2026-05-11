/**
 * Student dashboard — own attendance summary + upcoming events.
 * Uses /students/{id}, /student/attendance/student/{id}/summary,
 * /calendar-events/by-range.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip,
  XAxis, YAxis,
} from 'recharts';
import {
  ArrowUpRight, BookOpen, Calendar, ChevronRight, GraduationCap,
  Sparkles, TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import studentService from '../services/student.service';
import { studentAttendanceService } from '../services/attendance.service';
import calendarEventService from '../services/calendarEvent.service';
import { useAuth } from '../contexts/AuthContext';
import { CardGridSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import type { StudentResponse } from '../types/student';
import type { AttendanceSummaryResponse } from '../types/attendance';
import type { CalendarEventResponse } from '../types/calendarEvent';

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [events, setEvents] = useState<CalendarEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * True once initial fetches finish and the student record is still null —
   * almost always means the User UUID ≠ Student entity UUID (the backend has
   * no /student-portal endpoint yet). Surfaced as a friendly banner instead
   * of silently rendering empty stats.
   */
  const [linkageMissing, setLinkageMissing] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setLinkageMissing(false);
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthAhead = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    Promise.allSettled([
      studentService.getById(user.id).catch(() => null),
      studentAttendanceService.studentSummary(user.id, {
        startDate: ymd(monthAgo), endDate: ymd(today),
      }).catch(() => null),
      calendarEventService.byRange(ymd(today), ymd(monthAhead)).catch(() => []),
    ]).then(([s, sum, ev]) => {
      if (!alive) return;
      if (s.status === 'fulfilled') setStudent(s.value);
      if (sum.status === 'fulfilled') setSummary(sum.value);
      if (ev.status === 'fulfilled') setEvents(ev.value || []);
      if (s.status !== 'fulfilled' || !s.value) setLinkageMissing(true);
    }).finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [user]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const trend = useMemo(() => {
    if (!summary?.dailyBreakdown) return [];
    return Object.entries(summary.dailyBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, status]) => ({
        day: new Date(date).toLocaleDateString(undefined, { day: '2-digit' }),
        val: status === 'PRESENT' || status === 'LATE' ? 1 : 0,
      }));
  }, [summary]);

  const pct = summary?.attendancePercentage;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-amber-500 p-6 md:p-8 text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-2">
            <Sparkles className="w-3 h-3" /> Student portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">
            {greeting}, {user?.firstName || 'there'}
          </h1>
          <p className="text-white/80 mt-1 text-sm md:text-base">
            {student?.schoolClass?.name
              ? `${student.schoolClass.name}${student.section?.name ? ` · ${student.section.name}` : ''}${student.rollNumber ? ` · Roll ${student.rollNumber}` : ''}`
              : 'Your overview, attendance and calendar at a glance.'}
          </p>
        </div>
      </div>

      {linkageMissing && !loading && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          <div className="font-semibold mb-0.5">Your student record isn't linked yet</div>
          <div>
            We could not find a student profile attached to your account (<strong>{user?.email}</strong>).
            Please ask your school admin to link your enrolment to this login — once done,
            attendance, calendar and class details will appear here.
          </div>
        </div>
      )}

      {loading ? (
        <CardGridSkeleton count={3} />
      ) : !user ? (
        <EmptyState title="Not signed in" />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Attendance · 30 days"
              value={pct != null ? `${pct.toFixed(0)}%` : '—'}
              delta={pct != null && pct >= 90 ? 'On track' : undefined}
              icon={TrendingUp}
              gradient="from-cyan-500 to-emerald-500"
            />
            <StatCard
              label="Working days"
              value={summary?.totalWorkingDays ?? '—'}
              icon={BookOpen}
              gradient="from-emerald-500 to-amber-500"
            />
            <StatCard
              label="Upcoming events"
              value={events.length}
              icon={Calendar}
              gradient="from-amber-500 to-rose-500"
              to="/student/calendar"
            />
          </div>

          {/* Trend + Upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-sm text-ink-500 dark:text-slate-400">Recent attendance</div>
                  <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display">
                    Last 30 days
                  </div>
                </div>
                {summary && (
                  <div className="flex gap-1.5 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> {summary.presentDays} present
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-500">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> {summary.absentDays} absent
                    </span>
                  </div>
                )}
              </div>
              <div className="h-56 mt-3">
                {trend.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-ink-300 dark:text-slate-500 text-sm">
                    No attendance data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="att-student" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis hide domain={[0, 1]} />
                      <RTooltip />
                      <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} fill="url(#att-student)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-ink-500 dark:text-slate-400">Upcoming</div>
                  <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display">School calendar</div>
                </div>
                <Link to="/student/calendar" className="text-xs text-emerald-600 font-medium inline-flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {events.length === 0 ? (
                <div className="text-sm text-ink-300 dark:text-slate-500 py-4 text-center">
                  Nothing scheduled in the next 30 days.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {events.slice(0, 6).map((e) => (
                    <div key={e.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="text-[10px] uppercase text-ink-300 dark:text-slate-500 font-semibold">
                          {new Date(e.eventDate).toLocaleDateString(undefined, { month: 'short' })}
                        </div>
                        <div className="text-xl font-bold text-ink-900 dark:text-slate-100">
                          {new Date(e.eventDate).getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink-900 dark:text-slate-100 truncate">{e.title}</div>
                        <div className="text-xs text-ink-500 dark:text-slate-400">{e.eventType.replace(/_/g, ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  to?: string;
}

function StatCard({ label, value, delta, icon: Icon, gradient, to }: StatCardProps) {
  const inner = (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 hover:shadow-card-soft transition-all hover:-translate-y-0.5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-30 blur-2xl group-hover:opacity-50 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
        {to && <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />}
      </div>
      <div className="relative mt-4">
        <div className="text-3xl font-bold text-ink-900 dark:text-slate-100 font-display">{value}</div>
        <div className="text-sm text-ink-500 dark:text-slate-400 mt-0.5">{label}</div>
        {delta && (
          <div className="text-xs font-semibold text-emerald-600 mt-2">
            {delta}
          </div>
        )}
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
