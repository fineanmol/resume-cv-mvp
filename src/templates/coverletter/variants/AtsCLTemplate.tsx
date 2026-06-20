import React from 'react';
import { EditableText } from '../../shared/EditableText';
import type { CoverLetterTemplateProps } from '../shared';
import {
  interpolate,
  makeEditableClass,
  makeSheetStyle,
  makeHlText,
  resolveFonts,
} from '../shared';

const AtsCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
}) => {
  const {
    name, subtitle, phone, email, linkedin, location,
    companyName, jobTitle, salutation, p1, p2, p3, p4, highlights,
    layoutSettings,
  } = state;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const paragraphs = [
    { text: p1, field: 'p1' as const },
    { text: p2, field: 'p2' as const },
    { text: p3, field: 'p3' as const },
    { text: p4, field: 'p4' as const },
  ];

  return (
    <div className="pdf-sheet text-slate-900" style={sheetStyle} id="cover-letter-sheet">
      {/* ── Applicant header ── */}
      <header>
        <EditableText
          tag="h1"
          value={name}
          isEditable={isEditable}
          editableClass={editableClass}
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: headingFontCss }}
          onSave={(v) => onFieldChange?.('name', v)}
        />
        <EditableText
          tag="p"
          value={subtitle}
          isEditable={isEditable}
          editableClass={editableClass}
          className="text-sm text-slate-600 mt-0.5"
          onSave={(v) => onFieldChange?.('subtitle', v)}
        />
        <address className="not-italic flex flex-wrap gap-x-3 text-xs text-slate-600 mt-1.5">
          {phone && <span>{phone}</span>}
          {email && <span>{email}</span>}
          {location && <span>{location}</span>}
          {linkedin && <span>{linkedin}</span>}
        </address>
      </header>

      <p className="text-xs text-slate-600 mt-4 mb-1">{today}</p>

      {/* ── Addressee ── */}
      <section aria-label="Addressee" className="mb-4 text-xs text-slate-800">
        <EditableText
          tag="p"
          value={companyName ? `Hiring Team, ${companyName}` : 'Hiring Team'}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-semibold"
          onSave={(v) => onFieldChange?.('companyName', v)}
        />
        {jobTitle && (
          <EditableText
            tag="p"
            value={`Re: ${jobTitle} Position`}
            isEditable={isEditable}
            editableClass={editableClass}
            className="italic text-slate-600 mt-0.5"
            onSave={(v) => onFieldChange?.('jobTitle', v)}
          />
        )}
      </section>

      {/* ── Letter body ── */}
      <section aria-label="Letter body">
        <EditableText
          tag="p"
          value={salutation || 'Dear Hiring Manager,'}
          isEditable={isEditable}
          editableClass={editableClass}
          className="text-xs text-slate-800 mb-3"
          onSave={(v) => onFieldChange?.('salutation', v)}
        />

        {paragraphs.map(({ text, field }) =>
          text ? (
            <EditableText
              key={field}
              tag="p"
              value={ip(text)}
              className="text-xs text-slate-800 mb-3 leading-relaxed"
              isEditable={isEditable}
              editableClass={editableClass}
              onSave={(val) => onFieldChange?.(field, val)}
            />
          ) : null
        )}

        {highlights && highlights.length > 0 && (
          <section aria-label="Key qualifications" className="my-4">
            <h2 className="text-xs font-semibold text-slate-800 mb-2">Key Qualifications:</h2>
            <ul className="space-y-1 text-xs text-slate-700">
              {highlights.map((item, idx) => (
                <li key={idx}>
                  <strong
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                  >
                    {item.category}
                  </strong>
                  {': '}
                  {hlText(item.text, idx, '')}
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>

      {/* ── Signature ── */}
      <footer className="mt-5 text-xs text-slate-800">
        <p>Sincerely,</p>
        <EditableText
          tag="p"
          value={name}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-bold mt-2 text-slate-900"
          onSave={(v) => onFieldChange?.('name', v)}
        />
      </footer>
    </div>
  );
};

export default AtsCLTemplate;
