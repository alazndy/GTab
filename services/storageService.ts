
import { Shortcut, Category, WidgetConfig, Task, BackgroundConfig, ClockConfig, CardConfig, CustomThemeConfig, StocksConfig, AIConfig } from '../types';

const STORAGE_KEY = 'gtab_shortcuts';
const LAYOUT_KEY = 'gtab_layout';
const TASKS_KEY = 'gtab_tasks';
const BG_KEY = 'gtab_bg_config';
const VIEW_STATE_KEY = 'gtab_view_state';
const CLOCK_CONFIG_KEY = 'gtab_clock_config';
const CARD_CONFIG_KEY = 'gtab_card_config';
const STOCKS_CONFIG_KEY = 'gtab_stocks';
const AI_CONFIG_KEY = 'gtab_ai_config';

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

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: '3',                                    title: 'GitHub',      url: 'https://github.com',                           category: Category.DEV,  iconType: 'favicon' },
  { id: '4',                                    title: 'Gmail',       url: 'https://mail.google.com',                      category: Category.WORK, iconType: 'favicon' },
  { id: '5',                                    title: 'Google Drive', url: 'https://drive.google.com',                    category: Category.WORK, iconType: 'favicon' },
  { id: 'd40b2cec-ef00-4d96-a5a9-38011ed2f23f', title: 'Stitch',      url: 'https://stitch.withgoogle.com/',               category: Category.DEV },
  { id: '5955ca80-fa7a-4f3b-955b-e38a6b1fbc84', title: 'Pommeli',     url: 'https://labs.google.com/u/0/pomelli',          category: Category.DEV },
  { id: '68ede2f2-4bed-4868-aef7-65b89c4560f9', title: 'Gemini',      url: 'https://gemini.google.com/',                   category: Category.DEV },
  { id: 'cf3ef4fc-d561-42c1-83c6-08d4e7c7c857', title: 'AI Studio',   url: 'https://aistudio.google.com/',                 category: Category.DEV, iconType: 'favicon' },
  { id: '3612722b-e444-4c64-9bc5-d38cfe2ef06a', title: 'NotebookLM',  url: 'https://notebooklm.google.com/',               category: Category.OTHER },
  { id: '91a16339-a556-49e4-87e5-4013c1204c6a', title: 'Claude',      url: 'https://claude.ai/',                           category: Category.OTHER },
  { id: 'f1a9aaf3-9027-4ee7-a874-95026e376bd7', title: 'Reddit',      url: 'https://www.reddit.com/',                      category: Category.OTHER },
  { id: '4db3b7a3-55ce-41dc-a29f-62916720f742', title: 'Google Docs', url: 'https://docs.google.com',                      category: Category.WORK, iconType: 'favicon' },
];

export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'clock',        visible: true,  order: 0,  opacity: 10, glassEffect: true, showBorder: false, borderOpacity: 0,  widthPx: 320, heightPx: 180 },
  { id: 'search',       visible: false, order: 1,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 500, heightPx: 140 },
  { id: 'gmail',        visible: true,  order: 2,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 420, heightPx: 280 },
  { id: 'calendar',     visible: true,  order: 3,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 340, heightPx: 300 },
  { id: 'google-keep',  visible: true,  order: 4,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 260, heightPx: 300 },
  { id: 'google-tasks', visible: true,  order: 5,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 280, heightPx: 300 },
  { id: 'shortcuts',    visible: true,  order: 6,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 1100, heightPx: 340 },
  { id: 'categories',   visible: false, order: 7,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20 },
  { id: 'pomodoro',     visible: true,  order: 8,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 280, heightPx: 380 },
  { id: 'weather',      visible: true,  order: 9,  opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 280, heightPx: 320 },
  { id: 'stocks',       visible: true,  order: 10, opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 420, heightPx: 360 },
  { id: 'tasks',        visible: false, order: 11, opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20 },
  { id: 'spotify',      visible: true,  order: 12, opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 280, heightPx: 400 },
  { id: 'rss',          visible: false, order: 13, opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 380, heightPx: 500 },
  { id: 'github',       visible: false, order: 14, opacity: 10, glassEffect: true, showBorder: true,  borderOpacity: 20, widthPx: 320, heightPx: 480 },
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
  glowEnabled: false,
  gridGapX: 16,
  gridGapY: 16,
  gridCols: 8,
  showCardBorder: false,
  cardBorderOpacity: 10,
  menuOpacity: 95,
  menuBorderOpacity: 10
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
    
    let parsed = JSON.parse(stored) as WidgetConfig[];
    
    // Ensure all widgets from DEFAULT_LAYOUT exist in parsed
    DEFAULT_LAYOUT.forEach(defaultWidget => {
      const exists = parsed.some(w => w.id === defaultWidget.id);
      if (!exists) {
        parsed.push({ ...defaultWidget });
      }
    });

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
    return stored ? JSON.parse(stored) : { type: 'theme', value: 'portal' };
  } catch (e) {
    return { type: 'theme', value: 'portal' };
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

export const getStocksConfig = (): StocksConfig => {
  try {
    const stored = localStorage.getItem(STOCKS_CONFIG_KEY);
    return stored ? JSON.parse(stored) : { apiKey: '4QO8AQO0Y6B6NIPI', symbols: ['AAPL', 'MSFT', 'GOOGL'] };
  } catch (e) {
    return { apiKey: '4QO8AQO0Y6B6NIPI', symbols: ['AAPL', 'MSFT', 'GOOGL'] };
  }
};

export const saveStocksConfig = (config: StocksConfig) => {
  try {
    localStorage.setItem(STOCKS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save stocks config', e);
  }
};

export const getAIConfig = (): AIConfig => {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY);
    return stored ? { 
      statusBarShortcut: 'Alt+S', 
      statusBarEnabled: true, 
      ...JSON.parse(stored) 
    } : { 
      geminiApiKey: '', 
      commandPaletteShortcut: 'Alt+K',
      statusBarShortcut: 'Alt+S',
      statusBarEnabled: true
    };
  } catch (e) {
    return { 
      geminiApiKey: '', 
      commandPaletteShortcut: 'Alt+K',
      statusBarShortcut: 'Alt+S',
      statusBarEnabled: true
    };
  }
};

