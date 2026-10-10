import {parseEducationGrade} from '../../shared/parseEducationGrade';
import {reconcileGroups} from '../../../utils/skillGroups';
import { HybridResume } from '../../../studio/HybridResume';
import { useTemplateRenderContext } from '../useTemplateSetup';
import type { Profile } from '../../../studio/model';
import type { ResumeState,ExperienceItem } from '../../../types';

/** The flat editable field remains authoritative; categories never resurrect removed skills. */
export function reconcileSkillGroups(value:string, groups:ResumeState['resumeSkillGroups']=[]) {
 return reconcileGroups(value,groups);
}
export function HybridTemplate({state}:{state:ResumeState}) {
 const c=useTemplateRenderContext(),l=state.layoutSettings;
 const visible=(v:ExperienceItem,field:keyof NonNullable<ExperienceItem['visibility']>)=>v.visibility?.[field]!==false;
 const profile:Profile={schemaVersion:1,id:state.profileId||'preview',name:state.name,subtitle:l.showTitle===false?'':state.subtitle,
  phone:l.showPhone===false?'':state.phone,email:l.showEmail===false?'':state.email,location:l.showLocation===false?'':state.location,
  customContacts:state.customContacts,linkedin:l.showLinkedin===false?'':state.linkedin,avatar:l.showPhoto===false?'':state.avatar,summary:state.resumeSummary,
  skills:reconcileSkillGroups(state.resumeSkills,state.resumeSkillGroups),
  experience:state.resumeExperience.map(e=>({...e,company:l.showExperienceCompany===false||!visible(e,'company')?'':e.company,dates:l.showExperienceDates===false||!visible(e,'dates')?'':e.dates,location:l.showExperienceLocation===false||!visible(e,'location')?'':e.location,url:visible(e,'link')?e.url:'',logo:visible(e,'logo')?e.logo:'',bullets:visible(e,'bullets')?e.bullets:''})),
  education:state.resumeEducation.map(e=>({...e,dates:l.showEducationDates===false||e.visibility?.dates===false?'':e.dates,location:l.showEducationLocation===false||e.visibility?.location===false?'':e.location,logo:e.visibility?.logo===false?'':e.logo,bullets:(()=>{const grade=parseEducationGrade(e.bullets);return [(l.showEducationGpa!==false&&e.visibility?.gpa!==false)?grade.gradeText.replace('\n',': '):'',e.visibility?.bullets!==false?grade.remaining:''].filter(Boolean).join(' · ');})()})),
  projects:(state.resumeCerts||[]).map(e=>({...e,desc:l.showProjectDesc===false||e.visibility?.desc===false?'':e.desc,url:e.visibility?.link===false?'':e.url})),
  achievements:(state.resumeAchievements||[]).map(e=>({...e,desc:l.showAchievementDesc===false||e.visibility?.desc===false?'':e.desc,url:e.visibility?.link===false?'':e.url})),
  languages:(state.resumeLanguages||[]).map(e=>({...e,level:l.showLanguageLevel===false||e.visibility?.level===false?'':e.level})),template:'hybrid',notes:[]};
 return <HybridResume profile={profile} editor={c} layout={l} fonts={{body:c.bodyFontCss,heading:c.headingFontCss,title:c.titleFontCss,accent:c.accentFontCss}}/>;
}
