import React from 'react';
import { TemplateHeader } from '../../TemplateHeader';
import type { CoverLetterTemplateProps } from '../shared';
import {
  interpolate,
  makeEditableClass,
  makeSheetStyle,
  makeSpacingStyle,
  makeHeaderProps,
  makeParagraphEl,
  makeHlText,
  resolveFonts,
} from '../shared';

const NavyCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
  onLayoutSettingsChange,
}) => {
  const { name, salutation, p1, p2, p3, p4, highlights, layoutSettings, companyName, jobTitle, avatar } = state;
  const { sectionSpacing, brandColor = '#314855', showPhoto = true } = layoutSettings;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const showAvatar = showPhoto && !!avatar;
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const spacingStyle = makeSpacingStyle(sectionSpacing);
  const headerProps = makeHeaderProps(state, isEditable, editableClass, headingFontCss, showAvatar, brandColor, onFieldChange, onLayoutSettingsChange);
  const paragraphEl = makeParagraphEl(isEditable, editableClass, onFieldChange);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  return (
    <div className="pdf-sheet" style={sheetStyle} id="resume-sheet">
      <TemplateHeader {...headerProps} />

      <main className="text-xs text-slate-800 space-y-4">
        <div
          className={`font-bold text-slate-900 ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
        >
          {salutation}
        </div>

        {paragraphEl(ip(p1), 'p1', 'text-justify')}
        {paragraphEl(ip(p2), 'p2', 'text-justify')}

        {highlights && highlights.length > 0 && (
          <div style={spacingStyle} className="py-2">
            <h4
              className="font-bold text-[13px] uppercase tracking-wider mb-3 text-slate-800"
              style={{ color: brandColor }}
            >
              Core Competencies &amp; Strengths
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highlights.map((item, idx) => (
                <li key={idx} className="bg-slate-50 p-2.5 border border-slate-200 rounded text-slate-700">
                  <strong
                    className={`text-slate-800 block text-[11px] mb-0.5 ${editableClass}`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                  >
                    {item.category}
                  </strong>
                  {hlText(item.text, idx, 'text-[10px] leading-relaxed block')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {paragraphEl(ip(p3), 'p3', 'text-justify')}
        {paragraphEl(ip(p4), 'p4', 'text-justify')}

        <div className="pt-4">
          <p>Sincerely,</p>
          <p
            className={`font-bold mt-4 text-slate-900 ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
          >
            {name}
          </p>
        </div>
      </main>
    </div>
  );
};

export default NavyCLTemplate;
