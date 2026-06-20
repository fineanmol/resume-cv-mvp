import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { EditorHeader } from '../components/EditorHeader';
import { AddSectionModal } from '../components/AddSectionModal';
import { RearrangeSectionsModal } from '../components/RearrangeSectionsModal';
import { TemplatesModal } from '../components/TemplatesModal';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { EditorLayout } from '../components/layout/EditorLayout';

import { useAutoSave } from '../hooks/useAutoSave';
import { useAiActions } from '../hooks/useAiActions';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSheetOverflow } from '../hooks/useSheetOverflow';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useResumeMutations } from '../hooks/useResumeMutations';
import { useCoverLetterMutations } from '../hooks/useCoverLetterMutations';

import { dispatchClearEditorFocus } from '../utils/editorFocus';

import type { ResumeState, CoverLetterState, AuthUser, DocType, SaveStatus } from '../types';
import type { ToastAPI } from '../hooks/useToast';

interface EditorRouteProps {
  user: AuthUser;
  activeDocId: string;
  activeDocType: DocType;
  onBack: () => void;
  resume: ReturnType<typeof useUndoRedo<ResumeState>>;
  cl: ReturnType<typeof useUndoRedo<CoverLetterState>>;
  resumeMutations: ReturnType<typeof useResumeMutations>;
  clMutations: ReturnType<typeof useCoverLetterMutations>;
  toast: ToastAPI;
}

