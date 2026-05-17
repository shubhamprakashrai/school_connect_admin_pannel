/**
 * In-app notifications inbox — backend pending.
 *
 * The frontend already has a topbar bell with mock unread count (see
 * `components/NotificationCenter.tsx`). When the backend ships the
 * `/notifications/user/*` family, that bell + this page swap to live
 * data via `notificationInboxService`.
 *
 * Note: completely separate from the FCM token register/unregister
 * service (which is already live and ships push from the server).
 */

import BackendPendingState from '../../../components/ui/BackendPendingState';

export default function NotificationsInboxPage() {
  return (
    <BackendPendingState
      feature="Notifications inbox"
      description="A per-user inbox of in-app notifications (announcements, attendance, fees, exam results, homework, events). The FCM push registry is already live; the inbox + send endpoints are pending."
      expectedEndpoints={[
        'GET    /notifications/user?page=&size=    — paginated inbox',
        'GET    /notifications/user/unread         — unread only',
        'GET    /notifications/user/unread/count   — bell badge counter',
        'POST   /notifications/{id}/read           — mark single read',
        'POST   /notifications/read-all            — mark all read',
        'POST   /notifications/send                — admin broadcast (targeted audience)',
        'POST   /notifications/token        ✅     — already works (FCM register)',
        'DELETE /notifications/token        ✅     — already works (FCM unregister)',
      ]}
    />
  );
}
