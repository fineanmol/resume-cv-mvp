import { describe,it,expect } from 'vitest';
import { applyProse,resumeDocumentSchema } from '../studio/publication';
import { toResume,toCoverLetter } from '../studio/model';
import { anmol } from '../studio/anmol';
describe('published application boundaries',()=>{
 it('rejects identity and layout changes from AI',()=>{expect(()=>applyProse(toResume(anmol),toCoverLetter(anmol),{name:'Another candidate'},{resume:true,coverletter:true})).toThrow();});
 it('keeps unauthorized prose and all facts immutable',()=>{const r=toResume(anmol),c=toCoverLetter(anmol);const out=applyProse(r,c,{summary:'Changed'},{resume:false,coverletter:false});expect(out.resume).toEqual(r);expect(out.letter).toEqual(c);expect(out.changes).toHaveLength(0);});
 it('rejects changed numeric evidence',()=>{const r=toResume(anmol);const out=applyProse(r,toCoverLetter(anmol),{summary:r.resumeSummary.replace('7+','20+')},{resume:true,coverletter:false});expect(out.resume).toEqual(r);expect(out.warnings).toHaveLength(1);});
 it('records before/after without changing source',()=>{const r=toResume(anmol);const original=structuredClone(r);const out=applyProse(r,toCoverLetter(anmol),{summary:r.resumeSummary+' Focused on maintainable interfaces.'},{resume:true,coverletter:false});expect(out.changes).toHaveLength(1);expect(r).toEqual(original);expect(out.resume.layoutSettings).toEqual(original.layoutSettings);});
 it('rejects script URLs and remote image fetches',()=>{const r=toResume(anmol);r.resumeExperience[0].url='javascript:alert(1)';expect(resumeDocumentSchema.safeParse(r).success).toBe(false);r.resumeExperience[0].url='https://example.com/evidence';r.avatar='https://example.com/photo';expect(resumeDocumentSchema.safeParse(r).success).toBe(false);});
 it('accepts embedded profile photos larger than ordinary text fields',()=>{const r=toResume(anmol);r.avatar='data:image/png;base64,'+'a'.repeat(3000);expect(resumeDocumentSchema.safeParse(r).success).toBe(true);});
});
