
import { Shortcut, Category, WidgetConfig, Task, BackgroundConfig, ClockConfig, CardConfig, CustomThemeConfig } from '../types';

const STORAGE_KEY = 'gtab_shortcuts';
const LAYOUT_KEY = 'gtab_layout';
const TASKS_KEY = 'gtab_tasks';
const BG_KEY = 'gtab_bg_config';
const VIEW_STATE_KEY = 'gtab_view_state';
const CLOCK_CONFIG_KEY = 'gtab_clock_config';
const CARD_CONFIG_KEY = 'gtab_card_config';

export interface ViewState {
  category: Category | 'All';
  profile: string | 'All';
}

// Optimized Unsplash URLs
export const PRESET_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=70&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=70&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506259091721-347f7c3bbcbf?q=70&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?q=70&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=70&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=70&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=70&w=1600&auto=format&fit=crop'
];

// Default shortcuts for new users - customize as needed
const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: '1',
    title: 'Google',
    url: 'https://google.com',
    category: Category.OTHER,
    iconType: 'favicon'
  },
  {
    id: '2',
    title: 'YouTube',
    url: 'https://youtube.com',
    category: Category.ENTERTAINMENT,
    iconType: 'favicon'
  },
  {
    id: '3',
    title: 'GitHub',
    url: 'https://github.com',
    category: Category.DEV,
    iconType: 'favicon'
  },
  {
    id: '4',
    title: 'Gmail',
    url: 'https://mail.google.com',
    category: Category.WORK,
    iconType: 'favicon'
  },
  {
    id: '5',
    title: 'Google Drive',
    url: 'https://drive.google.com',
    category: Category.WORK,
    iconType: 'favicon'
  },
  {
    id: '6',
    title: 'Twitter',
    url: 'https://twitter.com',
    category: Category.SOCIAL,
    iconType: 'favicon'
  }
];

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'clock',      visible: true, order: 0, opacity: 10, glassEffect: true, showBorder: true, borderOpacity: 20 },
  { id: 'search',     visible: true, order: 1, opacity: 10, glassEffect: true, showBorder: true, borderOpacity: 20 },
  { id: 'tasks',      visible: true, order: 2, opacity: 10, glassEffect: true, showBorder: true, borderOpacity: 20 },
  { id: 'categories', visible: true, order: 3, opacity: 10, glassEffect: true, showBorder: true, borderOpacity: 20 },
  { id: 'shortcuts',  visible: true, order: 4, opacity: 10, glassEffect: true, showBorder: true, borderOpacity: 20 },
];

export const DEFAULT_CLOCK_CONFIG: ClockConfig = {
  format: '24h',
  showSeconds: false,
  showDate: true,
  fontFamily: 'geist',
  fontSize: 'xl'
};

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  wrapperBg: '#0f172a',
  overlayBg: 'rgba(0,0,0,0.3)',
  accentColor: '#3b82f6',
  glassBorder: 'rgba(255,255,255,0.1)',
  glassBg: 'rgba(255,255,255,0.05)',
  menuBg: 'rgba(15,23,42,0.95)',
  menuBorder: 'rgba(255,255,255,0.1)',
  textColor: '#ffffff'
};

export const DEFAULT_CARD_CONFIG: CardConfig = {
  bgOpacity: 10,
  shape: 'rounded',
  size: 'md',
  alignment: 'center',
  font: 'geist',
  iconSize: 'md',
  cardWidth: 100,
  glowEnabled: true,
  gridGapX: 16,
  gridGapY: 16
};

export const getShortcuts = (): Shortcut[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SHORTCUTS;
  } catch (e) {
    console.error("Failed to load shortcuts", e);
    return DEFAULT_SHORTCUTS;
  }
};

export const saveShortcuts = (shortcuts: Shortcut[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (e) {
    console.error("Failed to save shortcuts", e);
  }
};

export const getLayoutConfig = (): WidgetConfig[] => {
  try {
    const stored = localStorage.getItem(LAYOUT_KEY);
    if (!stored) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(stored) as WidgetConfig[];
    return parsed.map(w => ({ 
      opacity: 10, 
      glassEffect: w.glassEffect ?? true, 
      showBorder: w.showBorder ?? true, 
      borderOpacity: w.borderOpacity ?? 20, 
      ...w 
    }));
  } catch (e) {
    return DEFAULT_LAYOUT;
  }
};

export const saveLayoutConfig = (layout: WidgetConfig[]) => {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch (e) {
    console.error("Failed to save layout", e);
  }
};

export const getTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks", e);
  }
};

export const getBackgroundConfig = (): BackgroundConfig => {
  try {
    const stored = localStorage.getItem(BG_KEY);
    return stored ? JSON.parse(stored) : { type: 'random', value: '' };
  } catch (e) {
    return { type: 'random', value: '' };
  }
};

export const saveBackgroundConfig = (config: BackgroundConfig) => {
  try {
    localStorage.setItem(BG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save background", e);
  }
};

export const getViewState = (): ViewState => {
  try {
    const stored = localStorage.getItem(VIEW_STATE_KEY);
    return stored ? JSON.parse(stored) : { category: 'All', profile: 'All' };
  } catch (e) {
    return { category: 'All', profile: 'All' };
  }
};

export const saveViewState = (state: ViewState) => {
  try {
    localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save view state", e);
  }
};

export const getClockConfig = (): ClockConfig => {
  try {
    const stored = localStorage.getItem(CLOCK_CONFIG_KEY);
    return stored ? { ...DEFAULT_CLOCK_CONFIG, ...JSON.parse(stored) } : DEFAULT_CLOCK_CONFIG;
  } catch (e) {
    return DEFAULT_CLOCK_CONFIG;
  }
};

export const saveClockConfig = (config: ClockConfig) => {
  try {
    localStorage.setItem(CLOCK_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save clock config", e);
  }
};

export const getCardConfig = (): CardConfig => {
  try {
    const stored = localStorage.getItem(CARD_CONFIG_KEY);
    return stored ? { ...DEFAULT_CARD_CONFIG, ...JSON.parse(stored) } : DEFAULT_CARD_CONFIG;
  } catch {
    return DEFAULT_CARD_CONFIG;
  }
};

export const saveCardConfig = (config: CardConfig) => {
  try {
    localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save card config', e);
  }
};

export const exportShortcutsToFile = (shortcuts: Shortcut[]) => {
  const blob = new Blob([JSON.stringify(shortcuts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gtab-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importShortcutsFromFile = (): Promise<Shortcut[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { reject(new Error('Dosya seçilmedi')); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) resolve(data as Shortcut[]);
          else reject(new Error('Geçersiz format'));
        } catch {
          reject(new Error('Dosya okunamadı'));
        }
      };
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
};
