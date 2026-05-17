/**
 * Leave — full workflow (types, balances, request/approve/reject lifecycle).
 *
 * Backend currently exposes a stub at `/leave/requests/pending` returning
 * an empty array. The full workflow — request submission, approvals, per-user
 * balances, summaries — is pending.
 *
 * Frontend service + types are wired (`leaveReal.service.ts`).
 */

import BackendPendingState from '../../../components/ui/BackendPendingState';

export default function LeavePage() {
  return (
    <BackendPendingState
      feature="Leave"
      description="Teachers / staff submit leave requests, admins approve or reject, balances tracked per leave-type per year. The dashboard's pending-requests stub already works; the full workflow is pending."
      expectedEndpoints={[
        'GET    /leave/types                             — leave catalog',
        'GET    /leave/types/active                      — active types',
        'POST   /leave/types                             — create',
        'PUT    /leave/types/{id}                        — edit',
        'DELETE /leave/types/{id}                        — delete',
        'GET    /leave/balance                           — my balances',
        'GET    /leave/balance/{userId}                  — user balances',
        'POST   /leave/balance/initialize                — set initial allocations',
        'POST   /leave/request                           — submit request',
        'GET    /leave/my                                — my requests',
        'GET    /leave/requests?page=&size=              — all requests',
        'GET    /leave/requests/pending     ✅           — already works (stub)',
        'POST   /leave/requests/{id}/approve             — approve',
        'POST   /leave/requests/{id}/reject              — reject',
        'POST   /leave/requests/{id}/cancel              — cancel own request',
        'GET    /leave/summary                           — my summary',
        'GET    /leave/summary/{userId}                  — user summary',
      ]}
    />
  );
}
