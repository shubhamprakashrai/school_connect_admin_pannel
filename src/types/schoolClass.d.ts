/** SchoolClass + Section DTOs */

export interface SectionResponse {
  id: string;
  name: string;
  capacity?: number;
  schoolClassId: string;
  schoolClassCode?: string;
  schoolClassName?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionRequest {
  name: string;
  capacity?: number;
  schoolClassId?: string;
}

export interface SchoolClassResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  sections: SectionResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSchoolClassRequest {
  name: string;
  description?: string;
}

export interface UpdateSchoolClassRequest {
  name?: string;
  description?: string;
}
