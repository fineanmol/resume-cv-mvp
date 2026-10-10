import { describe,it,expect } from 'vitest';
import { anmol } from '../studio/anmol';
import { importProfile,profileSchema,matchProfile,tailorProfile } from '../studio/model';
describe('Profile generation',()=>{
 it('validates independent profiles without restoring Sakshi skills',()=>{const p=profileSchema.parse(anmol);expect(p.skills.flatMap(g=>g.items)).not.toContain('KYC');expect(importProfile(p)).toEqual(p);});
 it('ranks relevant bullets without changing facts or master',()=>{const before=JSON.stringify(anmol);const p=tailorProfile(anmol,'TypeScript developer with Storybook experience');expect(p.experience[0].bullets.split('\n')[0]).toContain('TypeScript');expect(p.experience.map(e=>e.dates)).toEqual(anmol.experience.map(e=>e.dates));for(let i=0;i<p.experience.length;i++)expect(p.experience[i].bullets.split('\n').sort()).toEqual(anmol.experience[i].bullets.split('\n').sort());expect(JSON.stringify(anmol)).toBe(before);});
 it('does not confuse Java and JavaScript or add missing skills',()=>{const p={...anmol,summary:'',skills:[{category:'Skills',items:['JavaScript']}],experience:[{title:'Developer',company:'Acme',dates:'2025',location:'',bullets:'Built JavaScript UI'}],projects:[]};expect(matchProfile(p,'Java developer').missing).toContain('java');expect(matchProfile(p,'Need JavaScript').matched).toContain('javascript');expect(tailorProfile(p,'Need Cypress').skills).toEqual(p.skills);});
 it('does not claim 100 percent when nothing is recognized',()=>{expect(matchProfile(anmol,'Require underwater basket weaving').score).toBeNull();});
 it('rejects path traversal and remote photo fetches',()=>{expect(profileSchema.safeParse({...anmol,id:'../../other'}).success).toBe(false);expect(profileSchema.safeParse({...anmol,avatar:'http://127.0.0.1/private'}).success).toBe(false);});
});
