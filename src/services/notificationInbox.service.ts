/**
 * Notification inbox service — `/notifications/user/*` (backend pending).
 *
 * Distinct from `notification.service.ts` which handles FCM token register
 * / unregister (already live). This service is the in-app inbox: lists,
 * unread counts, mark-read, and the admin-side send endpoint.
 */

import apiService from '../service/apiService';
import type { AppNotification, SendNotificationRequest } from '../types/notificationInbox';
import type { Page } from '../types/tenant';

const BASE = '/notifications';

export const notificationInboxService = {
  /** GET /notifications/user?page=&size= — current user's inbox. */
  inbox(params: { page?: number; size?: number } = {}): Promise<Page<AppNotification>> {
    return apiService.get(`${BASE}/user`, { params });
  },
  /** GET /notifications/user/unread — only unread items. */
  unread(): Promise<AppNotification[]> {
    return apiService.getList(`${BASE}/user/unread`);
  },
  /** GET /notifications/user/unread/count — badge counter. */
  unreadCount(): Promise<{ count: number }> {
    return apiService.get(`${BASE}/user/unread/count`);
  },
  /** POST /notifications/{id}/read */
  markRead(notificationId: string): Promise<AppNotification> {
    return apiService.post(`${BASE}/${notificationId}/read`, {});
  },
  /** POST /notifications/read-all */
  markAllRead(): Promise<{ updated: number }> {
    return apiService.post(`${BASE}/read-all`, {});
  },
  /** POST /notifications/send — admin sends to targeted audience. */
  send(payload: SendNotificationRequest): Promise<{ recipientCount: number }> {
    return apiService.post(`${BASE}/send`, payload);
  },
};

export default notificationInboxService;
