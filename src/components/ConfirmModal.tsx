import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from './ui/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Confirmation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="mb-5 flex items-start gap-3">
        <div className="p-2 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-main">{title}</h2>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">{message}</p>
        </div>
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-border-color hover:bg-card text-xs font-semibold rounded-lg text-text-muted hover:text-text-main transition cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </ModalFooter>
    </Modal>
  );
};
