/** Subject DTOs */

export type SubjectType = 'CORE' | 'ELECTIVE' | 'EXTRA_CURRICULAR';

export interface SubjectResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  type?: SubjectType;
  creditHours?: number;
  maxMarks?: number;
  passingMarks?: number;
  academicYear?: string;
  department?: string;
  isActive?: boolean;
  classIds?: string[];
  teacherIds?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectCreationRequest {
  name: string;
  code: string;
  description?: string;
  type?: SubjectType;
  creditHours?: number;
  maxMarks?: number;
  passingMarks?: number;
  academicYear?: string;
  classIds?: string[];
  teacherIds?: string[];
  department?: string;
  isActive?: boolean;
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface SubjectUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
}
