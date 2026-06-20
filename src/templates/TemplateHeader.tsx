import React from 'react';
import { CenteredHeader } from './header/CenteredHeader';
import { LeftHeader } from './header/LeftHeader';
import { BannerHeader } from './header/BannerHeader';
import { MinimalHeader } from './header/MinimalHeader';
import { EnhancvHeader } from './header/EnhancvHeader';

// Re-exports for backwards compatibility
export { AvatarCircleEditable } from './shared/AvatarCircleEditable';
export type { EditField, TemplateHeaderProps } from './header/types';

import type { TemplateHeaderProps } from './header/types';

const HEADER_RENDERERS: Record<string, React.FC<TemplateHeaderProps>> = {
  centered: CenteredHeader,
  left: LeftHeader,
  banner: BannerHeader,
  minimal: MinimalHeader,
  enhancv: EnhancvHeader,
};

export const TemplateHeader: React.FC<TemplateHeaderProps> = (props) => {
  const HeaderRenderer = HEADER_RENDERERS[props.headerStyle ?? 'centered'] ?? CenteredHeader;
  return <HeaderRenderer {...props} />;
};
