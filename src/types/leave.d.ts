/** Leave module DTOs — backend currently stub, returns []. */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/** Placeholder until the real leave domain lands. */
export interface LeaveRequest {
  id?: string;
  applicantId?: string;
  applicantName?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: LeaveStatus;
  appliedAt?: string;
}
