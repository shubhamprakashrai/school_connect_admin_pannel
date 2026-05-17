import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DemoProvider } from './contexts/DemoContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { AcademicYearProvider } from './contexts/AcademicYearContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import OfflineBanner from './components/ui/OfflineBanner';
import { PageSpinner } from './components/ui/LoadingSkeleton';
import ThemeToggle from './components/ui/ThemeToggle';
import LanguageToggle from './components/ui/LanguageToggle';
import CommandPalette from './components/CommandPalette';
import NotificationCenter, { toggleNotifications, useUnreadCount } from './components/NotificationCenter';
import TenantSwitcher from './components/ui/TenantSwitcher';
import AccountMenu from './components/ui/AccountMenu';
import OnboardingTour from './components/OnboardingTour';
import KeyboardShortcuts from './components/KeyboardShortcuts';

// Public landing — kept eager because it's the first paint for unauthenticated visitors.
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductDemo from './components/ProductDemo';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import NotFoundPage from './components/NotFoundPage';
import Drawer from './layouts/super_admin_dashboardLayout/Drawer';

// ---------------------------------------------------------------------------
// Lazy-loaded dashboard pages — each becomes its own JS chunk, downloaded on
// demand. Keeps the initial bundle small and TTI fast.
// ---------------------------------------------------------------------------

const Dashboard          = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const AddSchoolForm      = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/AddSchoolForm'));
const SchoolList         = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SchoolList/SchoolList'));
const SchoolDetail       = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SchoolList/SchoolDetail'));
const AcademicYearPage   = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/AcademicYear/AcademicYearPage'));
const CalendarPage       = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Calendar/CalendarPage'));
const SettingsPage       = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Settings/SettingsPage'));

const StudentList        = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Students/StudentList'));
const AddStudentForm     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Students/AddStudentForm'));
const EditStudentForm    = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Students/EditStudentForm'));
const ViewStudent        = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Students/ViewStudent'));
const BulkImportStudents = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Students/BulkImportStudents'));

const TeacherList        = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Teachers/TeacherList'));
const AddTeacherForm     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Teachers/AddTeacherForm'));
const EditTeacherForm    = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Teachers/EditTeacherForm'));
const ViewTeacher        = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Teachers/ViewTeacher'));

const AddClass           = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ClassManage/AddClass'));
const ClassSchedule      = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ClassManage/ClassSchedule'));
const ClassList          = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ClassManage/ClassList'));
const EditClass          = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ClassManage/EditClass'));
const ViewClass          = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ClassManage/ViewClass'));

const SubjectListPage    = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SubjectManagement/pages/SubjectListPage'));
const ParentsPage        = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Parents/ParentsPage'));
const AdminsPage         = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Admins/AdminsPage'));
const UsersPage          = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Users/UsersPage'));
const ClassTeachersPage  = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ClassTeachers/ClassTeachersPage'));
const TeacherAssignmentsPage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/TeacherAssignments/TeacherAssignmentsPage'));
const TeacherAttendancePage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Teachers/TeacherAttendancePage'));
const BulkSubjectsPage   = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SubjectManagement/pages/BulkSubjectsPage'));
const TenantSettingsPage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Tenant/TenantSettingsPage'));
const AdminProfilePage   = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Profile/AdminProfilePage'));
const MasterDataPage     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/MasterData/MasterDataPage'));
const TimeSlotsPage      = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/TimeSlots/TimeSlotsPage'));
const TimetablePage      = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Timetable/TimetablePage'));
const PromotionsPage     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Promotions/PromotionsPage'));
const SectionDetailPage  = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SectionDetail/SectionDetailPage'));
const AssignmentsPage    = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Assignments/AssignmentsPage'));
const FeesPage           = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Fees/FeesPage'));
const LeavePage          = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Leave/LeavePage'));
const NotificationsInboxPage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/NotificationsInbox/NotificationsInboxPage'));
const SafetyPage         = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/Safety/SafetyPage'));

