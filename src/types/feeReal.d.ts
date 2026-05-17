/**
 * Real Fee module DTOs — backend pending.
 *
 * Distinct from `types/fee.d.ts` which only carries the existing
 * dashboard-stub shapes (CollectionReportResponse). When backend ships
 * the real fee domain, these types model the payment lifecycle.
 */

export interface FeeType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface FeeStructureItem {
  id?: string;
  feeTypeId: string;
  feeTypeName?: string;
  amount: number;
  /** MONTHLY | QUARTERLY | TERM | ANNUAL */
  frequency?: string;
  isOptional?: boolean;
}

export interface FeeStructure {
  id: string;
  name: string;
  classId?: string;
  className?: string;
  academicYearId?: string;
  academicYearName?: string;
  items: FeeStructureItem[];
  totalAmount?: number;
}

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'REFUNDED';
export type PaymentMode = 'CASH' | 'CHEQUE' | 'ONLINE' | 'UPI' | 'CARD' | 'BANK_TRANSFER';

export interface FeePaymentRequest {
  studentId: string;
  feeStructureId?: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate?: string;
  referenceNumber?: string;
  remarks?: string;
}

export interface FeePaymentResponse {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName?: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  referenceNumber?: string;
  status: PaymentStatus;
  remarks?: string;
}

export interface StudentFeeSummary {
  studentId: string;
  studentName?: string;
  totalAssigned: number;
  totalPaid: number;
  totalPending: number;
  overdueAmount: number;
  nextDueDate?: string;
}
