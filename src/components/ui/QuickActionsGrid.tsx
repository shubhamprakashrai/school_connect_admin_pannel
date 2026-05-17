/**
 * Quick Actions grid — Dashboard shortcut tiles to every module.
 * Mirrors the mobile admin dashboard's _quickActions list.
 *
 * Each tile is role-aware: items invisible to the current role drop out
 * silently, so a TEACHER sees fewer tiles than an ADMIN.
 */

import { Link as RouterLink } from 'react-router-dom';
import {
  Banknote, BarChart3, Bell, BookOpen, BookOpenCheck, Calendar,
  CalendarOff, ClipboardCheck, ClipboardList, Database, Grid3X3,
  GraduationCap, Heart, Inbox, Settings, ShieldAlert, Users as UsersIcon,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Tint = 'blue' | 'cyan' | 'orange' | 'yellow' | 'emerald' | 'rose' | 'green' | 'purple' | 'sky' | 'pink' | 'gray' | 'amber';

interface Action {
  to: string;
  label: string;
  Icon: typeof BarChart3;
  tint: Tint;
  visibleTo: 'all' | 'staff' | 'admin';
}

const TINT_BG: Record<Tint, string> = {
  blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
  cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
  orange:  'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
  yellow:  'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  green:   'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-300',
  purple:  'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300',
  sky:     'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  pink:    'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300',
  gray:    'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  amber:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
};

const ACTIONS: Action[] = [
  { to: '/dashboard/students',           label: 'Students',     Icon: GraduationCap,  tint: 'blue',    visibleTo: 'staff' },
  { to: '/dashboard/teachers',           label: 'Teachers',     Icon: UsersIcon,      tint: 'cyan',    visibleTo: 'staff' },
  { to: '/dashboard/parents',            label: 'Parents',      Icon: Heart,          tint: 'orange',  visibleTo: 'admin' },
  { to: '/dashboard/classes',            label: 'Classes',      Icon: BookOpen,       tint: 'yellow',  visibleTo: 'staff' },
  { to: '/dashboard/subjects',           label: 'Subjects',     Icon: Database,       tint: 'emerald', visibleTo: 'staff' },
  { to: '/dashboard/attendance',         label: 'Attendance',   Icon: ClipboardCheck, tint: 'green',   visibleTo: 'staff' },
  { to: '/dashboard/timetable',          label: 'Timetable',    Icon: Grid3X3,        tint: 'sky',     visibleTo: 'staff' },
  { to: '/dashboard/assignments',        label: 'Assignments',  Icon: ClipboardList,  tint: 'sky',     visibleTo: 'staff' },
  { to: '/dashboard/exams',              label: 'Exams',        Icon: BookOpenCheck,  tint: 'rose',    visibleTo: 'staff' },
  { to: '/dashboard/fees',               label: 'Fees',         Icon: Wallet,         tint: 'green',   visibleTo: 'admin' },
  { to: '/dashboard/leave',              label: 'Leave',        Icon: CalendarOff,    tint: 'purple',  visibleTo: 'admin' },
  { to: '/dashboard/calendar',           label: 'Calendar',     Icon: Calendar,       tint: 'sky',     visibleTo: 'all' },
  { to: '/dashboard/notifications-inbox',label: 'Inbox',        Icon: Inbox,          tint: 'pink',    visibleTo: 'all' },
  { to: '/dashboard/notices',            label: 'Notices',      Icon: Bell,           tint: 'amber',   visibleTo: 'staff' },
  { to: '/dashboard/safety',             label: 'Safety',       Icon: ShieldAlert,    tint: 'orange',  visibleTo: 'admin' },
  { to: '/dashboard/reports',            label: 'Reports',      Icon: BarChart3,      tint: 'rose',    visibleTo: 'staff' },
  { to: '/dashboard/master-data',        label: 'Master data',  Icon: Database,       tint: 'gray',    visibleTo: 'admin' },
  { to: '/dashboard/settings',           label: 'Settings',     Icon: Settings,       tint: 'gray',    visibleTo: 'admin' },
];

export default function QuickActionsGrid() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const visible = ACTIONS.filter((a) =>
    a.visibleTo === 'all' || a.visibleTo === 'staff' || isAdmin,
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-ink-500 dark:text-slate-400">Quick actions</div>
          <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display">
            Jump anywhere
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
        {visible.map((a) => (
          <RouterLink
            key={a.to}
            to={a.to}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TINT_BG[a.tint]} group-hover:scale-105 transition-transform`}>
              <a.Icon className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-medium text-ink-700 dark:text-slate-300 text-center leading-tight">
              {a.label}
            </div>
          </RouterLink>
        ))}
      </div>
    </div>
  );
}
