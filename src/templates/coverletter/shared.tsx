import React from 'react';
import type { CoverLetterState, HighlightItem, LayoutSettings, HeaderStyle, FontFamily } from '../../types';
import { FONT_CSS } from '../../config/fonts';
import type { TemplateHeaderProps } from '../header/types';
import { formatMarkdownInline } from '../../utils/markdown';
import { EditableText } from '../shared/EditableText';

export interface CoverLetterTemplateProps {
  state: CoverLetterState;
  isEditable?: boolean;
  onFieldChange?: <K extends keyof CoverLetterState>(field: K, value: CoverLetterState[K]) => void;
  onHighlightChange?: (index: number, field: keyof HighlightItem, value: string) => void;
  /** Preferred over onFieldChange for layoutSettings patches — uses functional update to avoid stale closures. */
  onLayoutSettingsChange?: (patch: Partial<LayoutSettings>) => void;
}

/** Replace {{company}} and {{role}} tokens in body text. */
export function interpolate(text: string, companyName: string, jobTitle: string): string {
  return text
    .replace(/{{company}}/g, companyName || '[Company]')
    .replace(/{{role}}/g, jobTitle || '[Role]');
}

/** CSS class applied to editable elements. */
export function makeEditableClass(isEditable: boolean): string {
  return isEditable
    ? 'outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition'
    : '';
}

/** Resolve body and heading font CSS strings from layout settings. */
export function resolveFonts(ls: LayoutSettings): { bodyFontCss: string; headingFontCss: string } {
  const bodyFontCss = FONT_CSS[(ls.fontFamily ?? 'inter') as FontFamily] ?? FONT_CSS.inter;
  const headingFontCss = ls.headingFont ? (FONT_CSS[ls.headingFont as FontFamily] ?? bodyFontCss) : bodyFontCss;
  return { bodyFontCss, headingFontCss };
}

/** Base sheet style derived from layout settings. */
export function makeSheetStyle(ls: LayoutSettings): React.CSSProperties {
  const { bodyFontCss } = resolveFonts(ls);
  return {
    fontSize: `${ls.fontSize}pt`,
    padding: `${ls.paddingTopBottom}mm ${ls.paddingLeftRight}mm`,
    lineHeight: ls.lineHeight,
    color: '#334155',
    fontFamily: bodyFontCss,
    ['--sheet-fs' as string]: String(ls.fontSize),
  };
}

/** Section spacing style. */
export function makeSpacingStyle(sectionSpacing: number): React.CSSProperties {
  return { marginBottom: `${sectionSpacing}px` };
}

/** Build the TemplateHeader props bundle from CoverLetterState. */
export function makeHeaderProps(
  state: CoverLetterState,
  isEditable: boolean,
  editableClass: string,
  headingFontCss: string,
  showAvatar: boolean,
  brandColor: string,
  onFieldChange: CoverLetterTemplateProps['onFieldChange'],
  onLayoutSettingsChange?: CoverLetterTemplateProps['onLayoutSettingsChange'],
): TemplateHeaderProps {
  const { name, subtitle, phone, email, location, linkedin, avatar, layoutSettings } = state;
  return {
    name: { value: name, onSave: (v: string) => onFieldChange?.('name', v) },
    subtitle: { value: subtitle, onSave: (v: string) => onFieldChange?.('subtitle', v) },
    phone: { value: phone, onSave: (v: string) => onFieldChange?.('phone', v) },
    email: { value: email, onSave: (v: string) => onFieldChange?.('email', v) },
    location: { value: location, onSave: (v: string) => onFieldChange?.('location', v) },
    linkedin: { value: linkedin, onSave: (v: string) => onFieldChange?.('linkedin', v) },
    avatar,
    showAvatar,
    brandColor,
    headingFontCss,
    headerStyle: (layoutSettings.headerStyle ?? 'centered') as HeaderStyle,
    isEditable,
    ec: editableClass,
    sectionSpacing: layoutSettings.sectionSpacing,
    layoutSettings,
    // Prefer the dedicated functional-update handler; fall back to onFieldChange with closure spread.
    onLayoutSettingsChange: onLayoutSettingsChange
      ? onLayoutSettingsChange
      : (patch: Partial<LayoutSettings>) =>
          onFieldChange?.('layoutSettings', { ...layoutSettings, ...patch } as CoverLetterState['layoutSettings']),
    onAvatarChange: (url: string) => onFieldChange?.('avatar', url),
  };
}

/**
 * Factory for the paragraphEl helper.
 * Returns a function that renders a paragraph with EditableText.
 */
export function makeParagraphEl(
  isEditable: boolean,
  editableClass: string,
  onFieldChange: CoverLetterTemplateProps['onFieldChange'],
) {
  return function paragraphEl(
    text: string,
    field: 'p1' | 'p2' | 'p3' | 'p4',
    className?: string,
  ): JSX.Element {
    return (
      <EditableText
        tag="p"
        value={text}
        className={className}
        isEditable={isEditable}
        editableClass={editableClass}
        onSave={(val) => onFieldChange?.(field, val)}
      />
    );
  };
}

/**
 * Factory for the hlText helper.
 * Returns a function that renders highlight text with bold-aware formatting.
 */
export function makeHlText(
  isEditable: boolean,
  editableClass: string,
  onHighlightChange: CoverLetterTemplateProps['onHighlightChange'],
) {
  return function hlText(text: string, idx: number, className: string): JSX.Element {
    if (isEditable) {
      return (
        <span
          className={`${className} ${editableClass}`}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
        >
          {text}
        </span>
      );
    }
    return (
      <span className={className} dangerouslySetInnerHTML={{ __html: formatMarkdownInline(text) }} />
    );
  };
}
