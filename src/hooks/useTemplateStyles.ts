import { useCallback } from 'react';
import type React from 'react';
import type { LayoutSettings } from '../types';
import { FONT_CSS } from '../config/fonts';

interface UseTemplateStylesParams {
  layoutSettings: LayoutSettings;
  isEditable: boolean;
}

export interface TemplateStylesResult {
  bodyFontCss: string;
  headingFontCss: string;
  titleFontCss: string;
  accentFontCss: string;
  sheetStyle: React.CSSProperties;
  sec: React.CSSProperties;
  ec: string;
  badgeStyle: () => React.CSSProperties;
}

export function useTemplateStyles({
  layoutSettings,
  isEditable,
}: UseTemplateStylesParams): TemplateStylesResult {
  const {
    fontSize,
    paddingTopBottom,
    paddingLeftRight,
    sectionSpacing,
    lineHeight,
    fontFamily = 'inter',
    headingFont,
    titleFont,
    accentFont,
  } = layoutSettings;

  const bodyFontCss    = FONT_CSS[fontFamily]    ?? FONT_CSS.inter;
  const headingFontCss = headingFont ? FONT_CSS[headingFont] : bodyFontCss;
  const titleFontCss   = titleFont   ? FONT_CSS[titleFont]   : headingFontCss;
  const accentFontCss  = accentFont  ? FONT_CSS[accentFont]  : bodyFontCss;

  const sheetStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    padding: `${paddingTopBottom}mm ${paddingLeftRight}mm`,
    lineHeight,
    color: '#334155',
    fontFamily: bodyFontCss,
    ['--sheet-fs' as string]: String(fontSize),
  };

  const sec: React.CSSProperties = { marginBottom: `${sectionSpacing}px` };

  const ec = isEditable
    ? 'outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition'
    : '';

  const badgeStyle = useCallback((): React.CSSProperties => ({
    background: '#ffffff',
    color: '#475569',
    borderColor: '#e2e8f0',
  }), []);

  return {
    bodyFontCss,
    headingFontCss,
    titleFontCss,
    accentFontCss,
    sheetStyle,
    sec,
    ec,
    badgeStyle,
  };
}
