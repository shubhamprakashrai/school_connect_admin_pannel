/**
 * Parent dashboard — children overview cards + monthly attendance summary
 * + upcoming school events.
 *
 * Wired to /parent-portal/students, /student/attendance/student/{id}/summary,
 * and /calendar-events/by-range.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, Calendar, ChevronRight, GraduationCap, Sparkles, TrendingUp,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip,
  XAxis, YAxis,
} from 'recharts';
import { toast } from 'react-toastify';
import { parentPortalService } from '../services/parent.service';
import { studentAttendanceService } from '../services/attendance.service';
import calendarEventService from '../services/calendarEvent.service';
import { useAuth } from '../contexts/AuthContext';
import { CardGridSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import type { ParentChildSummary } from '../types/parent';
import type { AttendanceSummaryResponse } from '../types/attendance';
import type { CalendarEventResponse } from '../types/calendarEvent';

interface ChildWithSummary extends ParentChildSummary {
  summary?: AttendanceSummaryResponse;
}

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildWithSummary[]>([]);
  const [events, setEvents] = useState<CalendarEventResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthAhead = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    parentPortalService.myChildren()
      .then(async (kids) => {
        if (!alive) return;
        // Fire summary calls in parallel; tolerate per-child failure.
        const enriched = await Promise.all(
          (kids || []).map(async (k) => {
            try {
              const summary = await studentAttendanceService.studentSummary(k.studentId, {
                startDate: ymd(monthAgo),
                endDate:   ymd(today),
              });
              return { ...k, summary };
            } catch {
              return { ...k };
            }
          }),
        );
        if (alive) setChildren(enriched);
      })
      .catch((err) => alive && toast.error(err.message || 'Failed to load children'));

    calendarEventService
      .byRange(ymd(today), ymd(monthAhead))
      .then((ev) => alive && setEvents(ev || []))
      .catch(() => alive && setEvents([]))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 p-6 md:p-8 text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-2">
            <Sparkles className="w-3 h-3" /> Parent portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">
            {greeting}, {user?.firstName || 'there'}
          </h1>
          <p className="text-white/80 mt-1 text-sm md:text-base">
            Here's a snapshot of your {children.length === 1 ? 'child' : 'children'} this month.
          </p>
        </div>
      </div>

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-ink-500 dark:text-slate-400">Your children</div>
            <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display">
              {loading ? '…' : `${children.length} record${children.length === 1 ? '' : 's'}`}
            </div>
          </div>
        </div>

        {loading ? (
          <CardGridSkeleton count={2} />
        ) : children.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No linked children"
            description="Ask your school admin to link your account to your child's record."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((c) => {
              const pct = c.summary?.attendancePercentage ?? c.attendancePercentage;
              const trendData = (() => {
                if (!c.summary?.dailyBreakdown) return [];
                return Object.entries(c.summary.dailyBreakdown)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, status]) => ({
                    date: new Date(date).toLocaleDateString(undefined, { day: '2-digit' }),
                    val: status === 'PRESENT' || status === 'LATE' ? 1 : 0,
                  }));
              })();

              return (
                <Link
                  key={c.studentId}
                  to={`/parent/children/${c.studentId}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 hover:shadow-card-soft transition-all hover:-translate-y-0.5"
                >
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 to-amber-300 opacity-10 group-hover:opacity-20 blur-2xl transition-opacity" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-900 dark:text-slate-100">{c.fullName}</div>
                        <div className="text-xs text-ink-500 dark:text-slate-400">
                          {c.className || '—'}{c.sectionName ? ` · ${c.sectionName}` : ''}
                          {c.rollNumber ? ` · Roll ${c.rollNumber}` : ''}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                  </div>

                  {pct != null && (
                    <div className="relative mt-4">
                      <div className="flex items-baseline justify-between">
                        <div className="text-3xl font-bold text-ink-900 dark:text-slate-100 font-display">
                          {pct.toFixed(0)}%
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> 30-day attendance
                        </div>
                      </div>
                      <div className="mt-1.5 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {c.summary && (
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <Stat label="Present" value={c.summary.presentDays} tone="emerald" />
                      <Stat label="Absent"  value={c.summary.absentDays}  tone="rose" />
                      <Stat label="Late"    value={c.summary.lateDays}    tone="amber" />
                    </div>
                  )}

                  {trendData.length > 0 && (
                    <div className="relative h-16 mt-4 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id={`g-${c.studentId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="val" stroke="#ec4899" strokeWidth={2}
                            fill={`url(#g-${c.studentId})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming events */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-ink-500 dark:text-slate-400">Upcoming</div>
            <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display">School calendar</div>
          </div>
          <button
            onClick={() => navigate('/parent/calendar')}
            className="text-xs text-rose-600 font-medium inline-flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
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
                  <div className="text-xs text-ink-500 dark:text-slate-400">
                    {e.eventType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'rose' | 'amber' }) {
  const colorMap = {
    emerald: 'text-emerald-600',
    rose:    'text-rose-600',
    amber:   'text-amber-600',
  };
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 py-1.5">
      <div className={`text-base font-semibold ${colorMap[tone]}`}>{value}</div>
      <div className="text-[10px] uppercase text-ink-500 dark:text-slate-400 tracking-wide">{label}</div>
    </div>
  );
}
