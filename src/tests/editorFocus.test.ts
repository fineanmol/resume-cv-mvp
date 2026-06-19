import { describe, it, expect } from 'vitest';
import {
  shouldKeepEditorFocus,
  stripEditorFocusClasses,
  EDITOR_FOCUS_CLASSES,
} from '../utils/editorFocus';

describe('editorFocus', () => {
  describe('shouldKeepEditorFocus', () => {
    it('returns true for section and item wrappers', () => {
      const section = document.createElement('div');
      section.className = 'group/section';
      const inner = document.createElement('span');
      section.appendChild(inner);
      document.body.appendChild(section);

      expect(shouldKeepEditorFocus(inner)).toBe(true);

      const item = document.createElement('div');
      item.className = 'group/item';
      const itemInner = document.createElement('span');
      item.appendChild(itemInner);
      document.body.appendChild(item);

      expect(shouldKeepEditorFocus(itemInner)).toBe(true);

      section.remove();
      item.remove();
    });

    it('returns true for edit-only chrome', () => {
      const toolbar = document.createElement('div');
      toolbar.className = 'edit-only';
      document.body.appendChild(toolbar);
      expect(shouldKeepEditorFocus(toolbar)).toBe(true);
      toolbar.remove();
    });

    it('returns false for unrelated targets', () => {
      const sidebar = document.createElement('aside');
      document.body.appendChild(sidebar);
      expect(shouldKeepEditorFocus(sidebar)).toBe(false);
      sidebar.remove();
    });
  });

  describe('stripEditorFocusClasses', () => {
    it('removes all editor focus classes from root and descendants', () => {
      const root = document.createElement('div');
      root.className = 'pdf-sheet has-active-section';
      const child = document.createElement('div');
      child.className = 'group/section section-active';
      root.appendChild(child);

      stripEditorFocusClasses(root);

      expect(root.classList.contains('has-active-section')).toBe(false);
      EDITOR_FOCUS_CLASSES.forEach((cls) => {
        expect(child.classList.contains(cls)).toBe(false);
      });
    });
  });
});
