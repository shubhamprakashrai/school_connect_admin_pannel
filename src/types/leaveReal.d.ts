/** Real Leave module DTOs — backend pending. */

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  maxDaysPerYear?: number;
  isActive?: boolean;
}

export type LeaveRequestStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequestRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentIds?: string[];
}

export interface LeaveRequestResponse {
  id: string;
  applicantId: string;
  applicantName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface LeaveBalance {
  userId: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  year: number;
  totalAllocated: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveSummary {
  userId?: string;
  year: number;
  balances: LeaveBalance[];
  recentRequests: LeaveRequestResponse[];
}
