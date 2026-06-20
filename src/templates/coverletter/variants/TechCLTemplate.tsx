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

const TechCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
}) => {
  const { name, salutation, p1, p2, p3, p4, highlights, layoutSettings, companyName, jobTitle, avatar } = state;
  const { sectionSpacing, brandColor = '#10b981', showPhoto = true } = layoutSettings;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const showAvatar = showPhoto && !!avatar;
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const spacingStyle = makeSpacingStyle(sectionSpacing);
  const headerProps = makeHeaderProps(state, isEditable, editableClass, headingFontCss, showAvatar, brandColor, onFieldChange);
  const paragraphEl = makeParagraphEl(isEditable, editableClass, onFieldChange);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  return (
    <div className="pdf-sheet" style={sheetStyle} id="resume-sheet">
      <TemplateHeader {...headerProps} />

      <main className="text-xs space-y-4 text-slate-800 font-sans leading-relaxed">
        <div
          className={`font-mono text-xs font-semibold text-slate-900 ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
        >
          &gt; {salutation}
        </div>

        {paragraphEl(ip(p1), 'p1', 'text-justify font-sans')}
        {paragraphEl(ip(p2), 'p2', 'text-justify font-sans')}

        {highlights && highlights.length > 0 && (
          <div className="py-2" style={spacingStyle}>
            <div className="font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-3">
              // Strengths_Index
            </div>
            <ul className="space-y-2 text-xs">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-mono text-slate-400 select-none">-</span>
                  <div className="flex-1">
                    <strong
                      className={`text-slate-800 font-mono text-[11px] block ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                    >
                      {item.category}
                    </strong>
                    {hlText(item.text, idx, 'text-slate-600')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {paragraphEl(ip(p3), 'p3', 'text-justify font-sans')}
        {paragraphEl(ip(p4), 'p4', 'text-justify font-sans')}

        <div className="pt-4 font-mono text-xs">
          <p>Sincerely,</p>
          <p
            className={`font-bold mt-2 text-slate-900 ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
          >
            &gt; {name}
          </p>
        </div>
      </main>
    </div>
  );
};

export default TechCLTemplate;
