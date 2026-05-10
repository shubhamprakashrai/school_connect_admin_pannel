/** FCM notification service — `/notifications/*` */

import apiService from '../service/apiService';
import { NOTIFICATION_ENDPOINTS } from '../config/api.config';
import type { RegisterFcmTokenRequest } from '../types/notification';

export const notificationService = {
  /** POST /notifications/token — idempotent. Re-registering from same device updates the row. */
  registerToken(payload: RegisterFcmTokenRequest): Promise<{ message: string }> {
    return apiService.post(NOTIFICATION_ENDPOINTS.TOKEN, payload);
  },
  /** DELETE /notifications/token?token=… — called on logout. */
  unregisterToken(token: string): Promise<{ message: string }> {
    return apiService.delete(NOTIFICATION_ENDPOINTS.TOKEN, { params: { token } });
  },
};

export default notificationService;
