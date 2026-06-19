import React from 'react';
import type { CoverLetterState, HighlightItem, LayoutSettings } from '../types';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FONT_CSS } from '../config/fonts';
import { TemplateHeader } from './TemplateHeader';
import { formatLinkedinUrl } from '../utils/linkedin';
import { formatMarkdownBold } from '../utils/markdown';
import { EditableText } from './shared/EditableText';

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
    brandColor = '#314855',
    accentColor2,
    fontFamily = 'inter',
    headingFont,
    headerStyle = 'centered',
    showPhoto = true,
  } = layoutSettings;

  const bodyFontCss    = FONT_CSS[fontFamily] ?? FONT_CSS.inter;
  const headingFontCss = headingFont ? FONT_CSS[headingFont] : bodyFontCss;
  const showAvatar     = showPhoto && !!avatar;
  const editableClass  = isEditable ? "outline-none hover:bg-slate-100/80 focus:bg-slate-100 rounded px-1 -mx-1 transition" : "";

  // Shared TemplateHeader props for CL
  const headerProps = {
    name:    { value: name,     onSave: (v: string) => onFieldChange?.('name', v) },
    subtitle:{ value: subtitle, onSave: (v: string) => onFieldChange?.('subtitle', v) },
    phone:   { value: phone,    onSave: (v: string) => onFieldChange?.('phone', v) },
    email:   { value: email,    onSave: (v: string) => onFieldChange?.('email', v) },
    location:{ value: location, onSave: (v: string) => onFieldChange?.('location', v) },
    linkedin:{ value: linkedin, onSave: (v: string) => onFieldChange?.('linkedin', v) },
    avatar, showAvatar, brandColor, headingFontCss,
    headerStyle: headerStyle as import('../types').HeaderStyle,
    isEditable, ec: editableClass, sectionSpacing,
    layoutSettings,
    onLayoutSettingsChange: (patch: Partial<LayoutSettings>) => onFieldChange?.('layoutSettings', { ...layoutSettings, ...patch }),
    onAvatarChange: (url: string) => onFieldChange?.('avatar', url)
  };

  // accentColor2 is available for future highlight/badge styling in CL templates
  void accentColor2;

  const sheetStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    padding: `${paddingTopBottom}mm ${paddingLeftRight}mm`,
    lineHeight: lineHeight,
    color: '#334155',
    fontFamily: bodyFontCss,
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

  const paragraphEl = (
    text: string,
    field: 'p1' | 'p2' | 'p3' | 'p4',
    className?: string,
  ) => (
    <EditableText
      tag="p"
      value={text}
      className={className}
      isEditable={isEditable}
      editableClass={editableClass}
      onSave={(val) => onFieldChange?.(field, val)}
      dangerousInnerHtml={formatMarkdownBold(text)}
    />
  );

  // -------------------------------------------------------------
  // 1. NAVY TEMPLATE (Navy Elegant)
  // -------------------------------------------------------------
  if (template === 'navy') {
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
          
          {paragraphEl(interpolate(p1), 'p1', 'text-justify')}
          {paragraphEl(interpolate(p2), 'p2', 'text-justify')}
          
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

          {paragraphEl(interpolate(p3), 'p3', 'text-justify')}
          {paragraphEl(interpolate(p4), 'p4', 'text-justify')}
          
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
          
          {paragraphEl(interpolate(p1), 'p1')}
          {paragraphEl(interpolate(p2), 'p2')}
          
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

          {paragraphEl(interpolate(p3), 'p3')}
          {paragraphEl(interpolate(p4), 'p4')}
          
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
      <div className="pdf-sheet p-0 text-slate-800 flex flex-row" style={{ ...sheetStyle, padding: 0 }} id="cover-letter-sheet">
        {/* Left Column - Contact & Highlights */}
        <aside className="w-[230px] bg-slate-50 border-r border-slate-200/60 p-6 flex flex-col gap-6 flex-shrink-0 text-slate-700">
          {showAvatar && (
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-slate-300">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">Contact</h4>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              { (phone || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 mt-[1px]" />
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
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 mt-[1px]" />
                  {isEditable ? (
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onFieldChange?.('email', e.currentTarget.textContent || '')}
                    >
                      {email || 'Email'}
                    </span>
                  ) : (
                    <a href={`mailto:${email}`} className="hover:underline cursor-pointer">
                      {email}
                    </a>
                  )}
                </li>
              )}
              { (location || isEditable) && (
                <li className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-[1px]" />
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
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  {isEditable ? (
                    <span
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onFieldChange?.('linkedin', e.currentTarget.textContent || '')}
                    >
                      {linkedin || 'LinkedIn'}
                    </span>
                  ) : (
                    <a href={formatLinkedinUrl(linkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline cursor-pointer">
                      {linkedin}
                    </a>
                  )}
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
              style={{ color: brandColor, fontFamily: headingFontCss }}
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
            
            {paragraphEl(interpolate(p1), 'p1', 'text-justify')}
            {paragraphEl(interpolate(p2), 'p2', 'text-justify')}
            {paragraphEl(interpolate(p3), 'p3', 'text-justify')}
            {paragraphEl(interpolate(p4), 'p4', 'text-justify')}
            
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
  if (template === 'tech') return (
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
        
        {paragraphEl(interpolate(p1), 'p1', 'text-justify font-sans')}
        {paragraphEl(interpolate(p2), 'p2', 'text-justify font-sans')}
        
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

        {paragraphEl(interpolate(p3), 'p3', 'text-justify font-sans')}
        {paragraphEl(interpolate(p4), 'p4', 'text-justify font-sans')}
        
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CLEAN ATS — single column, no decoration, maximum parser compatibility
  // ═══════════════════════════════════════════════════════════════════════════
  if (template === 'ats') {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return (
      <div className="pdf-sheet text-slate-900" style={sheetStyle} id="cover-letter-sheet">
        {/* Header */}
        <header className="mb-6">
          <EditableText tag="h1" value={name} isEditable={isEditable} editableClass={editableClass} className="text-xl font-bold text-slate-900" style={{ fontFamily: headingFontCss }} onSave={v => onFieldChange?.('name', v)} />
          <EditableText tag="p" value={subtitle} isEditable={isEditable} editableClass={editableClass} className="text-sm text-slate-600 mt-0.5" onSave={v => onFieldChange?.('subtitle', v)} />
          <div className="flex flex-wrap gap-x-3 text-xs text-slate-600 mt-1.5">
            {phone && <span>{phone}</span>}
            {email && <span>| {email}</span>}
            {location && <span>| {location}</span>}
            {linkedin && <span>| {linkedin}</span>}
          </div>
        </header>

        <p className="text-xs text-slate-600 mb-4">{today}</p>

        <div className="mb-4 text-xs text-slate-800">
          <EditableText tag="p" value={companyName ? `Hiring Team, ${companyName}` : 'Hiring Team'} isEditable={isEditable} editableClass={editableClass} className="font-semibold" onSave={v => onFieldChange?.('companyName', v)} />
          {jobTitle && <EditableText tag="p" value={`Re: ${jobTitle} Position`} isEditable={isEditable} editableClass={editableClass} className="italic text-slate-600 mt-0.5" onSave={v => onFieldChange?.('jobTitle', v)} />}
        </div>

        <EditableText tag="p" value={salutation || `Dear Hiring Manager,`} isEditable={isEditable} editableClass={editableClass} className="text-xs text-slate-800 mb-3" onSave={v => onFieldChange?.('salutation', v)} />

        {[p1, p2, p3, p4].map((para, i) => (
          para ? (
            <EditableText
              key={i}
              tag="p"
              value={interpolate(para)}
              className="text-xs text-slate-800 mb-3 leading-relaxed"
              isEditable={isEditable}
              editableClass={editableClass}
              onSave={(val) => onFieldChange?.((['p1', 'p2', 'p3', 'p4'] as const)[i], val)}
              dangerousInnerHtml={formatMarkdownBold(interpolate(para))}
            />
          ) : null
        ))}

        {highlights && highlights.length > 0 && (
          <div className="my-4">
            <p className="text-xs font-semibold text-slate-800 mb-2">Key Qualifications:</p>
            <ul className="space-y-1 text-xs text-slate-700">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-slate-400 flex-shrink-0">▸</span>
                  <span>
                    <strong
                      className={editableClass} contentEditable={isEditable} suppressContentEditableWarning
                      onBlur={e => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                    >{item.category}</strong>
                    {': '}
                    <span
                      className={editableClass} contentEditable={isEditable} suppressContentEditableWarning
                      onBlur={e => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
                    >{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 text-xs text-slate-800">
          <p>Sincerely,</p>
          <EditableText tag="p" value={name} isEditable={isEditable} editableClass={editableClass} className="font-bold mt-2 text-slate-900" onSave={v => onFieldChange?.('name', v)} />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. EXECUTIVE — premium branded header, structured highlights table
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="pdf-sheet" style={{ ...sheetStyle, color: '#1e293b' }} id="cover-letter-sheet">
      {/* Branded header */}
      <TemplateHeader {...headerProps} />

      {/* Addressee */}
      <div className="mb-4 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">{companyName || 'Company Name'}</p>
        <p className="italic">{jobTitle ? `Re: Application for ${jobTitle}` : 'Re: Open Application'}</p>
      </div>

      <EditableText tag="p" value={salutation || 'Dear Hiring Manager,'} isEditable={isEditable} editableClass={editableClass}
        className="text-sm font-semibold text-slate-800 mb-4" onSave={v => onFieldChange?.('salutation', v)} />

      {paragraphEl(interpolate(p1), 'p1', 'text-xs text-justify mb-3 leading-relaxed')}
      {paragraphEl(interpolate(p2), 'p2', 'text-xs text-justify mb-4 leading-relaxed')}

      {highlights && highlights.length > 0 && (
        <div className="my-4 border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white" style={{ background: brandColor }}>
            Why I Am the Right Fit
          </div>
          <div className="divide-y divide-slate-100">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex gap-3 px-4 py-2 text-xs">
                <span
                  className={`font-bold text-slate-800 w-36 flex-shrink-0 ${editableClass}`}
                  contentEditable={isEditable} suppressContentEditableWarning
                  onBlur={e => onHighlightChange?.(idx, 'category', e.currentTarget.textContent || '')}
                >{item.category}</span>
                <span
                  className={`text-slate-600 flex-1 ${editableClass}`}
                  contentEditable={isEditable} suppressContentEditableWarning
                  onBlur={e => onHighlightChange?.(idx, 'text', e.currentTarget.textContent || '')}
                >{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {paragraphEl(interpolate(p3), 'p3', 'text-xs text-justify mb-3 leading-relaxed')}
      {paragraphEl(interpolate(p4), 'p4', 'text-xs text-justify mb-4 leading-relaxed')}

      <div className="mt-5 text-xs text-slate-800">
        <p>Yours sincerely,</p>
        <EditableText tag="p" value={name} isEditable={isEditable} editableClass={editableClass}
          className="font-bold mt-2 text-slate-900 text-sm" onSave={v => onFieldChange?.('name', v)} />
        <EditableText tag="p" value={subtitle} isEditable={isEditable} editableClass={editableClass}
          className="text-slate-500 text-[11px]" onSave={v => onFieldChange?.('subtitle', v)} />
      </div>
    </div>
  );
};
