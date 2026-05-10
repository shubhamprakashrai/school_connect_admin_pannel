/** Notices — backend pending. Replaced dummy list with a clear status page. */

import BackendPendingState from '../../../../components/ui/BackendPendingState';

export default function NoticeListPage() {
  return (
    <BackendPendingState
      feature="Notices"
      description="Push announcements to students, teachers and parents — targeted by class, section, or audience. The frontend forms are ready; we're waiting on the backend NoticeController."
      expectedEndpoints={[
        'POST   /notices            — create a notice',
        'GET    /notices            — list, filterable by audience/status',
        'GET    /notices/{id}       — single notice',
        'PUT    /notices/{id}       — edit',
        'DELETE /notices/{id}       — withdraw',
        'POST   /notices/{id}/publish — broadcast',
      ]}
    />
  );
}
