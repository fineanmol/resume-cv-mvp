import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { EditableText } from '../templates/shared/EditableText';

describe('EditableText placeholders', () => {
  it('shows section placeholder when an emptied field is re-focused', () => {
    const onSave = vi.fn();
    const { rerender } = render(
      <div className="pdf-sheet">
        <EditableText
          field="experience.title"
          value="Software Engineer"
          isEditable
          editableClass="editable"
          onSave={onSave}
        />
      </div>,
    );

    const el = document.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(el.getAttribute('data-placeholder')).toBe('Job Title');

    el.textContent = '';
    fireEvent.input(el);
    fireEvent.blur(el);

    expect(onSave).toHaveBeenCalledWith('');

    rerender(
      <div className="pdf-sheet">
        <EditableText
          field="experience.title"
          value=""
          isEditable
          editableClass="editable"
          onSave={onSave}
        />
      </div>,
    );

    fireEvent.focus(el);
    expect(el.getAttribute('data-empty')).toBe('true');
    expect(el.textContent).toBe('');
  });
});
