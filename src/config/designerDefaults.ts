import type { LayoutSettings } from '../types';

/**
 * Figma-matched default styles for the Designer template.
 * Used both as the initial layout settings for new resumes
 * and as the target when the user clicks "Reset to defaults".
 *
 * Only style/typography/spacing fields are included here —
 * visibility toggles (showPhoto, showLinkedin, etc.) are
 * intentionally omitted so they survive a style reset.
 */
export const DESIGNER_STYLE_DEFAULTS: Partial<LayoutSettings> = {
  template:         'designer',
  brandColor:       '#343334',
  accentColor2:     '#00B6CB',
  fontFamily:       'open-sans',
  headingFont:      'raleway',
  titleFont:        'raleway',
  accentFont:       'open-sans',
  fontSize:         10,
  paddingTopBottom: 10,
  paddingLeftRight: 10,
  sectionSpacing:   8,
  lineHeight:       1.35,
  columnGap:        16,
  entrySpacing:     12,
  bulletStyle:      'disc',
  skillsStyle:      'chips',
  summaryAlign:     'justify',
  experienceAlign:  'left',
  educationAlign:   'left',
  certsAlign:       'left',
  achievementsAlign:'left',
  bodyTextColor:    '#3E3E3E',
  titleColor:       '#343334',
  headerStyle:      'left',
};
