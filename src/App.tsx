import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { EditorHeader } from './components/EditorHeader';
import { ResumeForm } from './components/ResumeForm';
import { AddSectionModal } from './components/AddSectionModal';
import { RearrangeSectionsModal } from './components/RearrangeSectionsModal';
import { TemplatesModal } from './components/TemplatesModal';
import { CoverLetterForm } from './components/CoverLetterForm';
import { JDPanel } from './components/JDPanel';
import { DesignPanel } from './components/DesignPanel';
import { ToastContainer } from './components/ToastContainer';

import { useUndoRedo } from './hooks/useUndoRedo';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useAutoSave } from './hooks/useAutoSave';
import { useAiActions } from './hooks/useAiActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSheetOverflow } from './hooks/useSheetOverflow';
import { useToast } from './hooks/useToast';

import { dbService } from './services/db';
import { PdfService } from './services/pdf';
import { DEFAULT_RESUME_STATE } from './config/defaultResume';
import { DEFAULT_CL_STATE } from './config/defaultCL';

import { auth, isConfigured } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import type { ResumeState, CoverLetterState, AuthUser, DocType, SaveStatus, TemplateId } from './types';
import { isLocalUser, userEmail } from './types';

// Lazy-load heavy template renderers — they share a chunk with LandingPage/Carousel imports
const ResumeTemplateRenderer = lazy(() =>
  import('./templates/ResumeTemplates').then(m => ({ default: m.ResumeTemplateRenderer }))
);
const CoverLetterTemplateRenderer = lazy(() =>
  import('./templates/CoverLetterTemplates').then(m => ({ default: m.CoverLetterTemplateRenderer }))
);

// ─── Settings dropdown ────────────────────────────────────────────────────────
interface SettingsDropdownProps {
  geminiKey: string;
  onChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
}
const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ geminiKey, onChange, onSave }) => (
  <div className="absolute right-20 top-16 z-50 w-80 bg-sidebar border border-brand-accent/30 rounded-xl p-4 shadow-xl">
    <form onSubmit={onSave} className="space-y-3">
      <div className="text-xs font-bold text-brand-accent flex items-center gap-1">
        <Sparkles className="w-4 h-4" /> Gemini API Key
      </div>
      <p className="text-[10px] text-text-muted leading-relaxed">
        Provide your Gemini API Key to enable AI tailoring, keyword injection, and bullet improvers.
      </p>
      <input
        type="password"
        required
        placeholder="AIzaSy..."
        value={geminiKey}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-input-bg border border-border-color rounded-lg px-3 py-2 text-xs text-text-main placeholder-text-muted/30 focus:outline-none focus:border-brand-accent"
      />
      <button
        type="submit"
        className="w-full py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-lg text-xs transition cursor-pointer"
      >
        Save API Key
      </button>
    </form>
  </div>
);

// ─── Offline banner ───────────────────────────────────────────────────────────
const OfflineBanner: React.FC = () => (
  <div className="bg-amber-950/80 border-b border-amber-600/40 text-amber-200 text-xs py-2 px-8 flex items-center justify-center gap-2">
    <AlertTriangle className="w-4 h-4 text-amber-400" />
    <span>Offline — AI features are disabled. Reconnect to resume.</span>
  </div>
);

