import React from 'react';
import type { CoverLetterTemplateProps } from './coverletter/shared';
import NavyCLTemplate      from './coverletter/variants/NavyCLTemplate';
import SerifCLTemplate     from './coverletter/variants/SerifCLTemplate';
import SidebarCLTemplate   from './coverletter/variants/SidebarCLTemplate';
import TechCLTemplate      from './coverletter/variants/TechCLTemplate';
import AtsCLTemplate       from './coverletter/variants/AtsCLTemplate';
import ExecutiveCLTemplate from './coverletter/variants/ExecutiveCLTemplate';
import ProfessionalCLTemplate from './coverletter/variants/ProfessionalCLTemplate';

export type { CoverLetterTemplateProps };

export const CoverLetterTemplateRenderer: React.FC<CoverLetterTemplateProps> = (props) => {
  const template = props.state.layoutSettings.template ?? 'navy';

  switch (template) {
    case 'navy':
      return <NavyCLTemplate {...props} />;
    case 'serif':
      return <SerifCLTemplate {...props} />;
    case 'sidebar':
      return <SidebarCLTemplate {...props} />;
    case 'tech':
      return <TechCLTemplate {...props} />;
    case 'ats':
      return <AtsCLTemplate {...props} />;
    case 'executive':
      return <ExecutiveCLTemplate {...props} />;
    case 'professional':
      return <ProfessionalCLTemplate {...props} />;
    default:
      return <NavyCLTemplate {...props} />;
  }
};
