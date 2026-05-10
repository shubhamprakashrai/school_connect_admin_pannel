/** Fee service — `/fees/*` (currently backend stub returning zero/empty). */

import apiService from '../service/apiService';
import { FEE_ENDPOINTS } from '../config/api.config';
import type { CollectionReportResponse, OverduePayment } from '../types/fee';

export const feeService = {
  /** GET /fees/overdue — currently returns []. */
  overdue(): Promise<OverduePayment[]> {
    return apiService.getList(FEE_ENDPOINTS.OVERDUE);
  },
  /** GET /fees/report/collection — returns zero figures until fee domain ships. */
  collectionReport(): Promise<CollectionReportResponse> {
    return apiService.get(FEE_ENDPOINTS.COLLECTION_REPORT);
  },
};

export default feeService;
