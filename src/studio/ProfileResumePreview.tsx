import type { Profile } from './model';
import { toResume } from './model';
import { documentSchema,designSchema } from './documentSettings';
import { ResumeTemplateRenderer } from '../templates/resume/ResumeTemplateRenderer';
import { useResumeMutations } from '../hooks/useResumeMutations';
import { reconcileGroups } from '../templates/shared/SkillGroupsContext';

/** Profiles, drafts and exports share the same renderer and mutation contract. */
export function ProfileResumePreview({profile,onChange}:{profile:Profile;onChange?:(patch:Partial<Profile>)=>void}) {
 const state=toResume(profile);
 const mutations=useResumeMutations(update=>{
  const fullState=toResume({...profile,document:{...documentSchema.parse(profile.document||{}),hiddenSections:[]}});
  const next=typeof update==='function'?update(fullState):update;
  onChange?.({name:next.name,subtitle:next.subtitle,phone:next.phone,email:next.email,location:next.location,linkedin:next.linkedin,avatar:next.avatar,customContacts:next.customContacts,summary:next.resumeSummary,skills:reconcileGroups(next.resumeSkills,next.resumeSkillGroups),experience:next.resumeExperience,education:next.resumeEducation,projects:next.resumeCerts,achievements:next.resumeAchievements,languages:next.resumeLanguages,template:next.layoutSettings.template as Profile['template'],document:{...documentSchema.parse(profile.document||{}),layout:designSchema.parse(next.layoutSettings)}});
 });
 return <ResumeTemplateRenderer state={state} isEditable={!!onChange} {...mutations}/>;
}
