/** All templates use SkillsEditor. Both settings surfaces consume this contract. */
export const SKILLS_LAYOUTS = [
 {value:'chips',label:'Chips',description:'Styled pill badges'},
 {value:'normal',label:'List',description:'Compact bulleted skills'},
 {value:'grid',label:'Grid',description:'Aligned, wrapping columns'},
 {value:'grouped',label:'Grouped',description:'Your categories and skills'},
] as const;
export const SKILL_ACTIONS = {
 chips:['add','edit','remove','enter','backspace','reorder'],
 normal:['add','edit','remove'],
 grid:['add','edit','remove','enter','backspace'],
 grouped:['add-category','rename-category','edit-items','remove-category','reorder-category'],
} as const;
