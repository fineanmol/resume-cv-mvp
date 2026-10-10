import {useState} from 'react';
import {describe,it,expect} from 'vitest';
import {render,fireEvent,waitFor,within} from '@testing-library/react';
import {TEMPLATE_CATALOG} from '../config/templates';
import {ResumeTemplateRenderer,RESUME_TEMPLATE_RENDERERS} from '../templates/resume/ResumeTemplateRenderer';
import {SkillsSection} from '../components/forms/resume/SkillsSection';
import {ContactSection} from '../components/forms/resume/ContactSection';
import {useResumeMutations} from '../hooks/useResumeMutations';
import {anmol} from '../studio/anmol';
import {toResume,profileSchema} from '../studio/model';
import {ProfileResumePreview} from '../studio/ProfileResumePreview';
import type {ResumeState,TemplateId} from '../types';
const templates=TEMPLATE_CATALOG.filter(t=>!t.docTypes||t.docTypes.includes('resume')).map(t=>t.id);
function Harness({template}:{template:TemplateId}){
 const [state,set]=useState<ResumeState>(()=>{const s=toResume(anmol);s.layoutSettings={...s.layoutSettings,template,skillsStyle:'grouped'};s.resumeSkills='Vue, React';s.resumeSkillGroups=[{category:'Frontend',items:['Vue','React']}];return s;});
 const mutations=useResumeMutations(set);
 return <><output data-testid="state">{JSON.stringify(state)}</output><SkillsSection state={state} onChange={set} onCommit={()=>{}} openSection="skills" onToggle={()=>{}}/><ContactSection state={state} onChange={set} onCommit={()=>{}} openSection="personal" onToggle={()=>{}}/><ResumeTemplateRenderer state={state} isEditable {...mutations}/></>;
}
describe('Template parity: real form and canvas paths',()=>{
 it('every resume catalog entry registers its own renderer',()=>{
  expect(Object.keys(RESUME_TEMPLATE_RENDERERS).sort()).toEqual([...templates].sort());
 });
 it.each(templates)('%s: grouped sidebar additions and renames survive a renderer update',async template=>{
  const {container,getByLabelText}=render(<Harness template={template}/>);
  await waitFor(()=>expect(container.querySelector('[data-skills-grouped]')).toBeTruthy());
  fireEvent.change(getByLabelText('Skills in Frontend'),{target:{value:'Vue, React, Svelte'}});fireEvent.blur(getByLabelText('Skills in Frontend'));
  expect(container.querySelector('[data-skills-grouped]')?.textContent).toContain('Vue · React · Svelte');
  fireEvent.change(getByLabelText('Skill category 1'),{target:{value:'Web'}});
  expect(container.querySelector('[data-skills-grouped] strong')?.textContent).toBe('Web');
  fireEvent.change(getByLabelText('All skills'),{target:{value:'Vue, React, Svelte, Rust'}});
  expect(container.querySelector('[data-skills-grouped]')?.textContent).toContain('Additional skills');
  expect(container.querySelector('[data-skills-grouped]')?.textContent).toContain('Rust');
 });
 it.each(templates)('%s: LinkedIn is a compact branded link, retaining its destination',async template=>{
  const {container}=render(<Harness template={template}/>);
  await waitFor(()=>expect(container.querySelector('[data-linkedin-contact]')).toBeTruthy());
  const link=container.querySelector('[data-linkedin-contact]')!;
  expect(link.textContent).toBe('LinkedIn');expect(link.querySelector('svg')).toBeTruthy();expect(link.getAttribute('href')).toContain('linkedin.com/in/fineanmol');
 });
 it.each(templates)('%s: adding an extra field from the actual contact form updates the resume',async template=>{
  const {container,getByRole,getByPlaceholderText}=render(<Harness template={template}/>);
  await waitFor(()=>expect(container.querySelector('.pdf-sheet')).toBeTruthy());
  fireEvent.click(getByRole('button',{name:'Add field'}));
  fireEvent.change(getByPlaceholderText('Label'),{target:{value:'Portfolio'}});
  fireEvent.change(getByPlaceholderText('Value / URL'),{target:{value:'https://example.com/portfolio'}});
  expect(container.querySelector('[data-extra-contact] a')?.getAttribute('href')).toBe('https://example.com/portfolio');
 });
 it.each(templates)('%s: project and achievement icons are editable',async template=>{
  const {container,getByTestId}=render(<Harness template={template}/>);
  await waitFor(()=>expect(container.querySelector('.pdf-sheet')).toBeTruthy());
  for(const section of ['certs','achievements']){
   const scope=within(container.querySelector(`[data-section-wrapper="${section}"]`)! as HTMLElement);
   fireEvent.click(scope.getAllByRole('button',{name:'Change icon'})[0]);
   fireEvent.click(scope.getByTitle(section==='certs'?'code':'trophy'));
   const s=JSON.parse(getByTestId('state').textContent!);
   expect(s[section==='certs'?'resumeCerts':'resumeAchievements'][0].icon).toBe(section==='certs'?'code':'trophy');
  }
 });
 it('Hybrid: shared icon picker, entry duplication/deletion and header controls mutate state',async()=>{
  const {container,getByTestId}=render(<Harness template="hybrid"/>);
  const saved=()=>JSON.parse(getByTestId('state').textContent!);
  await waitFor(()=>expect(container.querySelector('[data-entry-section="achievements"]')).toBeTruthy());
  let entry=container.querySelector('[data-entry-section="achievements"]')!;
  fireEvent.click(within(entry as HTMLElement).getByRole('button',{name:'Change icon'}));
  fireEvent.click(within(entry as HTMLElement).getByTitle('trophy'));
  expect(saved().resumeAchievements[0].icon).toBe('trophy');
  fireEvent.mouseDown(entry.firstElementChild!);
  fireEvent.click(within(entry as HTMLElement).getByTitle('Duplicate'));
  expect(saved().resumeAchievements.length).toBe(anmol.achievements.length+1);
  entry=container.querySelector('[data-entry-section="achievements"]')!;
  fireEvent.click(within(entry as HTMLElement).getByTitle('Delete'));
  expect(saved().resumeAchievements.length).toBe(anmol.achievements.length);
  fireEvent.click(container.querySelector('button[title="Header Settings"]')!);
  fireEvent.click(within(container.querySelector('header')!).getByLabelText('Square photo'));
  expect(saved().layoutSettings.photoShape).toBe('square');
 });
 it('master profile parsing and shared profile preview preserve extra fields and custom icons',async()=>{
  const profile=profileSchema.parse({...anmol,customContacts:[{id:'work',icon:'github',label:'Work',value:'https://example.com/work'}],projects:[{title:'Project',desc:'Evidence',icon:'code',url:'https://example.com'}]});
  const {container}=render(<ProfileResumePreview profile={profile}/>);
  await waitFor(()=>expect(container.querySelector('[data-extra-contact="work"] a')).toBeTruthy());
  expect(toResume(profile).resumeCerts[0].icon).toBe('code');
  expect(container.querySelector('[data-extra-contact="work"]')?.closest('header')).toBeTruthy();
 });
});
