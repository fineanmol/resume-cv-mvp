import React from 'react';
import type { CoverLetterState, HighlightItem } from '../types';
import { Mail, Phone, MapPin } from 'lucide-react';

interface CoverLetterTemplateProps {
  state: CoverLetterState;
  isEditable?: boolean;
  onFieldChange?: (field: keyof CoverLetterState, value: string) => void;
  onHighlightChange?: (index: number, field: keyof HighlightItem, value: string) => void;
}

export const CoverLetterTemplateRenderer: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange
}) => {
  const {
    name,
    subtitle,
    phone,
    email,
    linkedin,
    location,
    avatar,
    companyName,
    jobTitle,
    salutation,
    p1,
    p2,
    p3,
    p4,
    highlights,
    layoutSettings
  } = state;

  const {
    fontSize,
    paddingTopBottom,
    paddingLeftRight,
    sectionSpacing,
    lineHeight,
    template = 'navy',
    brandColor = '#314855'
  } = layoutSettings;

  const sheetStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    padding: `${paddingTopBottom}mm ${paddingLeftRight}mm`,
    lineHeight: lineHeight,
    color: '#334155'
  };

  const spacingStyle: React.CSSProperties = {
    marginBottom: `${sectionSpacing}px`
  };

  // Helper to interpolate company and role in the paragraphs
  const interpolate = (text: string) => {
    return text
      .replace(/{{company}}/g, companyName || '[Company]')
      .replace(/{{role}}/g, jobTitle || '[Role]');
  };

  const editableClass = isEditable ? "outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition" : "";

  // Dedicated paragraph renderer to support edit/preview switching
  const Paragraph: React.FC<{ text: string; field: 'p1' | 'p2' | 'p3' | 'p4'; className?: string }> = ({
    text,
    field,
    className
  }) => {
    const currentVal = interpolate(text);
    if (isEditable) {
      return (
        <p
          className={`${className || ''} ${editableClass}`}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const val = e.currentTarget.textContent || '';
            if (val !== currentVal) {
              onFieldChange?.(field, val);
            }
          }}
        >
          {currentVal}
        </p>
      );
    }
    return (
      <p
        className={className}
        dangerouslySetInnerHTML={{ __html: formatMarkdownBold(currentVal) }}
      />
    );
  };

  // -------------------------------------------------------------
  // 1. NAVY TEMPLATE (Navy Elegant)
  // -------------------------------------------------------------
  if (template === 'navy') {
    return (
      <div className="pdf-sheet font-sans" style={sheetStyle} id="resume-sheet">
        <header className="text-center border-b-2 pb-4 mb-6" style={{ borderColor: brandColor }}>
          <h1
            className={`text-3xl font-bold tracking-tight text-slate-800 ${editableClass}`}
            style={{ color: brandColor }}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
          >
            {name}
          </h1>
          <p
            className={`text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
          >
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3">
            { (phone || isEditable) && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
                >
                  {phone || 'Phone'}
                </span>
              </span>
            )}
            { (email || isEditable) && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                >
                  {email || 'Email'}
                </span>
              </span>
            )}
            { (location || isEditable) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
                >
                  {location || 'Location'}
                </span>
              </span>
            )}
            { (linkedin || isEditable) && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                >
                  {linkedin || 'LinkedIn'}
                </span>
              </span>
            )}
          </div>
        </header>

        <main className="text-xs text-slate-800 space-y-4">
          <div
            className={`font-bold text-slate-900 ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
          >
            {salutation}
          </div>
          
          <Paragraph text={p1} field="p1" className="text-justify" />
          <Paragraph text={p2} field="p2" className="text-justify" />
          
          {/* Highlights section inside Navy */}
          {highlights && highlights.length > 0 && (
            <div style={spacingStyle} className="py-2">
              <h4 className="font-bold text-[13px] uppercase tracking-wider mb-3 text-slate-800" style={{ color: brandColor }}>Core Competencies &amp; Strengths</h4>
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
                    <span
                      className={`text-[10px] leading-relaxed block ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Paragraph text={p3} field="p3" className="text-justify" />
          <Paragraph text={p4} field="p4" className="text-justify" />
          
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
  }

  // -------------------------------------------------------------
  // 2. SERIF TEMPLATE (Harvard Classic Serif)
  // -------------------------------------------------------------
  if (template === 'serif') {
    return (
      <div className="pdf-sheet font-serif text-justify" style={sheetStyle} id="resume-sheet">
        <header className="text-center mb-6">
          <h1
            className={`text-3xl font-normal tracking-wide text-slate-900 ${editableClass}`}
            style={{ color: brandColor }}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
          >
            {name}
          </h1>
          <p
            className={`text-xs italic text-slate-500 mt-1 ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
          >
            {subtitle}
          </p>
          <div className="flex justify-center gap-x-3 text-xs text-slate-600 mt-2 font-sans flex-wrap">
            { (phone || isEditable) && (
              <>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
                >
                  {phone || 'Phone'}
                </span>
                <span>&bull;</span>
              </>
            )}
            { (email || isEditable) && (
              <>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                >
                  {email || 'Email'}
                </span>
                <span>&bull;</span>
              </>
            )}
            { (location || isEditable) && (
              <>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
                >
                  {location || 'Location'}
                </span>
              </>
            )}
            { (linkedin || isEditable) && (
              <>
                <span>&bull;</span>
                <span
                  className={editableClass}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                >
                  {linkedin || 'LinkedIn'}
                </span>
              </>
            )}
          </div>
        </header>

        <main className="text-xs space-y-4 text-slate-800 leading-relaxed">
          <div
            className={`font-bold text-slate-950 mb-2 ${editableClass}`}
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
          >
            {salutation}
          </div>
          
          <Paragraph text={p1} field="p1" />
          <Paragraph text={p2} field="p2" />
          
          {highlights && highlights.length > 0 && (
            <div className="py-2 text-[11px]" style={spacingStyle}>
              <h4 className="font-bold text-xs uppercase tracking-widest text-center border-b pb-1 mb-3 text-slate-800">Areas of Focus</h4>
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
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Paragraph text={p3} field="p3" />
          <Paragraph text={p4} field="p4" />
          
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
  }

  // -------------------------------------------------------------
  // 3. SIDEBAR TEMPLATE (Creative Two-Column Sidebar)
  // -------------------------------------------------------------
  if (template === 'sidebar') {
    return (
      <div className="pdf-sheet p-0 font-sans text-slate-800 flex flex-row min-h-[1123px] w-[794px]" style={{ fontSize: `${fontSize}pt` }} id="resume-sheet">
        {/* Left Column - Contact & Highlights */}
        <aside className="w-[230px] bg-slate-50 border-r border-slate-200/60 p-6 flex flex-col gap-6 flex-shrink-0 text-slate-700">
          {avatar && (
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-slate-300">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Contact</h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              { (phone || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
                  >
                    {phone || 'Phone'}
                  </span>
                </li>
              )}
              { (email || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                  >
                    {email || 'Email'}
                  </span>
                </li>
              )}
              { (location || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
                  >
                    {location || 'Location'}
                  </span>
                </li>
              )}
              { (linkedin || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  <span
                    className={editableClass}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                  >
                    {linkedin || 'LinkedIn'}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {highlights && highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-3">Key Highlights</h4>
              <ul className="space-y-3.5 text-[10px]">
                {highlights.map((item, idx) => (
                  <li key={idx} className="leading-relaxed bg-white border border-slate-200 p-2 rounded shadow-sm">
                    <strong
                      className={`text-slate-800 block mb-0.5 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                    >
                      {item.category}
                    </strong>
                    <span
                      className={`text-slate-500 block leading-normal ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Right Column - Cover Letter Body */}
        <main className="flex-1 p-8" style={{ lineHeight: lineHeight }}>
          <header className="mb-6">
            <h1
              className={`text-3xl font-extrabold tracking-tight ${editableClass}`}
              style={{ color: brandColor }}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
            >
              {name}
            </h1>
            <p
              className={`text-sm font-medium text-slate-500 uppercase mt-1 tracking-wide ${editableClass}`}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
            >
              {subtitle}
            </p>
          </header>

          <div className="text-xs text-slate-800 space-y-4">
            <div
              className={`font-bold text-slate-900 mb-2 ${editableClass}`}
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
            >
              {salutation}
            </div>
            
            <Paragraph text={p1} field="p1" className="text-justify" />
            <Paragraph text={p2} field="p2" className="text-justify" />
            <Paragraph text={p3} field="p3" className="text-justify" />
            <Paragraph text={p4} field="p4" className="text-justify" />
            
            <div className="pt-6">
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
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. TECH TEMPLATE (Modern Monospace Developer)
  // -------------------------------------------------------------
  return (
    <div className="pdf-sheet font-sans" style={sheetStyle} id="resume-sheet">
      <header className="border-l-4 pl-4 py-1 mb-6" style={{ borderColor: brandColor }}>
        <h1
          className={`text-3xl font-extrabold tracking-tight text-slate-900 ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('name', e.currentTarget.textContent || '')}
        >
          {name}
        </h1>
        <p
          className={`text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('subtitle', e.currentTarget.textContent || '')}
        >
          &gt; {subtitle}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600 mt-3">
          { (phone || isEditable) && (
            <span>
              [phone]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('phone', e.currentTarget.textContent || '')}
              >
                {phone || 'Phone'}
              </span>
            </span>
          )}
          { (email || isEditable) && (
            <span>
              [email]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
              >
                {email || 'Email'}
              </span>
            </span>
          )}
          { (location || isEditable) && (
            <span>
              [loc]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('location', e.currentTarget.textContent || '')}
              >
                {location || 'Location'}
              </span>
            </span>
          )}
          { (linkedin || isEditable) && (
            <span>
              [li]{' '}
              <span
                className={editableClass}
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
              >
                {linkedin || 'LinkedIn'}
              </span>
            </span>
          )}
        </div>
      </header>

      <main className="text-xs space-y-4 text-slate-800 font-sans leading-relaxed">
        <div
          className={`font-mono text-xs font-semibold text-slate-900 ${editableClass}`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onBlur={(e) => onFieldChange?.('salutation', e.currentTarget.textContent || '')}
        >
          &gt; {salutation}
        </div>
        
        <Paragraph text={p1} field="p1" className="text-justify font-sans" />
        <Paragraph text={p2} field="p2" className="text-justify font-sans" />
        
        {highlights && highlights.length > 0 && (
          <div className="py-2" style={spacingStyle}>
            <div className="font-mono text-xs font-bold text-slate-950 uppercase tracking-widest border-b pb-1 mb-3">// Strengths_Index</div>
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
                    <span
                      className={`text-slate-600 ${editableClass}`}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
                    >
                      {item.text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Paragraph text={p3} field="p3" className="text-justify font-sans" />
        <Paragraph text={p4} field="p4" className="text-justify font-sans" />
        
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

function formatMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
