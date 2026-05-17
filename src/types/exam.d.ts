/**
 * Exam DTOs — backend pending.
 * Shapes mirrored from the mobile Flutter app's exam module.
 */

export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PUBLISHED';

export interface ExamType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface ExamRequest {
  examTypeId: string;
  classId: string;
  subjectId: string;
  title: string;
  description?: string;
  examDate: string;
  startTime?: string;
  endTime?: string;
  maxMarks: number;
  passingMarks: number;
  status?: ExamStatus;
}

export interface ExamResponse {
  id: string;
  examTypeId: string;
  examTypeName?: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  description?: string;
  examDate: string;
  startTime?: string;
  endTime?: string;
  maxMarks: number;
  passingMarks: number;
  status: ExamStatus;
  studentCount?: number;
  marksSubmittedCount?: number;
}

export interface StudentMarkEntry {
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  marksObtained?: number | null;
  remarks?: string;
}

export interface ExamResults {
  examId: string;
  examTitle?: string;
  maxMarks: number;
  passingMarks: number;
  entries: StudentMarkEntry[];
}

export interface ExamStatistics {
  totalStudents: number;
  appeared: number;
  passed: number;
  failed: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passPercentage: number;
}

export interface ReportCardEntry {
  examId: string;
  examTitle?: string;
  examTypeName?: string;
  subjectName?: string;
  examDate?: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  passed: boolean;
}

export interface ReportCard {
  studentId: string;
  studentName?: string;
  className?: string;
  sectionName?: string;
  academicYearName?: string;
  entries: ReportCardEntry[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade?: string;
}
