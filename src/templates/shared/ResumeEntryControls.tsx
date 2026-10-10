import type { ReactNode } from 'react';
import type { EntrySection } from '../../types';
import type { TemplateRenderContext } from '../resume/useTemplateSetup';
import { ItemWrapper } from './ItemWrapper';
import { ExperienceEntrySettings, EducationEntrySettings, CertEntrySettings, AchievementEntrySettings, LanguageEntrySettings } from './entrySettings';

/** A template supplies its visual content, never a second implementation of entry actions. */
export function ResumeEntryControls({section,index,editor:c,children}:{section:EntrySection;index:number;editor?:TemplateRenderContext;children:ReactNode}) {
  if(!c)return <div className="resume-entry">{children}</div>;
  const actions={experience:[c.resumeExperience,c.onDeleteExperience,c.onDuplicateExperience,c.onAddSimilarExperience],education:[c.resumeEducation,c.onDeleteEducation,c.onDuplicateEducation,c.onAddSimilarEducation],certs:[c.resumeCerts,c.onDeleteCert,c.onDuplicateCert,c.onAddSimilarCert],achievements:[c.resumeAchievements,c.onDeleteAchievement,c.onDuplicateAchievement,c.onAddSimilarAchievement],languages:[c.resumeLanguages,c.onDeleteLanguage,c.onDuplicateLanguage,c.onAddSimilarLanguage]} as const;
  const [items,remove,duplicate,similar]=actions[section];
  const toggle=(field:string,value:boolean)=>c.onEntryVisibilityChange?.(section,index,field,value);
  const panel=(onClose:()=>void)=>{
    const common={onClose,onToggle:toggle};
    switch(section){
      case 'experience':return <ExperienceEntrySettings {...common} item={c.resumeExperience[index]} logo={c.resumeExperience[index].logo} brandColor={c.brandColor} onLogoChange={v=>c.onExperienceChange?.(index,'logo',v)} onUrlChange={v=>c.onExperienceChange?.(index,'url',v)}/>;
      case 'education':return <EducationEntrySettings {...common} item={c.resumeEducation[index]} logo={c.resumeEducation[index].logo} brandColor={c.brandColor} onLogoChange={v=>c.onEducationChange?.(index,'logo',v)}/>;
      case 'certs':return <CertEntrySettings {...common} item={c.resumeCerts[index]} onUrlChange={v=>c.onCertChange?.(index,'url',v)}/>;
      case 'achievements':return <AchievementEntrySettings {...common} item={c.resumeAchievements[index]} onUrlChange={v=>c.onAchievementChange?.(index,'url',v)}/>;
      case 'languages':return <LanguageEntrySettings {...common} item={c.resumeLanguages[index]}/>;
    }
  };
  return <div data-entry-section={section} data-entry-index={index}><ItemWrapper sectionId={section} index={index} totalItems={items.length} isEditable={c.isEditable} onDelete={()=>remove?.(index)} onDuplicate={()=>duplicate?.(index)} onAddSimilar={()=>similar?.(index)} settingsPanel={panel}>{children}</ItemWrapper></div>;
}
