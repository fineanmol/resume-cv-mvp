import type { CustomContactField, HeaderStyle, LayoutSettings } from '../../types';

export interface EditField {
  value: string;
  onSave: (v: string) => void;
}

export interface TemplateHeaderProps {
  name: EditField;
  subtitle: EditField;
  phone: EditField;
  email: EditField;
  location: EditField;
  linkedin: EditField;
  avatar: string;
  showAvatar: boolean;
  brandColor: string;
  headingFontCss: string;
  headerStyle: HeaderStyle;
  isEditable: boolean;
  ec: string;
  sectionSpacing: number;
  layoutSettings?: LayoutSettings;
  onLayoutSettingsChange?: (settings: Partial<LayoutSettings>) => void;
  onAvatarChange?: (url: string) => void;
  isActive?: boolean;
  onSelect?: () => void;
  customContacts?: CustomContactField[];
}
