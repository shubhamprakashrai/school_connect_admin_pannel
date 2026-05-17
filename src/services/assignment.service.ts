/**
 * Assignment service — `/assignments/*` (backend pending).
 *
 * Methods mirror the mobile app's repository contract. When the backend
 * AssignmentController ships, this service is already wired — pages just
 * need to swap their BackendPendingState for the real list/detail UIs.
 */

import apiService from '../service/apiService';
import type {
  AssignmentRequest,
  AssignmentResponse,
  AssignmentStatistics,
  AssignmentSubmissionRequest,
  AssignmentSubmissionResponse,
} from '../types/assignment';
import type { Page } from '../types/tenant';

const BASE = '/assignments';

export const assignmentService = {
  list(params: { page?: number; size?: number } = {}): Promise<Page<AssignmentResponse>> {
    return apiService.get(BASE, { params });
  },
  getById(id: string): Promise<AssignmentResponse> {
    return apiService.get(`${BASE}/${id}`);
  },
  byClass(classId: string): Promise<AssignmentResponse[]> {
    return apiService.getList(`${BASE}/class/${classId}`);
  },
  bySubject(subjectId: string): Promise<AssignmentResponse[]> {
    return apiService.getList(`${BASE}/subject/${subjectId}`);
  },
  byTeacher(teacherId: string): Promise<AssignmentResponse[]> {
    return apiService.getList(`${BASE}/teacher/${teacherId}`);
  },
  create(payload: AssignmentRequest): Promise<AssignmentResponse> {
    return apiService.post(BASE, payload);
  },
  update(id: string, payload: AssignmentRequest): Promise<AssignmentResponse> {
    return apiService.put(`${BASE}/${id}`, payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(`${BASE}/${id}`);
  },
  /** Per-assignment submissions (teacher view). */
  submissions(assignmentId: string): Promise<AssignmentSubmissionResponse[]> {
    return apiService.getList(`${BASE}/${assignmentId}/submissions`);
  },
  /** Per-student submissions (student/parent view). */
  byStudent(studentId: string): Promise<AssignmentSubmissionResponse[]> {
    return apiService.getList(`${BASE}/student/${studentId}/submissions`);
  },
  /** Submit work (student). */
  submit(assignmentId: string, payload: AssignmentSubmissionRequest): Promise<AssignmentSubmissionResponse> {
    return apiService.post(`${BASE}/${assignmentId}/submit`, payload);
  },
  /** Grade a submission (teacher). */
  grade(submissionId: string, marks: number, feedback?: string): Promise<AssignmentSubmissionResponse> {
    return apiService.post(`${BASE}/submissions/${submissionId}/grade`, { marks, feedback });
  },
  statistics(assignmentId: string): Promise<AssignmentStatistics> {
    return apiService.get(`${BASE}/${assignmentId}/statistics`);
  },
};

export default assignmentService;
