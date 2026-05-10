import BackendPendingState from '../../../../components/ui/BackendPendingState';

export default function EditNoticePage() {
  return (
    <BackendPendingState
      feature="Edit notice"
      expectedEndpoints={['PUT /notices/{id}', 'GET /notices/{id}']}
    />
  );
}
