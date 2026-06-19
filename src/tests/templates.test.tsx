import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
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

const ALL_TEMPLATES: TemplateId[] = ['navy', 'serif', 'sidebar', 'tech', 'ats', 'executive'];

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
  (['inter', 'outfit', 'merriweather', 'fira'] as const).forEach(font => {
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
    it(`${template}: headingFont=merriweather → Merriweather in DOM`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={resumeWith({ template, headingFont: 'merriweather' })} />
      );
      const withFont = Array.from(container.querySelectorAll<HTMLElement>('[style]'))
        .filter(el => el.style.fontFamily?.includes('Merriweather'));
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
  const photoTemplates: TemplateId[] = ['sidebar', 'executive'];

  photoTemplates.forEach(template => {
    it(`${template}: img present when showPhoto=true`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={{ ...withPhoto, layoutSettings: { ...withPhoto.layoutSettings, template, showPhoto: true } }} />
      );
      expect(container.querySelector('img')).toBeTruthy();
    });

    it(`${template}: img absent when showPhoto=false`, () => {
      const { container } = render(
        <ResumeTemplateRenderer state={{ ...withPhoto, layoutSettings: { ...withPhoto.layoutSettings, template, showPhoto: false } }} />
      );
      expect(container.querySelector('img')).toBeNull();
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
    it(`${template}: headingFont=merriweather → Merriweather in DOM`, () => {
      const { container } = render(
        <CoverLetterTemplateRenderer state={clWith({ template, headingFont: 'merriweather' })} />
      );
      const withFont = Array.from(container.querySelectorAll<HTMLElement>('[style]'))
        .filter(el => el.style.fontFamily?.includes('Merriweather'));
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

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER — highlights
// ─────────────────────────────────────────────────────────────────────────────
describe('CoverLetterTemplates — highlights render', () => {
  it('navy: renders highlight category', () => {
    const { getByText } = render(<CoverLetterTemplateRenderer state={clWith({ template: 'navy' })} />);
    expect(getByText('Frontend Engineering')).toBeTruthy();
  });
});
