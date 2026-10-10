import {describe,it,expect,vi} from 'vitest';
import {writeFile} from 'node:fs/promises';
vi.mock('../../server/pdf/exportPdf',()=>({renderSitePdf:vi.fn(async (_payload:unknown,path:string)=>{await writeFile(path,'%PDF-test');})}));
import {workspace} from '../../server/workspace';
import {anmol} from '../studio/anmol';
import {toResume,toCoverLetter} from '../studio/model';
describe('Direct document download',()=>{
 it.each(['resume','coverletter'])('returns a PDF attachment for %s without publishing',async kind=>{
  const state=kind==='resume'?toResume(anmol):toCoverLetter(anmol);
  const response=await workspace.request('/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,state})});
  expect(response.status).toBe(200);expect(response.headers.get('Content-Type')).toBe('application/pdf');
  expect(response.headers.get('Content-Disposition')).toContain('attachment');expect(await response.text()).toBe('%PDF-test');
 });
});
