import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import { profileSchema, importProfile, tailorProfile, matchProfile, toResume } from '../src/studio/model';
import { anmol } from '../src/studio/anmol';
import { renderSitePdf } from './pdf/exportPdf';
import { workspace } from './workspace';

const root=path.resolve(process.env.PROFILE_DATA_DIR || 'data/studio');
const profiles=path.join(root,'profiles'); const jobs=path.join(root,'jobs');
await mkdir(profiles,{recursive:true});await mkdir(jobs,{recursive:true});
try{await readFile(path.join(profiles,'anmol.json'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;await writeFile(path.join(profiles,'anmol.json'),JSON.stringify(anmol,null,2));}
const id=z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
async function getProfile(key:string){return profileSchema.parse(JSON.parse(await readFile(path.join(profiles,id.parse(key)+'.json'),'utf8')));}
const app=new Hono();
app.use('*',async(c,next)=>{
 const origin=c.req.header('origin'); if(origin&&!['http://127.0.0.1:5175','http://localhost:5175'].includes(origin))return c.json({error:'Origin not allowed'},403);
 if(process.env.STUDIO_API_TOKEN && c.req.header('authorization')!==`Bearer ${process.env.STUDIO_API_TOKEN}`)return c.json({error:'Unauthorized'},401);
 if(['POST','PUT'].includes(c.req.method)&&!c.req.header('content-type')?.includes('application/json'))return c.json({error:'JSON required'},415);
 await next();
});
app.onError((e,c)=>c.json({error:e instanceof z.ZodError?e.issues.map(x=>x.path.join('.')+': '+x.message).join('; '):(e as NodeJS.ErrnoException).code==='ENOENT'?'Profile or artifact not found':e.message},e instanceof z.ZodError?400:(e as NodeJS.ErrnoException).code==='ENOENT'?404:500));
app.route('/api/v2/workspace',workspace);
app.get('/api/v2/health',c=>c.json({ok:true,mode:'local-beta',generation:'evidence-preserving',legacy:'separate /v1 server'}));
app.get('/api/v2/profiles',async c=>{const names=(await readdir(profiles)).filter(x=>x.endsWith('.json'));return c.json(await Promise.all(names.map(async n=>{const p=await getProfile(n.slice(0,-5));return {id:p.id,name:p.name,subtitle:p.subtitle};})));});
app.get('/api/v2/profiles/:id',async c=>c.json(await getProfile(c.req.param('id'))));
app.post('/api/v2/profiles',async c=>{
 const p=importProfile(await c.req.json());
 try{await writeFile(path.join(profiles,p.id+'.json'),JSON.stringify(p,null,2),{flag:'wx'});}catch(e){if((e as NodeJS.ErrnoException).code==='EEXIST')return c.json({error:'Profile ID already exists. Choose another ID or save the existing profile.'},409);throw e;}
 return c.json(p,201);
});
app.put('/api/v2/profiles/:id',async c=>{const p=profileSchema.parse(await c.req.json());if(p.id!==id.parse(c.req.param('id')))return c.json({error:'Profile ID cannot change during save'},400);await getProfile(p.id);const dest=path.join(profiles,p.id+'.json');const temp=dest+'.'+randomUUID();await writeFile(temp,JSON.stringify(p,null,2));await rename(temp,dest);return c.json(p);});
app.get('/api/v2/schema',c=>c.json({schemaVersion:1,example:anmol,instructions:'Return one JSON object matching the example fields. Use only candidate-provided facts. Preserve dates and metrics. List unresolved questions in notes. Do not add skills just because a job description requests them. Use a unique lowercase hyphenated id. Photo is optional and must be an embedded data URL.'}));
const requestSchema=z.object({profileId:id,jobDescription:z.string().trim().min(10).max(40000),company:z.string().max(200).default(''),role:z.string().max(200).default(''),template:z.enum(['hybrid','designer','ats','navy','serif','sidebar','tech','executive']).optional()});
let queue:Promise<unknown>=Promise.resolve();
app.post('/api/v2/generate',async c=>{
 const input=requestSchema.parse(await c.req.json());const master=await getProfile(input.profileId);
 const key=createHash('sha256').update(JSON.stringify({input,master,renderer:2})).digest('hex').slice(0,32);
 const folder=path.join(jobs,key); const metaPath=path.join(folder,'meta.json');
 try{return c.json(JSON.parse(await readFile(metaPath,'utf8')));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const task=queue.catch(()=>undefined).then(async()=>{
  await mkdir(folder,{recursive:true});const variant=tailorProfile(master,input.jobDescription); if(input.template)variant.template=input.template;
  await renderSitePdf(variant.template==='hybrid'?{type:'hybrid',profile:variant}:{type:'resume',state:toResume(variant)},path.join(folder,'resume.pdf'),false);
  await writeFile(path.join(folder,'master-resume.json'),JSON.stringify(variant,null,2));
  const result={id:key,profileId:master.id,company:input.company,role:input.role,template:variant.template,createdAt:new Date().toISOString(),match:matchProfile(variant,input.jobDescription),notes:variant.notes,generationMode:'Evidence-preserving skill and bullet ranking; no invented or rewritten claims',pdfUrl:`/api/v2/jobs/${key}/resume.pdf`,jsonUrl:`/api/v2/jobs/${key}/master-resume.json`};
  await writeFile(metaPath,JSON.stringify(result,null,2));return result;
 });queue=task;return c.json(await task);
});
app.get('/api/v2/jobs/:id/:file',async c=>{const key=z.string().regex(/^[a-f0-9]{32}$/).parse(c.req.param('id'));const file=z.enum(['resume.pdf','master-resume.json','meta.json']).parse(c.req.param('file'));const data=await readFile(path.join(jobs,key,file));c.header('Content-Type',file.endsWith('.pdf')?'application/pdf':'application/json');c.header('Cache-Control','no-store');return c.body(new Uint8Array(data));});
serve({fetch:app.fetch,port:8793,hostname:'127.0.0.1'});
console.log('Profile API ready: http://127.0.0.1:8793/api/v2/health');
