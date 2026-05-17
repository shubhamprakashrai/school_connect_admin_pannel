/**
 * Centralized API configuration.
 *
 * Best practice: change BASE_URL in .env.* files only — every service in the
 * app imports from here, so a single env edit propagates everywhere.
 *
 * Endpoints are exposed as relative paths (no host) — the axios client
 * (`apiService`) is configured with BASE_URL, so paths combine naturally.
 * Functions are used wherever a path parameter is needed.
 */

// ---------------------------------------------------------------------------
// Runtime env (Vite injects these from .env.* files at build time)
// ---------------------------------------------------------------------------

const env = import.meta.env;

export const BASE_URL: string = env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const DEFAULT_TENANT_ID: string = env.VITE_DEFAULT_TENANT_ID || 'default';
export const API_TIMEOUT: number = Number(env.VITE_API_TIMEOUT) || 15000;
export const API_DEBUG: boolean = String(env.VITE_API_DEBUG) === 'true';

// ---------------------------------------------------------------------------
// Storage keys (single source — auth/tenant code reads from here)
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sc_access_token',
  REFRESH_TOKEN: 'sc_refresh_token',
  USER: 'sc_user',
  TENANT_ID: 'sc_tenant_id',
  IS_AUTHENTICATED: 'sc_is_authenticated',
} as const;

// ---------------------------------------------------------------------------
// Endpoint catalogue — every backend controller represented here.
// ---------------------------------------------------------------------------

/** /auth/* — AuthenticationController */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  INITIAL_RESET_PASSWORD: '/auth/Initialreset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  CHANGE_PASSWORD: '/auth/change-password',
  ADMIN_RESET_PASSWORD: '/auth/admin-reset-password',
  VALIDATE_TOKEN: '/auth/validate-token',
  /** GET ?token=… — public — return user identity for the welcome-email password screen. */
  FIRST_LOGIN_INFO: '/auth/first-login-info',
  /** POST { token, newPassword } — public — exchange welcome-email token + permanent password for AuthResponse. */
  FIRST_LOGIN: '/auth/first-login',
} as const;

/** /admins/* — AdminController */
export const ADMIN_ENDPOINTS = {
  ROOT: '/admins',
  byId: (adminId: string | number) => `/admins/${adminId}`,
} as const;

/** /users/* — UserController */
export const USER_ENDPOINTS = {
  ROOT: '/users',
  byId: (userId: string | number) => `/users/${userId}`,
  byRole: (role: string) => `/users/role/${role}`,
  status: (userId: string | number) => `/users/${userId}/status`,
  roles: (userId: string | number) => `/users/${userId}/roles`,
  removeRole: (userId: string | number, role: string) => `/users/${userId}/roles/${role}`,
  unlock: (userId: string | number) => `/users/${userId}/unlock`,
  verifyEmail: (userId: string | number) => `/users/${userId}/verify-email`,
  STATISTICS: '/users/statistics',
} as const;

/** /tenants/* — TenantController (self-service) */
export const TENANT_ENDPOINTS = {
  REGISTER: '/tenants/register',
  CURRENT: '/tenants/current',
  byId: (tenantId: string) => `/tenants/${tenantId}`,
  activate: (tenantId: string) => `/tenants/${tenantId}/activate`,
  suspend: (tenantId: string) => `/tenants/${tenantId}/suspend`,
  STATISTICS: '/tenants/statistics',
  CAN_ADD_STUDENT: '/tenants/can-add-student',
  CAN_ADD_TEACHER: '/tenants/can-add-teacher',
  UPDATE_STUDENT_COUNT: '/tenants/update-student-count',
  UPDATE_TEACHER_COUNT: '/tenants/update-teacher-count',
  UPDATE_STORAGE: '/tenants/update-storage',
} as const;

