import BackendPendingState from '../../../../components/ui/BackendPendingState';

export const ExamResultsPage = () => (
  <BackendPendingState
    feature="Exam results"
    description="Per-student grades, class averages and report cards. Awaiting backend ExamController."
    expectedEndpoints={[
      'GET  /exams/{id}/results',
      'POST /exams/{id}/results',
      'GET  /students/{id}/results',
    ]}
  />
);

export default ExamResultsPage;
