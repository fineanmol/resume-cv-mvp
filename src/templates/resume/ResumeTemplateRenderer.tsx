import React, { lazy, Suspense } from 'react';
import { ActiveSectionContext } from './context';
import { useTemplateSetup, TemplateRenderContext } from './useTemplateSetup';
import type { ResumeTemplateProps } from './types';

const NavyTemplate = lazy(() => import('./variants/NavyTemplate').then(m => ({ default: m.NavyTemplate })));
const ExecutiveTemplate = lazy(() => import('./variants/ExecutiveTemplate').then(m => ({ default: m.ExecutiveTemplate })));
const SerifTemplate = lazy(() => import('./variants/SerifTemplate').then(m => ({ default: m.SerifTemplate })));
const SidebarTemplate = lazy(() => import('./variants/SidebarTemplate').then(m => ({ default: m.SidebarTemplate })));
const TechTemplate = lazy(() => import('./variants/TechTemplate').then(m => ({ default: m.TechTemplate })));
const AtsTemplate = lazy(() => import('./variants/AtsTemplate').then(m => ({ default: m.AtsTemplate })));
const DesignerTemplate = lazy(() => import('./variants/DesignerTemplate').then(m => ({ default: m.DesignerTemplate })));

const variantFallback = (
  <div className="w-full min-h-[200px] bg-slate-50 animate-pulse rounded-sm" aria-hidden />
);

export const ResumeTemplateRenderer: React.FC<ResumeTemplateProps> = (props) => {
  const ctx = useTemplateSetup(props);

  const renderVariant = () => {
    switch (ctx.template) {
      case 'navy':
        return <NavyTemplate />;
      case 'executive':
        return <ExecutiveTemplate />;
      case 'serif':
        return <SerifTemplate />;
      case 'sidebar':
        return <SidebarTemplate />;
      case 'tech':
        return <TechTemplate />;
      case 'ats':
        return <AtsTemplate />;
      case 'designer':
        return <DesignerTemplate />;
      default:
        return <NavyTemplate />;
    }
  };

  return (
    <ActiveSectionContext.Provider value={ctx.sectionContextValue}>
      <TemplateRenderContext.Provider value={ctx}>
        <Suspense fallback={variantFallback}>
          {renderVariant()}
        </Suspense>
      </TemplateRenderContext.Provider>
    </ActiveSectionContext.Provider>
  );
};

export type { ResumeTemplateProps } from './types';
