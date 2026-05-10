import BackendPendingState from '../../../../components/ui/BackendPendingState';

export default function AddNoticePage() {
  return (
    <BackendPendingState
      feature="Add notice"
      description="Compose targeted announcements for students, teachers, parents, or specific sections. The form is designed; awaiting backend NoticeController."
      expectedEndpoints={['POST /notices', 'POST /notices/{id}/publish']}
    />
  );
}
