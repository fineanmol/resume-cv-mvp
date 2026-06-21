import React from 'react';
import { EditableText } from '../../shared/EditableText';
import { TemplateHeader } from '../../TemplateHeader';
import type { CoverLetterTemplateProps } from '../shared';
import {
  interpolate,
  makeEditableClass,
  makeSheetStyle,
  makeHeaderProps,
  makeParagraphEl,
  makeHlText,
  resolveFonts,
} from '../shared';

const ExecutiveCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
  onLayoutSettingsChange,
}) => {
  const {
    name, subtitle, companyName, jobTitle, salutation,
    p1, p2, p3, p4, highlights, layoutSettings, avatar,
  } = state;
  const { brandColor = '#b45309', showPhoto = true } = layoutSettings;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const showAvatar = showPhoto && !!avatar;
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const headerProps = makeHeaderProps(state, isEditable, editableClass, headingFontCss, showAvatar, brandColor, onFieldChange, onLayoutSettingsChange);
  const paragraphEl = makeParagraphEl(isEditable, editableClass, onFieldChange);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  return (
    <div className="pdf-sheet" style={{ ...sheetStyle, color: '#1e293b' }} id="cover-letter-sheet">
      {/* Branded header */}
      <TemplateHeader {...headerProps} />

      {/* Addressee */}
      <div className="mb-4 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">{companyName || 'Company Name'}</p>
        <p className="italic">
          {jobTitle ? `Re: Application for ${jobTitle}` : 'Re: Open Application'}
        </p>
      </div>

      <EditableText
        tag="p"
        value={salutation || 'Dear Hiring Manager,'}
        isEditable={isEditable}
        editableClass={editableClass}
        className="text-sm font-semibold text-slate-800 mb-4"
        onSave={(v) => onFieldChange?.('salutation', v)}
      />

      {paragraphEl(ip(p1), 'p1', 'text-xs text-justify mb-3 leading-relaxed')}
      {paragraphEl(ip(p2), 'p2', 'text-xs text-justify mb-4 leading-relaxed')}

      {highlights && highlights.length > 0 && (
        <div className="my-4 border border-slate-200 rounded-lg overflow-hidden">
          <div
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
            style={{ background: brandColor }}
          >
            Why I Am the Right Fit
          </div>
          <div className="divide-y divide-slate-100">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex gap-3 px-4 py-2 text-xs">
                <span
                  className={`font-bold text-slate-800 w-36 flex-shrink-0 ${editableClass}`}
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                >
                  {item.category}
                </span>
                {hlText(item.text, idx, 'text-slate-600 flex-1')}
              </div>
            ))}
          </div>
        </div>
      )}

      {paragraphEl(ip(p3), 'p3', 'text-xs text-justify mb-3 leading-relaxed')}
      {paragraphEl(ip(p4), 'p4', 'text-xs text-justify mb-4 leading-relaxed')}

      <div className="mt-5 text-xs text-slate-800">
        <p>Yours sincerely,</p>
        <EditableText
          tag="p"
          value={name}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-bold mt-2 text-slate-900 text-sm"
          onSave={(v) => onFieldChange?.('name', v)}
        />
        <EditableText
          tag="p"
          value={subtitle}
          isEditable={isEditable}
          editableClass={editableClass}
          className="text-slate-500 text-[11px]"
          onSave={(v) => onFieldChange?.('subtitle', v)}
        />
      </div>
    </div>
  );
};

export default ExecutiveCLTemplate;
