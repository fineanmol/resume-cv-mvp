import React, { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { EditorHeader } from './components/EditorHeader';
import { ResumeForm } from './components/ResumeForm';
import { CoverLetterForm } from './components/CoverLetterForm';
import { JDPanel } from './components/JDPanel';
import { ResumeTemplateRenderer } from './templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from './templates/CoverLetterTemplates';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { dbService } from './services/db';
import { GeminiService } from './services/gemini';
import { PdfService } from './services/pdf';
import { DEFAULT_RESUME_STATE } from './config/defaultResume';
import { DEFAULT_CL_STATE } from './config/defaultCL';
import type { ResumeState, CoverLetterState } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<any>(null);
  
  // Workspace navigation
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeDocType, setActiveDocType] = useState<'resume' | 'coverletter' | null>(null);
  
  // Settings
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem("GEMINI_API_KEY") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.85);
  
  // Connection state
  const isOnline = useOnlineStatus();
  
  // Document state using custom history tracking hooks
  const { 
    state: resumeState, 
    set: setResumeState, 
    undo: undoResume, 
    redo: redoResume, 
    canUndo: canUndoResume, 
    canRedo: canRedoResume, 
    reset: resetResume 
  } = useUndoRedo<ResumeState>(DEFAULT_RESUME_STATE);

  const { 
    state: clState, 
    set: setClState, 
    undo: undoCl, 
    redo: redoCl, 
    canUndo: canUndoCl, 
    canRedo: canRedoCl, 
    reset: resetCl 
  } = useUndoRedo<CoverLetterState>(DEFAULT_CL_STATE);

  // Job Description state
  const [jobDescription, setJobDescription] = useState(localStorage.getItem("LAST_JD") || "");
  const [aiLoading, setAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // References for PDF export
  const sheetRef = useRef<HTMLDivElement>(null);

  // Save current Gemini Key to LocalStorage
  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("GEMINI_API_KEY", geminiKey);
    setShowSettings(false);
  };

  // Log in user
  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
  };

  // Log out user
  const handleLogout = () => {
    setUser(null);
    setActiveDocId(null);
    setActiveDocType(null);
  };

  // Keyboard shortcut listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (activeDocType === 'resume') undoResume();
          if (activeDocType === 'coverletter') undoCl();
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          if (activeDocType === 'resume') redoResume();
          if (activeDocType === 'coverletter') redoCl();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (activeDocType === 'resume') redoResume();
        if (activeDocType === 'coverletter') redoCl();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocType, undoResume, redoResume, undoCl, redoCl]);

  // Load document draft
  const handleSelectDocument = async (id: string, type: 'resume' | 'coverletter') => {
    setSaveStatus('idle');
    if (type === 'resume') {
      const data = await dbService.getResume(user.email, id);
      if (data) {
        resetResume(data);
      }
    } else {
      const data = await dbService.getCoverLetter(user.email, id);
      if (data) {
        resetCl(data);
      }
    }
    setActiveDocId(id);
    setActiveDocType(type);
  };

  // Create new document draft
  const handleCreateNew = async (
    type: 'resume' | 'coverletter',
    template: 'navy' | 'serif' | 'sidebar' | 'tech'
  ) => {
    const id = `${type}_${Date.now()}`;
    if (type === 'resume') {
      const stateToSave = { 
        ...DEFAULT_RESUME_STATE, 
        id, 
        title: `New Resume (${new Date().toLocaleDateString()})`,
        layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template }
      };
      await dbService.saveResume(user.email, id, stateToSave);
      resetResume(stateToSave);
    } else {
      const stateToSave = { 
        ...DEFAULT_CL_STATE, 
        id, 
        title: `New Cover Letter (${new Date().toLocaleDateString()})`,
        layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, template }
      };
      await dbService.saveCoverLetter(user.email, id, stateToSave);
      resetCl(stateToSave);
    }
    setActiveDocId(id);
    setActiveDocType(type);
  };

  // Debounced auto-save hook
  useEffect(() => {
    if (!activeDocId || !user) return;
    
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        if (activeDocType === 'resume') {
          await dbService.saveResume(user.email, activeDocId, resumeState);
        } else {
          await dbService.saveCoverLetter(user.email, activeDocId, clState);
        }
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [resumeState, clState, activeDocId, activeDocType, user]);

  // Cache Job Description
  const handleJdChange = (text: string) => {
    setJobDescription(text);
    localStorage.setItem("LAST_JD", text);
  };

  // Trigger Client-Side PDF Generation
  const handleDownloadPdf = () => {
    if (!sheetRef.current) return;
    const filename = activeDocType === 'resume' 
      ? `${resumeState.name.replace(/\s+/g, '_')}_Resume.pdf`
      : `${clState.name.replace(/\s+/g, '_')}_Cover_Letter.pdf`;
    
    // Reset zoom before printing to prevent styling scales, then restore
    const currentScale = zoomScale;
    setZoomScale(1.0);
    setTimeout(() => {
      PdfService.downloadPdf(sheetRef.current!, filename);
      setZoomScale(currentScale);
    }, 300);
  };

  // AI Document Tailoring
  const handleAiTailoring = async () => {
    if (!geminiKey) {
      alert("Please configure your Gemini API Key in settings (top right) to use AI tailoring.");
      setShowSettings(true);
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a Job Description in the right column first.");
      return;
    }

    setAiLoading(true);
    try {
      if (activeDocType === 'resume') {
        const result = await GeminiService.tailorResume(geminiKey, resumeState, jobDescription);
        setResumeState((prev) => ({
          ...prev,
          resumeSummary: result.resumeSummary || prev.resumeSummary,
          resumeSkills: result.resumeSkills || prev.resumeSkills,
          resumeExperience: prev.resumeExperience.map((exp, idx) => ({
            ...exp,
            bullets: result.resumeExperience?.[idx]?.bullets || exp.bullets
          }))
        }));
      } else {
        const result = await GeminiService.tailorCoverLetter(geminiKey, clState, jobDescription);
        setClState((prev) => ({
          ...prev,
          companyName: result.companyName || prev.companyName,
          jobTitle: result.jobTitle || prev.jobTitle,
          salutation: result.salutation || prev.salutation,
          p1: result.p1 || prev.p1,
          p2: result.p2 || prev.p2,
          p3: result.p3 || prev.p3,
          p4: result.p4 || prev.p4,
          highlights: prev.highlights.map((hl, idx) => ({
            ...hl,
            category: result.highlights?.[idx]?.category || hl.category,
            text: result.highlights?.[idx]?.text || hl.text
          }))
        }));
      }
    } catch (err: any) {
      alert(`AI Tailoring failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Keyword Injection
  const handleKeywordInjection = async (kw: string) => {
    if (!geminiKey) {
      alert("Please configure your Gemini API Key in settings.");
      setShowSettings(true);
      return;
    }

    try {
      if (activeDocType === 'resume') {
        const result = await GeminiService.injectKeywordIntoResume(geminiKey, resumeState, kw);
        setResumeState((prev) => ({
          ...prev,
          resumeSummary: result.resumeSummary || prev.resumeSummary,
          resumeSkills: result.resumeSkills || prev.resumeSkills,
          resumeExperience: prev.resumeExperience.map((exp, idx) => ({
            ...exp,
            bullets: result.resumeExperience?.[idx]?.bullets || exp.bullets
          }))
        }));
      } else {
        const result = await GeminiService.injectKeywordIntoCoverLetter(geminiKey, clState, kw);
        setClState((prev) => ({
          ...prev,
          p1: result.p1 || prev.p1,
          p2: result.p2 || prev.p2,
          p3: result.p3 || prev.p3,
          p4: result.p4 || prev.p4,
          highlights: prev.highlights.map((hl, idx) => ({
            ...hl,
            category: result.highlights?.[idx]?.category || hl.category,
            text: result.highlights?.[idx]?.text || hl.text
          }))
        }));
      }
    } catch (err: any) {
      alert(`AI Keyword injection failed: ${err.message}`);
      throw err;
    }
  };

  // AI Bullet Point Improver
  const handleImproveBullet = async (idx: number, currentText: string) => {
    if (!geminiKey) {
      alert("Please configure your Gemini API Key in settings.");
      setShowSettings(true);
      return;
    }
    setAiLoading(true);
    try {
      const improved = await GeminiService.improveExperienceBullet(
        geminiKey, 
        currentText, 
        resumeState.resumeExperience[idx].title, 
        jobDescription
      );
      setResumeState((prev) => {
        const updated = [...prev.resumeExperience];
        updated[idx] = { ...updated[idx], bullets: improved };
        return { ...prev, resumeExperience: updated };
      });
    } catch (err: any) {
      alert(`AI Bullet Improvement failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const getDocumentText = () => {
    if (activeDocType === 'resume') {
      return `${resumeState.name} ${resumeState.subtitle} ${resumeState.resumeSummary} ${resumeState.resumeSkills} ${resumeState.resumeExperience.map(e => e.title + ' ' + e.bullets).join(' ')}`;
    } else {
      return `${clState.name} ${clState.subtitle} ${clState.p1} ${clState.p2} ${clState.p3} ${clState.p4} ${clState.highlights.map(h => h.category + ' ' + h.text).join(' ')}`;
    }
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated (Landing Page & Auth Modal Overlay)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-screen w-full"
        >
          <LandingPage onAuthSuccess={handleAuthSuccess} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Dashboard view
  // -------------------------------------------------------------
  if (!activeDocId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="min-h-screen w-full"
        >
          <Dashboard
            userId={user.email}
            isLocal={!!user.isLocal}
            onSelectDocument={handleSelectDocument}
            onCreateNew={handleCreateNew}
            onLogout={handleLogout}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Workspace Editor view
  // -------------------------------------------------------------
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen bg-editor text-text-main flex flex-col h-screen overflow-hidden"
      >
        {/* Offline Alert Banner */}
        {!isOnline && (
          <div className="bg-amber-950/80 border-b border-amber-600/40 text-amber-200 text-xs py-2 px-8 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Offline Mode: AI features (tailoring, polishing, keyword injections) are disabled. Reconnect to resume.</span>
          </div>
        )}

        {/* Header toolbar */}
        <EditorHeader
          title={activeDocType === 'resume' ? resumeState.title || '' : clState.title || ''}
          onTitleChange={(val) => {
            if (activeDocType === 'resume') {
              setResumeState(prev => ({ ...prev, title: val }), true);
            } else {
              setClState(prev => ({ ...prev, title: val }), true);
            }
          }}
          saveStatus={saveStatus}
          canUndo={activeDocType === 'resume' ? canUndoResume : canUndoCl}
          canRedo={activeDocType === 'resume' ? canRedoResume : canRedoCl}
          onUndo={activeDocType === 'resume' ? undoResume : undoCl}
          onRedo={activeDocType === 'resume' ? redoResume : redoCl}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          onDownload={handleDownloadPdf}
          onBack={() => setActiveDocId(null)}
        />

        {/* Split Screen panels */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Settings overlay dropdown */}
          {showSettings && (
            <div className="absolute right-20 top-16 z-50 w-80 bg-sidebar border border-brand-accent/30 rounded-xl p-4 shadow-xl">
              <form onSubmit={handleSaveGeminiKey} className="space-y-3">
                <div className="text-xs font-bold text-brand-accent flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Gemini API Key
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Provide your Gemini API Key to enable instant AI tailoring and bullet improvers. 
                </p>
                <input
                  type="password"
                  required
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
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
          )}

          {/* Left panel: Form editor */}
          {activeDocType === 'resume' ? (
            <ResumeForm
              state={resumeState}
              onChange={setResumeState}
              onImproveBullet={handleImproveBullet}
              aiLoading={aiLoading}
              isOnline={isOnline}
              geminiKey={geminiKey}
            />
          ) : (
            <CoverLetterForm
              state={clState}
              onChange={setClState}
            />
          )}

          {/* Center panel: A4 preview canvas */}
          <section className="flex-1 overflow-hidden relative flex flex-col items-center justify-center bg-editor">
            <div className="sheet-preview-container flex-1 w-full relative">
              <div 
                style={{ 
                  transform: `scale(${zoomScale})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.25s ease-out'
                }}
                ref={sheetRef}
                className="flex justify-center"
              >
                {activeDocType === 'resume' ? (
                  <ResumeTemplateRenderer
                    state={resumeState}
                    isEditable={true}
                    onFieldChange={(field, val) => {
                      setResumeState((prev) => ({ ...prev, [field]: val }));
                    }}
                    onExperienceChange={(idx, field, val) => {
                      setResumeState((prev) => {
                        const updated = [...prev.resumeExperience];
                        updated[idx] = { ...updated[idx], [field]: val };
                        return { ...prev, resumeExperience: updated };
                      });
                    }}
                    onEducationChange={(idx, field, val) => {
                      setResumeState((prev) => {
                        const updated = [...prev.resumeEducation];
                        updated[idx] = { ...updated[idx], [field]: val };
                        return { ...prev, resumeEducation: updated };
                      });
                    }}
                    onCertChange={(idx, field, val) => {
                      setResumeState((prev) => {
                        const updated = [...prev.resumeCerts];
                        updated[idx] = { ...updated[idx], [field]: val };
                        return { ...prev, resumeCerts: updated };
                      });
                    }}
                    onAchievementChange={(idx, field, val) => {
                      setResumeState((prev) => {
                        const updated = [...prev.resumeAchievements];
                        updated[idx] = { ...updated[idx], [field]: val };
                        return { ...prev, resumeAchievements: updated };
                      });
                    }}
                    onLanguageChange={(idx, field, val) => {
                      setResumeState((prev) => {
                        const updated = [...prev.resumeLanguages];
                        updated[idx] = { ...updated[idx], [field]: val };
                        return { ...prev, resumeLanguages: updated };
                      });
                    }}
                  />
                ) : (
                  <CoverLetterTemplateRenderer
                    state={clState}
                    isEditable={true}
                    onFieldChange={(field, val) => {
                      setClState((prev) => ({ ...prev, [field]: val }));
                    }}
                    onHighlightChange={(idx, field, val) => {
                      setClState((prev) => {
                        const updated = [...prev.highlights];
                        updated[idx] = { ...updated[idx], [field]: val };
                        return { ...prev, highlights: updated };
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Right panel: AI & ATS Checkers */}
          <JDPanel
            jobDescription={jobDescription}
            onJdChange={handleJdChange}
            docText={getDocumentText()}
            onInjectKeyword={handleKeywordInjection}
            aiLoading={aiLoading}
            onAiTailor={handleAiTailoring}
            isOnline={isOnline}
            geminiKey={geminiKey}
          />

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
