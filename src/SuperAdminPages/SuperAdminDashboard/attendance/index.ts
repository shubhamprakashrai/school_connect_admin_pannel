// Types
export type { 
  AttendanceRecord, 
  AttendanceStatus, 
  StudentAttendance, 
  ClassSection, 
  Student 
} from './types/attendance';

// Pages
export { default as AttendanceListPage } from './pages/AttendanceListPage';
export { default as MarkAttendancePage } from './pages/MarkAttendancePage';
export { default as ViewAttendancePage } from './pages/ViewAttendancePage';
export { default as EditAttendancePage } from './pages/EditAttendancePage';

// Components
export { default as AttendanceList } from './components/AttendanceList';
export { default as DeleteConfirmationModal } from './components/DeleteConfirmationModal';

// Utils
export { 
  filterAttendanceRecords, 
  sortAttendanceRecords, 
  getAttendanceStats, 
  initializeStudentAttendance,
  getStatusBadgeClass
} from './utils/attendanceHelpers';

// Data
export { dummyStudents, classSections } from './data/dummyStudents';
export { dummyAttendanceRecords } from './data/dummyAttendanceData';
