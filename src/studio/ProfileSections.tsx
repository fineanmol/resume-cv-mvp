import { useEffect, useState } from 'react';
import type { Profile } from './model';
export function SkillsInput({items,onChange}:{items:string[];onChange:(items:string[])=>void}) {
 const [draft,setDraft]=useState(items.join(', '));
 useEffect(()=>setDraft(items.join(', ')),[items]);
 return <textarea value={draft} onChange={e=>setDraft(e.target.value)} onBlur={()=>onChange(draft.split(',').map(s=>s.trim()).filter(Boolean))}/>;
}
function Entries<T extends object>({title,values,fields,empty,onChange}:{title:string;values:T[];fields:(keyof T)[];empty:T;onChange:(v:T[])=>void}){
 return <details><summary>{title} · {values.length}</summary>{values.map((v,i)=><div className="entry-form" key={i}>{fields.map(k=><label key={String(k)}>{String(k)==='desc'?'Description':String(k)==='bullets'?'Details':String(k)}<textarea rows={['desc','bullets'].includes(String(k))?3:1} value={String(v[k]||'')} onChange={e=>onChange(values.map((a,j)=>i===j?{...a,[k]:e.target.value}:a))}/></label>)}<button onClick={()=>onChange(values.filter((_,j)=>j!==i))}>Remove entry</button></div>)}<button onClick={()=>onChange([...values,{...empty}])}>＋ Add entry</button></details>;
}
export function ProfileSections({profile:p,onChange}:{profile:Profile;onChange:(p:Partial<Profile>)=>void}){
 return <><Entries title="Education" values={p.education} fields={['degree','school','dates','location','bullets','url']} empty={{degree:'',school:'',dates:'',location:'',bullets:''}} onChange={education=>onChange({education})}/><Entries title="Projects" values={p.projects} fields={['title','desc','url']} empty={{title:'',desc:''}} onChange={projects=>onChange({projects})}/><Entries title="Achievements" values={p.achievements} fields={['title','desc','url']} empty={{title:'',desc:''}} onChange={achievements=>onChange({achievements})}/><Entries title="Languages" values={p.languages} fields={['name','level']} empty={{name:'',level:''}} onChange={languages=>onChange({languages})}/></>;
}
