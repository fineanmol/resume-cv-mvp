import { readFileSync,writeFileSync,readdirSync } from 'node:fs';
function edit(file,fn){writeFileSync(file,fn(readFileSync(file,'utf8')));}
edit('src/templates/resume/useTemplateSetup.ts',s=>s.replace("bulletStyle = 'chips'","bulletStyle = 'disc'"));
for(const file of ['src/hooks/useTemplateFocus.ts','src/hooks/useTemplateDrag.ts'])edit(file,s=>s.replaceAll('LayoutSettings','ResumeLayoutSettings'));
edit('src/config/defaultResume.ts',s=>s.replace('...DESIGNER_STYLE_DEFAULTS,','...DESIGNER_STYLE_DEFAULTS,\n    fontSize: 9.5, lineHeight: 1.35, paddingTopBottom: 10, paddingLeftRight: 10, sectionSpacing: 8, columnGap: 16,'));
edit('src/templates/coverletter/shared.tsx',s=>s.replaceAll('JSX.Element','React.JSX.Element'));
edit('src/templates/shared/ItemWrapper.tsx',s=>s.replace('placeholderIcon?: React.ReactNode;','placeholderIcon?: React.ReactNode;\n  placeholderIconName?: string;'));
const dir='src/templates/resume/variants/designer/';
for(const name of readdirSync(dir).filter(n=>n.endsWith('.tsx'))){edit(dir+name,s=>{
  const imports=['LayoutSettings','EntrySection','ExperienceItem','EducationItem','CertItem','AchievementItem','LanguageItem'];
  for(const prop of ['bulletStyle','skillsStyle','summaryAlign','experienceAlign','educationAlign','certsAlign'])s=s.replaceAll(prop+': string;',prop+': NonNullable<LayoutSettings["'+prop+'"]>;');
  s=s.replaceAll('(section: string, idx: number, field: string, value: boolean)','(section: EntrySection, idx: number, field: string, value: boolean)');
  for(const [prop,type] of Object.entries({onExperienceChange:'ExperienceItem',onEducationChange:'EducationItem',onCertChange:'CertItem',onAchievementChange:'AchievementItem',onLanguageChange:'LanguageItem'}))s=s.replace(prop+'?: (idx: number, field: string, value: string)',prop+'?: (idx: number, field: keyof '+type+', value: string)');
  s=s.replace('value={resumeSkills}',"value={resumeSkills || ''}");
  const used=imports.filter(t=>new RegExp('\\b'+t+'\\b').test(s));
  return (used.length?`import type { ${used.join(', ')} } from '../../../../types';\n`:'')+s;
});}
for(const file of ['AtsTemplate','ExecutiveTemplate','NavyTemplate','SerifTemplate','TechTemplate'])edit('src/templates/resume/variants/'+file+'.tsx',s=>s.replace("import { Building2, GraduationCap } from 'lucide-react';\n",''));
edit('src/templates/resume/variants/SidebarTemplate.tsx',s=>s.replace(', Building2, GraduationCap',''));
for(const file of ['DesignerAchievementsSection','DesignerEducationSection','DesignerExperienceSection'])edit(dir+file+'.tsx',s=>s.replace('  C_TITLE,\n',''));
edit('src/components/CoverLetterForm.tsx',s=>s.replace('  onLayoutSettingsChange,\n',''));
edit('src/templates/shared/templateIconHelpers.tsx',s=>s.replace("import React from 'react';\n",''));
edit('src/services/gemini.ts',s=>s.replace('const _: IAiService = GeminiService;','export const aiService: IAiService = GeminiService;'));
for(const f of ['editorLayout.test.tsx','resumeForm.test.tsx','useResumeMutations.test.ts'])edit('src/tests/'+f,s=>s.replace(', vi }',' }').replace("import React from 'react';\n",''));
edit('src/tests/designer.test.tsx',s=>s.replaceAll('querySelector(', 'querySelector<HTMLElement>('));
