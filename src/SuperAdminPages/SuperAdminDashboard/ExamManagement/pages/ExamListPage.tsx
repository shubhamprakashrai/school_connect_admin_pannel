import BackendPendingState from '../../../../components/ui/BackendPendingState';

export const ExamListPage = () => (
  <BackendPendingState
    feature="Exams"
    description="Schedule exams, run grading, publish results. Front-end is ready; awaiting backend ExamController."
    expectedEndpoints={[
      'POST   /exams                   — schedule an exam',
      'GET    /exams                   — list, filterable',
      'GET    /exams/{id}              — single exam',
      'PUT    /exams/{id}              — edit',
      'DELETE /exams/{id}              — cancel',
      'POST   /exams/{id}/results      — submit results',
      'GET    /exams/{id}/results      — view results',
    ]}
  />
);

export default ExamListPage;
