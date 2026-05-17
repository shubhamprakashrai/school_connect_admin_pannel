/**
 * Assignments — homework / project work tracking.
 *
 * Frontend service + types are wired and ready (`assignment.service.ts`).
 * Waiting on the backend AssignmentController — the mobile app's REST
 * client at `lib/presentation/views/assignment/data/` defines the shape
 * we're committing to.
 */

import BackendPendingState from '../../../components/ui/BackendPendingState';

export default function AssignmentsPage() {
  return (
    <BackendPendingState
      feature="Assignments"
      description="Create homework / project work, track submissions, and grade them. Mobile app and admin panel both expect the same /assignments endpoint family — frontend service is ready."
      expectedEndpoints={[
        'POST   /assignments                              — create',
        'GET    /assignments?page=&size=                  — list (paginated)',
        'GET    /assignments/{id}                         — single',
        'PUT    /assignments/{id}                         — edit',
        'DELETE /assignments/{id}                         — withdraw',
        'GET    /assignments/class/{classId}              — class-scoped',
        'GET    /assignments/subject/{subjectId}          — subject-scoped',
        'GET    /assignments/teacher/{teacherId}          — own assignments',
        'GET    /assignments/{id}/submissions             — submission list',
        'POST   /assignments/{id}/submit                  — student submit',
        'POST   /assignments/submissions/{id}/grade       — teacher grade',
        'GET    /assignments/student/{studentId}/submissions — student view',
        'GET    /assignments/{id}/statistics              — aggregate stats',
      ]}
    />
  );
}
