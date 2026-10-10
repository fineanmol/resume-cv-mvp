import { createContext } from 'react';
import type {SkillGroup} from '../../utils/skillGroups';
export {reconcileGroups, type SkillGroup} from '../../utils/skillGroups';
export const SkillGroupsContext = createContext<{groups: SkillGroup[]; save?: (groups: SkillGroup[]) => void}>({groups: []});
