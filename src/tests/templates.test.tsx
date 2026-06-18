import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplates';
import { CoverLetterTemplateRenderer } from '../templates/CoverLetterTemplates';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';

describe('Templates Inline Editing', () => {
  it('renders ResumeTemplateRenderer in edit mode and triggers field change callback on blur', () => {
    const mockFieldChange = vi.fn();
    const mockExperienceChange = vi.fn();

    render(
      <ResumeTemplateRenderer
        state={DEFAULT_RESUME_STATE}
        isEditable={true}
        onFieldChange={mockFieldChange}
        onExperienceChange={mockExperienceChange}
      />
    );

    // Locate name header
    const nameHeader = screen.getByText(DEFAULT_RESUME_STATE.name);
    expect(nameHeader).toBeInTheDocument();
    expect(nameHeader).toHaveAttribute('contenteditable', 'true');

    // Simulate edit & blur
    nameHeader.textContent = 'New Name';
    fireEvent.blur(nameHeader);

    expect(mockFieldChange).toHaveBeenCalledWith('name', 'New Name');
  });

  it('renders CoverLetterTemplateRenderer in edit mode and triggers paragraph change callback on blur', () => {
    const mockFieldChange = vi.fn();

    render(
      <CoverLetterTemplateRenderer
        state={DEFAULT_CL_STATE}
        isEditable={true}
        onFieldChange={mockFieldChange}
      />
    );

    // Locate salutation
    const sal = screen.getByText(DEFAULT_CL_STATE.salutation);
    expect(sal).toBeInTheDocument();
    expect(sal).toHaveAttribute('contenteditable', 'true');

    // Edit and blur
    sal.textContent = 'Dear Hiring Manager,';
    fireEvent.blur(sal);

    expect(mockFieldChange).toHaveBeenCalledWith('salutation', 'Dear Hiring Manager,');
  });
});
