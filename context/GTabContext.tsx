import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Shortcut, Category, ShortcutPayload, WidgetConfig, WidgetId, BackgroundConfig, ClockConfig, CardConfig, StocksConfig, AIConfig, Task } from '../types';
import {
  getShortcuts, saveShortcuts,
  getLayoutConfig, saveLayoutConfig, DEFAULT_LAYOUT,
  getBackgroundConfig, saveBackgroundConfig, PRESET_BACKGROUNDS,
  getViewState, saveViewState,
  getClockConfig, saveClockConfig,
  getCardConfig, saveCardConfig,
  getStocksConfig,
  getAIConfig, saveAIConfig,
  getTasks, saveTasks
} from '../services/storageService';

interface GTabContextType {
  // Data State
  shortcuts: Shortcut[];
  setShortcuts: React.Dispatch<React.SetStateAction<Shortcut[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  layout: WidgetConfig[];
  setLayout: React.Dispatch<React.SetStateAction<WidgetConfig[]>>;
  bgConfig: BackgroundConfig;
  setBgConfig: React.Dispatch<React.SetStateAction<BackgroundConfig>>;
  clockConfig: ClockConfig;
  setClockConfig: React.Dispatch<React.SetStateAction<ClockConfig>>;
  cardConfig: CardConfig;
  setCardConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  stocksConfig: StocksConfig;
  setStocksConfig: React.Dispatch<React.SetStateAction<StocksConfig>>;
  aiConfig: AIConfig;
  setAIConfig: React.Dispatch<React.SetStateAction<AIConfig>>;

  // View State
  filterCategory: Category | 'All';
  setFilterCategory: React.Dispatch<React.SetStateAction<Category | 'All'>>;
  filterProfile: string | 'All';
  setFilterProfile: React.Dispatch<React.SetStateAction<string | 'All'>>;
  activeFolderId: string | null;
  setActiveFolderId: React.Dispatch<React.SetStateAction<string | null>>;

  // UI State
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBgModalOpen: boolean;
  setIsBgModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isClockModalOpen: boolean;
  setIsClockModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingShortcut: Shortcut | null;
  setEditingShortcut: React.Dispatch<React.SetStateAction<Shortcut | null>>;
  pendingUrl: string;
  setPendingUrl: React.Dispatch<React.SetStateAction<string>>;
  activeBgUrl: string;
  setActiveBgUrl: React.Dispatch<React.SetStateAction<string>>;
  isBgImageLoaded: boolean;
  setIsBgImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;

  // Actions
  addShortcuts: (items: ShortcutPayload[], targetGroupId?: string) => void;
  addTask: (text: string) => void;
  deleteShortcut: (id: string) => void;
  updateShortcut: (updated: Shortcut) => void;
  toggleWidgetVisibility: (id: WidgetId) => void;
  updateWidgetConfig: (id: WidgetId, updates: Partial<WidgetConfig>) => void;
  resetLayout: () => void;
}

const GTabContext = createContext<GTabContextType | undefined>(undefined);

export const useGTab = () => {
  const context = useContext(GTabContext);
  if (!context) throw new Error('useGTab must be used within a GTabProvider');
  return context;
};

export const GTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => getShortcuts());
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());
  const [layout, setLayout] = useState<WidgetConfig[]>(() => getLayoutConfig());
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(() => getBackgroundConfig());
  const [clockConfig, setClockConfig] = useState<ClockConfig>(() => getClockConfig());
  const [cardConfig, setCardConfig] = useState<CardConfig>(() => getCardConfig());
  const [stocksConfig, setStocksConfig] = useState<StocksConfig>(() => getStocksConfig());
  const [aiConfig, setAIConfig] = useState<AIConfig>(() => getAIConfig());

  const [viewState] = useState(() => getViewState());
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>(viewState.category);
  const [filterProfile, setFilterProfile] = useState<string | 'All'>(viewState.profile);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string>('');
  
  const [activeBgUrl, setActiveBgUrl] = useState<string>(() => {
    const config = getBackgroundConfig();
    if (config.type === 'image') return config.value;
    if (config.type === 'random') {
      return config.value || PRESET_BACKGROUNDS[Math.floor(Math.random() * PRESET_BACKGROUNDS.length)];
    }
    return '';
  });
  const [isBgImageLoaded, setIsBgImageLoaded] = useState(true);

  const isFirstRun = React.useRef(true);

  // Persistence
  useEffect(() => { saveShortcuts(shortcuts); }, [shortcuts]);
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveLayoutConfig(layout); }, [layout]);
  useEffect(() => { saveBackgroundConfig(bgConfig); }, [bgConfig]);
  useEffect(() => { saveClockConfig(clockConfig); }, [clockConfig]);
  useEffect(() => { saveCardConfig(cardConfig); }, [cardConfig]);
  useEffect(() => { saveAIConfig(aiConfig); }, [aiConfig]);
  useEffect(() => { saveViewState({ category: filterCategory, profile: filterProfile }); }, [filterCategory, filterProfile]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (bgConfig.type === 'color' || bgConfig.type === 'theme') {
      setActiveBgUrl('');
      setIsBgImageLoaded(true);
      return;
    }
    let targetUrl = bgConfig.value;
    if (bgConfig.type === 'random') {
        if (activeBgUrl && PRESET_BACKGROUNDS.includes(activeBgUrl) && !bgConfig.value) {
           targetUrl = activeBgUrl;
        } else if (!targetUrl) {
           targetUrl = PRESET_BACKGROUNDS[Math.floor(Math.random() * PRESET_BACKGROUNDS.length)];
        }
    }
    if (!targetUrl) return;
    if (targetUrl === activeBgUrl) {
        setIsBgImageLoaded(true);
        return;
    }
    setIsBgImageLoaded(false);
    const img = new Image();
    img.src = targetUrl;
    img.onload = () => {
      setActiveBgUrl(targetUrl);
      setIsBgImageLoaded(true);
    };
    img.onerror = () => setIsBgImageLoaded(true);
  }, [bgConfig]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'gtab_shortcuts' && e.newValue) {
        try { setShortcuts(JSON.parse(e.newValue)); } catch { /* noop */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addShortcuts = useCallback((items: ShortcutPayload[], targetGroupId?: string) => {
    const newShortcuts: Shortcut[] = items.map(item => ({ ...item, id: crypto.randomUUID() }));
    const effectiveGroupId = targetGroupId ?? activeFolderId;
    if (effectiveGroupId) {
      setShortcuts(prev => prev.map(s => {
        if (s.id === effectiveGroupId && s.isFolder) {
          return { ...s, children: [...(s.children || []), ...newShortcuts] };
        }
        return s;
      }));
    } else {
      setShortcuts(prev => [...prev, ...newShortcuts]);
    }
  }, [activeFolderId]);

  const addTask = useCallback((text: string) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const deleteShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
        const rootExists = prev.find(s => s.id === id);
        if (rootExists) return prev.filter(s => s.id !== id);
        return prev.map(s => {
            if (s.isFolder && s.children) {
                return { ...s, children: s.children.filter(child => child.id !== id) };
            }
            return s;
        });
    });
  }, []);

  const updateShortcut = useCallback((updated: Shortcut) => {
    setShortcuts(prev => {
        const rootIdx = prev.findIndex(s => s.id === updated.id);
        if (rootIdx !== -1) {
            const next = [...prev];
            next[rootIdx] = updated;
            return next;
        }
        const folderIdx = prev.findIndex(s => s.isFolder && s.children && s.children.some(c => c.id === updated.id));
        if (folderIdx !== -1) {
            const next = [...prev];
            const folder = next[folderIdx];
            if (folder.children) {
                const childIdx = folder.children.findIndex(c => c.id === updated.id);
                if (childIdx !== -1) {
                    const nextChildren = [...folder.children];
                    nextChildren[childIdx] = updated;
                    next[folderIdx] = { ...folder, children: nextChildren };
                    return next;
                }
            }
        }
        return prev;
    });
  }, []);

  const toggleWidgetVisibility = useCallback((id: WidgetId) => {
    setLayout(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], visible: !next[idx].visible };
      return next;
    });
  }, []);

  const updateWidgetConfig = useCallback((id: WidgetId, updates: Partial<WidgetConfig>) => {
    setLayout(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
  }, []);

  // --- Context Menu Pending URL ---
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const consume = (url: string) => {
      if (!url) return;
      chrome.storage.local.remove('gtab_pending_url');
      setActiveFolderId(null);
      setPendingUrl(url);
      setIsModalOpen(true);
    };

    chrome.storage.local.get('gtab_pending_url', (result) => {
      if (result.gtab_pending_url) consume(result.gtab_pending_url as string);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.gtab_pending_url?.newValue) {
        consume(changes.gtab_pending_url.newValue as string);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const value = {
    shortcuts, setShortcuts,
    tasks, setTasks,
    layout, setLayout,
    bgConfig, setBgConfig,
    clockConfig, setClockConfig,
    cardConfig, setCardConfig,
    stocksConfig, setStocksConfig,
    aiConfig, setAIConfig,
    filterCategory, setFilterCategory,
    filterProfile, setFilterProfile,
    activeFolderId, setActiveFolderId,
    isEditMode, setIsEditMode,
    isModalOpen, setIsModalOpen,
    isBgModalOpen, setIsBgModalOpen,
    isClockModalOpen, setIsClockModalOpen,
    editingShortcut, setEditingShortcut,
    pendingUrl, setPendingUrl,
    activeBgUrl, setActiveBgUrl,
    isBgImageLoaded, setIsBgImageLoaded,
    addShortcuts, addTask, deleteShortcut, updateShortcut,
    toggleWidgetVisibility, updateWidgetConfig, resetLayout
  };

  return <GTabContext.Provider value={value}>{children}</GTabContext.Provider>;
};
