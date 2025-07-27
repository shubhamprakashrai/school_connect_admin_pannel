import { FC } from 'react';

interface RequestDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare const RequestDemoModal: FC<RequestDemoModalProps>;

export default RequestDemoModal;
