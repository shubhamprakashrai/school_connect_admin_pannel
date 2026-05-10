/** Subject service — `/subjects/*` */

import apiService from '../service/apiService';
import { SUBJECT_ENDPOINTS } from '../config/api.config';
import type { Page } from '../types/tenant';
import type {
  SubjectCreationRequest,
  SubjectResponse,
  SubjectUpdateRequest,
} from '../types/subject';

export const subjectService = {
  list(): Promise<SubjectResponse[]> {
    return apiService.getList(SUBJECT_ENDPOINTS.ROOT);
  },
  paginated(params: { page?: number; size?: number; search?: string } = {}): Promise<Page<SubjectResponse>> {
    return apiService.get(SUBJECT_ENDPOINTS.PAGINATED, { params });
  },
  getById(id: string): Promise<SubjectResponse> {
    return apiService.get(SUBJECT_ENDPOINTS.byId(id));
  },
  byCode(code: string): Promise<SubjectResponse> {
    return apiService.get(SUBJECT_ENDPOINTS.byCode(code));
  },
  byClass(classId: string): Promise<SubjectResponse[]> {
    return apiService.getList(SUBJECT_ENDPOINTS.byClass(classId));
  },
  byTeacher(teacherId: string): Promise<SubjectResponse[]> {
    return apiService.getList(SUBJECT_ENDPOINTS.byTeacher(teacherId));
  },
  search(query: string): Promise<SubjectResponse[]> {
    return apiService.getList(SUBJECT_ENDPOINTS.SEARCH, { params: { query } });
  },
  create(payload: SubjectCreationRequest): Promise<SubjectResponse> {
    return apiService.post(SUBJECT_ENDPOINTS.ROOT, payload);
  },
  bulkCreate(payload: SubjectCreationRequest[]): Promise<SubjectResponse[]> {
    return apiService.postList(SUBJECT_ENDPOINTS.BULK, payload);
  },
  update(id: string, payload: SubjectUpdateRequest): Promise<SubjectResponse> {
    return apiService.put(SUBJECT_ENDPOINTS.byId(id), payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(SUBJECT_ENDPOINTS.byId(id));
  },
  assignToClass(subjectId: string, classId: string): Promise<unknown> {
    return apiService.post(SUBJECT_ENDPOINTS.assignToClass(subjectId, classId));
  },
  assignToTeacher(subjectId: string, teacherId: string): Promise<unknown> {
    return apiService.post(SUBJECT_ENDPOINTS.assignToTeacher(subjectId, teacherId));
  },
  removeFromClass(subjectId: string, classId: string): Promise<void> {
    return apiService.delete(SUBJECT_ENDPOINTS.removeFromClass(subjectId, classId));
  },
  removeFromTeacher(subjectId: string, teacherId: string): Promise<void> {
    return apiService.delete(SUBJECT_ENDPOINTS.removeFromTeacher(subjectId, teacherId));
  },
};

export default subjectService;
