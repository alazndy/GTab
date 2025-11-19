
import { Shortcut, Category, WidgetConfig, Task, BackgroundConfig } from '../types';

const STORAGE_KEY = 'novatab_shortcuts';
const LAYOUT_KEY = 'novatab_layout';
const TASKS_KEY = 'novatab_tasks';
const BG_KEY = 'novatab_bg_config';
const VIEW_STATE_KEY = 'novatab_view_state';

export interface ViewState {
  category: Category | 'All';
  profile: string | 'All';
}

export const PRESET_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // Abstract Liquid
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop', // Dark Fluid
  'https://images.unsplash.com/photo-1506259091721-347f7c3bbcbf?q=80&w=2070&auto=format&fit=crop', // Soft Lines
  'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?q=80&w=2091&auto=format&fit=crop', // Concrete Minimal
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop', // Dark Flow
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2070&auto=format&fit=crop', // Noise/Grain
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'  // Network/Tech
];

const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: '1',
    title: 'Google',
    url: 'https://google.com',
    category: Category.OTHER,
    iconType: 'favicon'
  },
  {
    id: '5',
    title: 'Gmail',
    url: 'https://mail.google.com',
    category: Category.WORK,
    iconType: 'lucide',
    iconValue: 'Mail',
    profiles: [
      {
        id: 'p_def',
        name: 'Bireysel', // goktugturhan71
        url: 'https://mail.google.com/mail/u/0/#inbox',
        avatarColor: 'bg-blue-500'
      },
      {
        id: 'p_pers',
        name: 'Kişisel', // turhan.gokt01
        url: 'https://mail.google.com/mail/u/1/#inbox',
        avatarColor: 'bg-emerald-500'
      },
      {
        id: 'p_work',
        name: 'İş', // goktugt.brigade
        url: 'https://mail.google.com/mail/u/2/#inbox',
        avatarColor: 'bg-orange-500'
      }
    ]
  },
  {
    id: 'g_drive',
    title: 'Google Drive',
    url: 'https://drive.google.com',
    category: Category.WORK,
    iconType: 'lucide',
    iconValue: 'Cloud'
  },
  {
    id: 'g_docs',
    title: 'Google Docs',
    url: 'https://docs.google.com',
    category: Category.WORK,
    iconType: 'lucide',
    iconValue: 'FileText'
  },
  {
    id: 'g_sheets',
    title: 'Google Sheets',
    url: 'https://docs.google.com/spreadsheets',
    category: Category.WORK,
    iconType: 'lucide',
    iconValue: 'Layout'
  },
  {
    id: 'ai_studio',
    title: 'Google AI Studio',
    url: 'https://aistudio.google.com',
    category: Category.DEV,
    iconType: 'lucide',
    iconValue: 'Sparkles'
  },
  {
    id: 'firebase_console',
    title: 'Firebase Console',
    url: 'https://console.firebase.google.com',
    category: Category.DEV,
    iconType: 'lucide',
    iconValue: 'Database'
  },
  {
    id: 'nextion',
    title: 'Nextion Editor',
    url: 'https://nextion.tech/editor/', // Web download link as placeholder
    category: Category.DEV,
    iconType: 'lucide',
    iconValue: 'Monitor'
  },
  {
    id: 'app_blender',
    title: 'Blender',
    url: 'blender:', // Protocol handler
    category: Category.APPS,
    iconType: 'image',
    iconValue: 'https://download.blender.org/branding/community/blender_community_badge_white.png'
  },
  {
    id: 'app_fusion',
    title: 'Fusion 360',
    url: 'fusion360://', // Protocol handler
    category: Category.APPS,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Autodesk_Fusion_360_Logo.png/64px-Autodesk_Fusion_360_Logo.png'
  },
  {
    id: 'app_figma',
    title: 'Figma',
    url: 'https://www.figma.com',
    category: Category.APPS,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
  },
  {
    id: 'app_ps',
    title: 'Photoshop',
    url: 'https://photoshop.adobe.com',
    category: Category.APPS,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg'
  },
  {
    id: 'app_ai',
    title: 'Illustrator',
    url: 'https://illustrator.adobe.com',
    category: Category.APPS,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg'
  },
  {
    id: 'app_stitch',
    title: 'Google Stitch',
    url: 'https://google.com', // Placeholder
    category: Category.OTHER,
    iconType: 'lucide',
    iconValue: 'Image'
  },
  {
    id: 'app_netflix',
    title: 'Netflix',
    url: 'https://www.netflix.com',
    category: Category.ENTERTAINMENT,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg'
  },
  {
    id: 'app_prime',
    title: 'Prime Video',
    url: 'https://www.primevideo.com',
    category: Category.ENTERTAINMENT,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_Prime_Video_2024_icon.svg'
  },
  {
    id: 'app_hbo',
    title: 'HBO Max',
    url: 'https://www.max.com',
    category: Category.ENTERTAINMENT,
    iconType: 'image',
    iconValue: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg'
  },
  {
    id: 'app_1',
    title: 'Spotify',
    url: 'spotify:', // URI Scheme
    category: Category.APPS,
    iconType: 'lucide',
    iconValue: 'Music'
  },
  {
    id: 'app_2',
    title: 'VS Code',
    url: 'vscode:', // URI Scheme
    category: Category.APPS,
    iconType: 'lucide',
    iconValue: 'Code'
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
    iconType: 'lucide',
    iconValue: 'Github'
  }
];

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'clock', visible: true, order: 0 },
  { id: 'search', visible: true, order: 1 },
  { id: 'tasks', visible: true, order: 2 },
  { id: 'categories', visible: true, order: 3 },
  { id: 'shortcuts', visible: true, order: 4 },
];

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

// Task Persistence
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

// Background Persistence
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

// View State Persistence (Profile & Category filters)
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