/** /superadmin/tenants/* — SuperAdminTenantController */
export const SUPERADMIN_TENANT_ENDPOINTS = {
  ROOT: '/superadmin/tenants',
  byId: (tenantId: string) => `/superadmin/tenants/${tenantId}`,
  activate: (tenantId: string) => `/superadmin/tenants/${tenantId}/activate`,
  suspend: (tenantId: string) => `/superadmin/tenants/${tenantId}/suspend`,
  permanentDelete: (tenantId: string) => `/superadmin/tenants/${tenantId}/permanent`,
  restore: (tenantId: string) => `/superadmin/tenants/${tenantId}/restore`,
  subscription: (tenantId: string) => `/superadmin/tenants/${tenantId}/subscription`,
  limits: (tenantId: string) => `/superadmin/tenants/${tenantId}/limits`,
  GLOBAL_STATISTICS: '/superadmin/tenants/statistics/global',
  byStatus: (status: string) => `/superadmin/tenants/status/${status}`,
  SEARCH: '/superadmin/tenants/search',
  analytics: (tenantId: string) => `/superadmin/tenants/${tenantId}/analytics`,
  BULK_ACTIVATE: '/superadmin/tenants/bulk/activate',
  BULK_SUSPEND: '/superadmin/tenants/bulk/suspend',
  configuration: (tenantId: string) => `/superadmin/tenants/${tenantId}/configuration`,
} as const;

/** /academic-years/* — AcademicYearController */
export const ACADEMIC_YEAR_ENDPOINTS = {
  ROOT: '/academic-years',
  byId: (id: string | number) => `/academic-years/${id}`,
  ACTIVE: '/academic-years/active',
  activate: (id: string | number) => `/academic-years/${id}/activate`,
} as const;

/** /classes/* — SchoolClassController (class CRUD) */
export const CLASS_ENDPOINTS = {
  ROOT: '/classes',
  CREATE: '/classes/create',
  byId: (id: string | number) => `/classes/${id}`,
} as const;

/** /class/* — ClassController (teacher/section ops) */
export const CLASS_TEACHER_LINK_ENDPOINTS = {
  ASSIGN_TEACHER: '/class/assign-teacher',
  removeTeacher: (sectionId: string | number) => `/class/remove-teacher/${sectionId}`,
  studentsBySection: (sectionId: string | number) => `/class/section/${sectionId}/students`,
  sectionsByTeacher: (teacherId: string | number) => `/class/teacher/${teacherId}/sections`,
  verifyAssignment: (teacherId: string | number, sectionId: string | number) =>
    `/class/teacher/${teacherId}/section/${sectionId}/verify`,
} as const;

/** /sections/* — SectionController */
export const SECTION_ENDPOINTS = {
  ROOT: '/sections',
  byClass: (classId: string | number) => `/sections/class/${classId}`,
  byId: (sectionId: string | number) => `/sections/${sectionId}`,
  byName: (sectionName: string) => `/sections/sections/by-name/${sectionName}`,
} as const;

/** /subjects/* — SubjectController */
export const SUBJECT_ENDPOINTS = {
  ROOT: '/subjects',
  BULK: '/subjects/bulk',
  PAGINATED: '/subjects/paginated',
  byId: (id: string | number) => `/subjects/${id}`,
  byCode: (code: string) => `/subjects/code/${code}`,
  byClass: (classId: string | number) => `/subjects/class/${classId}`,
  byTeacher: (teacherId: string | number) => `/subjects/teacher/${teacherId}`,
  SEARCH: '/subjects/search',
  assignToClass: (subjectId: string | number, classId: string | number) =>
    `/subjects/${subjectId}/assign-to-class/${classId}`,
  assignToTeacher: (subjectId: string | number, teacherId: string | number) =>
    `/subjects/${subjectId}/assign-to-teacher/${teacherId}`,
  removeFromClass: (subjectId: string | number, classId: string | number) =>
    `/subjects/${subjectId}/remove-from-class/${classId}`,
  removeFromTeacher: (subjectId: string | number, teacherId: string | number) =>
    `/subjects/${subjectId}/remove-from-teacher/${teacherId}`,
} as const;

