/**
 * Real Fee service — `/fees/*` (full domain — backend pending).
 *
 * Distinct from `fee.service.ts` which only carries the existing dashboard
 * stub endpoints (overdue + collection report). When the backend ships
 * the full fee domain, this service is the place pages will consume.
 */

import apiService from '../service/apiService';
import type {
  FeePaymentRequest,
  FeePaymentResponse,
  FeeStructure,
  FeeType,
  StudentFeeSummary,
} from '../types/feeReal';
import type { Page } from '../types/tenant';

const BASE = '/fees';

export const feeRealService = {
  // ---- Fee types (catalog of charges) -----------------------------------
  types(): Promise<FeeType[]> {
    return apiService.getList(`${BASE}/types`);
  },
  activeTypes(): Promise<FeeType[]> {
    return apiService.getList(`${BASE}/types/active`);
  },
  createType(payload: Omit<FeeType, 'id'>): Promise<FeeType> {
    return apiService.post(`${BASE}/types`, payload);
  },
  updateType(id: string, payload: Omit<FeeType, 'id'>): Promise<FeeType> {
    return apiService.put(`${BASE}/types/${id}`, payload);
  },
  removeType(id: string): Promise<void> {
    return apiService.delete(`${BASE}/types/${id}`);
  },

  // ---- Fee structures (per-class fee plans) -----------------------------
  structures(): Promise<FeeStructure[]> {
    return apiService.getList(`${BASE}/structure`);
  },
  structureById(id: string): Promise<FeeStructure> {
    return apiService.get(`${BASE}/structure/${id}`);
  },
  structureByClass(classId: string): Promise<FeeStructure[]> {
    return apiService.getList(`${BASE}/structure/class/${classId}`);
  },
  createStructure(payload: Omit<FeeStructure, 'id'>): Promise<FeeStructure> {
    return apiService.post(`${BASE}/structure`, payload);
  },

  // ---- Payments + receipts ----------------------------------------------
  recordPayment(payload: FeePaymentRequest): Promise<FeePaymentResponse> {
    return apiService.post(`${BASE}/payment`, payload);
  },
  payments(params: { page?: number; size?: number } = {}): Promise<Page<FeePaymentResponse>> {
    return apiService.get(`${BASE}/payments`, { params });
  },
  receipt(paymentId: string): Promise<FeePaymentResponse> {
    return apiService.get(`${BASE}/receipt/${paymentId}`);
  },

  // ---- Per-student views ------------------------------------------------
  studentSummary(studentId: string): Promise<StudentFeeSummary> {
    return apiService.get(`${BASE}/student/${studentId}`);
  },
  studentPending(studentId: string): Promise<FeePaymentResponse[]> {
    return apiService.getList(`${BASE}/student/${studentId}/pending`);
  },
};

export default feeRealService;
