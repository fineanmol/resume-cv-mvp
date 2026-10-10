import {readFileSync,writeFileSync} from 'node:fs';
let s=readFileSync('server/workspace.ts','utf8').replace('{ randomUUID }','{ randomUUID,createHash }');
const i=s.indexOf("workspace.post('/profiles/:id/publications'");
s=s.slice(0,i)+`const digest=(state:unknown)=>createHash('sha256').update(JSON.stringify(state)).digest('hex');
workspace.post('/profiles/:id/preflight',async c=>{
 const profileId=key.parse(c.req.param('id')),dir=await profile(profileId),input=publishSchema.parse(await c.req.json());
 const state=(input.kind==='resume'?resumeDocumentSchema:letterDocumentSchema).parse(input.state);
 if(state.profileId&&state.profileId!==profileId)return c.json({error:'Document belongs to a different profile'},409);
 const id=randomUUID(),filename=input.kind==='resume'?'resume.pdf':'coverletter.pdf',out=path.join(dir,'artifacts',id,filename);
 await renderSitePdf(input.kind==='resume'?{type:'resume',state:state as ResumeState}:{type:'coverLetter',state:state as CoverLetterState},out,false);
 const pages=(await PDFDocument.load(await readFile(out))).getPageCount();
 const proof={id,kind:input.kind,hash:digest(state),pages,pdfUrl:'/api/v2/workspace/profiles/'+profileId+'/artifacts/'+id+'/'+filename};
 await atomic(path.join(dir,'preflights',id+'.json'),proof);return c.json(proof);
});
`+s.slice(i);
s=s.replace('const publication={...input,',`let proof;
 if(input.previewId){proof=await file(path.join(dir,'preflights',input.previewId+'.json'));if(proof.kind!==input.kind||proof.hash!==digest(state))return c.json({error:'Document changed after preview. Render and review again.'},409);}
 const publication={...input,...(proof?{pages:proof.pages,pdfUrl:proof.pdfUrl}:{}),`);
writeFileSync('server/workspace.ts',s);
let h=readFileSync('src/templates/resume/variants/HybridTemplate.tsx','utf8').replace("title:visible(e,'title')?e.title:'',",'');writeFileSync('src/templates/resume/variants/HybridTemplate.tsx',h);
