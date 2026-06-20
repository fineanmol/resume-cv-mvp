import type React from 'react';
import type { ResumeState } from '../../../../types';
import type { useTemplateSetup } from '../../useTemplateSetup';

export type DesignerFG = {
  section: React.CSSProperties;
  entry: React.CSSProperties;
  entryTitle: React.CSSProperties;
  company: React.CSSProperties;
  body: React.CSSProperties;
  meta: React.CSSProperties;
};

export type DesignerDragProps = ReturnType<typeof useTemplateSetup>['dragProps'];

export type DesignerLayoutSettings = ResumeState['layoutSettings'];
