import { describe,it,expect,vi,beforeEach } from 'vitest';
vi.mock('../services/firebase',()=>({db:null}));
import { dbService } from '../services/db';
import { toResume } from '../studio/model';
import { anmol } from '../studio/anmol';
describe('profile draft isolation',()=>{
 beforeEach(()=>localStorage.clear());
 it('separates equal document IDs in different profiles',async()=>{const r=toResume(anmol);await dbService.saveResume('local-profile:anmol','same-id',r);await dbService.saveResume('local-profile:another','same-id',{...r,name:'Other candidate'});expect((await dbService.getResume('local-profile:anmol','same-id'))?.name).toBe('Anmol Agarwal');expect((await dbService.getResume('local-profile:another','same-id'))?.name).toBe('Other candidate');});
 it('does not read legacy documents into a profile',async()=>{localStorage.setItem('LOCAL_RESUME_old',JSON.stringify(toResume(anmol)));expect(await dbService.getResume('local-profile:another','old')).toBeNull();expect((await dbService.getResume('legacy-user','old'))?.name).toBe('Anmol Agarwal');});
});