/** /students/* — StudentController */
export const STUDENT_ENDPOINTS = {
  ROOT: '/students',
  byId: (studentId: string | number) => `/students/${studentId}`,
  status: (studentId: string | number) => `/students/${studentId}/status`,
  STATISTICS: '/students/statistics',
  byClass: (classId: string | number) => `/students/class/${classId}`,
  bySection: (sectionId: string | number) => `/students/section/${sectionId}`,
  SEARCH: '/students/search',
  /** GET — server-generated CSV with optional filter query string. */
  EXPORT: '/students/export',
} as const;

/** /students/bulk/* — BulkStudentController */
export const BULK_STUDENT_ENDPOINTS = {
  ROOT: '/students/bulk',
  TEMPLATE: '/students/bulk/template',
  VALIDATE: '/students/bulk/validate',
} as const;

/** /teachers/* — TeacherController */
export const TEACHER_ENDPOINTS = {
  ROOT: '/teachers',
  byId: (teacherId: string | number) => `/teachers/${teacherId}`,
  /** Mobile-parity lookup — used when only the employee id is on hand
   *  (e.g. legacy roll lists from HR). Falls through to 404 if no match. */
  byEmployeeId: (employeeId: string) => `/teachers/employee/${employeeId}`,
} as const;

/** /teachers/bulk-attendance/* — BulkTeacherAttendanceController */
export const TEACHER_BULK_ATTENDANCE_ENDPOINTS = {
  ROOT: '/teachers/bulk-attendance',
  TEMPLATE: '/teachers/bulk-attendance/template',
  VALIDATE: '/teachers/bulk-attendance/validate',
  byId: (id: string | number) => `/teachers/bulk-attendance/${id}`,
} as const;

/** /teacher-assignments/* — TeacherAssignmentController */
export const TEACHER_ASSIGNMENT_ENDPOINTS = {
  ROOT: '/teacher-assignments',
  byId: (assignmentId: string | number) => `/teacher-assignments/${assignmentId}`,
  byTeacher: (teacherId: string | number) => `/teacher-assignments/teacher/${teacherId}`,
  bySection: (sectionId: string | number) => `/teacher-assignments/section/${sectionId}`,
  BATCH: '/teacher-assignments/batch',
  teacherSubjectsInfo: (teacherId: string | number) =>
    `/teacher-assignments/teacher/${teacherId}/subjects-info`,
} as const;

/** /class-teachers/* — ClassTeacherController */
export const CLASS_TEACHER_ENDPOINTS = {
  ROOT: '/class-teachers',
  ASSIGN: '/class-teachers/assign',
  bySection: (sectionId: string | number) => `/class-teachers/section/${sectionId}`,
  byTeacher: (teacherId: string | number) => `/class-teachers/teacher/${teacherId}`,
  TRANSFER: '/class-teachers/transfer',
} as const;

/** /parents/* — ParentController */
export const PARENT_ENDPOINTS = {
  ROOT: '/parents',
  byId: (id: string | number) => `/parents/${id}`,
  /** POST body — paginated server-side search with filters. */
  SEARCH: '/parents/search',
  /** GET — all students linked to a parent's *user* UUID (not parent record id). */
  studentsByParentUser: (parentUserUuid: string) =>
    `/parents/user/${parentUserUuid}/students`,
  /** PATCH — toggle parent status (ACTIVE / INACTIVE / SUSPENDED). */
  status: (parentId: string) => `/parents/${parentId}/status`,
  /** POST to link / DELETE to unlink a (parent, student) pair. */
  linkStudent: (parentId: string, studentId: string) =>
    `/parents/${parentId}/students/${studentId}`,
  /** GET — every parent of a given student. */
  byStudent: (studentId: string) => `/parents/student/${studentId}`,
} as const;

