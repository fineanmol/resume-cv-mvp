import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
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

    // Initially rendered in display mode (not contenteditable) — click to enter edit mode
    const displayEl = document.querySelector('[data-placeholder="Job Title"]') as HTMLElement;
    expect(displayEl).not.toBeNull();
    expect(displayEl.getAttribute('data-placeholder')).toBe('Job Title');

    act(() => { fireEvent.click(displayEl); });

    const el = document.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(el).not.toBeNull();
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

    // After blur + rerender, back in display mode — click to re-enter edit mode
    const displayEl2 = document.querySelector('[data-placeholder="Job Title"]') as HTMLElement;
    expect(displayEl2).not.toBeNull();

    act(() => { fireEvent.click(displayEl2); });

    const editEl = document.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(editEl).not.toBeNull();

    fireEvent.focus(editEl);
    expect(editEl.getAttribute('data-empty')).toBe('true');
    expect(editEl.textContent).toBe('');
  });
});
