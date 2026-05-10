/**
 * Tenant self-service — `/tenants/*`.
 * Used by the currently logged-in tenant admin to manage their own org.
 */

import apiService from '../service/apiService';
import { TENANT_ENDPOINTS } from '../config/api.config';
import type {
  TenantRegistrationRequest,
  TenantRegistrationResponse,
  TenantResponse,
  TenantStatistics,
  UpdateTenantRequest,
} from '../types/tenant';

export const tenantService = {
  /** POST /tenants/register — public signup */
  register(payload: TenantRegistrationRequest): Promise<TenantRegistrationResponse> {
    return apiService.post(TENANT_ENDPOINTS.REGISTER, payload);
  },

  /** GET /tenants/current */
  current(): Promise<TenantResponse> {
    return apiService.get(TENANT_ENDPOINTS.CURRENT);
  },

  /** PUT /tenants/{tenantId} */
  update(tenantId: string, payload: UpdateTenantRequest): Promise<TenantResponse> {
    return apiService.put(TENANT_ENDPOINTS.byId(tenantId), payload);
  },

  /** POST /tenants/{tenantId}/activate */
  activate(tenantId: string, activationCode?: string): Promise<TenantResponse> {
    return apiService.post(TENANT_ENDPOINTS.activate(tenantId), { activationCode });
  },

  /** POST /tenants/{tenantId}/suspend */
  suspend(tenantId: string, reason?: string): Promise<TenantResponse> {
    return apiService.post(TENANT_ENDPOINTS.suspend(tenantId), { reason });
  },

  /** GET /tenants/statistics */
  statistics(): Promise<TenantStatistics> {
    return apiService.get(TENANT_ENDPOINTS.STATISTICS);
  },

  /** GET /tenants/can-add-student */
  canAddStudent(): Promise<{ allowed: boolean; reason?: string }> {
    return apiService.get(TENANT_ENDPOINTS.CAN_ADD_STUDENT);
  },

  /** GET /tenants/can-add-teacher */
  canAddTeacher(): Promise<{ allowed: boolean; reason?: string }> {
    return apiService.get(TENANT_ENDPOINTS.CAN_ADD_TEACHER);
  },

  /** POST /tenants/update-student-count */
  updateStudentCount(delta: number): Promise<void> {
    return apiService.post(TENANT_ENDPOINTS.UPDATE_STUDENT_COUNT, { delta });
  },

  /** POST /tenants/update-teacher-count */
  updateTeacherCount(delta: number): Promise<void> {
    return apiService.post(TENANT_ENDPOINTS.UPDATE_TEACHER_COUNT, { delta });
  },

  /** POST /tenants/update-storage */
  updateStorage(deltaMb: number): Promise<void> {
    return apiService.post(TENANT_ENDPOINTS.UPDATE_STORAGE, { deltaMb });
  },
};

export default tenantService;
