import type {LayoutSettings} from '../types';
type Control={key:keyof LayoutSettings;label:string};
/** Shared by the canvas toolbar and sidebar. Unsupported controls must be omitted here. */
export const SECTION_CONTROLS:Record<string,Control[]>={
 experience:[{key:'showExperienceDates',label:'Dates'},{key:'showExperienceCompany',label:'Company'},{key:'showExperienceLocation',label:'Location'},{key:'showExperienceLogo',label:'Logo'}],
 education:[{key:'showEducationDates',label:'Dates'},{key:'showEducationLocation',label:'Location'},{key:'showEducationGpa',label:'GPA'},{key:'showEducationLogo',label:'Logo'}],
 summary:[{key:'showSummaryBullets',label:'Show Bullets'}],
 certs:[{key:'showProjectIcons',label:'Show Icons'},{key:'showProjectDesc',label:'Show Description'},{key:'showProjectBullets',label:'Show Bullets'}],
 achievements:[{key:'showAchievementIcons',label:'Show Icons'},{key:'showAchievementDesc',label:'Show Description'},{key:'showAchievementBullets',label:'Show Bullets'}],
 languages:[{key:'showLanguageLevel',label:'Proficiency'}],
};
export function sectionControls(section:string,_template:LayoutSettings['template']){
 return SECTION_CONTROLS[section]||[];
}
