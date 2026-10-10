import { useEffect,useState } from 'react';
import { localApi } from '../services/workspace';
import type { Published } from '../studio/publication';
import type { ResumeState,CoverLetterState,DocType } from '../types';
type Proof={id:string;pages:number;pdfUrl:string};
export function PublicationBar({profileId,kind,state}:{profileId:string;kind:DocType;state:ResumeState|CoverLetterState}){
 const [open,setOpen]=useState(false),[limit,setLimit]=useState<'1'|'2'|'auto'>('1'),[rewrite,setRewrite]=useState(true),[label,setLabel]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const [proof,setProof]=useState<Proof|null>(null),[reviewed,setReviewed]=useState(false),[versions,setVersions]=useState<(Published&{pages?:number;pdfUrl?:string})[]>([]);
 const snapshot=JSON.stringify(state),base='/workspace/profiles/'+profileId;
 useEffect(()=>{setProof(null);setReviewed(false);},[snapshot,kind,profileId]);
 const load=()=>localApi<typeof versions>(base+'/publications').then(v=>setVersions(v.filter(x=>x.kind===kind))).catch(e=>setStatus(e.message));
 useEffect(()=>{if(open)void load();},[open,profileId,kind]);
 const input={kind,state,pageLimit:limit,allowRewrite:rewrite,label};
 return <div className="publication-bar"><span>Profile: {profileId} · Editable draft</span><button onClick={()=>setOpen(!open)}>Publish automation version</button>{status&&<span role="status">{status}</span>}{open&&<div className="publication-options">
 <h3>Review → lock → use in automation</h3><p>“Publish” saves a private, immutable automation version. It does not put your résumé online. Your editable draft stays separate.</p>
 <label>Version label<input placeholder="e.g. Frontend · two pages" value={label} onChange={e=>setLabel(e.target.value)}/></label>
 <label>Page budget<select value={limit} onChange={e=>setLimit(e.target.value as typeof limit)}><option value="1">One page</option><option value="2">Up to two pages</option><option value="auto">Automatic</option></select></label>
 <label><input type="checkbox" checked={rewrite} onChange={e=>setRewrite(e.target.checked)}/> Allow AI to rewrite {kind==='resume'?'summary and existing bullets':'paragraphs'}; preserve facts/layout</label>
 <button disabled={busy||!label.trim()} onClick={async()=>{setBusy(true);setStatus('');setReviewed(false);try{setProof(await localApi<Proof>(base+'/preflight',{method:'POST',body:JSON.stringify(input)}));}catch(e){setStatus((e as Error).message);}finally{setBusy(false);}}}>{busy?'Working…':'1. Render PDF for review'}</button>
 {proof&&<div><a href={proof.pdfUrl} target="_blank" rel="noreferrer">Open exact PDF · {proof.pages} {proof.pages===1?'page':'pages'} ↗</a>{limit!=='auto'&&proof.pages>Number(limit)&&<p role="alert">Over your page budget. Adjust content or spacing, or choose a larger budget. Nothing was truncated.</p>}<label><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> I checked this PDF’s facts, readability and page breaks.</label></div>}
 <button disabled={busy||!label.trim()||!proof||!reviewed||(limit!=='auto'&&!!proof&&proof.pages>Number(limit))} onClick={async()=>{setBusy(true);try{await localApi(base+'/publications',{method:'POST',body:JSON.stringify({...input,previewId:proof!.id})});setStatus('Private version locked. Select it in Applications & automation.');await load();setProof(null);setReviewed(false);}catch(e){setStatus((e as Error).message);}finally{setBusy(false);}}}>2. Lock reviewed version</button>
 <details><summary>Version history ({versions.length})</summary><p>Existing versions never change. Choose an earlier version in Applications to roll back.</p>{versions.map(v=><div key={v.id}><strong>{v.label}</strong> · {new Date(v.createdAt).toLocaleString()} · {v.state.layoutSettings.template} · {v.allowRewrite?'Prose rewriting allowed':'Prose locked'} {v.pdfUrl&&<a href={v.pdfUrl} target="_blank" rel="noreferrer">Reviewed PDF ↗</a>}<small style={{display:'block'}}>ID: {v.id}</small></div>)}</details>
 </div>}</div>;
}
