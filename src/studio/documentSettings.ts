import { z } from 'zod';
export const sectionKeys = ['summary','skills','experience','education','certs','achievements','languages'] as const;
export const designSchema = z.object({
  fontSize:z.number().min(9).max(16).default(11), lineHeight:z.number().min(1.1).max(1.8).default(1.3),
  fontFamily:z.enum(['inter','outfit','plus-jakarta','poppins','playfair','eb-garamond','lora','jetbrains-mono','raleway','open-sans']).default('open-sans'),
  headingFont:z.enum(['inter','outfit','plus-jakarta','poppins','playfair','eb-garamond','lora','jetbrains-mono','raleway','open-sans']).default('raleway'),
  brandColor:z.string().regex(/^#[a-fA-F0-9]{6}$/).default('#008f9e'),
  paddingTopBottom:z.number().min(6).max(25).default(10), paddingLeftRight:z.number().min(6).max(25).default(10),
  sectionSpacing:z.number().min(4).max(30).default(10), entrySpacing:z.number().min(2).max(24).default(8), columnGap:z.number().min(10).max(40).default(20),
  showPhoto:z.boolean().default(true), showPhone:z.boolean().default(true), showEmail:z.boolean().default(true), showLocation:z.boolean().default(true), showLinkedin:z.boolean().default(true), showTitle:z.boolean().default(true),
  photoShape:z.enum(['circle','rounded','square','squircle']).optional(),roundPhoto:z.boolean().optional(),uppercaseName:z.boolean().optional(),
  accentColor2:z.string().regex(/^#[a-fA-F0-9]{6}$/).optional(),bodyTextColor:z.string().regex(/^#[a-fA-F0-9]{6}$/).optional(),titleColor:z.string().regex(/^#[a-fA-F0-9]{6}$/).optional(),
  summaryAlign:z.enum(['left','center','right','justify']).optional(),experienceAlign:z.enum(['left','center','right','justify']).optional(),educationAlign:z.enum(['left','center','right','justify']).optional(),certsAlign:z.enum(['left','center','right','justify']).optional(),achievementsAlign:z.enum(['left','center','right','justify']).optional(),
  showAchievementIcons:z.boolean().default(true), showProjectIcons:z.boolean().default(true), showExperienceLogo:z.boolean().default(true), showEducationLogo:z.boolean().default(true),
  showExperienceDates:z.boolean().default(true), showExperienceLocation:z.boolean().default(true), showExperienceCompany:z.boolean().default(true), showEducationDates:z.boolean().default(true), showEducationLocation:z.boolean().default(true), showEducationGpa:z.boolean().default(true), showLanguageLevel:z.boolean().default(true),
  showAchievementDesc:z.boolean().default(true), showAchievementBullets:z.boolean().default(false), showProjectDesc:z.boolean().default(true), showProjectBullets:z.boolean().default(false), showSummaryBullets:z.boolean().default(false),
  headerStyle:z.enum(['centered','left','banner','minimal','enhancv']).default('left'),
  bulletStyle:z.enum(['disc','circle','square','dash','arrow','number','none']).default('disc'), skillsStyle:z.enum(['normal','chips','grid','grouped']).default('normal'),
  designerLeftSections:z.array(z.enum(sectionKeys)).default(['experience','education']), designerRightSections:z.array(z.enum(sectionKeys)).default(['summary','skills','achievements','certs','languages']),
});
export const documentSchema = z.object({pageLimit:z.enum(['1','2','auto']).default('1'), showIcons:z.boolean().default(true), hiddenSections:z.array(z.enum(sectionKeys)).default([]), layout:designSchema.default({})});
export const coverSchema = z.object({
  template:z.enum(['professional','navy','serif','sidebar','tech','ats','executive']).default('professional'),
  salutation:z.string().max(500).default('Dear Hiring Team,'),
  p1:z.string().max(12000).default('I am applying for the {{role}} position at {{company}}.'),
  p2:z.string().max(12000).default('{{summary}}'),
  p3:z.string().max(12000).default(''),
  p4:z.string().max(12000).default('Thank you for considering my application. I would welcome the opportunity to discuss my experience.'),
  highlights:z.array(z.object({category:z.string().max(300),text:z.string().max(3000)})).max(20).default([]),
  pageLimit:z.enum(['1','2','auto']).default('1'),layout:designSchema.default({}),
});
export const safeUrl=z.string().max(2000).refine(v=>!v||/^https?:\/\//i.test(v),'Use a complete https:// or http:// URL').optional();
