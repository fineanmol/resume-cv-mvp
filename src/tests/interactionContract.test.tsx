import {useState} from 'react';
import {describe,it,expect} from 'vitest';
import {render,fireEvent,waitFor} from '@testing-library/react';
import {ResumeTemplateRenderer} from '../templates/resume/ResumeTemplateRenderer';
import {SkillsLayoutOptions} from '../components/design/SkillsLayoutOptions';
import {toResume} from '../studio/model';
import {anmol} from '../studio/anmol';
import {useResumeMutations} from '../hooks/useResumeMutations';
import type {ResumeState,TemplateId} from '../types';
import {TEMPLATE_CATALOG} from '../config/templates';
// New catalog entries join this matrix automatically; no hand-maintained allowlist.
const templates=TEMPLATE_CATALOG.filter(t=>!t.docTypes||t.docTypes.includes('resume')).map(t=>t.id);
function Harness({template}:{template:TemplateId}){
 const initial=toResume(anmol);initial.resumeSkills='Vue, React';initial.resumeSkillGroups=[{category:'Frontend',items:['Vue','React']}];initial.layoutSettings={...initial.layoutSettings,template,skillsStyle:'chips'};
 const [state,set]=useState<ResumeState>(initial);const mutations=useResumeMutations(set);
 return <><output data-testid="saved-skills">{state.resumeSkills}</output><div data-testid="sidebar-skills"><SkillsLayoutOptions value={state.layoutSettings.skillsStyle} onChange={skillsStyle=>set(s=>({...s,layoutSettings:{...s.layoutSettings,skillsStyle}}))}/></div><ResumeTemplateRenderer state={state} isEditable {...mutations}/></>;
}
describe('Shared template interaction contract',()=>{
 it.each(templates)('%s: plus, repeated placeholders, Enter and blur preserve every skill',async template=>{
  const {container,getByTestId}=render(<Harness template={template}/>);
  await waitFor(()=>expect(container.querySelectorAll('[data-skill-chip]')).toHaveLength(2));
  const add=()=>container.querySelector('button[title="Add skill"]')!;
  fireEvent.click(add());await waitFor(()=>expect(container.querySelectorAll('[data-skill-chip]')).toHaveLength(3));
  fireEvent.click(add());await waitFor(()=>expect(container.querySelectorAll('[data-skill-chip]')).toHaveLength(4));
  const skill=container.querySelector('[data-skill-index="0"]') as HTMLElement;skill.focus();skill.textContent='Vue 3';
  fireEvent.keyDown(skill,{key:'Enter'});
  await waitFor(()=>expect(container.querySelectorAll('[data-skill-chip]')).toHaveLength(5));
  expect(getByTestId('saved-skills').textContent).toBe('Vue 3, New Skill, React, New Skill, New Skill');
  const remove=container.querySelector('button[title="Remove skill"]')!;fireEvent.click(remove);
  await waitFor(()=>expect(container.querySelectorAll('[data-skill-chip]')).toHaveLength(4));
 });
 it.each(templates)('%s: sidebar and toolbar use the same layout state',async template=>{
  const {container,getByTestId}=render(<Harness template={template}/>);
  await waitFor(()=>expect(container.querySelector('[data-section-wrapper="skills"]')).toBeTruthy());
  fireEvent.click(container.querySelector('[data-section-wrapper="skills"] button[title="Section Settings"]')!);
  const grouped=Array.from(container.querySelectorAll('[data-section-wrapper="skills"] button')).find(b=>b.textContent==='Grouped')!;
  fireEvent.click(grouped);
  expect(getByTestId('sidebar-skills').querySelector('[aria-pressed="true"]')?.textContent).toContain('Grouped');
  const chips=Array.from(getByTestId('sidebar-skills').querySelectorAll('button')).find(b=>b.textContent?.startsWith('Chips'))!;fireEvent.click(chips);
  expect(container.querySelector('[data-section-wrapper="skills"] [aria-pressed="true"]')?.textContent).toBe('Chips');
 });
 it.each(templates)('%s: enabling bullets inherits the selected style',async template=>{
  const state=toResume(anmol);state.layoutSettings={...state.layoutSettings,template,bulletStyle:'square',showSummaryBullets:false,showProjectBullets:false,showAchievementBullets:false};
  const {container,rerender}=render(<ResumeTemplateRenderer state={state} isEditable/>);
  await waitFor(()=>expect(container.querySelector('.pdf-sheet')).toBeTruthy());
  rerender(<ResumeTemplateRenderer state={{...state,layoutSettings:{...state.layoutSettings,showSummaryBullets:true,showProjectBullets:true,showAchievementBullets:true}}} isEditable/>);
  for(const id of ['summary','certs','achievements'])expect(container.querySelector(`[data-section-wrapper="${id}"] ul[data-bullet-style="square"]`)).toBeTruthy();
  const lists=Array.from(container.querySelectorAll('ul[data-bullet-style]'));
  expect(lists.length).toBeGreaterThan(state.resumeExperience.length);
  expect(lists.every(el=>el.getAttribute('data-bullet-style')==='square')).toBe(true);
 });
 it.each(templates)('%s: extra fields render in every layout and update with state',async template=>{
  const state=toResume(anmol);state.layoutSettings.template=template;state.customContacts=[{id:'portfolio',icon:'link',label:'Portfolio',value:'https://example.com/work'},{id:'availability',icon:'custom',label:'Availability',value:'October'}];
  const {container,rerender}=render(<ResumeTemplateRenderer state={state}/>);
  await waitFor(()=>expect(container.querySelectorAll('[data-extra-contact]')).toHaveLength(2));
  expect(container.querySelector('[data-extra-contact="portfolio"] a')?.getAttribute('href')).toBe('https://example.com/work');
  expect(container.querySelector('[data-extra-contact="availability"]')?.textContent).toBe('Availability: October');
  rerender(<ResumeTemplateRenderer state={{...state,customContacts:[]}}/>);
  expect(container.querySelector('[data-extra-contact]')).toBeNull();
 });
});
