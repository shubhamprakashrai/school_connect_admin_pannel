import BackendPendingState from '../../../../components/ui/BackendPendingState';

export const ExamListPage = () => (
  <BackendPendingState
    feature="Exams"
    description="Schedule exams, define exam types, record marks, publish results, generate report cards. Mobile app's REST client at lib/presentation/views/exam/data/ defines the full contract — frontend service stays the design source of truth."
    expectedEndpoints={[
      'GET    /exams/types                          — exam catalog (Unit-test, Mid-term, Final…)',
      'GET    /exams/types/active                   — active types only',
      'POST   /exams/types                          — create',
      'PUT    /exams/types/{id}                     — edit',
      'DELETE /exams/types/{id}                     — delete',
      'POST   /exams                                — schedule an exam',
      'GET    /exams                                — list, filterable',
      'GET    /exams/{id}                           — single exam',
      'PUT    /exams/{id}                           — edit',
      'DELETE /exams/{id}                           — cancel',
      'GET    /exams/class/{classId}                — class-scoped',
      'GET    /exams/upcoming                       — next scheduled exams',
      'GET    /exams/upcoming/class/{classId}       — upcoming for a class',
      'POST   /exams/{id}/marks                     — submit per-student marks',
      'GET    /exams/{id}/results                   — aggregate results',
      'GET    /exams/{id}/statistics                — pass rate, average, distribution',
      'GET    /exams/students/{id}/results          — single student all-exam history',
      'GET    /exams/students/{id}/report-card      — printable PDF / structured response',
    ]}
  />
);

export default ExamListPage;
