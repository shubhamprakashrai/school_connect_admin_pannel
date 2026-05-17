/** Parent + ParentPortal services */

import apiService from '../service/apiService';
import { PARENT_ENDPOINTS, PARENT_PORTAL_ENDPOINTS } from '../config/api.config';
import type {
  PaginatedParentSearchResponse,
  ParentChildSummary,
  ParentFilterRequest,
  ParentProfile,
  ParentRequest,
  ParentResponse,
} from '../types/parent';
import type { StudentResponse } from '../types/student';

export const parentService = {
  /** Backend `/parents` returns a flat List<ParentResponse> — not paginated. */
  list(): Promise<ParentResponse[]> {
    return apiService.getList(PARENT_ENDPOINTS.ROOT);
  },
  getById(id: string): Promise<ParentResponse> {
    return apiService.get(PARENT_ENDPOINTS.byId(id));
  },
  create(payload: ParentRequest): Promise<ParentResponse> {
    return apiService.post(PARENT_ENDPOINTS.ROOT, payload);
  },
  update(id: string, payload: ParentRequest): Promise<ParentResponse> {
    return apiService.put(PARENT_ENDPOINTS.byId(id), payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(PARENT_ENDPOINTS.byId(id));
  },
  /**
   * POST /parents/search — server-side paginated search.
   * Returns a paginated envelope with `content[]`, totals, and page flags.
   */
  search(filter: ParentFilterRequest): Promise<PaginatedParentSearchResponse> {
    return apiService.post(PARENT_ENDPOINTS.SEARCH, filter);
  },
  /**
   * GET /parents/user/{parentUserUuid}/students
   * Lists all students linked to a parent USER (not parent record). Used by
   * the parent portal as a fallback when the dedicated portal endpoint is
   * unavailable, and by admins to audit a parent's enrolments.
   */
  studentsByParentUser(parentUserUuid: string): Promise<StudentResponse[]> {
    return apiService.getList(PARENT_ENDPOINTS.studentsByParentUser(parentUserUuid));
  },
  /**
   * GET /parents/student/{studentId} — list every parent attached to a
   * student. Useful for the student-detail screen and emergency contact lookup.
   */
  byStudent(studentId: string): Promise<ParentResponse[]> {
    return apiService.getList(PARENT_ENDPOINTS.byStudent(studentId));
  },
  /**
   * POST /parents/{parentId}/students/{studentId} — attach an existing
   * parent record to a student. Backend tracks the relationship in a join
   * table, so this is idempotent on the (parent, student) pair.
   */
  linkStudent(parentId: string, studentId: string): Promise<ParentResponse> {
    return apiService.post(PARENT_ENDPOINTS.linkStudent(parentId, studentId), {});
  },
  /** DELETE /parents/{parentId}/students/{studentId} — break the link. */
  unlinkStudent(parentId: string, studentId: string): Promise<void> {
    return apiService.delete(PARENT_ENDPOINTS.linkStudent(parentId, studentId));
  },
  /**
   * PATCH /parents/{parentId}/status — toggle status (ACTIVE / INACTIVE /
   * SUSPENDED). Backend accepts the new status as a query param matching
   * the student-status pattern.
   */
  setStatus(parentId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ParentResponse> {
    return apiService.patch(PARENT_ENDPOINTS.status(parentId), undefined, { params: { status } });
  },
};

export const parentPortalService = {
  /** GET /parent-portal/students — own children */
  myChildren(): Promise<ParentChildSummary[]> {
    return apiService.getList(PARENT_PORTAL_ENDPOINTS.STUDENTS);
  },
  /** GET /parent-portal/students/{studentId} */
  childDetail(studentId: string): Promise<StudentResponse> {
    return apiService.get(PARENT_PORTAL_ENDPOINTS.studentById(studentId));
  },
  /**
   * GET /parent-portal/students/{studentId}/access-check
   *
   * Backend returns a raw `Boolean` body — NOT a `{ allowed: boolean }`
   * envelope. We expose `Promise<boolean>` so callers compare against the
   * primitive directly.
   */
  accessCheck(studentId: string): Promise<boolean> {
    return apiService.get(PARENT_PORTAL_ENDPOINTS.accessCheck(studentId));
  },
  /** GET /parent-portal/profile */
  myProfile(): Promise<ParentProfile> {
    return apiService.get(PARENT_PORTAL_ENDPOINTS.PROFILE);
  },
};

export default parentService;
