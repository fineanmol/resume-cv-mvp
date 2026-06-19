/** DOM targets that should keep section/entry focus when clicked. */
export function shouldKeepEditorFocus(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest('.edit-only')) return true;
  if (target.closest('.group\\/section')) return true;
  if (target.closest('.group\\/item')) return true;
  if (target.closest('.header-active')) return true;
  return false;
}

export const EDITOR_CLEAR_FOCUS_EVENT = 'resume-editor-clear-focus';

export function dispatchClearEditorFocus(): void {
  document.dispatchEvent(new CustomEvent(EDITOR_CLEAR_FOCUS_EVENT));
}

/** Classes applied during in-editor focus that must not appear in PDF output. */
export const EDITOR_FOCUS_CLASSES = [
  'has-active-section',
  'has-active-item',
  'section-active',
  'item-active',
  'header-active',
] as const;

export function stripEditorFocusClasses(root: HTMLElement): void {
  EDITOR_FOCUS_CLASSES.forEach((cls) => root.classList.remove(cls));
  root.querySelectorAll('*').forEach((el) => {
    EDITOR_FOCUS_CLASSES.forEach((cls) => el.classList.remove(cls));
  });
}
