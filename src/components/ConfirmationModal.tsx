import React from 'react';
import { Button } from '@/components/ui/button';
import Modal from './Modal'; // Import the generic Modal component

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      zIndex={1001} // Higher z-index for confirmation modal
    >
      <p>{message}</p>
      <div className="confirmation-modal-actions">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="default" onClick={onConfirm}>Confirmar</Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
