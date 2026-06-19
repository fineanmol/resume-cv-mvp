import type { KeyboardEvent } from 'react';

export function normalizeBulletText(text: string): string {
  return text.replace(/\u200B/g, '').replace(/\n/g, '');
}

export function isBulletEmpty(text: string): boolean {
  return normalizeBulletText(text).length === 0;
}

export function parseEditableBullets(value: string): string[] {
  const lines = value ? value.split('\n') : [''];
  return lines.length ? lines : [''];
}

export function getContentEditableCursorOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return element.textContent?.length ?? 0;
  }

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) {
    return element.textContent?.length ?? 0;
  }

  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}

export function focusBulletElement(
  prefixId: string,
  bIdx: number,
  position: 'start' | 'end' = 'start',
): void {
  setTimeout(() => {
    const el = document.querySelector(
      `[data-bullet-id="${prefixId}-${bIdx}"]`,
    ) as HTMLInputElement | HTMLElement | null;
    if (!el) return;

    el.focus();

    if (el instanceof HTMLInputElement) {
      const pos = position === 'end' ? el.value.length : 0;
      el.setSelectionRange(pos, pos);
      return;
    }

    const range = document.createRange();
    const sel = window.getSelection();
    if (position === 'end' && el.childNodes.length > 0) {
      range.selectNodeContents(el);
      range.collapse(false);
    } else {
      range.setStart(el, 0);
      range.collapse(true);
    }
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, 0);
}

export function handleBulletEnterKey(options: {
  bullets: string[];
  bIdx: number;
  text: string;
  cursorPos: number;
  onChange: (value: string) => void;
  prefixId: string;
}): void {
  const { bullets, bIdx, text, cursorPos, onChange, prefixId } = options;
  const textBefore = text.substring(0, cursorPos);
  const textAfter = text.substring(cursorPos);
  const updated = [...bullets];
  updated[bIdx] = textBefore;
  updated.splice(bIdx + 1, 0, textAfter);
  onChange(updated.join('\n'));
  focusBulletElement(prefixId, bIdx + 1, 'start');
}

export function handleBulletBackspaceKey(options: {
  bullets: string[];
  bIdx: number;
  text: string;
  cursorPos?: number;
  onChange: (value: string) => void;
  prefixId: string;
}): boolean {
  const { bullets, bIdx, text, cursorPos = 0, onChange, prefixId } = options;
  const normalized = normalizeBulletText(text);

  // Merge into previous bullet when cursor is at start and current line has text
  if (cursorPos === 0 && normalized && bIdx > 0) {
    const updated = [...bullets];
    updated[bIdx - 1] = (updated[bIdx - 1] ?? '') + normalized;
    updated.splice(bIdx, 1);
    onChange(updated.join('\n'));
    focusBulletElement(prefixId, bIdx - 1, 'end');
    return true;
  }

  if (!isBulletEmpty(text)) return false;
  if (bullets.length <= 1) return true;

  const updated = bullets.filter((_, i) => i !== bIdx);
  onChange(updated.join('\n'));
  focusBulletElement(prefixId, bIdx - 1, 'end');
  return true;
}

export function createInputBulletKeyDownHandler(options: {
  bullets: string[];
  bIdx: number;
  prefixId: string;
  onChange: (value: string) => void;
}) {
  const { bullets, bIdx, prefixId, onChange } = options;

  return (e: KeyboardEvent<HTMLInputElement>) => {
    const bullet = bullets[bIdx] ?? '';

    if (e.key === 'Enter') {
      e.preventDefault();
      const inputEl = e.currentTarget;
      const start = inputEl.selectionStart ?? bullet.length;
      handleBulletEnterKey({
        bullets,
        bIdx,
        text: bullet,
        cursorPos: start,
        onChange,
        prefixId,
      });
      return;
    }

    if (e.key === 'Backspace') {
      const inputEl = e.currentTarget;
      const start = inputEl.selectionStart ?? 0;
      if (handleBulletBackspaceKey({
        bullets,
        bIdx,
        text: bullet,
        cursorPos: start,
        onChange,
        prefixId,
      })) {
        e.preventDefault();
      }
    }
  };
}

export function createContentEditableBulletKeyDownHandler(options: {
  bullets: string[];
  bIdx: number;
  prefixId: string;
  onChange: (value: string) => void;
}) {
  const { bullets, bIdx, prefixId, onChange } = options;

  return (e: KeyboardEvent<HTMLElement>) => {
    const text = e.currentTarget.textContent ?? '';

    if (e.key === 'Enter') {
      e.preventDefault();
      const cursorPos = getContentEditableCursorOffset(e.currentTarget);
      handleBulletEnterKey({
        bullets,
        bIdx,
        text,
        cursorPos,
        onChange,
        prefixId,
      });
      return;
    }

    if (e.key === 'Backspace') {
      const cursorPos = getContentEditableCursorOffset(e.currentTarget);
      const text = e.currentTarget.textContent ?? '';
      if (handleBulletBackspaceKey({
        bullets,
        bIdx,
        text,
        cursorPos,
        onChange,
        prefixId,
      })) {
        e.preventDefault();
      }
    }
  };
}