export const saveAIConfig = (config: AIConfig) => {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AI config', e);
  }
};

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const pickJsonFile = (): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { reject(new Error('Dosya seçilmedi')); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { resolve(JSON.parse(ev.target?.result as string)); }
        catch { reject(new Error('Dosya okunamadı')); }
      };
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });

export const exportShortcutsToFile = (shortcuts: Shortcut[]) => {
  downloadJson(shortcuts, `gtab-shortcuts-${new Date().toISOString().split('T')[0]}.json`);
};

export const importShortcutsFromFile = (): Promise<Shortcut[]> =>
  pickJsonFile().then(data => {
    if (Array.isArray(data)) return data as Shortcut[];
    throw new Error('Geçersiz format');
  });

export const exportFullBackup = () => {
  const get = (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  };
  const backup = {
    version: '5.0.0',
    exportedAt: new Date().toISOString(),
    type: 'gtab-full-backup',
    data: {
      shortcuts:    get(STORAGE_KEY),
      layout:       get(LAYOUT_KEY),
      tasks:        get(TASKS_KEY),
      bgConfig:     get(BG_KEY),
      clockConfig:  get(CLOCK_CONFIG_KEY),
      cardConfig:   get(CARD_CONFIG_KEY),
      stocks:       get(STOCKS_CONFIG_KEY),
      aiConfig:     get(AI_CONFIG_KEY),
      notes:        get('gtab_quick_notes'),
      gmailAccounts: get('gtab_gmail_accounts'),
      spotifyClientId: localStorage.getItem('gtab_spotify_client_id'),
    }
  };
  downloadJson(backup, `gtab-full-backup-${new Date().toISOString().split('T')[0]}.json`);
};

export const importFullBackup = (): Promise<void> =>
  pickJsonFile().then(raw => {
    const backup = raw as any;
    if (backup?.type !== 'gtab-full-backup' || !backup?.data) {
      throw new Error('Geçersiz GTab yedek dosyası.');
    }
    const { data } = backup;
    const set = (key: string, val: unknown) => {
      if (val !== null && val !== undefined) localStorage.setItem(key, JSON.stringify(val));
    };
    set(STORAGE_KEY,       data.shortcuts);
    set(LAYOUT_KEY,        data.layout);
    set(TASKS_KEY,         data.tasks);
    set(BG_KEY,            data.bgConfig);
    set(CLOCK_CONFIG_KEY,  data.clockConfig);
    set(CARD_CONFIG_KEY,   data.cardConfig);
    set(STOCKS_CONFIG_KEY, data.stocks);
    set(AI_CONFIG_KEY,     data.aiConfig);
    set('gtab_quick_notes',    data.notes);
    set('gtab_gmail_accounts', data.gmailAccounts);
    if (data.spotifyClientId) localStorage.setItem('gtab_spotify_client_id', data.spotifyClientId);
    window.location.reload();
  });
