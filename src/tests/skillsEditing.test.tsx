import {describe,it,expect,vi} from 'vitest';
import {fireEvent,render,screen,renderHook,act} from '@testing-library/react';
import {renderResumeTemplate} from './helpers/renderResumeTemplate';
import {toResume} from '../studio/model';
import {anmol} from '../studio/anmol';
import {HYBRID_STYLE_DEFAULTS} from '../config/hybridDefaults';
import {SkillsEditor} from '../templates/shared/SkillsEditor';
import {SkillGroupsContext,reconcileGroups} from '../templates/shared/SkillGroupsContext';
import {useResumeMutations} from '../hooks/useResumeMutations';
import {useUndoRedo} from '../hooks/useUndoRedo';

describe('Editable Hybrid and reusable skills',()=>{
 it('saves Hybrid name, role and experience text through existing callbacks',async()=>{
   const state=toResume(anmol), onFieldChange=vi.fn(), onExperienceChange=vi.fn();
   state.layoutSettings={...state.layoutSettings,...HYBRID_STYLE_DEFAULTS};
   const {container}=await renderResumeTemplate({state,isEditable:true,onFieldChange,onExperienceChange});
   const name=container.querySelector('h1 [contenteditable]')!;
   fireEvent.focus(name);name.innerHTML='Updated Name';fireEvent.blur(name);
   expect(onFieldChange).toHaveBeenCalledWith('name','Updated Name');
   const role=container.querySelector('[data-section="experience"] h4 [contenteditable]')!;
   fireEvent.focus(role);role.innerHTML='Principal Engineer';fireEvent.blur(role);
   expect(onExperienceChange).toHaveBeenCalledWith(0,'title','Principal Engineer');
   expect(container.querySelector('[data-section="experience"] li [contenteditable], [data-section="experience"] li[contenteditable]')).toBeTruthy();
 });
 it.each(['navy','executive','serif','sidebar','tech','ats','designer','hybrid'] as const)('supports grouped skills in %s without export controls',async template=>{
   const state=toResume(anmol);state.layoutSettings={...state.layoutSettings,template,skillsStyle:'grouped'};
   const {container}=await renderResumeTemplate({state,isEditable:false});
   expect(container.querySelector('[data-skills-grouped]')?.textContent).toContain(anmol.skills[0].category);
   expect(container.querySelector('[contenteditable=true]')).toBeNull();
   expect(screen.queryByText('+ Add category')).toBeNull();
 });
 it('lets a non-engineering profile create and rename categories',()=>{
   const save=vi.fn();render(<SkillGroupsContext.Provider value={{groups:[{category:'Research',items:['Interviewing']}],save}}><SkillsEditor value="Interviewing" skillsStyle="grouped" isEditable ec="" onSave={vi.fn()} badgeStyle={()=>({})}/></SkillGroupsContext.Provider>);
   const category=screen.getByText('Research');fireEvent.focus(category);category.innerHTML='Customer research';fireEvent.blur(category);
   expect(save).toHaveBeenCalledWith([{category:'Customer research',items:['Interviewing']}]);
   fireEvent.click(screen.getByText('+ Add category'));
   expect(save).toHaveBeenLastCalledWith([{category:'Research',items:['Interviewing']},{category:'New category',items:[]}]);
 });
 it('keeps empty categories editable without reviving removed skills',()=>{
   expect(reconcileGroups('Interviewing',[{category:'Research',items:['Interviewing','Surveys']},{category:'Tools',items:[]}])).toEqual([{category:'Research',items:['Interviewing']},{category:'Tools',items:[]}]);
 });
 it('saves categories and flat skills in a single undoable mutation',()=>{
   const {result}=renderHook(()=>{const history=useUndoRedo(toResume(anmol));return {...history,mutations:useResumeMutations(history.set)};});
   act(()=>result.current.mutations.onFieldChange('resumeSkillGroups',[{category:'Research',items:['Interviewing']} ]));
   expect(result.current.state.resumeSkills).toBe('Interviewing');
   act(()=>result.current.undo());
   expect(result.current.state.resumeSkills).toBe(toResume(anmol).resumeSkills);
 });
 it('uses real columns for long grid skills',()=>{
   const {container}=render(<SkillsEditor value="Customer relationship management, Stakeholder communication" skillsStyle="grid" isEditable={false} ec="" onSave={()=>{}} badgeStyle={()=>({})}/>);
   expect((container.querySelector('[data-skills-grid]') as HTMLElement).style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))');
   expect((container.querySelector('[data-skill-grid-item]') as HTMLElement).style.whiteSpace).toBe('normal');
 });
});