export function EditorRoute({
  user,
  activeDocId,
  activeDocType,
  onBack,
  resume,
  cl,
  resumeMutations,
  clMutations,
  toast,
}: EditorRouteProps) {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') ?? '');
  const [showSettings, setShowSettings] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.85);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [rightTab, setRightTab] = useState<'design' | 'ats'>('design');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [designFocusSection, setDesignFocusSection] = useState<string | null>(null);

  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem('LAST_JD') ?? '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const isOnline = useOnlineStatus();
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetOverflow = useSheetOverflow(sheetRef, [activeDocId, activeDocType]);

  useAutoSave({
    user,
    activeDocId,
    activeDocType,
    resumeState: resume.state,
    clState: cl.state,
    setSaveStatus,
  });

  const ai = useAiActions({
    geminiKey,
    activeDocType,
    resumeState: resume.state,
    clState: cl.state,
    jobDescription,
    setResumeState: resume.set,
    setClState: cl.set,
    onNeedKey: () => setShowSettings(true),
    toast,
  });

  const activeUndo = activeDocType === 'resume' ? resume.undo : cl.undo;
  const activeRedo = activeDocType === 'resume' ? resume.redo : cl.redo;
  useKeyboardShortcuts({ activeDocType, onUndo: activeUndo, onRedo: activeRedo });

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    setShowSettings(false);
    toast.success('Gemini API Key saved.');
  };

  const handleJdChange = (text: string) => {
    setJobDescription(text);
    localStorage.setItem('LAST_JD', text);
  };

  const handleDownloadPdf = async () => {
    if (!sheetRef.current) return;
    dispatchClearEditorFocus();
    const filename = activeDocType === 'resume'
      ? `${resume.state.name.replace(/\s+/g, '_')}_Resume.pdf`
      : `${cl.state.name.replace(/\s+/g, '_')}_Cover_Letter.pdf`;
    toast.info('Opening print dialog — choose "Save as PDF", set Margins to None, and uncheck Headers & footers.');
    try {
      const { PdfService } = await import('../services/pdf');
      await PdfService.downloadPdf(sheetRef.current, filename);
      toast.success('Print dialog opened. Select "Save as PDF" → Margins: None → uncheck Headers & footers → Save.');
    } catch {
      toast.error('PDF download failed. Please try again.');
    }
  };

  const getDocumentText = () =>
    activeDocType === 'resume'
      ? `${resume.state.name} ${resume.state.subtitle} ${resume.state.resumeSummary} ${resume.state.resumeSkills} ${resume.state.resumeExperience.map(e => `${e.title} ${e.bullets}`).join(' ')}`
      : `${cl.state.name} ${cl.state.subtitle} ${cl.state.p1} ${cl.state.p2} ${cl.state.p3} ${cl.state.p4} ${cl.state.highlights.map(h => `${h.category} ${h.text}`).join(' ')}`;

  const isResume = activeDocType === 'resume';
  const canUndo = isResume ? resume.canUndo : cl.canUndo;
  const canRedo = isResume ? resume.canRedo : cl.canRedo;

  return (
    <>
      <motion.div
        key="editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen bg-editor text-text-main flex flex-col h-screen overflow-hidden"
      >
        {!isOnline && <OfflineBanner />}

        <EditorHeader
          title={isResume ? resume.state.title ?? '' : cl.state.title ?? ''}
          onTitleChange={val => isResume
            ? resume.set(prev => ({ ...prev, title: val }), true)
            : cl.set(prev => ({ ...prev, title: val }), true)
          }
          saveStatus={saveStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={activeUndo}
          onRedo={activeRedo}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          onDownload={handleDownloadPdf}
          onBack={onBack}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(p => !p)}
          isResume={isResume}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenAddSection={() => setShowAddSectionModal(true)}
          onOpenRearrange={() => setShowRearrangeModal(true)}
          onOpenDesign={() => {
            setRightPanelOpen(true);
            setRightTab('design');
            setDesignFocusSection('spacing');
          }}
          designPanelActive={rightPanelOpen && rightTab === 'design'}
        />

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <EditorLayout
            doc={{
              isResume,
              resumeState: resume.state,
              resumeSet: resume.set,
              resumeCommitHistory: resume.commitHistory,
              clState: cl.state,
              clSet: cl.set,
              clCommitHistory: cl.commitHistory,
            }}
            mutations={{ resumeMutations, clMutations }}
            panel={{
              sidebarOpen,
              zoomScale,
              rightTab,
              setRightTab,
              rightPanelOpen,
              setRightPanelOpen,
            }}
            sheet={{
              sheetRef,
              sheetOverflow,
              designFocusSection,
              onDesignFocusHandled: () => setDesignFocusSection(null),
              showSettings,
            }}
            aiConfig={{
              geminiKey,
              onGeminiKeyChange: setGeminiKey,
              onSaveGeminiKey: handleSaveGeminiKey,
              isOnline,
              aiLoading: ai.aiLoading,
            }}
            aiActions={{
              onImproveBullet: ai.improveBullet,
              jobDescription,
              onJdChange: handleJdChange,
              docText: getDocumentText(),
              onInjectKeyword: ai.injectKeyword,
              onAiTailor: ai.tailorDocument,
            }}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {showAddSectionModal && isResume && (
          <AddSectionModal
            isOpen={showAddSectionModal}
            onClose={() => setShowAddSectionModal(false)}
            activeSections={[
              ...(resume.state.layoutSettings.designerLeftSections || []),
              ...(resume.state.layoutSettings.designerRightSections || []),
            ]}
            brandColor={resume.state.layoutSettings.brandColor}
            skillsStyle={resume.state.layoutSettings.skillsStyle}
            onAddSection={(sectionId) => {
              resume.set(p => {
                const right = [...(p.layoutSettings.designerRightSections || [])];
                if (!right.includes(sectionId)) right.push(sectionId);
                return {
                  ...p,
                  layoutSettings: { ...p.layoutSettings, designerRightSections: right },
                };
              }, true);
            }}
          />
        )}

        {showRearrangeModal && isResume && (
          <RearrangeSectionsModal
            isOpen={showRearrangeModal}
            onClose={() => setShowRearrangeModal(false)}
            leftSections={resume.state.layoutSettings.designerLeftSections || []}
            rightSections={resume.state.layoutSettings.designerRightSections || []}
            onSave={(left, right) => {
              resume.set(p => ({
                ...p,
                layoutSettings: {
                  ...p.layoutSettings,
                  designerLeftSections: left,
                  designerRightSections: right,
                },
              }), true);
            }}
          />
        )}

        {showTemplatesModal && (
          <TemplatesModal
            isOpen={showTemplatesModal}
            onClose={() => setShowTemplatesModal(false)}
            currentTemplate={isResume ? (resume.state.layoutSettings.template ?? 'navy') : (cl.state.layoutSettings.template ?? 'navy')}
            onSelectTemplate={(templateId) => {
              if (isResume) {
                resume.set(p => ({
                  ...p,
                  layoutSettings: { ...p.layoutSettings, template: templateId },
                }), true);
              } else {
                cl.set(p => ({
                  ...p,
                  layoutSettings: { ...p.layoutSettings, template: templateId },
                }), true);
              }
            }}
            docType={activeDocType}
            documentState={isResume ? resume.state : cl.state}
          />
        )}
      </AnimatePresence>
    </>
  );
}
