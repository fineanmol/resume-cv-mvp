import {reconcileGroups} from '../utils/skillGroups';
import { z } from 'zod';
import type { ResumeState, CoverLetterState } from '../types';
import { documentSchema, coverSchema, safeUrl } from './documentSettings';

const short = z.string().trim().max(500);
const visibility=z.object({dates:z.boolean().optional(),location:z.boolean().optional(),company:z.boolean().optional(),logo:z.boolean().optional(),bullets:z.boolean().optional(),link:z.boolean().optional(),gpa:z.boolean().optional(),desc:z.boolean().optional(),icon:z.boolean().optional(),level:z.boolean().optional(),slider:z.boolean().optional()});
const entryOptions={icon:short.optional(),logo:z.string().max(2000000).optional(),visibility:visibility.optional()};
const contact=z.object({id:short,icon:z.enum(['globe','github','twitter','instagram','youtube','phone','mail','linkedin','location','link','briefcase','calendar','custom']),label:short,value:short});
const entry = z.object({ ...entryOptions,title: short, company: short, dates: short, location: short.default(''), bullets: z.string().max(12000), url:safeUrl });
export const profileSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  name: short.min(1), subtitle: short, email: short, phone: short.default(''), location: short,
  customContacts:z.array(contact).max(30).optional(),
  linkedin: short.default(''), avatar: z.string().max(2000000).refine(v => !v || /^data:image\/(png|jpeg|webp);base64,/.test(v), 'Use an embedded PNG, JPEG or WebP photo').default(''),
  summary: z.string().max(4000),
  skills: z.array(z.object({ category: short, items: z.array(short.min(1)).max(80) })).max(12),
  experience: z.array(entry).min(1).max(30),
  education: z.array(z.object({ ...entryOptions,degree: short, school: short, dates: short, location: short.default(''), bullets: z.string().max(3000).default(''), url:safeUrl })).max(15),
  projects: z.array(z.object({ ...entryOptions,title: short, desc: z.string().max(3000), url:safeUrl })).max(20).default([]),
  achievements: z.array(z.object({ ...entryOptions,title: short, desc: z.string().max(3000), url:safeUrl })).max(20).default([]),
  languages: z.array(z.object({ ...entryOptions,name: short, level: short })).max(15).default([]),
  template: z.enum(['hybrid', 'designer', 'ats', 'navy', 'serif', 'sidebar', 'tech', 'executive']).default('hybrid'),
  notes: z.array(short).default([]),
  document:documentSchema.optional(), coverLetter:coverSchema.optional(),
});
export type Profile = z.infer<typeof profileSchema>;
export function toResume(p: Profile): ResumeState {
  const doc=documentSchema.parse(p.document||{});const hidden=doc.hiddenSections;
  const result:ResumeState = { name:p.name, subtitle:p.subtitle, phone:p.phone, email:p.email, location:p.location, linkedin:p.linkedin, avatar:p.avatar,
    customContacts:p.customContacts,resumeSummary:p.summary, resumeSkills:p.skills.flatMap(g=>g.items).join(', '), resumeSkillGroups:p.skills, resumeExperience:p.experience,
    resumeEducation:p.education, resumeCerts:p.projects, resumeAchievements:p.achievements, resumeLanguages:p.languages,
    layoutSettings:{...doc.layout,template:p.template} };
  if(hidden.includes('summary'))result.resumeSummary='';if(hidden.includes('skills'))result.resumeSkills='';
  if(hidden.includes('experience'))result.resumeExperience=[];if(hidden.includes('education'))result.resumeEducation=[];
  if(hidden.includes('certs'))result.resumeCerts=[];if(hidden.includes('achievements'))result.resumeAchievements=[];if(hidden.includes('languages'))result.resumeLanguages=[];
  return result;
}
/** Keep optional resume fields visible so exported JSON can be completed before import. */
export function resumeDataForExport(state:ResumeState):ResumeState {
  return {...structuredClone(state),customContacts:state.customContacts||[],resumeExperience:state.resumeExperience.map(entry=>({...entry,url:entry.url||'',logo:entry.logo||'',visibility:entry.visibility||{}})),resumeEducation:state.resumeEducation.map(entry=>({...entry,url:entry.url||'',logo:entry.logo||'',visibility:entry.visibility||{}})),resumeCerts:state.resumeCerts.map(entry=>({...entry,url:entry.url||'',icon:entry.icon||'',visibility:entry.visibility||{}})),resumeAchievements:state.resumeAchievements.map(entry=>({...entry,url:entry.url||'',icon:entry.icon||'',visibility:entry.visibility||{}})),resumeLanguages:state.resumeLanguages.map(entry=>({...entry,visibility:entry.visibility||{}}))};
}
export function toCoverLetter(p:Profile,company='',role=''):CoverLetterState {
 const c=coverSchema.parse(p.coverLetter||{});
 const fill=(text:string)=>text.replace(/{{summary}}/g,p.summary).replace(/{{name}}/g,p.name);
 return {name:p.name,subtitle:p.subtitle,email:p.email,phone:p.phone,location:p.location,linkedin:p.linkedin,avatar:p.avatar,companyName:company,jobTitle:role,salutation:c.salutation,p1:fill(c.p1),p2:fill(c.p2),p3:fill(c.p3),p4:fill(c.p4),highlights:c.highlights,layoutSettings:{...c.layout,template:c.template}};
}
export function importProfile(raw: unknown): Profile {
  const direct = profileSchema.safeParse(raw);
  if(direct.success) return direct.data;
  const r = raw as Partial<ResumeState>;
  if(r?.resumeExperience) return profileSchema.parse({schemaVersion:1,id:(r.name||'profile').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''),name:r.name,subtitle:r.subtitle,email:r.email,phone:r.phone,location:r.location,linkedin:r.linkedin,customContacts:r.customContacts,avatar:r.avatar?.startsWith('data:')?r.avatar:'',summary:r.resumeSummary,skills:reconcileGroups(r.resumeSkills||'',r.resumeSkillGroups),experience:r.resumeExperience,education:r.resumeEducation||[],projects:r.resumeCerts||[],achievements:r.resumeAchievements||[],languages:r.resumeLanguages||[],template:'hybrid'});
  return profileSchema.parse(raw);
}
export function mergeResumeIntoProfile(current:Profile,raw:unknown):Profile {
  const source=raw as Partial<ResumeState>|null;
  if(!source||!Array.isArray(source.resumeExperience))throw new Error('This JSON is not a resume document. Export the resume data JSON from the editor and try again.');
  const incoming=importProfile(raw);
  return profileSchema.parse({...current,name:incoming.name,subtitle:incoming.subtitle,email:incoming.email,phone:incoming.phone,location:incoming.location,linkedin:incoming.linkedin,avatar:incoming.avatar,customContacts:incoming.customContacts,summary:incoming.summary,skills:incoming.skills,experience:incoming.experience,education:incoming.education,projects:incoming.projects,achievements:incoming.achievements,languages:incoming.languages});
}
const terms = ['Vue','Vue.js','Vue 3','React','React.js','Next.js','TypeScript','JavaScript','Node.js','Pinia','Redux','Storybook','HTML','HTML5','CSS','CSS3','SCSS','SASS','Tailwind CSS','Material UI','REST','REST APIs','GraphQL','WebSockets','WebGL','Canvas','Jest','Vitest','Playwright','Cypress','TDD','unit testing','accessibility','WCAG','SSR','design systems','micro-frontends','multi-frontend','monorepo','Webpack','Vite','Lighthouse','ESLint','Git','GitHub Actions','GitLab','CI/CD','CircleCI','Docker','Kubernetes','AWS','GCP','Python','Java','SQL','NoSQL','MongoDB','Nginx','Figma','Agile','Scrum','Kanban','Jira','Confluence','product management','product strategy','stakeholder management','Power BI','SAP','market research','A/B testing','user research','roadmap','KPI','analytics','n8n'];
const aliases: Record<string,string[]> = {'vue':['vue','vue.js','vue 3'],'react':['react','react.js'],'node.js':['node.js','nodejs'],'next.js':['next.js','nextjs'],'html':['html','html5'],'css':['css','css3'],'rest':['rest','rest api','rest apis'],'design systems':['design system','design systems']};
export function contains(text:string,term:string) { return new RegExp('(^|[^a-z0-9])'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(text); }
export function requirements(jd:string, p:Profile) {
  const pool = [...terms,...p.skills.flatMap(g=>g.items)];
  return [...new Set(pool.map(t=>Object.keys(aliases).find(k=>aliases[k].includes(t.toLowerCase()))||t.toLowerCase()))].filter(t=>(aliases[t]||[t]).some(a=>contains(jd,a)));
}
export function matchProfile(p:Profile,jd:string) {
  const text=JSON.stringify([p.summary,p.skills,p.experience,p.projects]);
  const terms=requirements(jd,p);const matched=terms.filter(t=>(aliases[t]||[t]).some(a=>contains(text,a)));
  return {score:terms.length?Math.round(100*matched.length/terms.length):null,matched,missing:terms.filter(t=>!matched.includes(t)),label:'Recognized JD keyword coverage'};
}
export function tailorProfile(master:Profile,jd:string):Profile {
  const p=structuredClone(master); const keys=requirements(jd,master);
  const rank=(s:string)=>keys.filter(k=>(aliases[k]||[k]).some(a=>contains(s,a))).length;
  p.skills=p.skills.map(g=>({...g,items:g.items.map((s,i)=>({s,i,r:rank(s)})).sort((a,b)=>b.r-a.r||a.i-b.i).map(x=>x.s)}));
  p.experience=p.experience.map(e=>({...e,bullets:e.bullets.split('\n').filter(Boolean).map((s,i)=>({s,i,r:rank(s)})).sort((a,b)=>b.r-a.r||a.i-b.i).map(x=>x.s).join('\n')}));
  return p;
}
