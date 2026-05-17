/**
 * Real Leave service — `/leave/*` (full workflow — backend pending).
 *
 * Distinct from `leave.service.ts` which only carries the dashboard stub
 * (`/leave/requests/pending` returning []). When the workflow ships,
 * pages will swap to this service.
 */

import apiService from '../service/apiService';
import type {
  LeaveBalance,
  LeaveRequestRequest,
  LeaveRequestResponse,
  LeaveSummary,
  LeaveType,
} from '../types/leaveReal';
import type { Page } from '../types/tenant';

const BASE = '/leave';

export const leaveRealService = {
  // ---- Leave types (catalog) -------------------------------------------
  types(): Promise<LeaveType[]> {
    return apiService.getList(`${BASE}/types`);
  },
  activeTypes(): Promise<LeaveType[]> {
    return apiService.getList(`${BASE}/types/active`);
  },
  createType(payload: Omit<LeaveType, 'id'>): Promise<LeaveType> {
    return apiService.post(`${BASE}/types`, payload);
  },
  updateType(id: string, payload: Omit<LeaveType, 'id'>): Promise<LeaveType> {
    return apiService.put(`${BASE}/types/${id}`, payload);
  },
  removeType(id: string): Promise<void> {
    return apiService.delete(`${BASE}/types/${id}`);
  },

  // ---- Balances (per-user per-year) ------------------------------------
  myBalance(year?: number): Promise<LeaveBalance[]> {
    const yearParam = year ? `?year=${year}` : '';
    return apiService.getList(`${BASE}/balance${yearParam}`);
  },
  userBalance(userId: string, year?: number): Promise<LeaveBalance[]> {
    const yearParam = year ? `?year=${year}` : '';
    return apiService.getList(`${BASE}/balance/${userId}${yearParam}`);
  },
  initializeBalance(payload: { userId: string; year: number }): Promise<LeaveBalance[]> {
    return apiService.post(`${BASE}/balance/initialize`, payload);
  },

  // ---- Requests --------------------------------------------------------
  /** POST a leave request as the current user. */
  request(payload: LeaveRequestRequest): Promise<LeaveRequestResponse> {
    return apiService.post(`${BASE}/request`, payload);
  },
  myRequests(): Promise<LeaveRequestResponse[]> {
    return apiService.getList(`${BASE}/my`);
  },
  allRequests(params: { page?: number; size?: number } = {}): Promise<Page<LeaveRequestResponse>> {
    return apiService.get(`${BASE}/requests`, { params });
  },
  pendingRequests(): Promise<LeaveRequestResponse[]> {
    return apiService.getList(`${BASE}/requests/pending`);
  },
  approve(id: string, remarks?: string): Promise<LeaveRequestResponse> {
    return apiService.post(`${BASE}/requests/${id}/approve`, { remarks });
  },
  reject(id: string, rejectionReason: string): Promise<LeaveRequestResponse> {
    return apiService.post(`${BASE}/requests/${id}/reject`, { rejectionReason });
  },
  cancel(id: string): Promise<LeaveRequestResponse> {
    return apiService.post(`${BASE}/requests/${id}/cancel`, {});
  },

  // ---- Summary --------------------------------------------------------
  mySummary(): Promise<LeaveSummary> {
    return apiService.get(`${BASE}/summary`);
  },
  userSummary(userId: string): Promise<LeaveSummary> {
    return apiService.get(`${BASE}/summary/${userId}`);
  },
};

export default leaveRealService;
