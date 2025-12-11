
import { Shortcut, Category, WidgetConfig, Task, BackgroundConfig, ClockConfig } from '../types';

const STORAGE_KEY = 'gtab_shortcuts';
const LAYOUT_KEY = 'gtab_layout';
const TASKS_KEY = 'gtab_tasks';
const BG_KEY = 'gtab_bg_config';
const VIEW_STATE_KEY = 'gtab_view_state';
const CLOCK_CONFIG_KEY = 'gtab_clock_config';

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
  { id: 'clock', visible: true, order: 0 },
  { id: 'search', visible: true, order: 1 },
  { id: 'tasks', visible: true, order: 2 },
  { id: 'categories', visible: true, order: 3 },
  { id: 'shortcuts', visible: true, order: 4 },
];

const DEFAULT_CLOCK_CONFIG: ClockConfig = {
  format: '24h',
  showSeconds: false,
  showDate: true
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
    return stored ? JSON.parse(stored) : DEFAULT_LAYOUT;
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
    return stored ? JSON.parse(stored) : DEFAULT_CLOCK_CONFIG;
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
