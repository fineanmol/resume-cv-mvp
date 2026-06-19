import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ToastContainer } from './components/ToastContainer';

import { useUndoRedo } from './hooks/useUndoRedo';
import { useResumeMutations } from './hooks/useResumeMutations';
import { useCoverLetterMutations } from './hooks/useCoverLetterMutations';
import { useToast } from './hooks/useToast';

import { dbService } from './services/db';
import { DEFAULT_RESUME_STATE } from './config/defaultResume';
import { DEFAULT_CL_STATE } from './config/defaultCL';

import { auth, isConfigured } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import type { ResumeState, CoverLetterState, AuthUser, DocType, TemplateId } from './types';
import { isLocalUser, userEmail } from './types';
import { PAGE_ANIM } from './constants/animations';

const EditorRoute = lazy(() =>
  import('./pages/EditorRoute').then(m => ({ default: m.EditorRoute }))
);

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (isConfigured && auth) return null;
    const localUser = localStorage.getItem('LOCAL_USER');
    return localUser ? ({ email: localUser, isLocal: true } as AuthUser) : null;
  });

  const [activeDocId, setActiveDocId] = useState<string | null>(() => localStorage.getItem('ACTIVE_DOC_ID'));
  const [activeDocType, setActiveDocType] = useState<DocType | null>(() => localStorage.getItem('ACTIVE_DOC_TYPE') as DocType | null);

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
  const cl = useUndoRedo<CoverLetterState>(DEFAULT_CL_STATE);
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

  const handleSelectDocument = async (id: string, type: DocType) => {
    if (!user) return;
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
    const id = `${type}_${Date.now()}`;
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

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="min-h-screen bg-editor flex items-center justify-center text-text-muted">Loading editor…</div>}>
          <EditorRoute
            user={user}
            activeDocId={activeDocId}
            activeDocType={activeDocType!}
            onBack={() => setActiveDocId(null)}
            resume={resume}
            cl={cl}
            resumeMutations={resumeMutations}
            clMutations={clMutations}
            toast={toast}
          />
        </Suspense>
      </AnimatePresence>
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </>
  );
}
