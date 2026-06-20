import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreviewPageBreaks } from '../hooks/usePreviewPageBreaks';

function mockDomRect(values: Partial<DOMRect>): DOMRect {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    toJSON: () => ({}),
    ...values,
  } as DOMRect;
}

describe('usePreviewPageBreaks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        disconnect = vi.fn();
        constructor(_cb: ResizeObserverCallback) {}
      },
    );
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ marginTop: '0px' }) as CSSStyleDeclaration,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('does not throw when sheet is null', () => {
    const { unmount } = renderHook(() => usePreviewPageBreaks(null, 1));
    expect(() => unmount()).not.toThrow();
  });

  it('applies data-pb-push margin when an item crosses a page boundary', () => {
    const sheet = document.createElement('div');
    sheet.className = 'pdf-sheet';
    const item = document.createElement('div');
    item.className = 'group/item';
    sheet.appendChild(item);
    document.body.appendChild(sheet);

    vi.spyOn(sheet, 'getBoundingClientRect').mockReturnValue(
      mockDomRect({ top: 0, left: 0, right: 794, bottom: 2000, width: 794, height: 2000 }),
    );
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(
      mockDomRect({ top: 1100, left: 0, right: 794, bottom: 1200, width: 794, height: 100, y: 1100 }),
    );

    renderHook(() => usePreviewPageBreaks(sheet, 1));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(item.getAttribute('data-pb-push')).toBe('true');
    expect(item.style.marginTop).toBe('39px');
  });

  it('resets margins and push attributes on unmount', () => {
    const sheet = document.createElement('div');
    sheet.className = 'pdf-sheet';
    const item = document.createElement('div');
    item.className = 'group/item';
    item.style.marginTop = '8px';
    sheet.appendChild(item);
    document.body.appendChild(sheet);

    vi.spyOn(sheet, 'getBoundingClientRect').mockReturnValue(
      mockDomRect({ top: 0, left: 0, right: 794, bottom: 2000, width: 794, height: 2000 }),
    );
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(
      mockDomRect({ top: 1100, left: 0, right: 794, bottom: 1200, width: 794, height: 100, y: 1100 }),
    );

    const { unmount } = renderHook(() => usePreviewPageBreaks(sheet, 1));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(item.getAttribute('data-pb-push')).toBe('true');

    unmount();

    expect(item.getAttribute('data-pb-push')).toBeNull();
    expect(item.getAttribute('data-pb-orig')).toBeNull();
    expect(item.style.marginTop).toBe('8px');
  });
});
