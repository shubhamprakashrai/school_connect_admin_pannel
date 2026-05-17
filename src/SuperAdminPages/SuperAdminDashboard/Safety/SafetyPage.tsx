/**
 * Safety — campus alerts, incident logs, counseling sessions.
 *
 * Mobile app already has the views; admin panel waiting on the backend
 * SafetyController. Frontend service + types are wired
 * (`safety.service.ts`).
 */

import BackendPendingState from '../../../components/ui/BackendPendingState';

export default function SafetyPage() {
  return (
    <BackendPendingState
      feature="Safety"
      description="Broadcast campus alerts, log incidents (bullying / injury / behavioural / medical), and schedule counseling sessions. Mobile app surfaces incidents to parents in real time — admin needs the management side here."
      expectedEndpoints={[
        'GET    /safety/alerts                  — alert history',
        'GET    /safety/alerts/active           — currently active banners',
        'POST   /safety/alerts                  — admin broadcast',
        'POST   /safety/incidents               — log incident',
        'POST   /safety/counseling              — schedule counseling session',
      ]}
    />
  );
}