/** /parent-portal/* — ParentPortalController */
export const PARENT_PORTAL_ENDPOINTS = {
  STUDENTS: '/parent-portal/students',
  studentById: (studentId: string | number) => `/parent-portal/students/${studentId}`,
  accessCheck: (studentId: string | number) =>
    `/parent-portal/students/${studentId}/access-check`,
  PROFILE: '/parent-portal/profile',
} as const;

/** /attendance/* — AttendanceController (generic mark) */
export const ATTENDANCE_ENDPOINTS = {
  ROOT: '/attendance',
} as const;

/** /student/attendance/* — StudentAttendanceController */
export const STUDENT_ATTENDANCE_ENDPOINTS = {
  ROOT: '/student/attendance',
  BULK: '/student/attendance/bulk',
  byId: (id: string | number) => `/student/attendance/${id}`,
  byStudentAndDate: (studentId: string | number, date: string) =>
    `/student/attendance/student/${studentId}/date/${date}`,
  bySectionAndDate: (sectionId: string | number, date: string) =>
    `/student/attendance/section/${sectionId}/date/${date}`,
  studentSummary: (studentId: string | number) =>
    `/student/attendance/student/${studentId}/summary`,
} as const;

/**
 * /calendar-events/* — CalendarEventController (refactored May 2026)
 *
 * The old `/by-date`, `/by-range`, `/by-academic-year/*` and `/is-working-day`
 * endpoints are gone. All reads go through the paginated `/search` endpoint,
 * which is audience-aware (PARENT/STUDENT roles see only events targeted to
 * them). Writes also got new shapes: events now carry `applicableSections`
 * (UUID[]) and `audienceType` (`ADMIN|SUPER_ADMIN|TEACHERS|STUDENTS|PARENTS|ALL`).
 */
export const CALENDAR_EVENT_ENDPOINTS = {
  ROOT: '/calendar-events',
  byId: (id: string | number) => `/calendar-events/${id}`,
  SEARCH: '/calendar-events/search',
  /** Create an academic-calendar event (audience-targeted) */
  ACADEMIC: '/calendar-events/academic',
  /** Delete an academic-calendar event */
  deleteAcademic: (id: string | number) => `/calendar-events/academic/${id}`,
  /** PUT — update sections + audience for an existing event */
  updateSectionsAudience: (id: string | number) =>
    `/calendar-events/${id}/sections-audience`,
} as const;

/** /config/* — MobileConfigController */
export const MOBILE_CONFIG_ENDPOINTS = {
  MOBILE: '/config/mobile',
  UPDATE: '/config/update',
  ROOT: '/config',
} as const;

// Parent search & relationship endpoints (added May 2026 alongside the
// student↔parent mapping refactor).
//
// `searchParents` is a POST body filter, not GET query, because the filter
// shape is rich (search/city/minChildren/email/phone/page/size/sort).
// `studentsByParentUser` returns a flat List<StudentResponse>.
//
// Both live under PARENT_ENDPOINTS to keep the parent-domain config in one
// place; declared here as additions to avoid disturbing the original block.

/** /master-data/* — MasterDataController. Tenant-scoped lookup tables (DESIGNATION, DEPARTMENT, BLOOD_GROUP, etc). */
export const MASTER_DATA_ENDPOINTS = {
  ROOT: '/master-data',
  ALL: '/master-data/all',
  CATEGORIES: '/master-data/categories',
  byId: (id: string | number) => `/master-data/${id}`,
} as const;

/** /notifications/* — NotificationController. FCM token registration. */
export const NOTIFICATION_ENDPOINTS = {
  TOKEN: '/notifications/token',
} as const;

/** /fees/* — FeeController (stub). Real domain pending — endpoints return zero/empty. */
export const FEE_ENDPOINTS = {
  OVERDUE: '/fees/overdue',
  COLLECTION_REPORT: '/fees/report/collection',
} as const;

/** /leave/* — LeaveController (stub). Real workflow pending. */
export const LEAVE_ENDPOINTS = {
  PENDING: '/leave/requests/pending',
} as const;

