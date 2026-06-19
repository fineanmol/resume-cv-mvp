import { normalizeBulletText } from '../hooks/useBulletKeyboard';

/** Normalize contenteditable text for save / empty checks (strips ZWSP, newlines). */
export function normalizeEditableText(text: string): string {
  return normalizeBulletText(text);
}

export function isEditableEmpty(text: string): boolean {
  return normalizeEditableText(text).length === 0;
}

/** Clear browser artifacts (<br>, ZWSP) so placeholder CSS and saves stay consistent. */
export function clearEditableIfEmpty(element: HTMLElement): boolean {
  const empty = isEditableEmpty(element.textContent ?? '');
  if (empty) {
    element.innerHTML = '';
  }
  return empty;
}
