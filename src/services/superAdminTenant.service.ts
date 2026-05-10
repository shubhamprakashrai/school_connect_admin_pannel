/**
 * SuperAdmin tenant service — `/superadmin/tenants/*`.
 * One method per backend route, in the order they appear in the controller.
 */

import apiService from '../service/apiService';
import { SUPERADMIN_TENANT_ENDPOINTS } from '../config/api.config';
import type {
  BulkTenantOperationRequest,
  Page,
  TenantFilterRequest,
  TenantRegistrationRequest,
  TenantRegistrationResponse,
  TenantResponse,
  TenantStatistics,
  TenantStatus,
  UpdateLimitsRequest,
  UpdateSubscriptionRequest,
  UpdateTenantRequest,
} from '../types/tenant';

export interface ListTenantsParams extends TenantFilterRequest {
  page?: number;
  size?: number;
}

export const superAdminTenantService = {
  /** POST /superadmin/tenants */
  create(payload: TenantRegistrationRequest): Promise<TenantRegistrationResponse> {
    return apiService.post(SUPERADMIN_TENANT_ENDPOINTS.ROOT, payload);
  },

  /** GET /superadmin/tenants */
  list(params: ListTenantsParams = {}): Promise<Page<TenantResponse>> {
    return apiService.get(SUPERADMIN_TENANT_ENDPOINTS.ROOT, { params });
  },

  /** GET /superadmin/tenants/{tenantId} */
  getById(tenantId: string): Promise<TenantResponse> {
    return apiService.get(SUPERADMIN_TENANT_ENDPOINTS.byId(tenantId));
  },

  /** PUT /superadmin/tenants/{tenantId} */
  update(tenantId: string, payload: UpdateTenantRequest): Promise<TenantResponse> {
    return apiService.put(SUPERADMIN_TENANT_ENDPOINTS.byId(tenantId), payload);
  },

  /** POST /superadmin/tenants/{tenantId}/activate */
  activate(tenantId: string): Promise<TenantResponse> {
    return apiService.post(SUPERADMIN_TENANT_ENDPOINTS.activate(tenantId));
  },

  /** POST /superadmin/tenants/{tenantId}/suspend */
  suspend(tenantId: string, reason?: string): Promise<TenantResponse> {
    return apiService.post(SUPERADMIN_TENANT_ENDPOINTS.suspend(tenantId), { reason });
  },

  /** DELETE /superadmin/tenants/{tenantId} (soft) */
  softDelete(tenantId: string): Promise<void> {
    return apiService.delete(SUPERADMIN_TENANT_ENDPOINTS.byId(tenantId));
  },

  /** DELETE /superadmin/tenants/{tenantId}/permanent */
  permanentDelete(tenantId: string): Promise<void> {
    return apiService.delete(SUPERADMIN_TENANT_ENDPOINTS.permanentDelete(tenantId));
  },

  /** POST /superadmin/tenants/{tenantId}/restore */
  restore(tenantId: string): Promise<TenantResponse> {
    return apiService.post(SUPERADMIN_TENANT_ENDPOINTS.restore(tenantId));
  },

  /** PUT /superadmin/tenants/{tenantId}/subscription */
  updateSubscription(
    tenantId: string,
    payload: UpdateSubscriptionRequest,
  ): Promise<TenantResponse> {
    return apiService.put(SUPERADMIN_TENANT_ENDPOINTS.subscription(tenantId), payload);
  },

  /** PUT /superadmin/tenants/{tenantId}/limits */
  updateLimits(tenantId: string, payload: UpdateLimitsRequest): Promise<TenantResponse> {
    return apiService.put(SUPERADMIN_TENANT_ENDPOINTS.limits(tenantId), payload);
  },

  /** GET /superadmin/tenants/statistics/global */
  globalStatistics(): Promise<Record<string, number | string>> {
    return apiService.get(SUPERADMIN_TENANT_ENDPOINTS.GLOBAL_STATISTICS);
  },

  /** GET /superadmin/tenants/status/{status} */
  byStatus(status: TenantStatus): Promise<TenantResponse[]> {
    return apiService.getList(SUPERADMIN_TENANT_ENDPOINTS.byStatus(status));
  },

  /** GET /superadmin/tenants/search */
  search(query: string): Promise<TenantResponse[]> {
    return apiService.getList(SUPERADMIN_TENANT_ENDPOINTS.SEARCH, { params: { query } });
  },

  /** GET /superadmin/tenants/{tenantId}/analytics */
  analytics(tenantId: string): Promise<TenantStatistics> {
    return apiService.get(SUPERADMIN_TENANT_ENDPOINTS.analytics(tenantId));
  },

  /** POST /superadmin/tenants/bulk/activate */
  bulkActivate(payload: BulkTenantOperationRequest): Promise<{ succeeded: number; failed: number }> {
    return apiService.post(SUPERADMIN_TENANT_ENDPOINTS.BULK_ACTIVATE, payload);
  },

  /** POST /superadmin/tenants/bulk/suspend */
  bulkSuspend(payload: BulkTenantOperationRequest): Promise<{ succeeded: number; failed: number }> {
    return apiService.post(SUPERADMIN_TENANT_ENDPOINTS.BULK_SUSPEND, payload);
  },

  /** GET /superadmin/tenants/{tenantId}/configuration */
  getConfiguration(tenantId: string): Promise<Record<string, string>> {
    return apiService.get(SUPERADMIN_TENANT_ENDPOINTS.configuration(tenantId));
  },

  /** PUT /superadmin/tenants/{tenantId}/configuration */
  updateConfiguration(
    tenantId: string,
    configuration: Record<string, string>,
  ): Promise<Record<string, string>> {
    return apiService.put(SUPERADMIN_TENANT_ENDPOINTS.configuration(tenantId), configuration);
  },
};

export default superAdminTenantService;
