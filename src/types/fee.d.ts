/** Fee module DTOs — backend currently stub, returns zero/empty. */

export interface CollectionReportResponse {
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
  monthlyCollection: number;
}

/** Placeholder until the real fee domain lands. */
export interface OverduePayment {
  id?: string;
  studentId?: string;
  studentName?: string;
  amount?: number;
  dueDate?: string;
  daysOverdue?: number;
}
