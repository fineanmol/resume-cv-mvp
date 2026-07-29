import React from 'react';
import { formatMarkdownInline } from '../../../../utils/markdown';
import { EditableText as E } from '../../../shared/EditableText';
import { BulletList } from '../../../shared/BulletList';
import { EntryIconPicker } from '../../../shared/EntryIconPicker';
import { getDynamicProjectIcon } from '../../../shared/templateIconHelpers';
import { CertEntrySettings } from '../../../shared/entrySettings';
import { mergeProjectDescription } from '../../../shared/parseEducationGrade';
import { DraggableSection, ItemWrapper, SectionWrapper, WorkLink } from '../../shared';
import type { ResumeState } from '../../../../types';
import type { DesignerDragProps, DesignerFG, DesignerLayoutSettings } from './designerSectionTypes';

type ResumeCert = NonNullable<ResumeState['resumeCerts']>[number];

export interface DesignerProjectsSectionProps {
  resumeCerts: ResumeState['resumeCerts'];
  isEditable: boolean;
  dragProps: DesignerDragProps;
  certsAlign: string;
  onLayoutSettingsChange?: (patch: Partial<DesignerLayoutSettings>) => void;
  layoutSettings: DesignerLayoutSettings;
  onAddCert?: () => void;
  ec: string;
  H: string;
  FG: DesignerFG;
  C_HEAD: string;
  C_TITLE: string;
  C_COMPANY: string;
  dsec: React.CSSProperties;
  entrySpacing: number;
  bulletStyle: string;
  showCert: (cert: ResumeCert, field: keyof NonNullable<ResumeCert['visibility']>) => boolean;
  showProjectIcons: boolean;
  showProjectDesc: boolean;
  showProjectBullets: boolean;
  onDeleteCert?: (idx: number) => void;
  onEntryVisibilityChange?: (section: string, idx: number, field: string, value: boolean) => void;
  onCertChange?: (idx: number, field: string, value: string) => void;
}

export const DesignerProjectsSection: React.FC<DesignerProjectsSectionProps> = ({
  resumeCerts,
  isEditable,
  dragProps,
  certsAlign,
  onLayoutSettingsChange,
  layoutSettings,
  onAddCert,
  ec,
  H,
  FG,
  C_HEAD,
  C_TITLE,
  C_COMPANY,
  dsec,
  entrySpacing,
  bulletStyle,
  showCert,
  showProjectIcons,
  showProjectDesc,
  showProjectBullets,
  onDeleteCert,
  onEntryVisibilityChange,
  onCertChange,
}) => {
  if ((!resumeCerts || resumeCerts.length === 0) && !isEditable) return null;
  return (
    <DraggableSection key="certs" id="certs" {...dragProps}>
      <SectionWrapper
        id="certs" title="Certifications" isEditable={isEditable}
        align={certsAlign} onAlignChange={(a) => onLayoutSettingsChange?.({ certsAlign: a })}
        onAddEntry={onAddCert}
        layoutSettings={layoutSettings} onLayoutSettingsChange={onLayoutSettingsChange}
      >
        <section style={dsec}>
          <h3 className={H} style={{ ...FG.section, borderColor: C_HEAD, color: C_HEAD }}>Certifications</h3>
          <ul className="flex flex-col" style={{ ...FG.body, gap: `${entrySpacing - 4}px` }}>
            {(resumeCerts ?? []).map((cert, idx) => {
              const desc = cert.desc || '';
              const isTechIdx = desc.toLowerCase().indexOf('tech:');
              let cleanDesc = desc;
              let techStack = '';
              if (isTechIdx !== -1) {
                cleanDesc = desc.substring(0, isTechIdx).trim();
                techStack = desc.substring(isTechIdx).trim();
              }
              const isLast = idx === (resumeCerts ?? []).length - 1;
              return (
                <ItemWrapper
                  key={idx} sectionId="certs" index={idx} totalItems={(resumeCerts ?? []).length}
                  isEditable={isEditable} onDelete={() => onDeleteCert?.(idx)}
                  settingsPanel={(onClose) => (
                    <CertEntrySettings
                      item={cert}
                      onToggle={(field, value) => onEntryVisibilityChange?.('certs', idx, field, value)}
                      onClose={onClose}
                      onUrlChange={(url) => onCertChange?.(idx, 'url', url)}
                    />
                  )}
                >
                  <li
                    className={`text-${certsAlign}${isLast ? '' : ' border-b border-dashed border-slate-300 pb-2'}`}
                  >
                    <div className={`flex gap-1.5 items-start ${certsAlign === 'center' ? 'justify-center' : certsAlign === 'right' ? 'justify-end' : ''}`}>
                      {showProjectIcons && (
                        isEditable ? (
                          <EntryIconPicker
                            variant="project"
                            currentIcon={cert.icon || 'briefcase'}
                            onChange={(icon) => onCertChange?.(idx, 'icon', icon)}
                            isEditable={isEditable}
                            accentColor={C_TITLE}
                            accentColor2={C_COMPANY}
                            index={idx}
                            title={cert.title}
                            iconClassName="w-3 h-3 shrink-0"
                            wrapperClassName="shrink-0 mt-0.5"
                          />
                        ) : (
                          getDynamicProjectIcon(idx, cert.title, cert.icon, C_TITLE, 'w-3 h-3 shrink-0 mt-0.5', C_COMPANY)
                        )
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={`leading-snug ${certsAlign === 'center' ? 'text-center' : certsAlign === 'right' ? 'text-right' : ''}`}>
                          <E tag="strong" field="projects.title" value={cert.title} isEditable={isEditable} editableClass={ec}
                            style={{ ...FG.itemTitle, color: C_HEAD }}
                            onSave={v => onCertChange?.(idx, 'title', v)} />
                        </div>
                        {showProjectDesc && (cleanDesc || isEditable) && (
                          showProjectBullets ? (
                            <BulletList
                              field="projects.description"
                              bullets={cleanDesc}
                              isEditable={isEditable}
                              editableClass={ec}
                              onBulletChange={(v) => {
                                onCertChange?.(idx, 'desc', mergeProjectDescription(v, techStack));
                              }}
                              className={`mt-0.5 leading-snug text-${certsAlign}`}
                              bulletStyle={bulletStyle}
                              align={certsAlign}
                              prefixId={`cert-${idx}`}
                            />
                          ) : (
                          <p className={`mt-0.5 leading-snug text-${certsAlign}`} style={FG.body}>
                            <E field="projects.description" value={cleanDesc} isEditable={isEditable} editableClass={ec}
                              style={FG.body}
                              onSave={(v) => onCertChange?.(idx, 'desc', techStack ? `${v}\n${techStack}` : v)} />
                            {showCert(cert, 'link') && <WorkLink url={cert.url} brandColor={C_COMPANY} />}
                          </p>
                          )
                        )}
                        {showProjectDesc && techStack && (
                          <div className={`italic mt-0.5 text-${certsAlign}`} style={FG.meta}
                            dangerouslySetInnerHTML={{ __html: formatMarkdownInline(techStack) }}
                          />
                        )}
                        {/* Link at end of title row when there is no description (website places it after desc). */}
                        {(!showProjectDesc || (!cleanDesc && !isEditable)) && showCert(cert, 'link') && (
                          <WorkLink url={cert.url} brandColor={C_COMPANY} />
                        )}
                      </div>
                    </div>
                  </li>
                </ItemWrapper>
              );
            })}
          </ul>
        </section>
      </SectionWrapper>
    </DraggableSection>
  );
};
