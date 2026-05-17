/**
 * Fees — full payment lifecycle (types, structures, payments, receipts).
 *
 * Backend currently exposes only stub endpoints (`/overdue`,
 * `/report/collection`) that surface aggregate numbers on the dashboard.
 * The full domain — fee types, per-class structures, payment recording,
 * receipt generation, student summaries — is pending.
 *
 * Frontend service + types are wired (`feeReal.service.ts`).
 */

import BackendPendingState from '../../../components/ui/BackendPendingState';

export default function FeesPage() {
  return (
    <BackendPendingState
      feature="Fees"
      description="Define fee types, build per-class fee structures, record payments, and generate receipts. The dashboard collection-report stub already works; the full domain is pending backend implementation."
      expectedEndpoints={[
        'GET    /fees/types                              — fee catalog',
        'GET    /fees/types/active                       — active types only',
        'POST   /fees/types                              — create',
        'PUT    /fees/types/{id}                         — edit',
        'DELETE /fees/types/{id}                         — delete',
        'GET    /fees/structure                          — list per-class plans',
        'GET    /fees/structure/{id}                     — single',
        'GET    /fees/structure/class/{classId}          — by class',
        'POST   /fees/structure                          — create',
        'POST   /fees/payment                            — record payment',
        'GET    /fees/payments?page=&size=               — payment history',
        'GET    /fees/receipt/{paymentId}                — receipt PDF / data',
        'GET    /fees/student/{studentId}                — student summary',
        'GET    /fees/student/{studentId}/pending        — pending dues',
        'GET    /fees/overdue              ✅            — already works (stub)',
        'GET    /fees/report/collection    ✅            — already works (stub)',
      ]}
    />
  );
}
