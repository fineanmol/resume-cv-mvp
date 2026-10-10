import { HYBRID_STYLE_DEFAULTS } from './config/hybridDefaults';
import { DESIGNER_STYLE_DEFAULTS } from './config/designerDefaults';
import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { localApi,profileScope } from './services/workspace';
import type { Application } from './services/workspace';
import type { Profile } from './studio/model';
import { toResume,toCoverLetter } from './studio/model';
import { AutomationPanel } from './components/AutomationPanel';
import { ProfileManager } from './components/ProfileManager';
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
    return localUser ? ({ email: localUser, isLocal: true } as AuthUser) : ({email:'local-workspace',isLocal:true} as AuthUser);
  });

  const [profileId,setProfileId]=useState(()=>localStorage.getItem('WORKSPACE_PROFILE')||'anmol');
  const [profiles,setProfiles]=useState<{id:string;name:string}[]>([]);
  const [showAutomation,setShowAutomation]=useState(false);const [showProfiles,setShowProfiles]=useState(false);
  const refreshProfiles=()=>localApi<typeof profiles>('/profiles').then(setProfiles).catch(e=>toast.error(e.message));
  useEffect(()=>{void refreshProfiles();},[]);
  const scopedUser:AuthUser|null=profileId?{email:profileScope(profileId),isLocal:true}:user;
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
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
      const uid = userEmail(scopedUser!);
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
  }, [user, profileId, activeDocId, activeDocType, resetResume, resetCl]);

  const handleSelectDocument = async (id: string, type: DocType) => {
    if (!user) return;
    const uid = userEmail(scopedUser!);
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
    const uid = userEmail(scopedUser!);
    const id = `${type}_${Date.now()}`;
    if (type === 'resume') {
      const master=profileId?await localApi<Profile>('/profiles/'+profileId):null;
      const source=master?toResume(master):DEFAULT_RESUME_STATE;
      const state = { ...source, profileId:profileId||undefined,id, title: `New Resume (${new Date().toLocaleDateString()})`, layoutSettings: { ...source.layoutSettings, ...(template === 'hybrid' ? HYBRID_STYLE_DEFAULTS : template==='designer'?DESIGNER_STYLE_DEFAULTS:{}), template } };
      await dbService.saveResume(uid, id, state);
      resume.reset(state);
    } else {
      const master=profileId?await localApi<Profile>('/profiles/'+profileId):null;
      const source=master?toCoverLetter(master):DEFAULT_CL_STATE;
      const clLayoutSettings = {
        ...source.layoutSettings,
        template,
        // Professional template uses the EnhancvHeader two-tone style by default
        ...(template === 'professional' && { headerStyle: 'enhancv' as const }),
      };
      const state = { ...source,profileId:profileId||undefined, id, title: `New Cover Letter (${new Date().toLocaleDateString()})`, layoutSettings: clLayoutSettings };
      await dbService.saveCoverLetter(uid, id, state);
      cl.reset(state);
    }
    setActiveDocId(id);
    setActiveDocType(type);
  };

  const editApplication=async(a:Application,type:DocType)=>{const id=type+'_'+crypto.randomUUID();const state={...(type==='resume'?a.resume:a.coverletter),id,profileId,title:a.company+' - '+type+' (review copy)'};const uid=profileScope(profileId);if(type==='resume'){await dbService.saveResume(uid,id,state as ResumeState);resume.reset(state as ResumeState);}else{await dbService.saveCoverLetter(uid,id,state as CoverLetterState);cl.reset(state as CoverLetterState);}setActiveDocId(id);setActiveDocType(type);setShowAutomation(false);};
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
      <div className="classic-shell">
        <div className="workspace-bar"><span className="workspace-brand">Résumé workspace · local beta</span><label>Profile <select aria-label="Active profile" value={profileId} onChange={e=>{setProfileId(e.target.value);localStorage.setItem('WORKSPACE_PROFILE',e.target.value);}}><option value="">Legacy documents (unchanged)</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button onClick={()=>setShowProfiles(true)}>Master profiles</button><button disabled={!profileId} onClick={()=>setShowAutomation(true)}>Applications & automation</button></div>
        <div className="classic-body"><AnimatePresence mode="wait">
          <motion.div key="dashboard" {...PAGE_ANIM} className="min-h-screen w-full">
            <Dashboard
              userId={userEmail(scopedUser!)}
              isLocal={isLocalUser(scopedUser!)}
              onSelectDocument={handleSelectDocument}
              onCreateNew={(type,template)=>{void handleCreateNew(type,template).catch(e=>toast.error(e.message));}}
              onLogout={() => { setUser(null); setActiveDocId(null); setActiveDocType(null); }}
            />
          </motion.div>
        </AnimatePresence></div>
        {showProfiles&&<ProfileManager profileId={profileId} onClose={()=>setShowProfiles(false)} onSaved={id=>{setProfileId(id);localStorage.setItem('WORKSPACE_PROFILE',id);setShowProfiles(false);void refreshProfiles();}}/>}
        {showAutomation&&<AutomationPanel profileId={profileId} onClose={()=>setShowAutomation(false)} onEdit={editApplication}/>}
        <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="min-h-screen bg-editor flex items-center justify-center text-text-muted">Loading editor…</div>}>
          <EditorRoute
            user={scopedUser!}
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
