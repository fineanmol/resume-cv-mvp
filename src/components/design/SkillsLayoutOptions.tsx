import {SKILLS_LAYOUTS} from '../../config/skillsContract';
import type {LayoutSettings} from '../../types';
export function SkillsLayoutOptions({value,onChange,compact=false}:{value:LayoutSettings['skillsStyle'];onChange:(value:NonNullable<LayoutSettings['skillsStyle']>)=>void;compact?:boolean}){
 return <div className={compact?'flex gap-1':'grid grid-cols-2 gap-1.5'}>{SKILLS_LAYOUTS.map(option=><button key={option.value} type="button" aria-pressed={(value||'chips')===option.value} onClick={e=>{e.stopPropagation();onChange(option.value);}} className={`${compact?'px-1.5 py-0.5 text-[10px]':'px-2.5 py-2 text-[10px] text-left'} flex-1 rounded border cursor-pointer ${(value||'chips')===option.value?'bg-teal-500 text-white border-teal-500':'bg-white text-slate-500 border-slate-200'}`}><span className="font-semibold">{option.label}</span>{!compact&&<span className="text-[8px] block opacity-70 mt-0.5">{option.description}</span>}</button>)}</div>;
}
