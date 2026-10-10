import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {renderSitePdf,closePdfRuntime} from '../server/pdf/exportPdf';
import {toResume} from '../src/studio/model';
import {anmol} from '../src/studio/anmol';
import {HYBRID_STYLE_DEFAULTS} from '../src/config/hybridDefaults';
import {DESIGNER_STYLE_DEFAULTS} from '../src/config/designerDefaults';
await mkdir('work/skills-validation',{recursive:true});
const results=[];
for(const template of ['hybrid','designer'] as const)for(const style of ['chips','normal','grid','grouped'] as const)for(const long of [false,true]){
 const state=toResume(anmol);state.layoutSettings={...state.layoutSettings,...(template==='hybrid'?HYBRID_STYLE_DEFAULTS:DESIGNER_STYLE_DEFAULTS),template,skillsStyle:style};
 if(long){state.resumeExperience=[...state.resumeExperience,...state.resumeExperience.map(e=>({...e,title:'Additional '+e.title}))];state.resumeSkills+=', Cross-functional stakeholder communication and collaboration';}
 const path=`work/skills-validation/${template}-${style}-${long?'long':'short'}.pdf`;
 await renderSitePdf({type:'resume',state},path,false);
 const pdf=await PDFDocument.load(await readFile(path));results.push({template,style,long,path,pages:pdf.getPageCount(),a4:pdf.getPages().every(p=>Math.abs(p.getWidth()-595.28)<2&&Math.abs(p.getHeight()-841.89)<2)});
}
await writeFile('work/skills-validation/report.json',JSON.stringify(results,null,2));console.log(results);
await closePdfRuntime();
