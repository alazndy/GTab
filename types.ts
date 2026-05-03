
export enum Category {
  SOCIAL = 'Sosyal',
  WORK = 'İş',
  DEV = 'Geliştirme',
  ENTERTAINMENT = 'Eğlence',
  SHOPPING = 'Alışveriş',
  APPS = 'Uygulamalar',
  STATUS_BAR = 'Status Bar',
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

export type WidgetId = 'clock' | 'search' | 'categories' | 'shortcuts' | 'tasks' | 'gmail' | 'calendar' | 'stocks' | 'google-tasks' | 'google-keep' | 'weather' | 'pomodoro' | 'spotify' | 'rss' | 'github';

export interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  order: number;
  widthPx?: number;
  heightPx?: number;
  x?: number;
  y?: number;
  glassEffect?: boolean;
  opacity?: number; // Background opacity
  borderOpacity?: number; // Area frame opacity
  showBorder?: boolean; // Toggle area frame
}

export interface StocksConfig {
  apiKey: string;
  symbols: string[];
}

export interface AIConfig {
  geminiApiKey: string;
  commandPaletteShortcut?: string; // e.g. 'Alt+K' or 'Ctrl+K'
  statusBarShortcut?: string;
  statusBarEnabled?: boolean;
  dockPosition?: 'top-center' | 'bottom-center' | 'top-right';
}

export interface GmailMessage {
  id: string;
  threadId: string;
}

export interface GmailListResponse {
  messages?: GmailMessage[];
  resultSizeEstimate: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface CalendarListResponse {
  items: CalendarEvent[];
  summary: string;
  timeZone: string;
}

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
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
  isFreeLayout?: boolean;
  widgetGap?: number; // px, default 24
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
  gridGapX?: number; // Yatay boşluk
  gridGapY?: number; // Dikey boşluk
  gridCols?: number; // Bir satırdaki kart sayısı
  showCardBorder?: boolean;
  cardBorderOpacity?: number;
  menuOpacity?: number;
  menuBorderOpacity?: number;
}

export interface Quote {
  q: string; // The quote text
  a: string; // The author
  h: string; // HTML representation
}

export interface QuoteCache {
  quote: Quote;
  lastFetched: string; // ISO date string
}

export type AmbientSoundId = 'rain' | 'coffee' | 'forest' | 'white-noise';

export interface AmbientAudioState {
  currentSoundId: AmbientSoundId | null;
  isPlaying: boolean;
  volume: number;
}
