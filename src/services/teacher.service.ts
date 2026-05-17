/** Teacher + assignment + class-teacher services */

import apiService from '../service/apiService';
import {
  CLASS_TEACHER_ENDPOINTS,
  TEACHER_ASSIGNMENT_ENDPOINTS,
  TEACHER_ENDPOINTS,
} from '../config/api.config';
import type { Page } from '../types/tenant';
import type {
  AssignClassTeacherRequest,
  ClassTeacherResponse,
  TeacherAssignmentRequest,
  TeacherAssignmentResponse,
  TeacherAssignmentUpdateRequest,
  TeacherBatchAssignmentRequest,
  TeacherCreationRequest,
  TeacherFilterRequest,
  TeacherResponse,
  TeacherSubjectInfoResponse,
  TeacherUpdateRequest,
} from '../types/teacher';

export interface ListTeachersParams extends TeacherFilterRequest {
  page?: number;
  size?: number;
}

export const teacherService = {
  list(params: ListTeachersParams = {}): Promise<Page<TeacherResponse>> {
    return apiService.get(TEACHER_ENDPOINTS.ROOT, { params });
  },
  getById(teacherId: string): Promise<TeacherResponse> {
    return apiService.get(TEACHER_ENDPOINTS.byId(teacherId));
  },
  /**
   * GET /teachers/employee/{employeeId} — mobile-parity lookup by HR
   * employee id (e.g. "T001") instead of the entity UUID. Useful when
   * importing from legacy spreadsheets / payroll systems.
   */
  byEmployeeId(employeeId: string): Promise<TeacherResponse> {
    return apiService.get(TEACHER_ENDPOINTS.byEmployeeId(employeeId));
  },
  create(payload: TeacherCreationRequest): Promise<TeacherResponse> {
    return apiService.post(TEACHER_ENDPOINTS.ROOT, payload);
  },
  update(teacherId: string, payload: TeacherUpdateRequest): Promise<TeacherResponse> {
    return apiService.put(TEACHER_ENDPOINTS.byId(teacherId), payload);
  },
  remove(teacherId: string): Promise<void> {
    return apiService.delete(TEACHER_ENDPOINTS.byId(teacherId));
  },
};

export const teacherAssignmentService = {
  create(payload: TeacherAssignmentRequest): Promise<TeacherAssignmentResponse> {
    return apiService.post(TEACHER_ASSIGNMENT_ENDPOINTS.ROOT, payload);
  },
  getById(assignmentId: string): Promise<TeacherAssignmentResponse> {
    return apiService.get(TEACHER_ASSIGNMENT_ENDPOINTS.byId(assignmentId));
  },
  byTeacher(teacherId: string): Promise<TeacherAssignmentResponse[]> {
    return apiService.getList(TEACHER_ASSIGNMENT_ENDPOINTS.byTeacher(teacherId));
  },
  bySection(sectionId: string): Promise<TeacherAssignmentResponse[]> {
    return apiService.getList(TEACHER_ASSIGNMENT_ENDPOINTS.bySection(sectionId));
  },
  update(
    assignmentId: string,
    payload: TeacherAssignmentUpdateRequest,
  ): Promise<TeacherAssignmentResponse> {
    return apiService.put(TEACHER_ASSIGNMENT_ENDPOINTS.byId(assignmentId), payload);
  },
  remove(assignmentId: string): Promise<void> {
    return apiService.delete(TEACHER_ASSIGNMENT_ENDPOINTS.byId(assignmentId));
  },
  batch(payload: TeacherBatchAssignmentRequest): Promise<TeacherAssignmentResponse[]> {
    return apiService.postList(TEACHER_ASSIGNMENT_ENDPOINTS.BATCH, payload);
  },
  teacherSubjectsInfo(teacherId: string): Promise<TeacherSubjectInfoResponse> {
    return apiService.get(TEACHER_ASSIGNMENT_ENDPOINTS.teacherSubjectsInfo(teacherId));
  },
};

export interface ListClassTeachersParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export const classTeacherService = {
  /** flat array — used by dropdowns */
  list(): Promise<ClassTeacherResponse[]> {
    return apiService.getList(CLASS_TEACHER_ENDPOINTS.ROOT, { params: { size: 500 } });
  },
  /** paginated Page<T> — used by list view */
  listPaginated(params: ListClassTeachersParams = {}): Promise<Page<ClassTeacherResponse>> {
    return apiService.get(CLASS_TEACHER_ENDPOINTS.ROOT, { params });
  },
  assign(payload: AssignClassTeacherRequest): Promise<ClassTeacherResponse> {
    return apiService.post(CLASS_TEACHER_ENDPOINTS.ASSIGN, payload);
  },
  bySection(sectionId: string): Promise<ClassTeacherResponse> {
    return apiService.get(CLASS_TEACHER_ENDPOINTS.bySection(sectionId));
  },
  removeFromSection(sectionId: string): Promise<void> {
    return apiService.delete(CLASS_TEACHER_ENDPOINTS.bySection(sectionId));
  },
  byTeacher(teacherId: string): Promise<ClassTeacherResponse[]> {
    return apiService.getList(CLASS_TEACHER_ENDPOINTS.byTeacher(teacherId));
  },
  transfer(payload: { fromTeacherId: string; toTeacherId: string; sectionId: string }): Promise<ClassTeacherResponse> {
    return apiService.post(CLASS_TEACHER_ENDPOINTS.TRANSFER, payload);
  },
};

export default teacherService;
