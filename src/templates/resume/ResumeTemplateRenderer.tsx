import React from 'react';
import { ActiveSectionContext } from './context';
import { useTemplateSetup, TemplateRenderContext } from './useTemplateSetup';
import type { ResumeTemplateProps } from './types';
import { NavyTemplate } from './variants/NavyTemplate';
import { ExecutiveTemplate } from './variants/ExecutiveTemplate';
import { SerifTemplate } from './variants/SerifTemplate';
import { SidebarTemplate } from './variants/SidebarTemplate';
import { TechTemplate } from './variants/TechTemplate';
import { AtsTemplate } from './variants/AtsTemplate';
import { DesignerTemplate } from './variants/DesignerTemplate';

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
        {renderVariant()}
      </TemplateRenderContext.Provider>
    </ActiveSectionContext.Provider>
  );
};

export type { ResumeTemplateProps } from './types';
