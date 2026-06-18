import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';

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

  useEffect(() => {
    setNewTitle(currentTitle);
  }, [currentTitle, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-editor/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-sidebar border border-border-color rounded-2xl shadow-2xl p-6 relative flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="text-xs font-bold text-brand-accent flex items-center gap-1.5 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            Rename Document
          </div>
          <h2 className="text-base font-bold text-text-main">
            Enter New Draft Title
          </h2>
        </div>

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

          <div className="flex gap-3 justify-end pt-2">
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
          </div>
        </form>
      </motion.div>
    </div>
  );
};
