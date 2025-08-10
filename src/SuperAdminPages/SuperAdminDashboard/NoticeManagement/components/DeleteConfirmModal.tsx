import React from 'react';
import { Modal, Button } from 'antd';
import { Notice } from '../types/notice';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  notice?: Pick<Notice, 'title'>;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  notice,
  loading = false,
}) => {
  return (
    <Modal
      title="Delete Notice"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={onConfirm}
          loading={loading}
        >
          Delete
        </Button>,
      ]}
    >
      <p>
        Are you sure you want to delete the notice "<strong>{notice?.title}</strong>"? This action
        cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteConfirmModal;
