/**
 * Assignment / Homework DTOs — backend pending.
 *
 * Shapes mirrored from the mobile app's REST client at
 * `lib/presentation/views/assignment/data/`. Once the backend
 * AssignmentController ships these will be the contracts.
 */

export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'GRADED';
export type SubmissionStatus = 'SUBMITTED' | 'LATE' | 'MISSING' | 'GRADED';

export interface AssignmentRequest {
  title: string;
  description?: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  maxMarks?: number;
  attachmentIds?: string[];
}

export interface AssignmentResponse {
  id: string;
  title: string;
  description?: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  subjectId: string;
  subjectName?: string;
  teacherId: string;
  teacherName?: string;
  dueDate: string;
  maxMarks?: number;
  status: AssignmentStatus;
  submissionCount?: number;
  pendingCount?: number;
  createdAt?: string;
}

export interface AssignmentSubmissionRequest {
  studentId: string;
  content?: string;
  attachmentIds?: string[];
}

export interface AssignmentSubmissionResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  content?: string;
  submittedAt: string;
  status: SubmissionStatus;
  marksObtained?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface AssignmentStatistics {
  totalStudents: number;
  submitted: number;
  pending: number;
  graded: number;
  averageMarks?: number;
  highestMarks?: number;
  lowestMarks?: number;
}
