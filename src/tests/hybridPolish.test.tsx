import {describe,it,expect,vi} from 'vitest';
import {fireEvent} from '@testing-library/react';
import {renderResumeTemplate} from './helpers/renderResumeTemplate';
import {toResume} from '../studio/model';
import {anmol} from '../studio/anmol';
import {HYBRID_STYLE_DEFAULTS} from '../config/hybridDefaults';
describe('Hybrid reference parity',()=>{
 it('uses middle dots and an on-canvas skills selector',async()=>{
  const state=toResume(anmol);state.layoutSettings={...state.layoutSettings,...HYBRID_STYLE_DEFAULTS};
  const change=vi.fn();const {container,getByText}=await renderResumeTemplate({state,isEditable:true,onLayoutSettingsChange:change});
  expect(container.querySelector('[data-skills-grouped] p')?.textContent).toContain('TypeScript · JavaScript');
  expect(container.querySelectorAll('[data-section-wrapper]')).toHaveLength(7);
  fireEvent.click(container.querySelector('[data-section-wrapper="skills"] button[title="Section Settings"]')!);
  fireEvent.click(getByText('Chips'));
  expect(change).toHaveBeenCalledWith(expect.objectContaining({skillsStyle:'chips'}));
  fireEvent.click(getByText('Grouped'));
  expect(change).toHaveBeenCalledWith(expect.objectContaining({skillsStyle:'grouped'}));
  expect(container.querySelector('select')).toBeNull();
 });
 it('renders entry icons and clickable work links without export controls',async()=>{
  const state=toResume(anmol);state.layoutSettings={...state.layoutSettings,...HYBRID_STYLE_DEFAULTS};state.resumeExperience[0].url='https://example.com/evidence';
  const {container}=await renderResumeTemplate({state,isEditable:false});
  expect(container.querySelector('[data-section="experience"] a')?.getAttribute('href')).toBe('https://example.com/evidence');
  expect(container.querySelectorAll('[data-section="achievements"] .hybrid-entry-icon')).toHaveLength(state.resumeAchievements.length);
  expect(container.querySelectorAll('[data-section="certs"] .hybrid-entry-icon')).toHaveLength(state.resumeCerts.length);
  expect(container.querySelector('details,select,input')).toBeNull();
 });
});
