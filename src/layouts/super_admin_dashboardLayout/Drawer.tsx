/**
 * Admin / staff sidebar.
 *
 * Single-level navigation grouped into sections. Each entry goes straight
 * to the list page — adding/editing happens via buttons on the list page,
 * so the sidebar doesn't carry an expandable Add/View pair for everything.
 *
 * Items are filtered by the current user's role.
 */

import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, School, Users, Settings, LogOut, GraduationCap, BookOpen,
  Bell, CalendarCheck, BookOpenCheck, CalendarRange, Heart, Shield, UserCog,
  Building2, ClipboardCheck, Network, BookOpenText, Database, Clock, Grid3X3,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useT } from '../../contexts/I18nContext';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  exact?: boolean;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const Drawer: React.FC<DrawerProps> = ({ onClose, onLogout }) => {
  const { hasRole } = useAuth();
  const { t } = useT();
  const isSuper   = hasRole('SUPERADMIN', 'SUPER_ADMIN');
  const isAdmin   = hasRole('ADMIN');
  const isTeacher = hasRole('TEACHER');
  const canManage = isAdmin || isTeacher || isSuper;

  /** Map of nav keys → whether the current user can see the item. */
  const can: Record<string, boolean> = {
    dashboard:           true,
    calendar:            true,
    schools:             isSuper,
    students:            canManage,
    teachers:            canManage,
    parents:             isAdmin || isSuper,
    admins:              isSuper,
    users:               isSuper,
    classes:             canManage,
    subjects:            canManage,
    academic_years:      isAdmin || isSuper,
    attendance:          canManage,
    teacher_attendance:  canManage,
    class_teachers:      isAdmin || isSuper,
    assignments:         isAdmin || isSuper,
    notices:             canManage,
    exams:               canManage,
    tenant:              isAdmin || isSuper,
    master_data:         isAdmin || isSuper,
    time_slots:          isAdmin || isSuper,
    timetable:           canManage,
    promotions:          isAdmin || isSuper,
    settings:            isSuper,
  };

  const SECTIONS: NavSection[] = [
    {
      heading: t('nav.sectionOverview'),
      items: [
        { key: 'dashboard', label: t('nav.dashboard'), path: '/dashboard',          icon: <LayoutDashboard className="w-[18px] h-[18px]" />, exact: true },
        { key: 'calendar',  label: t('nav.calendar'),  path: '/dashboard/calendar', icon: <CalendarCheck   className="w-[18px] h-[18px]" /> },
      ],
    },
    {
      heading: t('nav.sectionPeople'),
      items: [
        { key: 'students', label: t('nav.students'), path: '/dashboard/students', icon: <GraduationCap className="w-[18px] h-[18px]" /> },
        { key: 'teachers', label: t('nav.teachers'), path: '/dashboard/teachers', icon: <Users         className="w-[18px] h-[18px]" /> },
        { key: 'parents',  label: t('nav.parents'),  path: '/dashboard/parents',  icon: <Heart         className="w-[18px] h-[18px]" /> },
        { key: 'admins',   label: t('nav.admins'),   path: '/dashboard/admins',   icon: <Shield        className="w-[18px] h-[18px]" /> },
        { key: 'users',    label: t('nav.users'),    path: '/dashboard/users',    icon: <UserCog       className="w-[18px] h-[18px]" /> },
      ],
    },
    {
      heading: t('nav.sectionAcademic'),
      items: [
        { key: 'classes',         label: t('nav.classes'),            path: '/dashboard/classes',              icon: <BookOpen     className="w-[18px] h-[18px]" /> },
        { key: 'subjects',        label: t('nav.subjects'),           path: '/dashboard/subjects',             icon: <BookOpenText className="w-[18px] h-[18px]" /> },
        { key: 'academic_years',  label: t('nav.academicYears'),      path: '/dashboard/academic-years',       icon: <CalendarRange className="w-[18px] h-[18px]" /> },
        { key: 'attendance',      label: t('nav.attendance'),         path: '/dashboard/attendance',           icon: <ClipboardCheck className="w-[18px] h-[18px]" /> },
        { key: 'class_teachers',  label: t('nav.classTeachers'),      path: '/dashboard/class-teachers',       icon: <Users        className="w-[18px] h-[18px]" /> },
        { key: 'assignments',     label: t('nav.teacherAssignments'), path: '/dashboard/teacher-assignments', icon: <Network      className="w-[18px] h-[18px]" /> },
        { key: 'exams',           label: t('nav.exams'),              path: '/dashboard/exams',                icon: <BookOpenCheck className="w-[18px] h-[18px]" /> },
        { key: 'timetable',       label: 'Timetable',                 path: '/dashboard/timetable',            icon: <Grid3X3      className="w-[18px] h-[18px]" /> },
        { key: 'promotions',      label: 'Year-end promotions',       path: '/dashboard/promotions',           icon: <ArrowUpRight className="w-[18px] h-[18px]" /> },
      ],
    },
    {
      heading: t('nav.sectionAdmin'),
      items: [
        { key: 'notices',     label: t('nav.notices'),         path: '/dashboard/notices',     icon: <Bell      className="w-[18px] h-[18px]" /> },
        { key: 'schools',     label: t('nav.schools'),         path: '/dashboard/schools',     icon: <School    className="w-[18px] h-[18px]" /> },
        { key: 'tenant',      label: t('nav.schoolSettings'),  path: '/dashboard/tenant',      icon: <Building2 className="w-[18px] h-[18px]" /> },
        { key: 'master_data', label: t('nav.masterData'),      path: '/dashboard/master-data', icon: <Database  className="w-[18px] h-[18px]" /> },
        { key: 'time_slots',  label: 'Time slots',             path: '/dashboard/time-slots',  icon: <Clock     className="w-[18px] h-[18px]" /> },
        { key: 'settings',    label: t('nav.settings'),        path: '/dashboard/settings',    icon: <Settings  className="w-[18px] h-[18px]" /> },
      ],
    },
  ];

  // Filter items in each section by visibility; drop empty sections.
  const visibleSections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => can[i.key]) }))
    .filter((s) => s.items.length > 0);

  return (
    <div
      className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col"
      style={{ height: '100vh', width: '100%', overflowY: 'hidden' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-bold text-xs">
          SC
        </div>
        <div className="text-sm font-semibold text-ink-900 dark:text-slate-100 font-display">
          School Connect
        </div>
      </div>

      {/* Sections */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {visibleSections.map((section, i) => (
          <div key={section.heading} className={i === 0 ? '' : 'mt-5'}>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-300 dark:text-slate-500 px-3 mb-1.5">
              {section.heading}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200 font-medium'
                          : 'text-ink-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? 'text-brand-600 dark:text-brand-300' : 'text-ink-400 dark:text-slate-500'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>{t('auth.signOut')}</span>
        </button>
      </div>
    </div>
  );
};

export default Drawer;