// ─── Page transition wrapper ──────────────────────────────────────────────────
const PAGE_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
} as const;

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [user, setUser] = useState<AuthUser | null>(null);

  // Workspace navigation (restored from localStorage if available to persist routing on refresh)
  const [activeDocId,   setActiveDocId]   = useState<string | null>(() => localStorage.getItem('ACTIVE_DOC_ID'));
  const [activeDocType, setActiveDocType] = useState<DocType | null>(() => localStorage.getItem('ACTIVE_DOC_TYPE') as DocType | null);

  // Settings
  const [geminiKey,    setGeminiKey]    = useState(() => localStorage.getItem('GEMINI_API_KEY') ?? '');
  const [showSettings, setShowSettings] = useState(false);
  const [zoomScale,    setZoomScale]    = useState(0.85);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  // Modals state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [rightTab,     setRightTab]     = useState<'design' | 'ats'>('design');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const startResizeLeft = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = leftWidth;

    const doResize = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.max(280, Math.min(550, startWidth + deltaX));
      setLeftWidth(newWidth);
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [leftWidth]);

  const startResizeRight = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = rightWidth;

    const doResize = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.max(260, Math.min(500, startWidth - deltaX));
      setRightWidth(newWidth);
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  }, [rightWidth]);

  // Job Description
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem('LAST_JD') ?? '');

  // Save status
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Notifications
  const toast = useToast();

  // Listen for auth state changes globally to auto-restore session on page load/refresh
  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
      });
      return unsubscribe;
    } else {
      const localUser = localStorage.getItem("LOCAL_USER");
      if (localUser) {
        setUser({ email: localUser, isLocal: true } as any);
      }
    }
  }, []);

  // Sync activeDocId to localStorage
  useEffect(() => {
    if (activeDocId) {
      localStorage.setItem('ACTIVE_DOC_ID', activeDocId);
    } else {
      localStorage.removeItem('ACTIVE_DOC_ID');
    }
  }, [activeDocId]);

  // Sync activeDocType to localStorage
  useEffect(() => {
    if (activeDocType) {
      localStorage.setItem('ACTIVE_DOC_TYPE', activeDocType);
    } else {
      localStorage.removeItem('ACTIVE_DOC_TYPE');
    }
  }, [activeDocType]);

  // Load restored document data on refresh once user session and routing are resolved
  useEffect(() => {
    if (!user || !activeDocId || !activeDocType) return;
    let isMounted = true;
    const loadRestoredDoc = async () => {
      const uid = userEmail(user);
      if (activeDocType === 'resume') {
        const data = await dbService.getResume(uid, activeDocId);
        if (data && isMounted) {
          resume.reset(data);
        }
      } else {
        const data = await dbService.getCoverLetter(uid, activeDocId);
        if (data && isMounted) {
          cl.reset(data);
        }
      }
    };
    loadRestoredDoc();
    return () => { isMounted = false; };
  }, [user, activeDocId, activeDocType]);

  // Connection
  const isOnline = useOnlineStatus();

  // Document history stacks
  const resume = useUndoRedo<ResumeState>(DEFAULT_RESUME_STATE);
  const cl     = useUndoRedo<CoverLetterState>(DEFAULT_CL_STATE);

  // Sheet overflow detector
  const sheetRef    = useRef<HTMLDivElement>(null);
  const sheetOverflow = useSheetOverflow(sheetRef, [activeDocId, activeDocType]);

  // Auto-save
  useAutoSave({
    user, activeDocId, activeDocType,
    resumeState: resume.state, clState: cl.state,
    setSaveStatus,
  });

  // AI actions (tailoring, keyword injection, bullet improvement)
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

  // Keyboard shortcuts (Undo/Redo)
  const activeUndo = activeDocType === 'resume' ? resume.undo : cl.undo;
  const activeRedo = activeDocType === 'resume' ? resume.redo : cl.redo;
  useKeyboardShortcuts({ activeDocType, onUndo: activeUndo, onRedo: activeRedo });

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const handleDownloadPdf = () => {
    if (!sheetRef.current) return;
    const filename = activeDocType === 'resume'
      ? `${resume.state.name.replace(/\s+/g, '_')}_Resume.pdf`
      : `${cl.state.name.replace(/\s+/g, '_')}_Cover_Letter.pdf`;
    PdfService.downloadPdf(sheetRef.current, filename);
    toast.info('Preparing PDF download…');
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

  // ── Render: Landing ──────────────────────────────────────────────────────────
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

  // ── Render: Dashboard ────────────────────────────────────────────────────────
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

  // ── Render: Editor ───────────────────────────────────────────────────────────
  const isResume  = activeDocType === 'resume';
  const canUndo   = isResume ? resume.canUndo : cl.canUndo;
  const canRedo   = isResume ? resume.canRedo : cl.canRedo;

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
            }}
          />

          {/* ── Three-panel editor layout ───────────────────────── */}
          <div className="flex-1 flex overflow-hidden relative">
            {showSettings && (
              <SettingsDropdown
                geminiKey={geminiKey}
                onChange={setGeminiKey}
                onSave={handleSaveGeminiKey}
              />
            )}

            {/* LEFT — Content form (sections) */}
            {sidebarOpen && (
              <aside
                style={{ width: `${leftWidth}px` }}
                className="flex-shrink-0 border-r border-border-color/60 bg-sidebar flex flex-col overflow-hidden"
              >
                {isResume ? (
                  <ResumeForm
                    state={resume.state}
                    onChange={resume.set}
                    onImproveBullet={ai.improveBullet}
                    aiLoading={ai.aiLoading}
                    isOnline={isOnline}
                    geminiKey={geminiKey}
                  />
                ) : (
                  <CoverLetterForm state={cl.state} onChange={cl.set} />
                )}
              </aside>
            )}

            {/* Resize handle for left panel */}
            {sidebarOpen && (
              <div
                onMouseDown={startResizeLeft}
                className="w-[4px] hover:w-[6px] h-full cursor-col-resize bg-border-color/10 hover:bg-brand-accent/50 transition-colors flex-shrink-0 z-40 relative select-none"
                title="Drag to resize panel"
              />
            )}

            {/* CENTRE — Live A4 preview (always visible, no modal) */}
            <section className="flex-1 overflow-hidden relative flex flex-col bg-[#dde3ec]">
              <div className="sheet-preview-container flex-1 w-full relative">
                <div
                  ref={sheetRef}
                  style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', transition: 'transform 0.25s ease-out' }}
                  className={`flex justify-center${sheetOverflow ? ' sheet-overflow-active' : ''}`}
                >
                  <Suspense fallback={<div className="w-[794px] h-[1123px] bg-white animate-pulse rounded shadow-xl" />}>
                    {isResume ? (
                      <ResumeTemplateRenderer
                        state={resume.state}
                        isEditable
                        onFieldChange={(f, v) => resume.set(p => ({ ...p, [f]: v }))}
                        onExperienceChange={(i, f, v) => resume.set(p => { const u = [...p.resumeExperience]; u[i] = { ...u[i], [f]: v }; return { ...p, resumeExperience: u }; })}
                        onEducationChange={(i, f, v) => resume.set(p => { const u = [...p.resumeEducation]; u[i] = { ...u[i], [f]: v }; return { ...p, resumeEducation: u }; })}
                        onCertChange={(i, f, v) => resume.set(p => { const u = [...p.resumeCerts]; u[i] = { ...u[i], [f]: v }; return { ...p, resumeCerts: u }; })}
                        onAchievementChange={(i, f, v) => resume.set(p => { const u = [...p.resumeAchievements]; u[i] = { ...u[i], [f]: v }; return { ...p, resumeAchievements: u }; })}
                        onLanguageChange={(i, f, v) => resume.set(p => { const u = [...p.resumeLanguages]; u[i] = { ...u[i], [f]: v }; return { ...p, resumeLanguages: u }; })}
                        onLayoutSettingsChange={(patch) => resume.set(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                        onAddExperience={() => resume.set(p => ({ ...p, resumeExperience: [...p.resumeExperience, { company: 'New Company', title: 'New Position', dates: '2026 - Present', location: 'City, Country', bullets: '• Accomplished X using Y.\n• Led team of Z.' }] }))}
                        onDeleteExperience={(idx) => resume.set(p => ({ ...p, resumeExperience: p.resumeExperience.filter((_, i) => i !== idx) }))}
                        onAddEducation={() => resume.set(p => ({ ...p, resumeEducation: [...p.resumeEducation, { school: 'New University', degree: 'Degree Name', dates: '2022 - 2026', location: 'City, Country', bullets: 'GPA: 3.8/4.0' }] }))}
                        onDeleteEducation={(idx) => resume.set(p => ({ ...p, resumeEducation: p.resumeEducation.filter((_, i) => i !== idx) }))}
                        onAddCert={() => resume.set(p => ({ ...p, resumeCerts: [...(p.resumeCerts || []), { title: 'New Project/Cert', desc: 'Description of project/cert' }] }))}
                        onDeleteCert={(idx) => resume.set(p => ({ ...p, resumeCerts: p.resumeCerts.filter((_, i) => i !== idx) }))}
                        onAddAchievement={() => resume.set(p => ({ ...p, resumeAchievements: [...(p.resumeAchievements || []), { title: 'New Achievement', desc: 'Detail of achievement', icon: 'star' }] }))}
                        onDeleteAchievement={(idx) => resume.set(p => ({ ...p, resumeAchievements: p.resumeAchievements.filter((_, i) => i !== idx) }))}
                        onAddLanguage={() => resume.set(p => ({ ...p, resumeLanguages: [...(p.resumeLanguages || []), { name: 'Language', level: 'Native' }] }))}
                        onDeleteLanguage={(idx) => resume.set(p => ({ ...p, resumeLanguages: p.resumeLanguages.filter((_, i) => i !== idx) }))}
                      />
                    ) : (
                      <CoverLetterTemplateRenderer
                        state={cl.state}
                        isEditable
                        onFieldChange={(f, v) => cl.set(p => ({ ...p, [f]: v }))}
                        onHighlightChange={(i, f, v) => cl.set(p => { const u = [...p.highlights]; u[i] = { ...u[i], [f]: v }; return { ...p, highlights: u }; })}
                      />
                    )}
                  </Suspense>
                </div>
              </div>
            </section>

            {/* Resize handle for right panel */}
            {rightPanelOpen && (
              <div
                onMouseDown={startResizeRight}
                className="w-[4px] hover:w-[6px] h-full cursor-col-resize bg-border-color/10 hover:bg-brand-accent/50 transition-colors flex-shrink-0 z-40 relative select-none"
                title="Drag to resize panel"
              />
            )}

            {/* RIGHT — Design + ATS tabs */}
            <motion.aside
              animate={{ width: rightPanelOpen ? rightWidth : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex-shrink-0 bg-sidebar flex flex-col overflow-hidden relative ${rightPanelOpen ? 'border-l border-border-color/60' : 'border-transparent'}`}
            >
              {/* Tab switcher */}
              <div className="flex border-b border-border-color/60 flex-shrink-0">
                <button
                  onClick={() => setRightTab('design')}
                  className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${rightTab === 'design' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-text-muted hover:text-text-main'}`}
                >
                  Design
                </button>
                <button
                  onClick={() => setRightTab('ats')}
                  className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${rightTab === 'ats' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-text-muted hover:text-text-main'}`}
                >
                  ATS &amp; AI
                </button>
              </div>

              {rightTab === 'design' ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {isResume ? (
                    <DesignPanel
                      layout={resume.state.layoutSettings}
                      onChange={patch => resume.set(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                      docType="resume"
                    />
                  ) : (
                    <DesignPanel
                      layout={cl.state.layoutSettings}
                      onChange={patch => cl.set(p => ({ ...p, layoutSettings: { ...p.layoutSettings, ...patch } }))}
                      docType="coverletter"
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <JDPanel
                    jobDescription={jobDescription}
                    onJdChange={handleJdChange}
                    docText={getDocumentText()}
                    onInjectKeyword={ai.injectKeyword}
                    aiLoading={ai.aiLoading}
                    onAiTailor={ai.tailorDocument}
                    isOnline={isOnline}
                    geminiKey={geminiKey}
                  />
                </div>
              )}
            </motion.aside>

            {/* Floating toggle button for right side drawer */}
            <button
              onClick={() => setRightPanelOpen(p => !p)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full border border-border-color/60 bg-sidebar text-text-muted hover:text-text-main flex items-center justify-center shadow-md cursor-pointer z-50 hover:bg-brand-accent hover:text-editor transition-all"
              style={{
                right: rightPanelOpen ? `${rightWidth}px` : '0px',
                transition: isResizing ? 'none' : 'right 0.2s ease-out',
              }}
              title={rightPanelOpen ? "Close panel" : "Open panel"}
            >
              {rightPanelOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
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
            onAddSection={(sectionId) => {
              resume.set(p => {
                const right = [...(p.layoutSettings.designerRightSections || [])];
                if (!right.includes(sectionId)) {
                  right.push(sectionId);
                }
                return {
                  ...p,
                  layoutSettings: {
                    ...p.layoutSettings,
                    designerRightSections: right
                  }
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
                  layoutSettings: {
                    ...p.layoutSettings,
                    template: templateId
                  }
                }), true);
              } else {
                cl.set(p => ({
                  ...p,
                  layoutSettings: {
                    ...p.layoutSettings,
                    template: templateId
                  }
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
