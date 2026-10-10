import { validateTemplates } from '../server/validateTemplates';
const r=await validateTemplates();console.log(JSON.stringify(r.reports.map(({kind,template,fixture,pages,a4})=>({kind,template,fixture,pages,a4})),null,2));process.exit(r.reports.every(x=>x.a4)?0:1);
