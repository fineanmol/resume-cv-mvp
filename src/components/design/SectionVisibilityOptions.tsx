import {ToggleSwitch} from '../ui/ToggleSwitch';
import {sectionControls} from '../../config/sectionCapabilities';
import type {LayoutSettings} from '../../types';
export function SectionVisibilityOptions({section,layout,onChange,compact=false}:{section:string;layout:LayoutSettings;onChange:(patch:Partial<LayoutSettings>)=>void;compact?:boolean}){
 return <div className="flex flex-col gap-1">{sectionControls(section,layout.template).map(({key,label})=>{
  const fallback=key.endsWith('Bullets')?!['hybrid','designer'].includes(layout.template||''):true;
  return <ToggleSwitch key={key} label={label} checked={(layout[key] as boolean|undefined)??fallback} onChange={checked=>onChange({[key]:checked})} variant="teal" compact={compact}/>;
 })}</div>;
}
