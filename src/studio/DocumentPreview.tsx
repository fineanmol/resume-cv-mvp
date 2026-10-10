import type { Profile } from './model';
import { toCoverLetter } from './model';
import { coverSchema,designSchema } from './documentSettings';
import { ProfileResumePreview } from './ProfileResumePreview';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
export function DocumentPreview({profile:p,kind,company,role,onChange}:{profile:Profile;kind:'resume'|'coverletter';company:string;role:string;onChange?:(p:Partial<Profile>)=>void}) {
 const c=coverSchema.parse(p.coverLetter||{});
 if(kind==='coverletter')return <CoverLetterTemplateRenderer state={toCoverLetter(p,company,role)} isEditable={!!onChange} onFieldChange={(k,v)=>{if(['p1','p2','p3','p4','salutation','highlights'].includes(k))onChange?.({coverLetter:coverSchema.parse({...c,[k]:v})});else if(['name','subtitle','email','phone','location','linkedin','avatar'].includes(k))onChange?.({[k]:v});}} onLayoutSettingsChange={patch=>onChange?.({coverLetter:{...c,layout:designSchema.parse({...c.layout,...patch})}})} onHighlightChange={(i,k,v)=>onChange?.({coverLetter:{...c,highlights:c.highlights.map((h,j)=>i===j?{...h,[k]:v}:h)}})}/>;
 return <ProfileResumePreview profile={p} onChange={onChange}/>;
}
