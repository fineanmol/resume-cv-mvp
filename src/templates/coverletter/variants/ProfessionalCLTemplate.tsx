import React from "react";
import { TemplateHeader } from "../../TemplateHeader";
import { EditableText } from "../../shared/EditableText";
import type { CoverLetterTemplateProps } from "../shared";
import {
  interpolate,
  makeEditableClass,
  makeSheetStyle,
  makeHeaderProps,
  makeParagraphEl,
  makeHlText,
  resolveFonts,
} from "../shared";

const ProfessionalCLTemplate: React.FC<CoverLetterTemplateProps> = ({
  state,
  isEditable = false,
  onFieldChange,
  onHighlightChange,
  onLayoutSettingsChange,
}) => {
  const {
    name,
    companyName,
    jobTitle,
    salutation,
    p1,
    p2,
    p3,
    p4,
    highlights,
    layoutSettings,
    avatar,
  } = state;
  const { brandColor = "#314855", showPhoto = true } = layoutSettings;
  const showAvatar = showPhoto && !!avatar;

  const { headingFontCss } = resolveFonts(layoutSettings);
  const editableClass = makeEditableClass(isEditable);
  const sheetStyle = makeSheetStyle(layoutSettings);
  const headerProps = makeHeaderProps(
    state,
    isEditable,
    editableClass,
    headingFontCss,
    showAvatar,
    brandColor,
    onFieldChange,
    onLayoutSettingsChange,
  );
  const paragraphEl = makeParagraphEl(isEditable, editableClass, onFieldChange);
  const hlText = makeHlText(isEditable, editableClass, onHighlightChange);
  const ip = (text: string) => interpolate(text, companyName, jobTitle);

  return (
    <div className="pdf-sheet" style={sheetStyle} id="cover-letter-sheet">
      {/* ── Header block — respects headerStyle from Design Panel ── */}
      <TemplateHeader {...headerProps} />

      {/* ── Divider + label ── */}
      <div className="my-4">
        <p
          className="text-left text-[10px] font-normal tracking-[0.2em] uppercase py-1.5"
          style={{ color: brandColor }}
        >
          COVER LETTER
        </p>
      </div>

      {/* ── Letter body ── */}
      <section className="text-xs text-slate-800 space-y-3 mt-4">
        <EditableText
          tag="p"
          value={salutation || "To the Recruitment Team,"}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-semibold text-slate-900"
          onSave={(v) => onFieldChange?.("salutation", v)}
        />

        {paragraphEl(ip(p1), "p1", "leading-relaxed")}
        {paragraphEl(ip(p2), "p2", "leading-relaxed")}

        {/* ── Highlights ── */}
        {highlights && highlights.length > 0 && (
          <section aria-label="Key highlights" className="mt-1">
            <h2
              className="text-xs font-bold mb-2"
              style={{ color: brandColor }}
            >
              Key Highlights of My Expertise:
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-baseline gap-2">
                  <span
                    className="shrink-0 font-bold"
                    style={{ color: brandColor }}
                  >
                    •
                  </span>
                  <span>
                    <strong
                      className={editableClass}
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        onHighlightChange?.(
                          idx,
                          "category",
                          e.currentTarget.textContent || "",
                        )
                      }
                    >
                      {item.category}
                    </strong>
                    {": "}
                    {hlText(item.text, idx, "")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {paragraphEl(ip(p3), "p3", "leading-relaxed")}
        {paragraphEl(ip(p4), "p4", "leading-relaxed")}
      </section>

      {/* ── Signature block ── */}
      <footer className="mt-6 text-xs text-slate-800">
        <p className="mb-3">Warm regards,</p>
        <EditableText
          tag="p"
          value={name}
          isEditable={isEditable}
          editableClass={editableClass}
          className="font-bold text-slate-900 mb-1"
          style={{ fontFamily: headingFontCss }}
          onSave={(v) => onFieldChange?.("name", v)}
        />
      </footer>
    </div>
  );
};

export default ProfessionalCLTemplate;
