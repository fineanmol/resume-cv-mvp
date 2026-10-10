export type SkillGroup = { category: string; items: string[] };
/** Flat skills are authoritative; preserve categories and collect uncategorized additions. */
export function reconcileGroups(value: string, groups: SkillGroup[] = []) {
  const remaining = new Set(value.split(/[,·\n]/).map(s => s.trim()).filter(Boolean));
  const result = groups.map(g => ({category: g.category, items: g.items.filter(s => remaining.delete(s))}));
  if (remaining.size) {
    const extra=result.find(g=>g.category==='Additional skills');
    if(extra)extra.items.push(...remaining);
    else result.push({category: result.length ? 'Additional skills' : 'Core skills', items: [...remaining]});
  }
  return result;
}
