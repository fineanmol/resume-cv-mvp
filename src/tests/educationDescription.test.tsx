import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EducationDescription } from '../templates/shared/EducationDescription';
import { mergeEducationBullets } from '../templates/shared/parseEducationGrade';
import { renderResumeTemplate } from './helpers/renderResumeTemplate';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';

describe('mergeEducationBullets', () => {
  it('preserves GPA lines when updating coursework bullets', () => {
    const original = 'GPA: 3.8\nRelevant coursework';
    expect(mergeEducationBullets(original, 'Honors program\nDean\'s list')).toBe(
      'GPA: 3.8\nHonors program\nDean\'s list',
    );
  });
});

describe('EducationDescription', () => {
  it('always renders editable bullet rows (not plain paragraph)', () => {
    render(
      <EducationDescription
        bullets="GPA: 3.8"
        isEditable
        editableClass="editable"
        onBulletChange={vi.fn()}
        prefixId="edu-0"
      />,
    );
    expect(screen.getByRole('list')).toBeTruthy();
    expect(document.querySelector('[data-bullet-id="edu-0-0"]')).toBeTruthy();
  });

  it('split GPA mode merges prefix lines on change', () => {
    const onBulletChange = vi.fn();
    render(
      <EducationDescription
        bullets={'GPA: 3.8\nCoursework A'}
        isEditable
        editableClass="editable"
        onBulletChange={onBulletChange}
        prefixId="edu-0"
        splitGpa
      />,
    );
    const bullet = document.querySelector('[data-bullet-id="edu-0-0"]') as HTMLElement;
    fireEvent.keyDown(bullet, { key: 'Enter' });
    expect(onBulletChange).toHaveBeenCalledTimes(1);
    const merged = onBulletChange.mock.calls[0][0] as string;
    expect(merged.startsWith('GPA: 3.8')).toBe(true);
    expect(merged).toContain('Coursework A');
    expect(merged.split('\n').length).toBeGreaterThan(2);
  });
});

describe('ResumeTemplates — education canvas uses BulletList enter handling', () => {
  it('executive education description supports bullet enter key', async () => {
    const onEducationChange = vi.fn();
    const state = {
      ...DEFAULT_RESUME_STATE,
      layoutSettings: { ...DEFAULT_RESUME_STATE.layoutSettings, template: 'executive' as const },
      resumeEducation: [
        {
          ...DEFAULT_RESUME_STATE.resumeEducation[0],
          bullets: 'Graduated with Honors',
        },
      ],
    };

    await renderResumeTemplate({
      state,
      isEditable: true,
      onEducationChange,
    });

    const bullet = document.querySelector('[data-bullet-id="edu-0-0"]') as HTMLElement;
    expect(bullet).toBeTruthy();
    expect(bullet.getAttribute('contenteditable')).toBe('true');

    fireEvent.keyDown(bullet, { key: 'Enter', preventDefault: vi.fn() });
    expect(onEducationChange).toHaveBeenCalledWith(0, 'bullets', 'Graduated with Honors\n');
  });
});
