import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MODAL_OVERLAY_ANIM, MODAL_PANEL_ANIM } from '../../constants/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  panelClassName?: string;
  noPadding?: boolean;
  overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  children,
  maxWidth = 'max-w-md',
  panelClassName = '',
  noPadding = false,
  overlayClassName = 'bg-editor/80',
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 ${overlayClassName}`}
      {...MODAL_OVERLAY_ANIM}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        {...MODAL_PANEL_ANIM}
        transition={{ duration: 0.2 }}
        className={`w-full ${maxWidth} bg-sidebar border border-border-color rounded-2xl shadow-2xl relative flex flex-col ${noPadding ? '' : 'p-6'} ${panelClassName}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

interface ModalHeaderProps {
  title: React.ReactNode;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => (
  <>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    )}
    <div className="mb-5">
      <h2 className="text-base font-bold text-text-main">{title}</h2>
    </div>
  </>
);

interface ModalFooterProps {
  children: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="flex gap-3 justify-end">{children}</div>
);
