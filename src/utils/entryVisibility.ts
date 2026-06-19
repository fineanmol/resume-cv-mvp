/** Per-entry field is visible when undefined or explicitly true. */
export function isEntryFieldVisible<T extends object>(
  visibility: T | undefined,
  field: keyof T
): boolean {
  if (!visibility) return true;
  return visibility[field] !== false;
}
