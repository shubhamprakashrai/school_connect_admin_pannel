/**
 * Notification inbox DTOs — backend pending.
 *
 * Distinct from `notification.d.ts` which covers the FCM token registry
 * (already live). This is the in-app inbox: server-side messages an admin
 * sends, that users see in a bell-icon dropdown / inbox page.
 */

export type NotificationType =
  | 'ANNOUNCEMENT' | 'ATTENDANCE' | 'FEE_REMINDER' | 'EXAM_RESULT'
  | 'HOMEWORK' | 'EVENT' | 'GENERAL';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  link?: string;
  createdAt: string;
  readAt?: string;
}

export interface SendNotificationRequest {
  /** Targeting — at least one of userIds or audience. */
  userIds?: string[];
  audience?: 'ALL' | 'ADMINS' | 'TEACHERS' | 'PARENTS' | 'STUDENTS' | 'CLASS' | 'SECTION';
  classId?: string;
  sectionId?: string;
  title: string;
  body: string;
  type?: NotificationType;
  link?: string;
  data?: Record<string, unknown>;
}
