import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { CoverLetterTemplateProps } from '../shared';
import {
  interpolate,
  makeEditableClass,
  makeSheetStyle,
  makeParagraphEl,
  makeHlText,
  resolveFonts,
} from '../shared';
import { formatLinkedinUrl } from '../../../utils/linkedin';

const SidebarCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
}) => {
  const {
    name, subtitle, phone, email, linkedin, location, avatar,
    salutation, p1, p2, p3, p4, highlights, layoutSettings, companyName, jobTitle,
  } = state;
  const { brandColor = '#0284c7', showPhoto = true, lineHeight } = layoutSettings;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const showAvatar = showPhoto && !!avatar;
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const paragraphEl = makeParagraphEl(isEditable, editableClass, onFieldChange);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  return (
    <div
      className="pdf-sheet p-0 text-slate-800 flex flex-row"
      style={{ ...sheetStyle, padding: 0 }}
      id="cover-letter-sheet"
    >
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
            {(phone || isEditable) && (
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
            {(email || isEditable) && (
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
            {(location || isEditable) && (
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
            {(linkedin || isEditable) && (
              <li className="flex items-center gap-1.5 truncate">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 mt-[1px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
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
                  <a
                    href={formatLinkedinUrl(linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    {linkedin}
                  </a>
                )}
              </li>
            )}
          </ul>
        </div>

        {highlights && highlights.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-3">
              Key Highlights
            </h4>
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
                  {hlText(item.text, idx, 'text-slate-500 block leading-normal')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Right Column - Cover Letter Body */}
      <main className="flex-1 p-8" style={{ lineHeight }}>
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

          {paragraphEl(ip(p1), 'p1', 'text-justify')}
          {paragraphEl(ip(p2), 'p2', 'text-justify')}
          {paragraphEl(ip(p3), 'p3', 'text-justify')}
          {paragraphEl(ip(p4), 'p4', 'text-justify')}

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
};

export default SidebarCLTemplate;
