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

const SerifCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
}) => {
  const { name, salutation, p1, p2, p3, p4, highlights, layoutSettings, companyName, jobTitle, avatar } = state;
  const { sectionSpacing, brandColor = '#1e293b', showPhoto = true } = layoutSettings;

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
    <div className="pdf-sheet text-justify" style={sheetStyle} id="resume-sheet">
      <TemplateHeader {...headerProps} />

      <main className="text-xs space-y-4 text-slate-800 leading-relaxed">
        <div
          className={`font-bold text-slate-950 mb-2 ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
        >
          {salutation}
        </div>

        {paragraphEl(ip(p1), 'p1')}
        {paragraphEl(ip(p2), 'p2')}

        {highlights && highlights.length > 0 && (
          <div className="py-2 text-[11px]" style={spacingStyle}>
            <h4 className="font-bold text-xs uppercase tracking-widest text-center border-b pb-1 mb-3 text-slate-800">
              Areas of Focus
            </h4>
            <ul className="space-y-2.5">
              {highlights.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  <strong
                    className={`text-slate-955 ${editableClass}`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                  >
                    {item.category}
                  </strong>
                  <span>: </span>
                  {hlText(item.text, idx, '')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {paragraphEl(ip(p3), 'p3')}
        {paragraphEl(ip(p4), 'p4')}

        <div className="pt-4 font-sans text-xs">
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

export default SerifCLTemplate;