// Parent portal
const ParentLayout       = lazy(() => import('./parent/ParentLayout'));
const ParentDashboard    = lazy(() => import('./parent/ParentDashboard'));
const ChildDetailPage    = lazy(() => import('./parent/ChildDetailPage'));
const ParentProfile      = lazy(() => import('./parent/ParentProfile'));
const ParentCalendar     = lazy(() => import('./parent/ParentCalendar'));
const ParentNotices      = lazy(() => import('./parent/ParentNotices'));

// Student portal
const StudentLayout      = lazy(() => import('./student/StudentLayout'));
const StudentDashboard   = lazy(() => import('./student/StudentDashboard'));
const StudentAttendance  = lazy(() => import('./student/StudentAttendance'));
const StudentProfile     = lazy(() => import('./student/StudentProfile'));
const StudentCalendar    = lazy(() => import('./student/StudentCalendar'));

// Auth (public)
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./components/auth/ResetPasswordPage'));
const FirstLoginPage     = lazy(() => import('./components/auth/FirstLoginPage'));
const VerifyEmailPage    = lazy(() => import('./components/auth/VerifyEmailPage'));
const ChangePasswordPage = lazy(() => import('./components/auth/ChangePasswordPage'));
const RegisterSchoolPage = lazy(() => import('./components/auth/RegisterSchoolPage'));
const AddSubjectPage     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SubjectManagement/pages/AddSubjectPage'));
const EditSubjectPage    = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/SubjectManagement/pages/EditSubjectPage'));

const ExamListPage       = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ExamManagement/pages/ExamListPage').then((m) => ({ default: m.ExamListPage })));
const ScheduleExamPage   = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ExamManagement/pages/ScheduleExamPage').then((m) => ({ default: m.ScheduleExamPage })));
const ExamResultsPage    = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/ExamManagement/pages/ExamResultsPage').then((m) => ({ default: m.ExamResultsPage })));

const NoticeListPage     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/NoticeManagement/pages/NoticeListPage'));
const AddNoticePage      = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/NoticeManagement/pages/AddNoticePage'));
const EditNoticePage     = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/NoticeManagement/pages/EditNoticePage'));

const AttendanceListPage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/attendance/pages/AttendanceListPage'));
const MarkAttendancePage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/attendance/pages/MarkAttendancePage'));
const ViewAttendancePage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/attendance/pages/ViewAttendancePage'));
const EditAttendancePage = lazy(() => import('./SuperAdminPages/SuperAdminDashboard/attendance/pages/EditAttendancePage'));

// ---------------------------------------------------------------------------

type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'superadmin';

const PublicLayout = ({ onLoginClick, isAuthenticated }: { onLoginClick: () => void; isAuthenticated: boolean }) => (
  <div className="min-h-screen bg-white font-inter">
    <Header onLoginClick={onLoginClick} isAuthenticated={isAuthenticated} onLogout={() => {}} />
    <main>
      <Hero />
      <Features />
      <ProductDemo />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <About />
      <Contact />
      <FAQ />
    </main>
    <Footer />
  </div>
);

