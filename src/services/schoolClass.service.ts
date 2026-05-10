/**
 * Two backend controllers serve "class":
 *   - `/classes/*` (SchoolClassController) — class CRUD
 *   - `/class/*`   (ClassController)       — teacher-section operations
 * Exposed as two service objects from the same module so callers can pick.
 */

import apiService from '../service/apiService';
import {
  CLASS_ENDPOINTS,
  CLASS_TEACHER_LINK_ENDPOINTS,
  SECTION_ENDPOINTS,
} from '../config/api.config';
import type {
  CreateSchoolClassRequest,
  CreateSectionRequest,
  SchoolClassResponse,
  SectionResponse,
  UpdateSchoolClassRequest,
} from '../types/schoolClass';
import type { StudentResponse } from '../types/student';
import type { Page } from '../types/tenant';

export interface ListClassesParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export const schoolClassService = {
  /** GET /classes — flat array (used by dropdowns) */
  list(): Promise<SchoolClassResponse[]> {
    return apiService.getList(CLASS_ENDPOINTS.ROOT, { params: { size: 500 } });
  },
  /** GET /classes — paginated Page<T> (used by list view) */
  listPaginated(params: ListClassesParams = {}): Promise<Page<SchoolClassResponse>> {
    return apiService.get(CLASS_ENDPOINTS.ROOT, { params });
  },
  /** GET /classes/{id} */
  getById(id: string): Promise<SchoolClassResponse> {
    return apiService.get(CLASS_ENDPOINTS.byId(id));
  },
  /** POST /classes/create */
  create(payload: CreateSchoolClassRequest): Promise<SchoolClassResponse> {
    return apiService.post(CLASS_ENDPOINTS.CREATE, payload);
  },
  /** PUT /classes/{id} */
  update(id: string, payload: UpdateSchoolClassRequest): Promise<SchoolClassResponse> {
    return apiService.put(CLASS_ENDPOINTS.byId(id), payload);
  },
  /** DELETE /classes/{id} */
  remove(id: string): Promise<void> {
    return apiService.delete(CLASS_ENDPOINTS.byId(id));
  },
};

export const sectionService = {
  /** POST /sections */
  create(payload: CreateSectionRequest): Promise<SectionResponse> {
    return apiService.post(SECTION_ENDPOINTS.ROOT, payload);
  },
  /** GET /sections/class/{classId} */
  byClass(classId: string): Promise<SectionResponse[]> {
    return apiService.getList(SECTION_ENDPOINTS.byClass(classId));
  },
  /** PUT /sections/{sectionId} */
  update(sectionId: string, payload: CreateSectionRequest): Promise<SectionResponse> {
    return apiService.put(SECTION_ENDPOINTS.byId(sectionId), payload);
  },
  /** DELETE /sections/{sectionId} */
  remove(sectionId: string): Promise<void> {
    return apiService.delete(SECTION_ENDPOINTS.byId(sectionId));
  },
  /** GET /sections/{sectionId} */
  getById(sectionId: string): Promise<SectionResponse> {
    return apiService.get(SECTION_ENDPOINTS.byId(sectionId));
  },
  /** GET /sections/sections/by-name/{name} */
  byName(sectionName: string): Promise<SectionResponse[]> {
    return apiService.getList(SECTION_ENDPOINTS.byName(sectionName));
  },
};

export const classOpsService = {
  /** POST /class/assign-teacher */
  assignTeacher(payload: { teacherId: string; sectionId: string }): Promise<unknown> {
    return apiService.post(CLASS_TEACHER_LINK_ENDPOINTS.ASSIGN_TEACHER, payload);
  },
  /** DELETE /class/remove-teacher/{sectionId} */
  removeTeacher(sectionId: string): Promise<void> {
    return apiService.delete(CLASS_TEACHER_LINK_ENDPOINTS.removeTeacher(sectionId));
  },
  /** GET /class/section/{sectionId}/students */
  studentsBySection(sectionId: string): Promise<StudentResponse[]> {
    return apiService.getList(CLASS_TEACHER_LINK_ENDPOINTS.studentsBySection(sectionId));
  },
  /** GET /class/teacher/{teacherId}/sections */
  sectionsByTeacher(teacherId: string): Promise<SectionResponse[]> {
    return apiService.getList(CLASS_TEACHER_LINK_ENDPOINTS.sectionsByTeacher(teacherId));
  },
  /** GET /class/teacher/{teacherId}/section/{sectionId}/verify */
  verifyAssignment(teacherId: string, sectionId: string): Promise<{ assigned: boolean }> {
    return apiService.get(CLASS_TEACHER_LINK_ENDPOINTS.verifyAssignment(teacherId, sectionId));
  },
};

export default schoolClassService;
