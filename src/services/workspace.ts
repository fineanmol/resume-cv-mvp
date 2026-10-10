import type { Published,Change } from '../studio/publication';
import type { ResumeState,CoverLetterState } from '../types';
export async function localApi<T>(url:string,init?:RequestInit):Promise<T>{const r=await fetch('/api/v2'+url,{...init,headers:{'Content-Type':'application/json',...init?.headers}});const raw=await r.text();let data:unknown;try{data=JSON.parse(raw);}catch{if(raw.trimStart().startsWith('<!DOCTYPE')||raw.trimStart().startsWith('<html'))throw new Error('Workspace API is not running. Start the project with `npm run studio`, then reload this page.');throw new Error(`Workspace API returned invalid JSON (${r.status}).`);}if(!r.ok)throw new Error(typeof data==='object'&&data&&'error' in data?String((data as {error:unknown}).error):`Request failed (${r.status})`);return data as T;}
export const profileScope=(id:string)=>`local-profile:${id}`;
export type Application={id:string;profileId:string;company:string;role:string;createdAt:string;status:'draft'|'reviewed';pageCounts:{resume:number;coverletter:number};warnings:string[];changes:Change[];resume:ResumeState;coverletter:CoverLetterState;pdfUrl:string;coverletterUrl:string};
export type { Published };
