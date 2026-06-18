import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { DocumentMetadata } from '../types';
import { 
  FileText, 
  Mail, 
  Trash2, 
  Plus, 
  LogOut, 
  CloudOff, 
  CloudLightning,
  Clock,
  Pencil
} from 'lucide-react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplatePicker } from './TemplatePicker';
import { RenameModal } from './RenameModal';
import { ConfirmModal } from './ConfirmModal';

interface DashboardProps {
  userId: string;
  isLocal: boolean;
  onSelectDocument: (id: string, type: 'resume' | 'coverletter') => void;
  onCreateNew: (type: 'resume' | 'coverletter', template: 'navy' | 'serif' | 'sidebar' | 'tech') => void;
  onLogout: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export const Dashboard: React.FC<DashboardProps> = ({
  userId,
  isLocal,
  onSelectDocument,
  onCreateNew,
  onLogout
}) => {
  const [drafts, setDrafts] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerDocType, setPickerDocType] = useState<'resume' | 'coverletter'>('resume');

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [activeRename, setActiveRename] = useState<{ id: string; title: string; type: 'resume' | 'coverletter' } | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeDelete, setActiveDelete] = useState<{ id: string; type: 'resume' | 'coverletter' } | null>(null);

  const loadDrafts = async () => {
    setLoading(true);
    const list = await dbService.listDrafts(userId);
    setDrafts(list);
    setLoading(false);
  };

  useEffect(() => {
    loadDrafts();
  }, [userId]);

  const handleSignOut = async () => {
    if (auth && !isLocal) {
      await signOut(auth);
    } else {
      localStorage.removeItem("LOCAL_USER");
    }
    onLogout();
  };

  const handleOpenPicker = (type: 'resume' | 'coverletter') => {
    setPickerDocType(type);
    setIsPickerOpen(true);
  };

  const handleSelectTemplate = (template: 'navy' | 'serif' | 'sidebar' | 'tech') => {
    setIsPickerOpen(false);
    onCreateNew(pickerDocType, template);
  };

  const handleOpenRename = (e: React.MouseEvent, draft: DocumentMetadata) => {
    e.stopPropagation();
    setActiveRename({ id: draft.id, title: draft.title, type: draft.type });
    setIsRenameOpen(true);
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (!activeRename) return;
    await dbService.renameDraft(userId, activeRename.id, activeRename.type, newTitle);
    await loadDrafts();
  };

  const handleOpenDelete = (e: React.MouseEvent, id: string, type: 'resume' | 'coverletter') => {
    e.stopPropagation();
    setActiveDelete({ id, type });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeDelete) return;
    await dbService.deleteDraft(userId, activeDelete.id, activeDelete.type);
    await loadDrafts();
  };

  return (
    <div className="min-h-screen bg-editor text-text-main flex flex-col">
      {/* Top Navigation Banner */}
      <header className="bg-sidebar border-b border-border-color/60 px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-card border border-border-color rounded text-brand-accent">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Candidate Suite</h1>
            <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
              {isLocal ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-orange-400" />
                  <span>Local Mode (guest sandbox)</span>
                </>
              ) : (
                <>
                  <CloudLightning className="w-3.5 h-3.5 text-green-400" />
                  <span>Syncing with Cloud Firebase</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted hidden md:inline">Logged in: {userId}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-card/75 border border-border-color rounded-lg text-xs font-semibold text-text-main hover:text-brand-accent transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {/* Call to Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold">Your Saved Documents</h2>
            <p className="text-sm text-text-muted mt-1">Manage, edit, and tailor your resumes and cover letters.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleOpenPicker('resume')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-editor font-semibold rounded-lg shadow-lg hover:shadow-brand-accent/10 transition duration-200 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Resume
            </button>
            <button
              onClick={() => handleOpenPicker('coverletter')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-card hover:bg-card/85 border border-border-color text-text-main font-semibold rounded-lg transition duration-200 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Cover Letter
            </button>
          </div>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-brand-accent rounded-full mb-4"></div>
            <p className="text-sm text-text-muted">Loading drafts...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-color rounded-xl bg-card/20 px-4">
            <div className="inline-flex p-4 bg-card border border-border-color rounded-full text-text-muted mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-1">No documents found</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
              Create your first customized Resume or Cover Letter to get started with ATS-weighted AI optimization.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleOpenPicker('resume')}
                className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-semibold rounded-lg text-sm transition cursor-pointer"
              >
                Create Resume
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {drafts.map((draft) => {
              const dateStr = new Date(draft.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <motion.div
                  key={draft.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01, borderColor: '#5cc3e8' }}
                  onClick={() => onSelectDocument(draft.id, draft.type)}
                  className="bg-sidebar hover:bg-card border border-border-color/60 hover:border-brand-accent/50 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="p-3 bg-card border border-border-color rounded-lg text-text-main group-hover:text-brand-accent transition">
                      {draft.type === 'resume' ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleOpenRename(e, draft)}
                        className="p-1.5 text-text-muted hover:text-brand-accent border border-transparent hover:border-border-color rounded-lg transition hover:bg-sidebar cursor-pointer"
                        title="Rename draft"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDelete(e, draft.id, draft.type)}
                        className="p-1.5 text-text-muted hover:text-red-400 border border-transparent hover:border-border-color rounded-lg transition hover:bg-sidebar cursor-pointer"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-text-main group-hover:text-brand-accent transition truncate mb-2">
                    {draft.title}
                  </h4>

                  <div className="mt-auto flex items-center justify-between text-xs text-text-muted">
                    <span className="capitalize px-2 py-0.5 bg-card border border-border-color rounded text-[10px]">
                      {draft.type === 'coverletter' ? 'Cover Letter' : 'Resume'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Visual Template Picker Modal */}
      <AnimatePresence>
        {isPickerOpen && (
          <TemplatePicker
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            onSelect={handleSelectTemplate}
            docType={pickerDocType}
          />
        )}
      </AnimatePresence>

      {/* Rename Dialog Modal */}
      <AnimatePresence>
        {isRenameOpen && activeRename && (
          <RenameModal
            isOpen={isRenameOpen}
            onClose={() => {
              setIsRenameOpen(false);
              setActiveRename(null);
            }}
            currentTitle={activeRename.title}
            onRename={handleRenameConfirm}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && activeDelete && (
          <ConfirmModal
            isOpen={isDeleteOpen}
            onClose={() => {
              setIsDeleteOpen(false);
              setActiveDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Document Draft"
            message="Are you sure you want to delete this draft? This action is permanent and cannot be undone."
          />
        )}
      </AnimatePresence>
    </div>
  );
};
