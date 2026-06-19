import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BulletList } from '../templates/shared/BulletList';

describe('BulletList', () => {
  it('creates a second bullet on Enter without blur overwriting the split', () => {
    const onBulletChange = vi.fn();
    render(
      <BulletList
        bullets="First achievement detail"
        isEditable
        editableClass="editable"
        onBulletChange={onBulletChange}
        prefixId="ach-0"
      />,
    );

    const bullet = document.querySelector('[data-bullet-id="ach-0-0"]') as HTMLElement;
    expect(bullet).toBeTruthy();

    fireEvent.keyDown(bullet, { key: 'Enter' });
    fireEvent.blur(bullet);

    expect(onBulletChange).toHaveBeenCalled();
    const lastCall = onBulletChange.mock.calls[onBulletChange.mock.calls.length - 1][0] as string;
    expect(lastCall.split('\n').length).toBeGreaterThan(1);
    expect(lastCall.startsWith('First achievement detail')).toBe(true);
  });

  it('renders and focuses the next bullet row after parent updates from Enter', () => {
    let bullets = 'Gained expertise in architecting secure systems';
    const onBulletChange = vi.fn((next: string) => {
      bullets = next;
    });

    const { rerender } = render(
      <BulletList
        bullets={bullets}
        isEditable
        editableClass="editable"
        onBulletChange={onBulletChange}
        prefixId="ach-0"
      />,
    );

    const first = document.querySelector('[data-bullet-id="ach-0-0"]') as HTMLElement;
    first.focus();
    fireEvent.keyDown(first, { key: 'Enter' });

    expect(onBulletChange).toHaveBeenCalled();
    const saved = onBulletChange.mock.calls[0][0] as string;
    expect(saved.split('\n').length).toBe(2);
    expect(saved.endsWith('\n') || saved.includes('\n')).toBe(true);

    rerender(
      <BulletList
        bullets={bullets}
        isEditable
        editableClass="editable"
        onBulletChange={onBulletChange}
        prefixId="ach-0"
      />,
    );

    const second = document.querySelector('[data-bullet-id="ach-0-1"]') as HTMLElement;
    expect(second).toBeTruthy();
    expect(document.activeElement).toBe(second);
  });

  it('shows section placeholder when an empty bullet is focused', () => {
    render(
      <div className="pdf-sheet">
        <BulletList
          bullets=""
          isEditable
          editableClass="editable"
          onBulletChange={vi.fn()}
          prefixId="ach-0"
          field="achievements.description"
        />
      </div>,
    );

    const bullet = document.querySelector('[data-bullet-id="ach-0-0"]') as HTMLElement;
    expect(bullet).toBeTruthy();
    expect(bullet.getAttribute('data-placeholder')).toBe('Impact / scale (e.g. Increased revenue by 30%)');
    expect(bullet.getAttribute('data-empty')).toBe('true');
    expect(bullet.textContent).toBe('\u200B');

    fireEvent.focus(bullet);
    expect(bullet.textContent).toBe('');
  });
});
