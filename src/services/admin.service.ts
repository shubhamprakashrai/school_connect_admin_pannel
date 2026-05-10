/** Admin + User management services */

import apiService from '../service/apiService';
import { ADMIN_ENDPOINTS, USER_ENDPOINTS } from '../config/api.config';
import type { Page } from '../types/tenant';
import type {
  AdminRequest,
  AdminResponse,
  AdminUpdateRequest,
  UpdateUserRequest,
  UserStatistics,
  UserSummary,
} from '../types/admin';

export interface ListAdminsParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export const adminService = {
  /** flat array — used by dropdowns */
  list(): Promise<AdminResponse[]> {
    return apiService.getList(ADMIN_ENDPOINTS.ROOT, { params: { size: 500 } });
  },
  /** paginated Page<T> — used by list view */
  listPaginated(params: ListAdminsParams = {}): Promise<Page<AdminResponse>> {
    return apiService.get(ADMIN_ENDPOINTS.ROOT, { params });
  },
  getById(adminId: string): Promise<AdminResponse> {
    return apiService.get(ADMIN_ENDPOINTS.byId(adminId));
  },
  create(payload: AdminRequest): Promise<AdminResponse> {
    return apiService.post(ADMIN_ENDPOINTS.ROOT, payload);
  },
  update(adminId: string, payload: AdminUpdateRequest): Promise<AdminResponse> {
    return apiService.put(ADMIN_ENDPOINTS.byId(adminId), payload);
  },
  remove(adminId: string): Promise<void> {
    return apiService.delete(ADMIN_ENDPOINTS.byId(adminId));
  },
};

export const userService = {
  list(params: { page?: number; size?: number; search?: string; status?: string } = {}): Promise<Page<UserSummary>> {
    return apiService.get(USER_ENDPOINTS.ROOT, { params });
  },
  byRole(role: string): Promise<UserSummary[]> {
    return apiService.getList(USER_ENDPOINTS.byRole(role));
  },
  getById(userId: string): Promise<UserSummary> {
    return apiService.get(USER_ENDPOINTS.byId(userId));
  },
  update(userId: string, payload: UpdateUserRequest): Promise<UserSummary> {
    return apiService.put(USER_ENDPOINTS.byId(userId), payload);
  },
  setStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED'): Promise<UserSummary> {
    return apiService.patch(USER_ENDPOINTS.status(userId), { status });
  },
  remove(userId: string): Promise<void> {
    return apiService.delete(USER_ENDPOINTS.byId(userId));
  },
  addRole(userId: string, role: string): Promise<UserSummary> {
    return apiService.post(USER_ENDPOINTS.roles(userId), { role });
  },
  removeRole(userId: string, role: string): Promise<UserSummary> {
    return apiService.delete(USER_ENDPOINTS.removeRole(userId, role));
  },
  unlock(userId: string): Promise<UserSummary> {
    return apiService.post(USER_ENDPOINTS.unlock(userId));
  },
  forceVerifyEmail(userId: string): Promise<UserSummary> {
    return apiService.post(USER_ENDPOINTS.verifyEmail(userId));
  },
  statistics(): Promise<UserStatistics> {
    return apiService.get(USER_ENDPOINTS.STATISTICS);
  },
};

export default adminService;
