import { describe, it, expect } from 'vitest';
import { renderResumeTemplate } from './helpers/renderResumeTemplate';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import type { ResumeState } from '../types';

const resumeWith = (patch: Partial<ResumeState['layoutSettings']>): ResumeState => ({
  ...DEFAULT_RESUME_STATE,
  layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: 'designer', ...patch },
});

const designerDefaults = () =>
  resumeWith({
    designerLeftSections: ['experience', 'education'],
    designerRightSections: ['summary', 'skills', 'achievements', 'certs', 'languages'],
  });

describe('DesignerTemplate — functional regression', () => {
  // ── Layout & CSS variables ────────────────────────────────────────────────

  it('sets --entry-gap CSS variable on the sheet', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ entrySpacing: 14 }),
      isEditable: false,
    });
    expect(container.querySelector('.pdf-sheet')?.style.getPropertyValue('--entry-gap')).toBe('14px');
  });

  it('sets --section-gap CSS variable on the sheet', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ sectionSpacing: 10 }),
      isEditable: false,
    });
    expect(container.querySelector('.pdf-sheet')?.style.getPropertyValue('--section-gap')).toBe('10px');
  });

  it('column gap is applied as grid gap on the column container', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ columnGap: 20 }),
      isEditable: false,
    });
    expect(container.querySelector('[data-testid="designer-column-grid"]')?.style.gap).toBe('20px');
  });

  // ── Two-column section placement ──────────────────────────────────────────

  it('renders experience in left column and skills in right column by default', async () => {
    const { container, getByText } = await renderResumeTemplate({
      state: designerDefaults(),
      isEditable: false,
    });
    const columns = container.querySelectorAll('.designer-column');
    const experienceHeading = getByText('Experience');
    const skillsHeading = getByText('Skills');
    expect(columns[0]?.contains(experienceHeading)).toBe(true);
    expect(columns[1]?.contains(skillsHeading)).toBe(true);
  });

  it('custom column assignment moves sections correctly', async () => {
    const { container, getByText } = await renderResumeTemplate({
      state: resumeWith({
        designerLeftSections: ['skills'],
        designerRightSections: ['experience'],
      }),
      isEditable: false,
    });
    const columns = container.querySelectorAll('.designer-column');
    const skillsHeading = getByText('Skills');
    const experienceHeading = getByText('Experience');
    expect(columns[0]?.contains(skillsHeading)).toBe(true);
    expect(columns[1]?.contains(experienceHeading)).toBe(true);
  });

  // ── Visibility toggles ────────────────────────────────────────────────────

  it('showSummaryBullets: false renders summary as paragraph not bullets', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ showSummaryBullets: false }),
      isEditable: false,
    });
    const summaryHeading = Array.from(container.querySelectorAll('h3')).find(
      (h) => h.textContent === 'Summary'
    );
    expect(summaryHeading).toBeTruthy();
    const summarySection = summaryHeading!.closest('section');
    expect(summarySection?.querySelector('ul')).toBeNull();
    expect(summarySection?.querySelector('p')?.textContent).toContain('Innovative and results-driven');
  });

  it('showLanguageLevel: false hides language proficiency bubbles', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ showLanguageLevel: false }),
      isEditable: false,
    });
    const languagesHeading = Array.from(container.querySelectorAll('h3')).find(
      (h) => h.textContent === 'Languages'
    );
    expect(languagesHeading).toBeTruthy();
    const languagesSection = languagesHeading!.closest('section');
    expect(languagesSection?.textContent).not.toMatch(/Native|Conversational/);
    const languageRows = languagesSection?.querySelectorAll('.flex.justify-between.items-start.gap-1');
    languageRows?.forEach((row) => {
      const levelParagraphs = row.querySelector('div')?.querySelectorAll('p') ?? [];
      expect(levelParagraphs.length).toBe(1);
    });
  });

  it('showProjectIcons: false hides project icons', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ showProjectIcons: false }),
      isEditable: false,
    });
    const projectsHeading = Array.from(container.querySelectorAll('h3')).find(
      (h) => h.textContent === 'Projects'
    );
    expect(projectsHeading).toBeTruthy();
    const projectsSection = projectsHeading!.closest('section');
    expect(projectsSection?.querySelectorAll('svg.w-3.h-3.shrink-0').length ?? 0).toBe(0);
  });

  // ── Header styles ─────────────────────────────────────────────────────────

  it('centered header style applies centering class', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ headerStyle: 'centered' }),
      isEditable: false,
    });
    const header = container.querySelector('header');
    expect(header).toBeTruthy();
    const className = header!.className;
    expect(className.includes('items-center') || className.includes('text-center')).toBe(true);
  });

  it('minimal header style renders without photo slot', async () => {
    const { container } = await renderResumeTemplate({
      state: resumeWith({ headerStyle: 'minimal', showPhoto: true }),
      isEditable: false,
    });
    const header = container.querySelector('header');
    expect(header).toBeTruthy();
    expect(header!.querySelector('[class*="group/avatar"]')).toBeNull();
    expect(header!.querySelector('img[alt="Jonathan Doe"]')).toBeNull();
  });

  // ── Photo container ───────────────────────────────────────────────────────

  it('avatar container does not have bg-slate-100 class when not editable', async () => {
    const { container } = await renderResumeTemplate({
      state: {
        ...DEFAULT_RESUME_STATE,
        avatar: '/test.jpg',
        layoutSettings: {
          ...DEFAULT_RESUME_STATE.layoutSettings,
          template: 'designer',
          headerStyle: 'left',
          showPhoto: true,
        },
      },
      isEditable: false,
    });
    expect(container.querySelector('[class*="group/avatar"]')).toBeNull();
    const avatarInner = container.querySelector('header img[alt="Jonathan Doe"]')?.parentElement;
    expect(avatarInner).toBeTruthy();
    expect(avatarInner!.className).not.toMatch(/\bbg-slate-100\b/);
  });
});
