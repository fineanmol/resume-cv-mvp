import {describe,it,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import {reconcileSkillGroups} from '../templates/resume/variants/HybridTemplate';
import {HybridResume} from '../studio/HybridResume';
import {anmol} from '../studio/anmol';
import {toResume} from '../studio/model';
import {HYBRID_STYLE_DEFAULTS} from '../config/hybridDefaults';
describe('Hybrid is a distinct template',()=>{
 it('preserves master skill groups and template identity',()=>{const r=toResume(anmol);expect(r.layoutSettings.template).toBe('hybrid');expect(r.resumeSkillGroups).toEqual(anmol.skills);});
 it('does not restore a skill deleted in the editor',()=>expect(reconcileSkillGroups('Vue, New skill',[{category:'Frontend',items:['Vue','React']}])).toEqual([{category:'Frontend',items:['Vue']},{category:'Additional skills',items:['New skill']}]));
 it('renders categorized skills and binds design tokens',()=>{const state=toResume(anmol);render(<HybridResume profile={anmol} layout={{...state.layoutSettings,...HYBRID_STYLE_DEFAULTS,brandColor:'#123456',bodyTextColor:'#654321'}}/>);expect(screen.getByText(anmol.skills[0].category)).toBeTruthy();const sheet=document.querySelector('.hybrid-sheet') as HTMLElement;expect(sheet.style.getPropertyValue('--hybrid-heading')).toBe('#123456');expect(sheet.style.getPropertyValue('--hybrid-body')).toBe('#654321');});
});
