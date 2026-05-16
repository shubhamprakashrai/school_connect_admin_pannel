/**
 * StudentEnrollment DTOs — tracks year-by-year enrolment.
 *
 * Distinct from `Student`: a Student is the long-lived person record;
 * each year that student is enrolled produces one StudentEnrollment row
 * (class/section/roll for that academic year). End-of-year promotions
 * write a fresh row pointing to the next class.
 */

export type EnrollmentStatus =
  | 'ACTIVE'
  | 'PROMOTED'
  | 'WITHDRAWN'
  | 'TRANSFERRED'
  | 'GRADUATED';

export interface StudentEnrollmentRequest {
  studentId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber?: string;
}

export interface StudentEnrollmentResponse {
  id: string;

  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  enrollmentNumber?: string;

  academicYearId: string;
  academicYearName?: string;

  classId: string;
  className?: string;

  sectionId: string;
  sectionName?: string;

  rollNumber?: string;
  status?: EnrollmentStatus;

  promotedToClassId?: string;
  promotedToClassName?: string;
  promotedAt?: string;

  remarks?: string;
  createdAt?: string;
}

/** POST /enrollments/promote — bulk move a list of students into a new class/section. */
export interface PromoteRequest {
  studentIds: string[];
  fromAcademicYearId: string;
  toAcademicYearId: string;
  toClassId: string;
  toSectionId: string;
  remarks?: string;
}
