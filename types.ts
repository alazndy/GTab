
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
  name: string; // e.g. "Personal", "Work"
  url?: string; // Optional override URL (e.g. mail.google.com/u/1/)
  avatarColor?: string; // Tailwind color class
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  category: Category;
  
  // Customization
  iconType?: IconType;
  iconValue?: string; // URL for image, or Icon Name for Lucide
  
  // Profiles
  profiles?: ShortcutProfile[];
  defaultProfileId?: string; // ID of the default profile to use on main click
  
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
}

export type BackgroundType = 'image' | 'color' | 'random';

export interface BackgroundConfig {
  type: BackgroundType;
  value: string; // URL for image, Hex/RGBA for color
}

export type TimeFormat = '12h' | '24h';
export type DateFormat = 'full' | 'long' | 'medium' | 'short' | 'hidden';

export interface ClockConfig {
  format: TimeFormat;
  showSeconds: boolean;
  showDate: boolean;
}