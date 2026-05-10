/** Leave service — `/leave/*` (backend stub returning []). */

import apiService from '../service/apiService';
import { LEAVE_ENDPOINTS } from '../config/api.config';
import type { LeaveRequest } from '../types/leave';

export const leaveService = {
  /** GET /leave/requests/pending — currently returns []. */
  pending(): Promise<LeaveRequest[]> {
    return apiService.getList(LEAVE_ENDPOINTS.PENDING);
  },
};

export default leaveService;
