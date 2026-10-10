import React from 'react';
import { FileText } from 'lucide-react';
import type { ResumeState } from '../../../types';
import type { UndoRedoSetter } from '../../../hooks/useUndoRedo';
import { AccordionSection } from '../../ui/AccordionSection';
import { reconcileGroups, type SkillGroup } from '../../../templates/shared/SkillGroupsContext';

interface SkillsSectionProps {
  state: ResumeState;
  onChange: UndoRedoSetter<ResumeState>;
  onCommit: () => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  state,
  onChange,
  onCommit,
  openSection,
  onToggle,
}) => {
 const groups=reconcileGroups(state.resumeSkills,state.resumeSkillGroups);
 const saveGroups=(next:SkillGroup[])=>onChange(p=>({...p,resumeSkillGroups:next,resumeSkills:next.flatMap(g=>g.items).join(', ')}));
 return (
  <AccordionSection
    id="skills"
    icon={FileText}
    label="Skills"
    openSection={openSection}
    onToggle={onToggle}
  >
    {state.layoutSettings.skillsStyle==='grouped'&&<div className="space-y-3 mb-3" data-sidebar-skill-groups>
      <p className="text-xs text-text-muted">Edit each category below. New skills in the flat list appear under Additional skills.</p>
      {groups.map((g,i)=><div key={i} className="space-y-1">
        <input aria-label={`Skill category ${i+1}`} className="w-full border rounded p-2 text-xs" value={g.category} onChange={e=>saveGroups(groups.map((x,j)=>j===i?{...x,category:e.target.value}:x))}/>
        <textarea aria-label={`Skills in ${g.category}`} key={g.items.join(', ')} className="w-full border rounded p-2 text-xs" defaultValue={g.items.join(', ')} onBlur={e=>saveGroups(groups.map((x,j)=>j===i?{...x,items:e.target.value.split(/[,·\n]/).map(s=>s.trim()).filter(Boolean)}:x))}/>
        <button type="button" className="text-xs text-red-600" onClick={()=>saveGroups(groups.filter((_,j)=>j!==i))}>Remove {g.category}</button>
      </div>)}
      <button type="button" className="text-xs text-teal-700" onClick={()=>saveGroups([...groups,{category:'New category',items:[]}])}>Add skill category</button>
    </div>}
    <p className="text-[10px] text-text-muted mb-2">
      Comma-separated list of skills. ATS keyword frequency is calculated from this field.
    </p>
    <textarea
      rows={3}
      className="w-full bg-input-bg border border-border-color rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:border-brand-accent resize-y"
      placeholder="React, TypeScript, Node.js, AWS, Python, Docker..."
      aria-label="All skills"
      value={state.resumeSkills}
      onChange={(e) => onChange((p) => ({ ...p, resumeSkills: e.target.value }), true)}
      onBlur={onCommit}
    />
  </AccordionSection>
);};
