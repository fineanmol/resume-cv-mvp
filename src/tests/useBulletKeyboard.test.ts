import { describe, it, expect } from 'vitest';
import {
  parseEditableBullets,
  handleBulletEnterKey,
  handleBulletBackspaceKey,
  setContentEditableCaret,
  getContentEditableCursorOffset,
} from '../hooks/useBulletKeyboard';

describe('useBulletKeyboard', () => {
  describe('parseEditableBullets', () => {
    it('returns a single empty line for empty value', () => {
      expect(parseEditableBullets('')).toEqual(['']);
    });

    it('splits on newlines without trimming or filtering', () => {
      expect(parseEditableBullets('Line one\nLine two')).toEqual(['Line one', 'Line two']);
      expect(parseEditableBullets('Line one\n')).toEqual(['Line one', '']);
    });
  });

  describe('handleBulletEnterKey', () => {
    it('splits the current bullet at the cursor', () => {
      let result = '';
      handleBulletEnterKey({
        bullets: ['Hello world'],
        bIdx: 0,
        text: 'Hello world',
        cursorPos: 5,
        onChange: (value) => { result = value; },
        prefixId: 'test',
      });
      expect(result).toBe('Hello\n world');
    });

    it('appends a new empty bullet when enter is pressed at end of line', () => {
      let result = '';
      handleBulletEnterKey({
        bullets: ['Hello world'],
        bIdx: 0,
        text: 'Hello world',
        cursorPos: 11,
        onChange: (value) => { result = value; },
        prefixId: 'test',
      });
      expect(result).toBe('Hello world\n');
    });
  });

  describe('handleBulletBackspaceKey', () => {
    it('removes an empty bullet and keeps at least one line', () => {
      let result = '';
      const handled = handleBulletBackspaceKey({
        bullets: ['First', ''],
        bIdx: 1,
        text: '',
        onChange: (value) => { result = value; },
        prefixId: 'test',
      });
      expect(handled).toBe(true);
      expect(result).toBe('First');
    });

    it('does not remove the last remaining bullet', () => {
      let result = 'unchanged';
      const handled = handleBulletBackspaceKey({
        bullets: [''],
        bIdx: 0,
        text: '',
        onChange: (value) => { result = value; },
        prefixId: 'test',
      });
      expect(handled).toBe(true);
      expect(result).toBe('unchanged');
    });

    it('merges text into the previous bullet when backspace is pressed at the start', () => {
      let result = '';
      const handled = handleBulletBackspaceKey({
        bullets: ['First line', 'Second'],
        bIdx: 1,
        text: 'Second',
        cursorPos: 0,
        onChange: (value) => { result = value; },
        prefixId: 'test',
      });
      expect(handled).toBe(true);
      expect(result).toBe('First lineSecond');
    });

    it('ignores backspace when the bullet has text and cursor is not at start', () => {
      let result = 'unchanged';
      const handled = handleBulletBackspaceKey({
        bullets: ['Hello'],
        bIdx: 0,
        text: 'Hello',
        onChange: (value) => { result = value; },
        prefixId: 'test',
      });
      expect(handled).toBe(false);
      expect(result).toBe('unchanged');
    });
  });

  describe('getContentEditableCursorOffset', () => {
    it('returns full text length when caret is after a trailing br', () => {
      const el = document.createElement('span');
      el.appendChild(document.createTextNode('Hello'));
      el.appendChild(document.createElement('br'));
      document.body.appendChild(el);

      const range = document.createRange();
      range.setStart(el, 2);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      expect(getContentEditableCursorOffset(el)).toBe(5);

      el.remove();
    });
  });

  describe('setContentEditableCaret', () => {
    it('places the caret at the requested character offset', () => {
      const el = document.createElement('span');
      el.textContent = 'FirstSecond';
      document.body.appendChild(el);

      setContentEditableCaret(el, 5);

      const sel = window.getSelection();
      expect(sel?.rangeCount).toBe(1);
      expect(sel?.getRangeAt(0).startOffset).toBe(5);

      el.remove();
    });
  });
});
