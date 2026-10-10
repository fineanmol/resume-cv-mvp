import { mkdir,readFile,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { anmol } from '../src/studio/anmol';
import { toResume,toCoverLetter } from '../src/studio/model';
import { renderSitePdf } from './pdf/exportPdf';
import type { TemplateId } from '../src/types';
import {TEMPLATE_CATALOG} from '../src/config/templates';
export async function validateTemplates(){
 const dir=path.resolve('work/template-validation');await mkdir(dir,{recursive:true});
 const reports: {kind:string;template:string;fixture:string;pages:number;a4:boolean;path:string;expectedText:string[]}[]=[];
 for(const kind of ['resume','coverletter'] as const)for(const template of TEMPLATE_CATALOG.filter(t=>!t.docTypes||t.docTypes.includes(kind)).map(t=>t.id) as TemplateId[])for(const fixture of ['short','two-page','oversized']){
  const resume=toResume(anmol),letter=toCoverLetter(anmol,'Validation Company','Software Engineer');
  resume.name='Test Candidate';resume.phone='';resume.email='candidate@example.com';resume.linkedin='';resume.avatar='';
  letter.name=resume.name;letter.phone='';letter.email=resume.email;letter.linkedin='';letter.avatar='';
  resume.layoutSettings.template=template;letter.layoutSettings.template=template;const expectedText:string[]=[];
  if(kind==='resume'){
   if(fixture==='short'){resume.resumeSummary='Frontend engineer building maintainable interfaces.';resume.resumeSkills='Vue, React, TypeScript, Storybook';resume.resumeEducation=resume.resumeEducation.slice(0,1);resume.resumeCerts=[];resume.resumeAchievements=[];}
   resume.resumeEducation[0].url='https://example.com/evidence';
   resume.resumeExperience=fixture==='short'?resume.resumeExperience.slice(0,1):Array.from({length:fixture==='two-page'?(template==='executive'?5:7):4},(_,i)=>({...resume.resumeExperience[i%resume.resumeExperience.length],title:`Validation Role ${i+1}`,bullets:Array.from({length:fixture==='oversized'?(i===0?80:12):3},(_,j)=>`Evidence ${i+1}.${j+1}: Built reliable interfaces and documented reusable components for cross-team delivery.`).join('\n')}));
   expectedText.push(...resume.resumeExperience.map(x=>x.title),...resume.resumeExperience.flatMap(x=>x.bullets.split('\n')));
  }else{
   const count=fixture==='short'?1:fixture==='two-page'?(template==='navy'?10:7):18;
   for(const k of ['p1','p2','p3','p4'] as const)letter[k]=Array.from({length:count},(_,i)=>`Evidence ${k}.${i+1}: I developed reusable interfaces and tested them with colleagues to deliver maintainable software for users.`).join('\n\n');
   expectedText.push(...['p1','p2','p3','p4'].flatMap(k=>letter[k as 'p1'].split('\n\n')));
  }
  const output=path.join(dir,`${kind}-${template}-${fixture}.pdf`);await renderSitePdf(kind==='resume'?{type:'resume',state:resume}:{type:'coverLetter',state:letter},output,false);
  const pdf=await PDFDocument.load(await readFile(output));reports.push({kind,template,fixture,pages:pdf.getPageCount(),a4:pdf.getPages().every(p=>Math.abs(p.getWidth()-595.28)<2&&Math.abs(p.getHeight()-841.89)<2),path:output,expectedText});
 }
 const report={createdAt:new Date().toISOString(),checks:'A4 geometry and page counts. Text retention and visual review are separate checks.',reports};await writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2));return report;
}
