import React, { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { Modal, ModalHeader, ModalFooter } from './ui/Modal';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onRename: (newTitle: string) => Promise<void>;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  onRename
}) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const prevIsOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setNewTitle(currentTitle);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, currentTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      await onRename(newTitle.trim());
      onClose();
    } catch (err) {
      console.error("Failed to rename draft:", err);
      alert("Failed to rename draft. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={
          <>
            <span className="block text-xs font-bold text-brand-accent uppercase tracking-wider mb-2 font-normal">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Rename Document
              </span>
            </span>
            <span className="block">Enter New Draft Title</span>
          </>
        }
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. My Tailored Software Resume"
            className="w-full bg-input-bg border border-border-color rounded-lg px-3.5 py-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent placeholder-text-muted/30"
            autoFocus
          />
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
            type="submit"
            disabled={loading || !newTitle.trim()}
            className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Title'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