/** /time-slots/* — TimeSlotController. Bell schedule (periods + breaks). */
export const TIME_SLOT_ENDPOINTS = {
  ROOT: '/time-slots',
  /** Admin-only — includes inactive slots. */
  ALL: '/time-slots/all',
  byId: (id: string) => `/time-slots/${id}`,
  toggleActive: (id: string) => `/time-slots/${id}/toggle-active`,
} as const;

/** /timetable/* — TimetableController. Per-section weekly grid. */
export const TIMETABLE_ENDPOINTS = {
  upsertEntry: (sectionId: string) => `/timetable/section/${sectionId}/entry`,
  deleteEntry: (sectionId: string) => `/timetable/section/${sectionId}/entry`,
  bySection: (sectionId: string) => `/timetable/section/${sectionId}`,
  byTeacher: (teacherId: string) => `/timetable/teacher/${teacherId}`,
} as const;

/** /enrollments/* — StudentEnrollmentController. Year-over-year enrolment + promotion. */
export const ENROLLMENT_ENDPOINTS = {
  ROOT: '/enrollments',
  history: (studentId: string) => `/enrollments/student/${studentId}/history`,
  bySession: (academicYearId: string) => `/enrollments/session/${academicYearId}`,
  PROMOTE: '/enrollments/promote',
} as const;

/** /sections/* (extras) — SectionDetailController */
export const SECTION_DETAIL_ENDPOINTS = {
  detail: (sectionId: string) => `/sections/${sectionId}/detail`,
  createConfig: (sectionId: string) => `/sections/${sectionId}/timetable-config`,
  updateConfig: (sectionId: string) => `/sections/${sectionId}/timetable-config`,
} as const;

// ---------------------------------------------------------------------------
// Convenience export — single object containing every group.
// Use this when iterating, debugging, or wiring a generic API explorer.
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  USER: USER_ENDPOINTS,
  TENANT: TENANT_ENDPOINTS,
  SUPERADMIN_TENANT: SUPERADMIN_TENANT_ENDPOINTS,
  ACADEMIC_YEAR: ACADEMIC_YEAR_ENDPOINTS,
  CLASS: CLASS_ENDPOINTS,
  CLASS_TEACHER_LINK: CLASS_TEACHER_LINK_ENDPOINTS,
  SECTION: SECTION_ENDPOINTS,
  SUBJECT: SUBJECT_ENDPOINTS,
  STUDENT: STUDENT_ENDPOINTS,
  BULK_STUDENT: BULK_STUDENT_ENDPOINTS,
  TEACHER: TEACHER_ENDPOINTS,
  TEACHER_BULK_ATTENDANCE: TEACHER_BULK_ATTENDANCE_ENDPOINTS,
  TEACHER_ASSIGNMENT: TEACHER_ASSIGNMENT_ENDPOINTS,
  CLASS_TEACHER: CLASS_TEACHER_ENDPOINTS,
  PARENT: PARENT_ENDPOINTS,
  PARENT_PORTAL: PARENT_PORTAL_ENDPOINTS,
  ATTENDANCE: ATTENDANCE_ENDPOINTS,
  STUDENT_ATTENDANCE: STUDENT_ATTENDANCE_ENDPOINTS,
  CALENDAR_EVENT: CALENDAR_EVENT_ENDPOINTS,
  MOBILE_CONFIG: MOBILE_CONFIG_ENDPOINTS,
  MASTER_DATA: MASTER_DATA_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  FEE: FEE_ENDPOINTS,
  LEAVE: LEAVE_ENDPOINTS,
  TIME_SLOT: TIME_SLOT_ENDPOINTS,
  TIMETABLE: TIMETABLE_ENDPOINTS,
  ENROLLMENT: ENROLLMENT_ENDPOINTS,
  SECTION_DETAIL: SECTION_DETAIL_ENDPOINTS,
} as const;

export default {
  BASE_URL,
  DEFAULT_TENANT_ID,
  API_TIMEOUT,
  API_DEBUG,
  STORAGE_KEYS,
  ...API_ENDPOINTS,
};
