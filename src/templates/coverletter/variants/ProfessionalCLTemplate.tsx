import React from 'react';
import { EditableText } from '../../shared/EditableText';
import type { CoverLetterTemplateProps } from '../shared';
import {
  interpolate,
  makeEditableClass,
  makeSheetStyle,
  makeParagraphEl,
  makeHlText,
  resolveFonts,
} from '../shared';

const ProfessionalCLTemplate: React.FC<CoverLetterTemplateProps> = ({
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
  const { brandColor = '#314855' } = layoutSettings;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const paragraphEl = makeParagraphEl(isEditable, editableClass, onFieldChange);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  // Build contact info segments, filtering empty fields
  const contactParts = [phone, email, linkedin, location].filter(Boolean);

  return (
    <div className="pdf-sheet" style={sheetStyle} id="cover-letter-sheet">
      {/* ── Header block ── */}
      <header className="text-center mb-4">
        <EditableText
          tag="h1"
          value={name}
          isEditable={isEditable}
          editableClass={editableClass}
          className="text-2xl font-bold tracking-widest uppercase"
          style={{ color: brandColor, fontFamily: headingFontCss }}
          onSave={(v) => onFieldChange?.('name', v)}
        />
        {(subtitle || isEditable) && (
          <EditableText
            tag="p"
            value={subtitle}
            isEditable={isEditable}
            editableClass={editableClass}
            className="text-sm text-slate-500 mt-1 tracking-wide"
            onSave={(v) => onFieldChange?.('subtitle', v)}
          />
        )}
        {contactParts.length > 0 && (
          <p className="text-xs text-slate-600 mt-2">
            {contactParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="mx-1.5 text-slate-400">•</span>}
                <span>{part}</span>
              </React.Fragment>
            ))}
          </p>
        )}
      </header>

      {/* ── Divider + label ── */}
      <div className="my-3">
        <hr style={{ borderColor: brandColor, borderTopWidth: 2 }} />
        <p
          className="text-center text-xs font-bold tracking-[0.25em] uppercase py-1.5"
          style={{ color: brandColor }}
        >
          Cover Letter
        </p>
        <hr style={{ borderColor: brandColor, borderTopWidth: 1 }} />
      </div>

      {/* ── Letter body ── */}
      <section className="text-xs text-slate-800 space-y-3 mt-4">
        <EditableText
          tag="p"
          value={salutation || 'To the Recruitment Team,'}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-semibold text-slate-900"
          onSave={(v) => onFieldChange?.('salutation', v)}
        />

        {paragraphEl(ip(p1), 'p1', 'leading-relaxed')}
        {paragraphEl(ip(p2), 'p2', 'leading-relaxed')}
        {paragraphEl(ip(p3), 'p3', 'leading-relaxed')}
        {paragraphEl(ip(p4), 'p4', 'leading-relaxed')}

        {/* ── Highlights ── */}
        {highlights && highlights.length > 0 && (
          <section aria-label="Key highlights" className="mt-2">
            <h2
              className="text-xs font-bold mb-2"
              style={{ color: brandColor }}
            >
              Key Highlights of My Expertise:
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex gap-1.5">
                  <span className="text-slate-500 shrink-0">•</span>
                  <span>
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
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>

      {/* ── Signature block ── */}
      <footer className="mt-6 text-xs text-slate-800">
        <p className="mb-3">Warm regards,</p>
        <EditableText
          tag="p"
          value={name}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-bold text-slate-900"
          style={{ fontFamily: headingFontCss }}
          onSave={(v) => onFieldChange?.('name', v)}
        />
        {[email, linkedin, location].filter(Boolean).length > 0 && (
          <p className="text-slate-500 mt-0.5">
            {[email, linkedin, location].filter(Boolean).join(' | ')}
          </p>
        )}
      </footer>
    </div>
  );
};

export default ProfessionalCLTemplate;
