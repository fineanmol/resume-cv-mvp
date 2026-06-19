import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { EditorHeader } from './components/EditorHeader';
import { AddSectionModal } from './components/AddSectionModal';
import { RearrangeSectionsModal } from './components/RearrangeSectionsModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ToastContainer } from './components/ToastContainer';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { EditorLayout } from './components/layout/EditorLayout';

import { useUndoRedo } from './hooks/useUndoRedo';
import { useResumeMutations } from './hooks/useResumeMutations';
import { useCoverLetterMutations } from './hooks/useCoverLetterMutations';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useAutoSave } from './hooks/useAutoSave';
import { useAiActions } from './hooks/useAiActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSheetOverflow } from './hooks/useSheetOverflow';
import { useToast } from './hooks/useToast';

import { dbService } from './services/db';
import { PdfService } from './services/pdf';
import { dispatchClearEditorFocus } from './utils/editorFocus';
import { DEFAULT_RESUME_STATE } from './config/defaultResume';
import { DEFAULT_CL_STATE } from './config/defaultCL';

import { auth, isConfigured } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import type { ResumeState, CoverLetterState, AuthUser, DocType, SaveStatus, TemplateId } from './types';
import { isLocalUser, userEmail } from './types';
import { PAGE_ANIM } from './constants/animations';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (isConfigured && auth) return null;
    const localUser = localStorage.getItem('LOCAL_USER');
    return localUser ? ({ email: localUser, isLocal: true } as AuthUser) : null;
  });

  const [activeDocId,   setActiveDocId]   = useState<string | null>(() => localStorage.getItem('ACTIVE_DOC_ID'));
  const [activeDocType, setActiveDocType] = useState<DocType | null>(() => localStorage.getItem('ACTIVE_DOC_TYPE') as DocType | null);

  const [geminiKey,    setGeminiKey]    = useState(() => localStorage.getItem('GEMINI_API_KEY') ?? '');
  const [showSettings, setShowSettings] = useState(false);
  const [zoomScale,    setZoomScale]    = useState(0.85);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [rightTab,       setRightTab]       = useState<'design' | 'ats'>('design');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [designFocusSection, setDesignFocusSection] = useState<string | null>(null);

  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem('LAST_JD') ?? '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const toast = useToast();

  useEffect(() => {
    if (!isConfigured || !auth) return;
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
  }, []);

  useEffect(() => {
    if (activeDocId) {
      localStorage.setItem('ACTIVE_DOC_ID', activeDocId);
    } else {
      localStorage.removeItem('ACTIVE_DOC_ID');
    }
  }, [activeDocId]);

  useEffect(() => {
    if (activeDocType) {
      localStorage.setItem('ACTIVE_DOC_TYPE', activeDocType);
    } else {
      localStorage.removeItem('ACTIVE_DOC_TYPE');
    }
  }, [activeDocType]);

  const resume = useUndoRedo<ResumeState>(DEFAULT_RESUME_STATE);
  const cl     = useUndoRedo<CoverLetterState>(DEFAULT_CL_STATE);
  const { reset: resetResume } = resume;
  const { reset: resetCl } = cl;
  const resumeMutations = useResumeMutations(resume.set);
  const clMutations = useCoverLetterMutations(cl.set);

  useEffect(() => {
    if (!user || !activeDocId || !activeDocType) return;
    let isMounted = true;
    const loadRestoredDoc = async () => {
      const uid = userEmail(user);
      if (activeDocType === 'resume') {
        const data = await dbService.getResume(uid, activeDocId);
        if (data && isMounted) resetResume(data);
      } else {
        const data = await dbService.getCoverLetter(uid, activeDocId);
        if (data && isMounted) resetCl(data);
      }
    };
    loadRestoredDoc();
    return () => { isMounted = false; };
  }, [user, activeDocId, activeDocType, resetResume, resetCl]);

  const isOnline = useOnlineStatus();
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetOverflow = useSheetOverflow(sheetRef, [activeDocId, activeDocType]);

  useAutoSave({
    user, activeDocId, activeDocType,
    resumeState: resume.state, clState: cl.state,
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
    toast.info('Preparing PDF download…');
    try {
      await PdfService.downloadPdf(sheetRef.current, filename);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('PDF download failed. Please try again.');
    }
  };

  const handleSelectDocument = async (id: string, type: DocType) => {
    if (!user) return;
    setSaveStatus('idle');
    const uid = userEmail(user);
    if (type === 'resume') {
      const data = await dbService.getResume(uid, id);
      if (data) resume.reset(data);
    } else {
      const data = await dbService.getCoverLetter(uid, id);
      if (data) cl.reset(data);
    }
    setActiveDocId(id);
    setActiveDocType(type);
  };

  const handleCreateNew = async (type: DocType, template: TemplateId) => {
    if (!user) return;
    const uid = userEmail(user);
    const id  = `${type}_${Date.now()}`;
    if (type === 'resume') {
      const state = { ...DEFAULT_RESUME_STATE, id, title: `New Resume (${new Date().toLocaleDateString()})`, layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template } };
      await dbService.saveResume(uid, id, state);
      resume.reset(state);
    } else {
      const state = { ...DEFAULT_CL_STATE, id, title: `New Cover Letter (${new Date().toLocaleDateString()})`, layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, template } };
      await dbService.saveCoverLetter(uid, id, state);
      cl.reset(state);
    }
    setActiveDocId(id);
    setActiveDocType(type);
  };

  const getDocumentText = () =>
    activeDocType === 'resume'
      ? `${resume.state.name} ${resume.state.subtitle} ${resume.state.resumeSummary} ${resume.state.resumeSkills} ${resume.state.resumeExperience.map(e => `${e.title} ${e.bullets}`).join(' ')}`
      : `${cl.state.name} ${cl.state.subtitle} ${cl.state.p1} ${cl.state.p2} ${cl.state.p3} ${cl.state.p4} ${cl.state.highlights.map(h => `${h.category} ${h.text}`).join(' ')}`;

  if (!user) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div key="landing" {...PAGE_ANIM} className="min-h-screen w-full">
            <LandingPage onAuthSuccess={u => setUser(u)} />
          </motion.div>
        </AnimatePresence>
        <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
      </>
    );
  }

  if (!activeDocId) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div key="dashboard" {...PAGE_ANIM} className="min-h-screen w-full">
            <Dashboard
              userId={userEmail(user)}
              isLocal={isLocalUser(user)}
              onSelectDocument={handleSelectDocument}
              onCreateNew={handleCreateNew}
              onLogout={() => { setUser(null); setActiveDocId(null); setActiveDocType(null); }}
            />
          </motion.div>
        </AnimatePresence>
        <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
      </>
    );
  }

  const isResume = activeDocType === 'resume';
  const canUndo  = isResume ? resume.canUndo : cl.canUndo;
  const canRedo  = isResume ? resume.canRedo : cl.canRedo;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key="editor"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            canUndo={canUndo} canRedo={canRedo}
            onUndo={activeUndo} onRedo={activeRedo}
            zoomScale={zoomScale} setZoomScale={setZoomScale}
            showSettings={showSettings} setShowSettings={setShowSettings}
            onDownload={handleDownloadPdf}
            onBack={() => setActiveDocId(null)}
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
            isResume={isResume}
            resumeState={resume.state}
            resumeSet={resume.set}
            clState={cl.state}
            clSet={cl.set}
            resumeMutations={resumeMutations}
            clMutations={clMutations}
            sidebarOpen={sidebarOpen}
            zoomScale={zoomScale}
            sheetRef={sheetRef}
            sheetOverflow={sheetOverflow}
            rightTab={rightTab}
            setRightTab={setRightTab}
            rightPanelOpen={rightPanelOpen}
            setRightPanelOpen={setRightPanelOpen}
            designFocusSection={designFocusSection}
            onDesignFocusHandled={() => setDesignFocusSection(null)}
            showSettings={showSettings}
            geminiKey={geminiKey}
            onGeminiKeyChange={setGeminiKey}
            onSaveGeminiKey={handleSaveGeminiKey}
            isOnline={isOnline}
            onImproveBullet={ai.improveBullet}
            aiLoading={ai.aiLoading}
            jobDescription={jobDescription}
            onJdChange={handleJdChange}
            docText={getDocumentText()}
            onInjectKeyword={ai.injectKeyword}
            onAiTailor={ai.tailorDocument}
          />
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showAddSectionModal && isResume && (
          <AddSectionModal
            isOpen={showAddSectionModal}
            onClose={() => setShowAddSectionModal(false)}
            activeSections={[
              ...(resume.state.layoutSettings.designerLeftSections || []),
              ...(resume.state.layoutSettings.designerRightSections || [])
            ]}
            brandColor={resume.state.layoutSettings.brandColor}
            skillsStyle={resume.state.layoutSettings.skillsStyle}
            onAddSection={(sectionId) => {
              resume.set(p => {
                const right = [...(p.layoutSettings.designerRightSections || [])];
                if (!right.includes(sectionId)) right.push(sectionId);
                return {
                  ...p,
                  layoutSettings: { ...p.layoutSettings, designerRightSections: right }
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
                  designerRightSections: right
                }
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
                  layoutSettings: { ...p.layoutSettings, template: templateId }
                }), true);
              } else {
                cl.set(p => ({
                  ...p,
                  layoutSettings: { ...p.layoutSettings, template: templateId }
                }), true);
              }
            }}
            docType={activeDocType ?? 'resume'}
            documentState={isResume ? resume.state : cl.state}
          />
        )}
      </AnimatePresence>
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </>
  );
}
