import { z } from 'zod';
import type { ResumeState,CoverLetterState } from '../types';
const text=z.string().max(30000),short=z.string().max(2000);
const url=short.refine(v=>!v||/^https?:\/\//i.test(v),'Links must use http:// or https://').optional();
const photo=z.string().max(2000000).refine(v=>!v||/^data:image\/(png|jpeg|webp);base64,/.test(v)||/^\/(?!\/)[\w/.-]+$/.test(v),'Use an embedded or local image');
const base={name:short.min(1),subtitle:short,phone:short,email:short,linkedin:short,location:short,avatar:photo,profileId:z.string().optional()};
const layout=z.object({fontSize:z.number().min(8).max(20),lineHeight:z.number().min(1).max(2),paddingTopBottom:z.number().min(0).max(35),paddingLeftRight:z.number().min(0).max(35),sectionSpacing:z.number().min(0).max(60),template:z.enum(['navy','serif','sidebar','tech','ats','executive','designer','professional','hybrid'])}).passthrough();
const experience=z.object({title:short,company:short,dates:short,location:short,bullets:text,url,logo:photo.optional()}).passthrough();
const education=z.object({degree:short,school:short,dates:short,location:short,bullets:text,url,logo:photo.optional()}).passthrough();
const item=z.object({title:short,desc:text,url}).passthrough();
export const resumeDocumentSchema=z.object({...base,resumeSummary:text,resumeSkills:text,resumeExperience:z.array(experience).max(50),resumeEducation:z.array(education).max(30),resumeCerts:z.array(item).max(50),resumeAchievements:z.array(item).max(50),resumeLanguages:z.array(z.object({name:short,level:short}).passthrough()).max(30),layoutSettings:layout.extend({columnGap:z.number().min(0).max(80)})}).passthrough();
export const letterDocumentSchema=z.object({...base,companyName:short,jobTitle:short,salutation:short,p1:text,p2:text,p3:text,p4:text,highlights:z.array(z.object({category:short,text})).max(30),layoutSettings:layout}).passthrough();
export const publishSchema=z.object({kind:z.enum(['resume','coverletter']),state:z.unknown(),pageLimit:z.enum(['1','2','auto']),allowRewrite:z.boolean(),label:z.string().trim().min(1).max(100),previewId:z.string().uuid().optional()});
export type Published={id:string;profileId:string;kind:'resume'|'coverletter';state:ResumeState|CoverLetterState;pageLimit:'1'|'2'|'auto';allowRewrite:boolean;label:string;createdAt:string};
export type Change={field:string;before:string;after:string};
// Only these prose fields can cross the AI boundary. Every other field is copied from the publication.
export function applyProse(resume:ResumeState,letter:CoverLetterState,proposed:unknown,permissions:{resume:boolean;coverletter:boolean}) {
 const schema=z.object({summary:text.optional(),bullets:z.array(text).optional(),p1:text.optional(),p2:text.optional(),p3:text.optional(),p4:text.optional()}).strict();
 const input=schema.parse(proposed);const r=structuredClone(resume),c=structuredClone(letter);const changes:Change[]=[];const warnings:string[]=[];
 const numbers=(s:string):string[]=>Array.from(s.match(/\d+(?:[.,]\d+)*(?:\s*%|\+)?/g)||[]);
 const approve=(field:string,before:string,after:string|undefined,set:(s:string)=>void)=>{if(after===undefined||after===before)return;
  if(numbers(after).some(n=>!numbers(before).includes(n))||numbers(before).some(n=>!numbers(after).includes(n))){warnings.push(`${field}: rewrite rejected because a numeric fact changed.`);return;}
  if(!after.trim()){warnings.push(`${field}: empty rewrite rejected.`);return;}
  set(after);changes.push({field,before,after});
 };
 if(permissions.resume){approve('resume.summary',r.resumeSummary,input.summary,v=>r.resumeSummary=v);if(input.bullets){if(input.bullets.length!==r.resumeExperience.length)warnings.push('Experience rewrite rejected: role count changed.');else input.bullets.forEach((s,i)=>{const before=r.resumeExperience[i].bullets;if(s.split('\n').filter(Boolean).length!==before.split('\n').filter(Boolean).length)warnings.push(`Experience ${i+1}: rewrite rejected because bullet count changed.`);else approve(`resume.experience.${i}.bullets`,before,s,v=>r.resumeExperience[i].bullets=v);});}}
 if(permissions.coverletter)for(const k of ['p1','p2','p3','p4'] as const)approve(`coverletter.${k}`,c[k],input[k],v=>c[k]=v);
 return {resume:r,letter:c,changes,warnings};
}
