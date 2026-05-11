/** Teacher DTOs */

import type { BankDetails, Gender, UserRequestDto } from './common';

export interface TeacherResponse {
  id: string;
  /**
   * UUID of the backing User account (distinct from the Teacher entity id).
   * Required when calling `/auth/admin-reset-password` and any other route
   * that operates on the User principal rather than the Teacher record.
   */
  userId?: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  joiningDate?: string;
  employeeType?: string;
  department?: string;
  designation?: string;
  subjects?: string[];
  classes?: string[];
  isClassTeacher?: boolean;
  classTeacherFor?: string;
  highestQualification?: string;
  experienceYears?: number;
  basicSalary?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  ifscCode?: string;
  status?: string;
  photoUrl?: string;
  rating?: number;
  age?: number;
  serviceYears?: number;
}

export interface TeacherCreationRequest {
  userRequest: UserRequestDto;
  additionalRoles?: string[];
  joiningDate: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  designation?: string;
  basicSalary: number;
  experienceYears: number;
  bankDetails?: BankDetails;
  highestQualification?: string;
}

export interface TeacherUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  designation?: string;
  department?: string;
  status?: string;
}

export interface TeacherFilterRequest {
  department?: string;
  designation?: string;
  status?: string;
  employeeType?: string;
  subject?: string;
  search?: string;
  classTeachersOnly?: boolean;
}

export interface TeacherStatistics {
  totalTeachers: number;
  activeTeachers: number;
  teachersByDepartment: Record<string, number>;
  teachersByEmployeeType: Record<string, number>;
  averageRatingByDepartment: Record<string, number>;
  classTeachers: number;
  averageExperience: number;
}

// Teacher assignment
export interface TeacherAssignmentRequest {
  teacherId: string;
  subjectId: string;
  sectionId: string;
  academicYear?: string;
}

export interface TeacherAssignmentUpdateRequest {
  subjectId?: string;
  sectionId?: string;
  academicYear?: string;
}

export interface TeacherAssignmentResponse {
  id: string;
  teacherId: string;
  teacherName?: string;
  subjectId: string;
  subjectName?: string;
  sectionId: string;
  sectionName?: string;
  classId?: string;
  className?: string;
  academicYear?: string;
  createdAt?: string;
}

export interface TeacherBatchAssignmentRequest {
  assignments: TeacherAssignmentRequest[];
}

export interface TeacherSubjectInfoResponse {
  teacherId: string;
  teacherName: string;
  subjects: Array<{ id: string; name: string; code: string }>;
}

export interface TeacherClassResponse {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  studentCount?: number;
}

// Class-teacher (homeroom) assignment
export interface AssignClassTeacherRequest {
  teacherId: string;
  sectionId: string;
}

export interface ClassTeacherAssignmentRequest {
  teacherId: string;
  sectionId: string;
  academicYear?: string;
}

export interface ClassTeacherResponse {
  id: string;
  teacherId: string;
  teacherName: string;
  sectionId: string;
  sectionName: string;
  classId?: string;
  className?: string;
  academicYear?: string;
}

export interface AssignTeacherToClassRequest {
  teacherId: string;
  sectionId: string;
}
