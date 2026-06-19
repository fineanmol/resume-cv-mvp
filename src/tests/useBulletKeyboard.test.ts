import { describe, it, expect } from 'vitest';
import {
  parseEditableBullets,
  handleBulletEnterKey,
  handleBulletBackspaceKey,
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
});
