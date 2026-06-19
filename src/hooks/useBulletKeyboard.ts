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

export function setContentEditableCaret(el: HTMLElement, offset: number): void {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  const maxOffset = el.textContent?.length ?? 0;
  const targetOffset = Math.max(0, Math.min(offset, maxOffset));

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let remaining = targetOffset;
  let textNode = walker.nextNode() as Text | null;

  if (!textNode) {
    range.setStart(el, 0);
    range.collapse(true);
  } else {
    let placed = false;
    while (textNode) {
      const len = textNode.length;
      if (remaining <= len) {
        range.setStart(textNode, remaining);
        range.collapse(true);
        placed = true;
        break;
      }
      remaining -= len;
      textNode = walker.nextNode() as Text | null;
    }
    if (!placed) {
      range.selectNodeContents(el);
      range.collapse(false);
    }
  }

  sel.removeAllRanges();
  sel.addRange(range);
}

export function focusBulletElement(
  prefixId: string,
  bIdx: number,
  caret: 'start' | 'end' | number = 'start',
): void {
  const applyFocus = () => {
    const el = document.querySelector(
      `[data-bullet-id="${prefixId}-${bIdx}"]`,
    ) as HTMLInputElement | HTMLElement | null;
    if (!el) return;

    el.focus();

    let offset: number;
    if (typeof caret === 'number') {
      offset = caret;
    } else if (caret === 'end') {
      offset = el instanceof HTMLInputElement
        ? el.value.length
        : (el.textContent?.length ?? 0);
    } else {
      offset = 0;
    }

    if (el instanceof HTMLInputElement) {
      const pos = Math.min(offset, el.value.length);
      el.setSelectionRange(pos, pos);
      return;
    }

    setContentEditableCaret(el, offset);
  };

  // Wait for React to commit remounted bullet rows after merge/delete
  setTimeout(() => requestAnimationFrame(applyFocus), 0);
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
    const prevText = bullets[bIdx - 1] ?? '';
    const mergeCaret = prevText.length;
    const updated = [...bullets];
    updated[bIdx - 1] = prevText + normalized;
    updated.splice(bIdx, 1);
    onChange(updated.join('\n'));
    focusBulletElement(prefixId, bIdx - 1, mergeCaret);
    return true;
  }

  if (!isBulletEmpty(text)) return false;
  if (bullets.length <= 1) return true;

  const mergeCaret = (bullets[bIdx - 1] ?? '').length;
  const updated = bullets.filter((_, i) => i !== bIdx);
  onChange(updated.join('\n'));
  focusBulletElement(prefixId, bIdx - 1, mergeCaret);
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
