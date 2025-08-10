export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface StudentAttendance {
  studentId: string;
  rollNo: string;
  name: string;
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO date string
  class: string;
  section: string;
  students: StudentAttendance[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ClassSection {
  id: string;
  className: string;
  section: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
}
