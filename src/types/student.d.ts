/** Student DTOs */

import type {
  EmergencyContact,
  Gender,
  MedicalInfo,
  ParentInfoDto,
  UserRequestDto,
} from './common';
import type { SchoolClassResponse, SectionResponse } from './schoolClass';

export interface StudentResponse {
  id: string;
  rollNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  dateOfBirth: string;
  gender: Gender;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  schoolClass?: SchoolClassResponse;
  section?: SectionResponse;
  admissionDate?: string;
  status?: string;
  photoUrl?: string;
  fatherInfo?: ParentInfoDto;
  motherInfo?: ParentInfoDto;
  guardianInfo?: ParentInfoDto;
  emergencyContact?: EmergencyContact;
}

export interface CreateStudentRequest {
  rollNumber?: string;
  userRequest: UserRequestDto;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  schoolClass: { id: string };
  section: { id: string };
  admissionDate: string;
  previousSchool?: string;
  fatherInfo?: ParentInfoDto;
  motherInfo?: ParentInfoDto;
  guardianInfo?: ParentInfoDto;
  emergencyContact: EmergencyContact;
  medicalInfo?: MedicalInfo;
  createUserAccount?: boolean;
}

export interface UpdateStudentRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  medicalInfo?: MedicalInfo;
  photoUrl?: string;
}

export interface StudentFilterRequest {
  classId?: string;
  sectionId?: string;
  status?: string;
  search?: string;
  gender?: Gender;
  feeCategory?: string;
  transportRouteId?: string;
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  studentsByClass: Record<string, number>;
  studentsByStatus: Record<string, number>;
}

export interface BulkStudentRequest {
  students: CreateStudentRequest[];
  batchReference?: string;
  continueOnError?: boolean;
}

export interface BulkStudentError {
  rowIndex: number;
  errorMessage: string;
  errorType: string;
  failedRequest?: CreateStudentRequest;
  studentIdentifier?: string;
}

export interface BulkStudentSectionSummary {
  sectionId: string;
  sectionName: string;
  totalRequested: number;
  successful: number;
  failed: number;
}

export interface BulkStudentResponse {
  batchReference: string;
  totalRequested: number;
  successful: number;
  failed: number;
  createdStudents: StudentResponse[];
  errors: BulkStudentError[];
  sectionSummaries: BulkStudentSectionSummary[];
  processedAt: string;
}
