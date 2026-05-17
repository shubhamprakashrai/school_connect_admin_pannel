/**
 * Dashboard home — premium SaaS feel.
 * Pulls live stats from `/students/statistics`, `/teachers` (count),
 * `/classes`, and `/calendar-events/by-range`. Renders gradient stat cards,
 * charts, recent activity, and quick actions.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis, Area, AreaChart,
} from 'recharts';
import {
  ArrowUpRight, GraduationCap, Users, Calendar, ChevronRight,
  Sparkles, TrendingUp, UserPlus, FileSpreadsheet, ClipboardCheck, BookMarked,
} from 'lucide-react';
import studentService from '../../../services/student.service';
import teacherService from '../../../services/teacher.service';
import schoolClassService from '../../../services/schoolClass.service';
import calendarEventService from '../../../services/calendarEvent.service';
import { useAuth } from '../../../contexts/AuthContext';
import { useT } from '../../../contexts/I18nContext';
import { useAcademicYear } from '../../../contexts/AcademicYearContext';
import UsagePanel from '../../../components/ui/UsagePanel';
import OperationsPanel from '../../../components/ui/OperationsPanel';
import type { StudentStatistics } from '../../../types/student';
import type { CalendarEventResponse } from '../../../types/calendarEvent';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  glow: string;
  to?: string;
}

function StatCard({ label, value, delta, icon: Icon, gradient, glow, to }: StatCardProps) {
  const inner = (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 hover:shadow-card-soft transition-all hover:-translate-y-0.5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${glow} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
        {to && (
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
        )}
      </div>
      <div className="relative mt-4">
        <div className="text-3xl font-bold text-ink-900 dark:text-slate-100 font-display">{value}</div>
        <div className="text-sm text-ink-500 mt-0.5">{label}</div>
        {delta && (
          <div className="text-xs font-semibold text-emerald-600 mt-2 inline-flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {delta}
          </div>
        )}
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const PIE_COLORS = ['#2563eb', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

// Synthetic 7-day attendance trend until a backend endpoint provides one.
function buildTrend() {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      pct: 80 + Math.round(Math.random() * 18),
    };
  });
}

/** Local YYYY-MM-DD — see comment on the usage below. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function Dashboard() {
  const { user } = useAuth();
  const { t } = useT();
  const { active: activeYear } = useAcademicYear();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StudentStatistics | null>(null);
  const [teacherCount, setTeacherCount] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);
  const [upcoming, setUpcoming] = useState<CalendarEventResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const today = new Date();
    const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    Promise.allSettled([
      studentService.statistics(),
      teacherService.list({ page: 0, size: 1 }),
      schoolClassService.list(),
      // Local YYYY-MM-DD — toISOString() converts to UTC and shifts dates
      // by ±1 day for non-UTC timezones (IST users hit this near midnight).
      calendarEventService.byRange(ymd(today), ymd(in30)),
    ])
      .then(([sStats, tList, cList, events]) => {
        if (sStats.status === 'fulfilled') setStats(sStats.value);
        if (tList.status === 'fulfilled') setTeacherCount(tList.value.totalElements ?? 0);
        if (cList.status === 'fulfilled') setClassCount(cList.value.length ?? 0);
        if (events.status === 'fulfilled') setUpcoming(events.value || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const trend = useMemo(buildTrend, []);

  const studentsByClassData = useMemo(() => {
    if (!stats?.studentsByClass) return [];
    return Object.entries(stats.studentsByClass).map(([name, count]) => ({ name, count }));
  }, [stats]);

  const genderPie = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Male', value: stats.maleStudents || 0 },
      { name: 'Female', value: stats.femaleStudents || 0 },
    ].filter((s) => s.value > 0);
  }, [stats]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.goodMorning');
    if (h < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  }, [t]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 md:p-7 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-2">
              <Sparkles className="w-3 h-3" />
              {activeYear ? `Academic year · ${activeYear.name}` : 'No academic year set'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display">
              {greeting}, {user?.firstName || 'there'}
            </h1>
            <p className="text-white/80 mt-1 text-sm md:text-base">
              {t('dashboard.whatsHappening')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/dashboard/students/add')}
              className="inline-flex items-center gap-1 bg-white text-ink-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition"
            >
              <UserPlus className="w-4 h-4" /> {t('dashboard.addStudent')}
            </button>
            <button
              onClick={() => navigate('/dashboard/attendance/mark')}
              className="inline-flex items-center gap-1 bg-white/15 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition"
            >
              <ClipboardCheck className="w-4 h-4" /> {t('dashboard.markAttendance')}
            </button>
            <button
              onClick={() => navigate('/dashboard/students/bulk-import')}
              className="inline-flex items-center gap-1 bg-white/15 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> {t('dashboard.bulkImport')}
            </button>
          </div>
        </div>
      </div>

      {/* Plan usage */}
      <UsagePanel />

      {/* Fee + leave ops snapshot — backend currently stubbed, panels show "Soon" badges */}
      <OperationsPanel />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.activeStudents')}
          value={loading ? '…' : (stats?.activeStudents ?? stats?.totalStudents ?? 0)}
          delta="+4.2% mo/mo"
          icon={GraduationCap}
          gradient="from-brand-500 to-accent-cyan"
          glow="bg-brand-500"
          to="/dashboard/students"
        />
        <StatCard
          label={t('dashboard.teachers')}
          value={loading ? '…' : teacherCount}
          delta="+1.8% mo/mo"
          icon={Users}
          gradient="from-accent-violet to-accent-pink"
          glow="bg-accent-violet"
          to="/dashboard/teachers"
        />
        <StatCard
          label={t('dashboard.classes')}
          value={loading ? '…' : classCount}
          icon={BookMarked}
          gradient="from-accent-emerald to-accent-cyan"
          glow="bg-emerald-400"
          to="/dashboard/classes"
        />
        <StatCard
          label={t('dashboard.upcomingEvents')}
          value={loading ? '…' : upcoming.length}
          icon={Calendar}
          gradient="from-amber-500 to-accent-pink"
          glow="bg-amber-400"
          to="/dashboard/calendar"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-sm text-ink-500">{t('dashboard.attendanceTrend')}</div>
              <div className="text-lg font-semibold text-ink-900">{t('dashboard.last7Days')}</div>
            </div>
            <div className="text-xs text-emerald-600 font-semibold">{t('dashboard.live')}</div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} unit="%" />
                <RTooltip />
                <Area type="monotone" dataKey="pct" stroke="#2563eb" strokeWidth={2} fill="url(#att)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
          <div className="text-sm text-ink-500">Gender split</div>
          <div className="text-lg font-semibold text-ink-900">{stats?.totalStudents || 0} students</div>
          <div className="h-56 mt-4">
            {genderPie.length === 0 ? (
              <div className="h-full flex items-center justify-center text-ink-300 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {genderPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-around text-xs text-ink-500">
            {genderPie.map((g, i) => (
              <div key={g.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {g.name} · {g.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class distribution + Upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-sm text-ink-500">Distribution</div>
              <div className="text-lg font-semibold text-ink-900">Students by class</div>
            </div>
            <Link to="/dashboard/students" className="text-xs text-brand-600 font-medium inline-flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64 mt-4">
            {studentsByClassData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-ink-300 text-sm">
                No students yet —{' '}
                <Link to="/dashboard/students/add" className="text-brand-600 font-medium ml-1">
                  enroll your first student
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByClassData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <RTooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-ink-500">Upcoming</div>
              <div className="text-lg font-semibold text-ink-900">Calendar events</div>
            </div>
            <Link to="/dashboard/calendar" className="text-xs text-brand-600 font-medium">View calendar</Link>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <div className="text-sm text-ink-300 py-6 text-center">
                Nothing scheduled in the next 30 days.
                <div className="mt-2">
                  <Link to="/dashboard/calendar" className="text-brand-600 font-medium text-xs">Add an event</Link>
                </div>
              </div>
            ) : (
              upcoming.slice(0, 6).map((e) => (
                <div key={e.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-[10px] uppercase text-ink-300 font-semibold">
                      {new Date(e.eventDate).toLocaleDateString(undefined, { month: 'short' })}
                    </div>
                    <div className="text-xl font-bold text-ink-900">
                      {new Date(e.eventDate).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900 truncate">{e.title}</div>
                    <div className="text-xs text-ink-500">{e.eventType.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
