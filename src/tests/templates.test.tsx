import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';
import { FONT_CSS } from '../config/fonts';
import type { ResumeState, CoverLetterState, TemplateId } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const resumeWith = (patch: Partial<ResumeState['layoutSettings']>): ResumeState => ({
  ...DEFAULT_RESUME_STATE,
  layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, ...patch },
});

const clWith = (patch: Partial<CoverLetterState['layoutSettings']>): CoverLetterState => ({
  ...DEFAULT_CL_STATE,
  layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, ...patch },
});

const ALL_TEMPLATES: TemplateId[] = ['navy', 'serif', 'sidebar', 'tech', 'ats', 'executive', 'designer'];

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — smoke + name
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — smoke: all templates render', () => {
  ALL_TEMPLATES.forEach(template => {
    it(`${template} renders .pdf-sheet without crashing`, () => {
      const { container } = render(<ResumeTemplateRenderer state={resumeWith({ template })} />);
      expect(container.querySelector('.pdf-sheet')).toBeTruthy();
    });
  });
});

describe('ResumeTemplates — candidate name shown in every template', () => {
  ALL_TEMPLATES.forEach(template => {
    it(`${template} shows "Jonathan Doe"`, () => {
      const { getAllByText } = render(<ResumeTemplateRenderer state={resumeWith({ template })} />);
      expect(getAllByText('Jonathan Doe').length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — body font via sheetStyle
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — body fontFamily applied to .pdf-sheet', () => {
  (['inter', 'outfit', 'eb-garamond', 'jetbrains-mono'] as const).forEach(font => {
    it(`fontFamily="${font}" → .pdf-sheet.style.fontFamily contains font name`, () => {
      const { container } = render(<ResumeTemplateRenderer state={resumeWith({ template: 'navy', fontFamily: font })} />);
      const sheet = container.querySelector('.pdf-sheet') as HTMLElement;
      const expected = FONT_CSS[font].split(',')[0].replace(/'/g, '').trim();
      expect(sheet.style.fontFamily).toContain(expected);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — heading font applied to h1 name in every template
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — headingFont applied to name heading in all templates', () => {
  ALL_TEMPLATES.forEach(template => {
    it(`${template}: headingFont=eb-garamond → EB Garamond in DOM`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={resumeWith({ template, headingFont: 'eb-garamond' })} />
      );
      const withFont = Array.from(container.querySelectorAll<HTMLElement>('[style]'))
        .filter(el => el.style.fontFamily?.includes('EB Garamond'));
      expect(withFont.length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — brandColor appears in styled elements
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — brandColor appears in DOM for all templates', () => {
  const brandColor = '#cc2200';
  ALL_TEMPLATES.forEach(template => {
    it(`${template}: brandColor #cc2200 appears in at least one element style`, () => {
      const { container } = render(<ResumeTemplateRenderer state={resumeWith({ template, brandColor })} />);
      const raw = container.innerHTML;
      // Either the hex or computed rgb(204,34,0) will appear
      const found = raw.includes('#cc2200') || raw.includes('204, 34, 0') || raw.includes('204,34,0');
      expect(found).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — showPhoto toggle
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — showPhoto toggle', () => {
  const withPhoto = { ...DEFAULT_RESUME_STATE, avatar: '/profile_picture.jpg' };
  const photoTemplates: TemplateId[] = ['sidebar', 'executive', 'designer'];

  photoTemplates.forEach(template => {
    it(`${template}: profile img present when showPhoto=true`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={{ ...withPhoto, layoutSettings: { ...withPhoto.layoutSettings, template, showPhoto: true } }} />
      );
      expect(container.querySelector('img[alt="Jonathan Doe"]')).toBeTruthy();
    });

    it(`${template}: profile img absent when showPhoto=false`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={{ ...withPhoto, layoutSettings: { ...withPhoto.layoutSettings, template, showPhoto: false } }} />
      );
      expect(container.querySelector('img[alt="Jonathan Doe"]')).toBeNull();
    });
  });

  // Navy headerStyle variants that support photo
  it('navy banner: img present when showPhoto=true', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={{ ...withPhoto, layoutSettings: { ...withPhoto.layoutSettings, template: 'navy', headerStyle: 'banner', showPhoto: true } }} />
    );
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('navy banner: img absent when showPhoto=false', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={{ ...withPhoto, layoutSettings: { ...withPhoto.layoutSettings, template: 'navy', headerStyle: 'banner', showPhoto: false } }} />
    );
    expect(container.querySelector('img')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — layoutSettings contact visibility (sidebar / designer)
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — contact field visibility via layoutSettings', () => {
  const contactState: ResumeState = {
    ...DEFAULT_RESUME_STATE,
    phone: '+1 555-0100',
    email: 'jon@example.com',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/jondoe',
  };

  (['sidebar', 'designer'] as const).forEach(template => {
    it(`${template}: hides phone when showPhone=false`, () => {
      const { queryByText } = render(
        <ResumeTemplateRenderer state={{
          ...contactState,
          layoutSettings: { ...contactState.layoutSettings, template, showPhone: false },
        }} />
      );
      expect(queryByText('+1 555-0100')).toBeNull();
      expect(queryByText('jon@example.com')).toBeTruthy();
    });

    it(`${template}: hides title when showTitle=false`, () => {
      const uniqueSubtitle = 'Unique Header Title XYZ';
      const { queryByText } = render(
        <ResumeTemplateRenderer state={{
          ...contactState,
          subtitle: uniqueSubtitle,
          layoutSettings: { ...contactState.layoutSettings, template, showTitle: false },
        }} />
      );
      expect(queryByText(uniqueSubtitle)).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — headerStyle variants
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — navy headerStyle variants render', () => {
  (['centered', 'left', 'banner', 'minimal'] as const).forEach(style => {
    it(`headerStyle="${style}" renders without crashing`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={resumeWith({ template: 'navy', headerStyle: style })} />
      );
      expect(container.querySelector('.pdf-sheet')).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — key content sections
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — content sections render', () => {
  it('navy: skills tags visible', () => {
    const { getByText } = render(<ResumeTemplateRenderer state={resumeWith({ template: 'navy' })} />);
    expect(getByText('React')).toBeTruthy();
  });

  it('navy: experience company name visible', () => {
    const { getByText } = render(<ResumeTemplateRenderer state={resumeWith({ template: 'navy' })} />);
    expect(getByText('TechFlow Solutions')).toBeTruthy();
  });

  it('navy: certifications visible', () => {
    const { getAllByText } = render(<ResumeTemplateRenderer state={resumeWith({ template: 'navy' })} />);
    expect(getAllByText(/AWS Certified/i).length).toBeGreaterThan(0);
  });

  it('sidebar: languages in left column', () => {
    const { getByText } = render(<ResumeTemplateRenderer state={resumeWith({ template: 'sidebar' })} />);
    expect(getByText('English')).toBeTruthy();
  });

  it('tech: achievements section renders', () => {
    const { getAllByText } = render(<ResumeTemplateRenderer state={resumeWith({ template: 'tech' })} />);
    expect(getAllByText(/Outstanding/i).length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER — smoke + name
// ─────────────────────────────────────────────────────────────────────────────
describe('CoverLetterTemplates — smoke: all templates render', () => {
  ALL_TEMPLATES.forEach(template => {
    it(`${template} renders .pdf-sheet without crashing`, () => {
      const { container } = render(<CoverLetterTemplateRenderer state={clWith({ template })} />);
      expect(container.querySelector('.pdf-sheet')).toBeTruthy();
    });
  });
});

describe('CoverLetterTemplates — candidate name shown in every template', () => {
  const name = 'Priya Sharma';
  ALL_TEMPLATES.forEach(template => {
    it(`${template} shows name`, () => {
      const { getAllByText } = render(<CoverLetterTemplateRenderer state={{ ...clWith({ template }), name }} />);
      expect(getAllByText(name).length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER — body font
// ─────────────────────────────────────────────────────────────────────────────
describe('CoverLetterTemplates — body fontFamily on .pdf-sheet', () => {
  it('outfit font applied to navy pdf-sheet', () => {
    const { container } = render(<CoverLetterTemplateRenderer state={clWith({ template: 'navy', fontFamily: 'outfit' })} />);
    const sheet = container.querySelector('.pdf-sheet') as HTMLElement;
    expect(sheet.style.fontFamily).toContain('Outfit');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER — heading font in all templates
// ─────────────────────────────────────────────────────────────────────────────
describe('CoverLetterTemplates — headingFont applied to name heading', () => {
  ALL_TEMPLATES.forEach(template => {
    it(`${template}: headingFont=eb-garamond → EB Garamond in DOM`, () => {
      const { container } = render(
        <CoverLetterTemplateRenderer state={clWith({ template, headingFont: 'eb-garamond' })} />
      );
      const withFont = Array.from(container.querySelectorAll<HTMLElement>('[style]'))
        .filter(el => el.style.fontFamily?.includes('EB Garamond'));
      expect(withFont.length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER — showPhoto toggle
// ─────────────────────────────────────────────────────────────────────────────
describe('CoverLetterTemplates — showPhoto toggle', () => {
  const withAvatar = { ...DEFAULT_CL_STATE, avatar: '/profile_picture.jpg' };

  it('executive: img present when showPhoto=true', () => {
    const { container } = render(
      <CoverLetterTemplateRenderer state={{ ...withAvatar, layoutSettings: { ...withAvatar.layoutSettings, template: 'executive', showPhoto: true } }} />
    );
    expect(container.querySelector('img')).toBeTruthy();
  });

  it('executive: img absent when showPhoto=false', () => {
    const { container } = render(
      <CoverLetterTemplateRenderer state={{ ...withAvatar, layoutSettings: { ...withAvatar.layoutSettings, template: 'executive', showPhoto: false } }} />
    );
    expect(container.querySelector('img')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER — paragraph interpolation
// ─────────────────────────────────────────────────────────────────────────────
describe('CoverLetterTemplates — {{company}} / {{role}} interpolation', () => {
  const stateWithTokens: CoverLetterState = {
    ...DEFAULT_CL_STATE,
    companyName: 'TestCorp',
    jobTitle: 'Lead Engineer',
    p1: 'I am applying to {{company}} for the {{role}} role.',
    layoutSettings: { ...DEFAULT_CL_STATE.layoutSettings, template: 'navy' },
  };

  it('replaces {{company}} with companyName in navy', () => {
    const { getAllByText } = render(<CoverLetterTemplateRenderer state={stateWithTokens} />);
    expect(getAllByText(/TestCorp/).length).toBeGreaterThan(0);
  });

  it('replaces {{role}} with jobTitle in navy', () => {
    const { getAllByText } = render(<CoverLetterTemplateRenderer state={stateWithTokens} />);
    expect(getAllByText(/Lead Engineer/).length).toBeGreaterThan(0);
  });
});

// ─── COVER LETTER — highlights ───────────────────────────────────────────────
describe('CoverLetterTemplates — highlights render', () => {
  it('navy: renders highlight category', () => {
    const { getByText } = render(<CoverLetterTemplateRenderer state={clWith({ template: 'navy' })} />);
    expect(getByText('Frontend Engineering')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — bulletStyle customization
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — bulletStyle customization', () => {
  it('renders arrow bullet points in navy when bulletStyle="arrow"', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'navy', bulletStyle: 'arrow' })} />
    );
    expect(container.textContent).toContain('➤');
  });

  it('renders number bullet points in navy when bulletStyle="number"', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'navy', bulletStyle: 'number' })} />
    );
    expect(container.textContent).toContain('1.');
    expect(container.textContent).toContain('2.');
  });

  it('does not render bullet markers when bulletStyle="none"', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'navy', bulletStyle: 'none' })} />
    );
    expect(container.textContent).not.toContain('●');
    expect(container.textContent).not.toContain('➤');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — Work history and Certification links
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — work and certification links', () => {
  it('renders experience work link with correct href and data-href', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={DEFAULT_RESUME_STATE} />
    );
    // Find link for TechFlow Solutions
    const link = container.querySelector('a[href="https://techflow.example.com"]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('data-href')).toBe('https://techflow.example.com');
  });

  it('renders certification link with correct href and data-href', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={DEFAULT_RESUME_STATE} />
    );
    // Find link for AWS certification
    const link = container.querySelector('a[href="https://aws.amazon.com/verification"]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('data-href')).toBe('https://aws.amazon.com/verification');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — skillsStyle option (chips vs normal)
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — skillsStyle option', () => {
  it('renders skills as chips by default', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'navy', skillsStyle: 'chips' })} />
    );
    // Chips should have the inline-block styles
    const chip = container.querySelector('span.inline-block');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toBe('React');
  });

  it('renders skills as normal text when skillsStyle="normal"', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'navy', skillsStyle: 'normal' })} />
    );
    // Normal style shouldn't contain span.inline-block chips
    const chip = container.querySelector('span.inline-block');
    expect(chip).toBeNull();
    // It should render the entire comma-separated value
    expect(container.textContent).toContain('React, TypeScript, Node.js');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — BottomSections entry-level visibility (navy / serif via bottomProps)
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — BottomSections entry visibility', () => {
  it('navy: hides cert link when entry visibility.link=false', () => {
    const state: ResumeState = {
      ...DEFAULT_RESUME_STATE,
      layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: 'navy' },
      resumeCerts: [{
        title: 'Hidden Link Cert',
        desc: 'Test description',
        url: 'https://example.com/cert',
        visibility: { link: false },
      }],
    };
    const { container } = render(<ResumeTemplateRenderer state={state} />);
    expect(container.querySelector('a[href="https://example.com/cert"]')).toBeNull();
  });

  it('navy: hides language level when entry visibility.level=false', () => {
    const state: ResumeState = {
      ...DEFAULT_RESUME_STATE,
      layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: 'navy' },
      resumeLanguages: [{ name: 'French', level: 'Fluent', visibility: { level: false } }],
    };
    const { getByText, queryByText } = render(<ResumeTemplateRenderer state={state} />);
    expect(getByText('French')).toBeTruthy();
    expect(queryByText('Fluent')).toBeNull();
  });

  it('navy: cert multiline desc renders as bullet list', () => {
    const state: ResumeState = {
      ...DEFAULT_RESUME_STATE,
      layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: 'navy', bulletStyle: 'dash' },
      resumeCerts: [{
        title: 'Multi-line Cert',
        desc: 'First point\nSecond point',
      }],
    };
    const { container } = render(<ResumeTemplateRenderer state={state} />);
    expect(container.textContent).toContain('First point');
    expect(container.textContent).toContain('Second point');
    expect(container.textContent).toContain('—');
  });

  it('serif: hides achievement desc when entry visibility.desc=false', () => {
    const state: ResumeState = {
      ...DEFAULT_RESUME_STATE,
      layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: 'serif' },
      resumeAchievements: [{
        title: 'Visible Title Only',
        desc: 'Hidden achievement description',
        icon: 'star',
        visibility: { desc: false },
      }],
    };
    const { getByText, queryByText } = render(<ResumeTemplateRenderer state={state} />);
    expect(getByText('Visible Title Only')).toBeTruthy();
    expect(queryByText('Hidden achievement description')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUME — editable integration (SectionWrapper, entry settings, designer drag)
// ─────────────────────────────────────────────────────────────────────────────
describe('ResumeTemplates — editable integration', () => {
  it('navy: entry settings panel renders when gear is clicked', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'navy' })} isEditable />
    );
    const gearButtons = container.querySelectorAll('button[title="Settings"]');
    expect(gearButtons.length).toBeGreaterThan(0);
    fireEvent.click(gearButtons[0]);
    expect(container.textContent).toMatch(/Show Period|Show Company/);
  });

  it('navy: BottomSections Add entry buttons exist when isEditable', () => {
    const { container } = render(
      <ResumeTemplateRenderer
        state={resumeWith({ template: 'navy' })}
        isEditable
        onAddExperience={() => {}}
        onAddEducation={() => {}}
        onAddCert={() => {}}
        onAddAchievement={() => {}}
        onAddLanguage={() => {}}
      />
    );
    const addButtons = container.querySelectorAll(
      'button[title^="Add entry"], button[title="Add Skill"]'
    );
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('serif: SectionWrapper edit toolbar present when isEditable', () => {
    const { container } = render(
      <ResumeTemplateRenderer state={resumeWith({ template: 'serif' })} isEditable />
    );
    expect(container.querySelectorAll('.edit-only').length).toBeGreaterThan(0);
  });

  it('designer: draggable sections render when showLayoutBounds is true', () => {
    const { container } = render(
      <ResumeTemplateRenderer
        state={resumeWith({ template: 'designer', showLayoutBounds: true })}
        isEditable
      />
    );
    expect(container.querySelectorAll('.designer-column').length).toBe(2);
    expect(container.querySelector('[draggable="true"]')).toBeTruthy();
  });

  it('designer: custom column order renders sections in configured columns', () => {
    const { getByText, queryByText } = render(
      <ResumeTemplateRenderer
        state={resumeWith({
          template: 'designer',
          designerLeftSections: ['skills'],
          designerRightSections: ['experience'],
        })}
      />
    );
    const skillsHeading = getByText('Skills');
    const experienceHeading = getByText('Experience');
    const leftCol = skillsHeading.closest('.designer-column');
    const rightCol = experienceHeading.closest('.designer-column');
    expect(leftCol).toBeTruthy();
    expect(rightCol).toBeTruthy();
    expect(leftCol?.contains(skillsHeading)).toBe(true);
    expect(rightCol?.contains(experienceHeading)).toBe(true);
    expect(queryByText('Summary')).toBeNull();
  });
});