// Bell with live unread badge — extracted so the hook isn't called inside JSX.
function NotificationsBell() {
  const unread = useUnreadCount();
  return (
    <button
      type="button"
      onClick={() => toggleNotifications()}
      className="relative p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

const DashboardTopBar = ({
  isDrawerOpen, toggleDrawer, onLogout,
}: { isDrawerOpen: boolean; toggleDrawer: () => void; onLogout: () => void }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-20 sticky top-0">
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={toggleDrawer}
          className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isDrawerOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('command-palette:open'))}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-ink-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm"
            aria-label="Open command palette"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
            <span>Search…</span>
            <kbd className="ml-2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-ink-500">
              ⌘K
            </kbd>
          </button>
          <TenantSwitcher />
          <LanguageToggle />
          <ThemeToggle />
          <NotificationsBell />

          <AccountMenu personaPath="dashboard" onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

const DashboardLayout = ({ onLogout }: { onLogout: () => void }) => {
  // Sidebar starts open on >=lg (1024px) and closed on smaller screens.
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );
  const location = useLocation();

  // Auto-close drawer when navigating on mobile.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) setIsDrawerOpen(false);
  }, [location.pathname]);

  if (!location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 relative">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 ${isDrawerOpen ? 'w-64' : 'w-0'} transition-all duration-300`}>
        <Drawer
          isOpen
          onClose={() => {
            // Only auto-close on mobile after a nav click; on desktop keep it open.
            if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsDrawerOpen(false);
          }}
          onLogout={onLogout}
        />
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isDrawerOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        <DashboardTopBar
          isDrawerOpen={isDrawerOpen}
          toggleDrawer={() => setIsDrawerOpen((v) => !v)}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950 text-ink-900 dark:text-slate-100">
          <RouteErrorBoundary>
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="schools">
                  <Route index element={<SchoolList />} />
                  <Route path="add" element={<AddSchoolForm />} />
                  <Route path=":id" element={<SchoolDetail />} />
                </Route>
                <Route path="students">
                  <Route index element={<StudentList />} />
                  <Route path="add" element={<AddStudentForm />} />
                  <Route path="bulk-import" element={<BulkImportStudents />} />
                  <Route path=":id" element={<ViewStudent />} />
                  <Route path=":id/edit" element={<EditStudentForm />} />
                </Route>
                <Route path="teachers">
                  <Route index element={<TeacherList />} />
                  <Route path="add" element={<AddTeacherForm />} />
                  <Route path="attendance" element={<TeacherAttendancePage />} />
                  <Route path=":id" element={<ViewTeacher />} />
                  <Route path=":id/edit" element={<EditTeacherForm />} />
                </Route>
                <Route path="classes">
                  <Route index element={<ClassList />} />
                  <Route path="add" element={<AddClass />} />
                  <Route path="schedule" element={<ClassSchedule />} />
                  <Route path=":id" element={<ViewClass />} />
                  <Route path=":id/edit" element={<EditClass />} />
                </Route>
                <Route path="subjects">
                  <Route index element={<SubjectListPage />} />
                  <Route path="add" element={<AddSubjectPage />} />
                  <Route path="bulk-import" element={<BulkSubjectsPage />} />
                  <Route path="edit/:id" element={<EditSubjectPage />} />
                </Route>
                <Route path="academic-years" element={<AcademicYearPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="notices">
                  <Route index element={<NoticeListPage />} />
                  <Route path="add" element={<AddNoticePage />} />
                  <Route path="edit/:id" element={<EditNoticePage />} />
                </Route>
                <Route path="attendance">
                  <Route index element={<AttendanceListPage />} />
                  <Route path="mark" element={<MarkAttendancePage />} />
                  <Route path="view/:id" element={<ViewAttendancePage />} />
                  <Route path="edit/:id" element={<EditAttendancePage />} />
                </Route>
                <Route path="users" element={<UsersPage />} />
                <Route path="parents" element={<ParentsPage />} />
                <Route path="admins" element={<AdminsPage />} />
                <Route path="class-teachers" element={<ClassTeachersPage />} />
                <Route path="teacher-assignments" element={<TeacherAssignmentsPage />} />
                <Route path="tenant" element={<TenantSettingsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="exams">
                  <Route index element={<ExamListPage />} />
                  <Route path="schedule" element={<ScheduleExamPage />} />
                  <Route path="results" element={<ExamResultsPage />} />
                </Route>
                <Route path="master-data" element={<MasterDataPage />} />
                <Route path="time-slots" element={<TimeSlotsPage />} />
                <Route path="timetable" element={<TimetablePage />} />
                <Route path="promotions" element={<PromotionsPage />} />
                <Route path="sections/:sectionId" element={<SectionDetailPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="fees" element={<FeesPage />} />
                <Route path="leave" element={<LeavePage />} />
                <Route path="notifications-inbox" element={<NotificationsInboxPage />} />
                <Route path="safety" element={<SafetyPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, logout, hasRole } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isParent = hasRole('PARENT');
  const isStudent = hasRole('STUDENT');

  // Each role has its own home: parents → /parent, students → /student,
  // everyone else (super-admin, admin, teacher) → /dashboard.
  const homePath = isParent ? '/parent' : isStudent ? '/student' : '/dashboard';

  const handleLoginSuccess = (_role: UserRole) => {
    setIsLoginModalOpen(false);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={homePath} replace />
          ) : (
            <>
              <PublicLayout
                onLoginClick={() => setIsLoginModalOpen(true)}
                isAuthenticated={isAuthenticated}
              />
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
              />
            </>
          )
        }
      />

      {/* Public auth flows — accessible without sign in */}
      <Route
        path="/forgot-password"
        element={<Suspense fallback={<PageSpinner />}><ForgotPasswordPage /></Suspense>}
      />
      <Route
        path="/reset-password"
        element={<Suspense fallback={<PageSpinner />}><ResetPasswordPage /></Suspense>}
      />
      <Route
        path="/first-login"
        element={<Suspense fallback={<PageSpinner />}><FirstLoginPage /></Suspense>}
      />
      <Route
        path="/verify-email"
        element={<Suspense fallback={<PageSpinner />}><VerifyEmailPage /></Suspense>}
      />
      <Route
        path="/register"
        element={<Suspense fallback={<PageSpinner />}><RegisterSchoolPage /></Suspense>}
      />

      {/* Admin / staff dashboard — parents and students are bounced to their own portals */}
      <Route
        path="/dashboard/*"
        element={
          !isAuthenticated ? (
            <Navigate to="/" state={{ from: '/dashboard' }} replace />
          ) : isParent ? (
            <Navigate to="/parent" replace />
          ) : isStudent ? (
            <Navigate to="/student" replace />
          ) : (
            <DashboardLayout onLogout={() => void logout()} />
          )
        }
      />

      {/* Parent portal — gated to PARENT role */}
      <Route
        path="/parent"
        element={
          !isAuthenticated ? (
            <Navigate to="/" state={{ from: '/parent' }} replace />
          ) : !isParent ? (
            <Navigate to={homePath} replace />
          ) : (
            <Suspense fallback={<PageSpinner />}>
              <ParentLayout />
            </Suspense>
          )
        }
      >
        <Route index element={<Suspense fallback={<PageSpinner />}><ParentDashboard /></Suspense>} />
        <Route path="children/:id" element={<Suspense fallback={<PageSpinner />}><ChildDetailPage /></Suspense>} />
        <Route path="calendar" element={<Suspense fallback={<PageSpinner />}><ParentCalendar /></Suspense>} />
        <Route path="notices" element={<Suspense fallback={<PageSpinner />}><ParentNotices /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageSpinner />}><ParentProfile /></Suspense>} />
        <Route path="change-password" element={<Suspense fallback={<PageSpinner />}><ChangePasswordPage /></Suspense>} />
      </Route>

      {/* Student portal — gated to STUDENT role */}
      <Route
        path="/student"
        element={
          !isAuthenticated ? (
            <Navigate to="/" state={{ from: '/student' }} replace />
          ) : !isStudent ? (
            <Navigate to={homePath} replace />
          ) : (
            <Suspense fallback={<PageSpinner />}>
              <StudentLayout />
            </Suspense>
          )
        }
      >
        <Route index element={<Suspense fallback={<PageSpinner />}><StudentDashboard /></Suspense>} />
        <Route path="attendance" element={<Suspense fallback={<PageSpinner />}><StudentAttendance /></Suspense>} />
        <Route path="calendar" element={<Suspense fallback={<PageSpinner />}><StudentCalendar /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageSpinner />}><StudentProfile /></Suspense>} />
        <Route path="change-password" element={<Suspense fallback={<PageSpinner />}><ChangePasswordPage /></Suspense>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
      <DemoProvider>
        <Router>
          <AuthProvider>
            <TenantProvider>
              <AcademicYearProvider>
                <RouteErrorBoundary>
                  <AppRoutes />
                </RouteErrorBoundary>
                <CommandPalette />
                <NotificationCenter />
                <OnboardingTour />
                <KeyboardShortcuts />
                <OfflineBanner />
                <ToastContainer
                  position="top-right"
                  autoClose={3500}
                  newestOnTop
                  pauseOnHover
                  theme="colored"
                />
              </AcademicYearProvider>
            </TenantProvider>
          </AuthProvider>
        </Router>
      </DemoProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
