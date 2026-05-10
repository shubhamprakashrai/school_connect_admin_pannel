import BackendPendingState from '../../../../components/ui/BackendPendingState';

export const ScheduleExamPage = () => (
  <BackendPendingState
    feature="Schedule exam"
    description="Pick a class, subjects, dates and venues. Awaiting backend ExamController."
    expectedEndpoints={['POST /exams', 'POST /exams/{id}/schedule']}
  />
);

export default ScheduleExamPage;
