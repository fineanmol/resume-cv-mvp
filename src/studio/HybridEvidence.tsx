import {ExternalLink} from 'lucide-react';
export function HybridEvidence({url='',editable=false,onSave}:{url?:string;editable?:boolean;onSave?:(value:string)=>void}) {
 const href=/^https?:\/\//i.test(url)?url:/^[\w-]+(?:\.[\w-]+)+(?:\/.*)?$/.test(url)?`https://${url}`:undefined;
 return <span className="hybrid-evidence-control">
  {href&&<a className="hybrid-evidence" href={href} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true"/> Link</a>}
  {editable&&<details className="edit-only hybrid-link-editor"><summary>{href?'Edit link':'+ Add link'}</summary><input aria-label="Evidence URL" type="url" defaultValue={url} placeholder="https://…" onBlur={e=>{const value=e.currentTarget.value.trim();onSave?.(/^[\w-]+(?:\.[\w-]+)+(?:\/.*)?$/.test(value)?`https://${value}`:value);}}/></details>}
 </span>;
}
