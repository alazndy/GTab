
export enum Category {
  SOCIAL = 'Sosyal',
  WORK = 'İş',
  DEV = 'Geliştirme',
  ENTERTAINMENT = 'Eğlence',
  SHOPPING = 'Alışveriş',
  APPS = 'Uygulamalar',
  OTHER = 'Diğer'
}

export type IconType = 'favicon' | 'lucide' | 'image';

export interface ShortcutProfile {
  id: string;
  name: string;
  url?: string;
  avatarColor?: string;
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  category: Category;
  iconType?: IconType;
  iconValue?: string;
  profiles?: ShortcutProfile[];
  defaultProfileId?: string;
  isFolder?: boolean;
  children?: Shortcut[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface WeatherData {
  temp: number;
  condition: string;
  city: string;
}

export type ShortcutPayload = Omit<Shortcut, 'id'>;

export type WidgetId = 'clock' | 'search' | 'categories' | 'shortcuts' | 'tasks';

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  order: number;
  widthPx?: number;
  heightPx?: number;
  glassEffect?: boolean;
  opacity?: number; // Background opacity
  borderOpacity?: number; // Area frame opacity
  showBorder?: boolean; // Toggle area frame
}

export type BackgroundType = 'image' | 'color' | 'random' | 'theme';

export type ThemeId = 'default' | 'neon' | 'starship' | 'terminal' | 'portal' | 'custom';

export interface CustomThemeConfig {
  wrapperBg: string;
  overlayBg: string;
  accentColor: string;
  glassBorder: string;
  glassBg: string;
  menuBg: string;
  menuBorder: string;
  textColor: string;
}

export interface BackgroundConfig {
  type: BackgroundType;
  value: string;
  customTheme?: CustomThemeConfig;
}

export type TimeFormat = '12h' | '24h';
export type DateFormat = 'full' | 'long' | 'medium' | 'short' | 'hidden';

export interface ClockConfig {
  format: TimeFormat;
  showSeconds: boolean;
  showDate: boolean;
  fontFamily?: FontFamily;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export type CardShape = 'sharp' | 'rounded' | 'pill';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';
export type CardAlignment = 'left' | 'center' | 'right';
export type FontFamily = 'geist' | 'system' | 'mono' | 'serif';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CardConfig {
  bgOpacity: number;
  shape: CardShape;
  size: CardSize;
  alignment: CardAlignment;
  font: FontFamily;
  iconSize: IconSize;
  cardWidth?: number;
  glowEnabled?: boolean;
  gridGap?: number; // Space between cards
}
