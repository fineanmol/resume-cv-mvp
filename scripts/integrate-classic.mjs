import fs from 'node:fs';
const edit=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));
edit('src/types/index.ts',s=>s.replace("export interface DocumentBase {","export interface DocumentBase {\n  profileId?: string;").replaceAll("'designer' | 'professional'","'designer' | 'hybrid' | 'professional'"));
edit('src/main.tsx',s=>s.replace("import { Studio } from './studio/Studio';","import './workspace.css';").replace("{window.location.pathname.startsWith('/studio') ? <Studio /> : <App />}",'<App />'));
edit('src/App.tsx',s=>s.replace("import { LandingPage }",`import { localApi,profileScope } from './services/workspace';
import type { Application } from './services/workspace';
import type { Profile } from './studio/model';
import { toResume,toCoverLetter } from './studio/model';
import { AutomationPanel } from './components/AutomationPanel';
import { ProfileManager } from './components/ProfileManager';
import { LandingPage }`)
 .replace(" : null;\n  });", " : ({email:'local-workspace',isLocal:true} as AuthUser);\n  });")
 .replace("const [activeDocId, setActiveDocId] = useState<string | null>(() => localStorage.getItem('ACTIVE_DOC_ID'));","const [profileId,setProfileId]=useState(()=>localStorage.getItem('WORKSPACE_PROFILE')||'anmol');\n  const [profiles,setProfiles]=useState<{id:string;name:string}[]>([]);\n  const [showAutomation,setShowAutomation]=useState(false);const [showProfiles,setShowProfiles]=useState(false);\n  const refreshProfiles=()=>localApi<typeof profiles>('/profiles').then(setProfiles).catch(e=>toast.error(e.message));\n  useEffect(()=>{void refreshProfiles();},[]);\n  const scopedUser:AuthUser|null=profileId?{email:profileScope(profileId),isLocal:true}:user;\n  const [activeDocId, setActiveDocId] = useState<string | null>(null);")
 .replace("const uid = userEmail(user);","const uid = userEmail(scopedUser!);")
 .replace("}, [user, activeDocId, activeDocType, resetResume, resetCl]);","}, [user, profileId, activeDocId, activeDocType, resetResume, resetCl]);")
 .replace("const state = { ...DEFAULT_RESUME_STATE, id, title:","const master=profileId?await localApi<Profile>('/profiles/'+profileId):null;\n      const source=master?toResume(master):DEFAULT_RESUME_STATE;\n      const state = { ...source, profileId:profileId||undefined,id, title:")
 .replace('...DEFAULT_RESUME_STATE.layoutSettings, template','...source.layoutSettings, template')
 .replace("const clLayoutSettings = {\n        ...DEFAULT_CL_STATE.layoutSettings,","const master=profileId?await localApi<Profile>('/profiles/'+profileId):null;\n      const source=master?toCoverLetter(master):DEFAULT_CL_STATE;\n      const clLayoutSettings = {\n        ...source.layoutSettings,")
 .replace("const state = { ...DEFAULT_CL_STATE, id, title:","const state = { ...source,profileId:profileId||undefined, id, title:")
 .replace("  if (!user) {",`  const editApplication=async(a:Application,type:DocType)=>{const id=type+'_'+crypto.randomUUID();const state={...(type==='resume'?a.resume:a.coverletter),id,profileId,title:a.company+' - '+type+' (review copy)'};const uid=profileScope(profileId);if(type==='resume'){await dbService.saveResume(uid,id,state as ResumeState);resume.reset(state as ResumeState);}else{await dbService.saveCoverLetter(uid,id,state as CoverLetterState);cl.reset(state as CoverLetterState);}setActiveDocId(id);setActiveDocType(type);setShowAutomation(false);};
  if (!user) {`)
 .replace("    return (\n      <>\n        <AnimatePresence mode=\"wait\">\n          <motion.div key=\"dashboard\"",`    return (
      <div className="classic-shell">
        <div className="workspace-bar"><span className="workspace-brand">Résumé workspace · local beta</span><label>Profile <select aria-label="Active profile" value={profileId} onChange={e=>{setProfileId(e.target.value);localStorage.setItem('WORKSPACE_PROFILE',e.target.value);}}><option value="">Legacy documents (unchanged)</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button onClick={()=>setShowProfiles(true)}>Master profiles</button><button disabled={!profileId} onClick={()=>setShowAutomation(true)}>Applications & automation</button></div>
        <div className="classic-body"><AnimatePresence mode="wait">
          <motion.div key="dashboard"`)
 .replace('userId={userEmail(user)}','userId={userEmail(scopedUser!)}').replace('isLocal={isLocalUser(user)}','isLocal={isLocalUser(scopedUser!)}')
 .replace('onCreateNew={handleCreateNew}','onCreateNew={(type,template)=>{void handleCreateNew(type,template).catch(e=>toast.error(e.message));}}')
 .replace(`        </AnimatePresence>
        <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
      </>
    );
  }

  return (`, `        </AnimatePresence></div>
        {showProfiles&&<ProfileManager profileId={profileId} onClose={()=>setShowProfiles(false)} onSaved={id=>{setProfileId(id);localStorage.setItem('WORKSPACE_PROFILE',id);setShowProfiles(false);void refreshProfiles();}}/>}
        {showAutomation&&<AutomationPanel profileId={profileId} onClose={()=>setShowAutomation(false)} onEdit={editApplication}/>}
        <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
      </div>
    );
  }

  return (`)
 .replace('user={user}\n            activeDocId','user={scopedUser!}\n            activeDocId'));
edit('src/pages/EditorRoute.tsx',s=>s.replace("import { EditorHeader }","import { PublicationBar } from '../components/PublicationBar';\nimport { EditorHeader }").replace('        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">','        {(isResume?resume.state.profileId:cl.state.profileId)&&<PublicationBar key={activeDocId} profileId={(isResume?resume.state.profileId:cl.state.profileId)!} kind={activeDocType} state={isResume?resume.state:cl.state}/>}\n        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">'));
// Local profile drafts never fall through to configured Firebase.
edit('src/services/db.ts',s=>s.replaceAll('if (db) {',"if (db && !userId.startsWith('local-profile:')) {").replaceAll('`LOCAL_RESUME_${id}`','`LOCAL_RESUME_${userId}_${id}`').replaceAll('`LOCAL_CL_${id}`','`LOCAL_CL_${userId}_${id}`'));
edit('src/templates/resume/ResumeTemplateRenderer.tsx',s=>s.replace("case 'designer':","case 'hybrid':\n      case 'designer':"));
edit('src/config/templates.ts',s=>s.replace('export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [',`export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {id:'hybrid',name:'Hybrid',accent:'#008f9e',chipName:'Hybrid',tagline:'Original-inspired · fully editable',desc:'Two-column layout with editable elements, evidence links and icons.',docTypes:['resume']},`).replace('Maximum ATS Score','Simple text structure').replace('Guaranteed to parse through any ATS system.','Designed for straightforward text extraction; parsing varies by ATS.'));
for(const p of ['src/components/EditorHeader.tsx','src/components/TemplateLayoutPreview.tsx'])edit(p,s=>s.replace("currentTemplate === 'designer'","(currentTemplate === 'designer' || currentTemplate === 'hybrid')").replace("case 'designer':","case 'hybrid':\n    case 'designer':"));
