import React, { lazy, Suspense } from 'react';
import { ActiveSectionContext } from './context';
import { useTemplateSetup, TemplateRenderContext } from './useTemplateSetup';
import type { ResumeTemplateProps } from './types';
import { SkillGroupsContext } from '../shared/SkillGroupsContext';
import { BulletStyleContext } from '../shared/BulletStyleContext';

const NavyTemplate = lazy(() => import('./variants/NavyTemplate').then(m => ({ default: m.NavyTemplate })));
const ExecutiveTemplate = lazy(() => import('./variants/ExecutiveTemplate').then(m => ({ default: m.ExecutiveTemplate })));
const SerifTemplate = lazy(() => import('./variants/SerifTemplate').then(m => ({ default: m.SerifTemplate })));
const SidebarTemplate = lazy(() => import('./variants/SidebarTemplate').then(m => ({ default: m.SidebarTemplate })));
const TechTemplate = lazy(() => import('./variants/TechTemplate').then(m => ({ default: m.TechTemplate })));
const AtsTemplate = lazy(() => import('./variants/AtsTemplate').then(m => ({ default: m.AtsTemplate })));
const DesignerTemplate = lazy(() => import('./variants/DesignerTemplate').then(m => ({ default: m.DesignerTemplate })));
const HybridTemplate = lazy(() => import('./variants/HybridTemplate').then(m => ({ default: m.HybridTemplate })));
// Catalog additions must register a renderer; never silently pass QA as Navy.
export const RESUME_TEMPLATE_RENDERERS={navy:NavyTemplate,executive:ExecutiveTemplate,serif:SerifTemplate,sidebar:SidebarTemplate,tech:TechTemplate,ats:AtsTemplate,designer:DesignerTemplate,hybrid:HybridTemplate};

const variantFallback = (
  <div className="w-full min-h-[200px] bg-slate-50 animate-pulse rounded-sm" aria-hidden />
);

export const ResumeTemplateRenderer: React.FC<ResumeTemplateProps> = (props) => {
  const ctx = useTemplateSetup(props);

  const renderVariant = () => {
    const Template=RESUME_TEMPLATE_RENDERERS[ctx.template as keyof typeof RESUME_TEMPLATE_RENDERERS];
    if(!Template)throw new Error(`Unregistered resume template: ${ctx.template}`);
    return <Template state={props.state}/>;
  };

  return (
    <ActiveSectionContext.Provider value={ctx.sectionContextValue}>
      <TemplateRenderContext.Provider value={ctx}>
        <BulletStyleContext.Provider value={props.state.layoutSettings.bulletStyle||'disc'}>
        <SkillGroupsContext.Provider value={{groups: props.state.resumeSkillGroups || [], save: groups => props.onFieldChange?.('resumeSkillGroups', groups)}}>
        <Suspense fallback={variantFallback}>
          {renderVariant()}
        </Suspense>
        </SkillGroupsContext.Provider>
        </BulletStyleContext.Provider>
      </TemplateRenderContext.Provider>
    </ActiveSectionContext.Provider>
  );
};

export type { ResumeTemplateProps } from './types';
