import {useState} from 'react';
import {SectionVisibilityOptions} from './SectionVisibilityOptions';
import type {LayoutSettings} from '../../types';
export function SectionSettingsPanel({layout,onChange}:{layout:LayoutSettings;onChange:(patch:Partial<LayoutSettings>)=>void}){
 const [section,setSection]=useState('experience');
 return <details className="border border-border-color/50 rounded-xl p-3 text-xs"><summary className="font-bold cursor-pointer">Section settings</summary><label className="block my-3">Section <select aria-label="Sidebar section settings" className="w-full border rounded p-2 mt-1" value={section} onChange={e=>setSection(e.target.value)}>{[['experience','Experience'],['education','Education'],['summary','Profile'],['certs','Projects'],['achievements','Achievements'],['languages','Languages']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><SectionVisibilityOptions section={section} layout={layout} onChange={onChange}/><p className="text-[10px] mt-3 text-slate-500">Uses the same settings as the section toolbar. Enabled bullets inherit the selected document bullet style.</p></details>;
}
