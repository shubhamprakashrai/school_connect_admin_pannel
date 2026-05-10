/** Attendance DTOs (student + teacher) */

export type StudentAttendanceStatus =
  | 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY' | 'EXCUSED';

export type AttendanceSession = 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
export type HalfDayType = 'MORNING' | 'AFTERNOON';

// Single student
export interface StudentAttendanceRequest {
  studentId: string;
  attendanceDate: string; // ISO date
  sectionId: string;
  academicYearId: string;
  status: StudentAttendanceStatus;
  remarks?: string;
  isHalfDay?: boolean;
  halfDayType?: HalfDayType;
}

// Bulk for a section
export interface BulkAttendanceRecord {
  studentId: string;
  status: StudentAttendanceStatus;
  remarks?: string;
  isHalfDay?: boolean;
  halfDayType?: HalfDayType;
}

export interface BulkAttendanceRequest {
  attendanceDate: string;
  sectionId: string;
  academicYearId: string;
  attendanceRecords: BulkAttendanceRecord[];
}

// Section/student summary
export interface AttendanceSummaryResponse {
  studentId?: string;
  studentName?: string;
  sectionId?: string;
  sectionName?: string;
  startDate: string;
  endDate: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  halfDays: number;
  attendancePercentage: number;
  dailyBreakdown?: Record<string, string>;
}

export interface StudentAttendanceResponse {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  attendanceDate: string;
  sectionId?: string;
  sectionName?: string;
  className?: string;
  academicYearId?: string;
  academicYearName?: string;
  status: StudentAttendanceStatus;
  remarks?: string;
  markedBy?: string;
  markedByName?: string;
  isHalfDay?: boolean;
  halfDayType?: HalfDayType;
  createdAt?: string;
  updatedAt?: string;
}

// Generic /attendance — covers student & teacher rows alike
export interface AttendanceResponse {
  id: string;
  studentId?: string;
  studentName?: string;
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
  teacherId?: string;
  teacherName?: string;
  employeeId?: string;
  department?: string;
  attendanceDate: string;
  status: string;
  session?: AttendanceSession;
  subject?: string;
  markedByTeacherId?: string;
  markedByTeacherName?: string;
  markedAt?: string;
  remarks?: string;
}

export interface AttendanceMarkingRequest {
  studentId: string;
  teacherClassId: string;
  attendanceDate: string;
  status: string;
  remarks?: string;
}

// Teacher bulk
export interface TeacherAttendanceRecord {
  teacherId: string;
  status: string;
  remarks?: string;
  checkInTime?: string;
  checkOutTime?: string;
  isHalfDay?: boolean;
  halfDayType?: string;
}

export interface BulkTeacherAttendanceRequest {
  attendanceDate: string;
  batchReference?: string;
  continueOnError?: boolean;
  attendanceRecords: TeacherAttendanceRecord[];
}

export interface BulkTeacherAttendanceError {
  rowIndex: number;
  errorMessage: string;
  errorType?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface BulkTeacherAttendanceResponse {
  batchReference: string;
  totalRequested: number;
  successful: number;
  failed: number;
  createdAttendanceRecords: AttendanceResponse[];
  errors: BulkTeacherAttendanceError[];
  processedAt: string;
}
