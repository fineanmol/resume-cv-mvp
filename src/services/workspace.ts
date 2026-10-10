import type { Published,Change } from '../studio/publication';
import type { ResumeState,CoverLetterState } from '../types';
export async function localApi<T>(url:string,init?:RequestInit):Promise<T>{const r=await fetch('/api/v2'+url,{...init,headers:{'Content-Type':'application/json',...init?.headers}});const data=await r.json();if(!r.ok)throw new Error(data.error||`Request failed (${r.status})`);return data;}
export const profileScope=(id:string)=>`local-profile:${id}`;
export type Application={id:string;profileId:string;company:string;role:string;createdAt:string;status:'draft'|'reviewed';pageCounts:{resume:number;coverletter:number};warnings:string[];changes:Change[];resume:ResumeState;coverletter:CoverLetterState;pdfUrl:string;coverletterUrl:string};
export type { Published };
