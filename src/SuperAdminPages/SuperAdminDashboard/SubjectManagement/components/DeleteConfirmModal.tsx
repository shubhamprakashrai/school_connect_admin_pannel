import React from 'react';
import { Modal, Button } from 'antd';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'this item',
  loading = false,
}) => {
  return (
    <Modal
      title="Confirm Delete"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
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
      <p>Are you sure you want to delete {itemName}? This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteConfirmModal;