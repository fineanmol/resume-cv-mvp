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

export function getContentEditableText(element: HTMLElement): string {
  return normalizeBulletText(element.textContent ?? '');
}

export function getContentEditableCursorOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  const textLen = getContentEditableText(element).length;

  if (!selection || selection.rangeCount === 0) {
    return textLen;
  }

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) {
    return textLen;
  }

  // Caret after trailing <br> or at end of element node
  if (range.startContainer === element) {
    let offset = 0;
    const limit = Math.min(range.startOffset, element.childNodes.length);
    for (let i = 0; i < limit; i++) {
      offset += normalizeBulletText(element.childNodes[i].textContent ?? '').length;
    }
    return Math.min(offset, textLen);
  }

  if (range.startContainer.nodeName === 'BR') {
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEndBefore(range.startContainer);
    return normalizeBulletText(preRange.toString()).length;
  }

  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.startContainer, range.startOffset);
  return Math.min(normalizeBulletText(preRange.toString()).length, textLen);
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
  setTimeout(() => {
    requestAnimationFrame(() => {
      applyFocus();
      // Retry once if the new bullet row wasn't mounted yet
      requestAnimationFrame(applyFocus);
    });
  }, 0);
}

export function handleBulletEnterKey(options: {
  bullets: string[];
  bIdx: number;
  text: string;
  cursorPos: number;
  onChange: (value: string) => void;
  prefixId: string;
  onFocusNext?: (nextIdx: number) => void;
}): void {
  const { bullets, bIdx, text, cursorPos, onChange, prefixId, onFocusNext } = options;
  const normalizedText = normalizeBulletText(text);
  const safeCursor = Math.min(Math.max(0, cursorPos), normalizedText.length);
  const textBefore = normalizedText.substring(0, safeCursor);
  const textAfter = normalizedText.substring(safeCursor);

  const updated = [...bullets];
  while (updated.length <= bIdx) updated.push('');
  updated[bIdx] = textBefore;
  updated.splice(bIdx + 1, 0, textAfter);
  onChange(updated.join('\n'));
  if (onFocusNext) {
    onFocusNext(bIdx + 1);
  } else {
    focusBulletElement(prefixId, bIdx + 1, 'start');
  }
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
  onEnter?: (nextIdx: number) => void;
}) {
  const { bullets, bIdx, prefixId, onChange, onEnter } = options;

  return (e: KeyboardEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const text = getContentEditableText(el);

    if (e.key === 'Enter') {
      e.preventDefault();
      let cursorPos = getContentEditableCursorOffset(el);
      const sel = window.getSelection();
      // When selection API is unavailable (tests) or ambiguous, default Enter to end-of-line split.
      if (text.length > 0 && cursorPos === 0 && (!sel || sel.rangeCount === 0)) {
        cursorPos = text.length;
      }
      handleBulletEnterKey({
        bullets,
        bIdx,
        text,
        cursorPos,
        onChange,
        prefixId,
        onFocusNext: onEnter,
      });
      return;
    }

    if (e.key === 'Backspace') {
      const cursorPos = getContentEditableCursorOffset(el);
      const backspaceText = getContentEditableText(el);
      if (handleBulletBackspaceKey({
        bullets,
        bIdx,
        text: backspaceText,
        cursorPos,
        onChange,
        prefixId,
      })) {
        e.preventDefault();
      }
    }
  };
}
