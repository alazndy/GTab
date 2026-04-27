
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  FolderIcon,
  Bars3Icon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
  UsersIcon,
  PhotoIcon,
  HeartIcon,
  SparklesIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import ShortcutCard from './components/ShortcutCard';
import TasksWidget from './components/TasksWidget';
const AddModal = React.lazy(() => import('./components/AddModal'));
const ShortcutSettingsModal = React.lazy(() => import('./components/ShortcutSettingsModal'));
const BackgroundSettingsModal = React.lazy(() => import('./components/BackgroundSettingsModal'));
const ClockSettingsModal = React.lazy(() => import('./components/ClockSettingsModal'));
const FolderViewModal = React.lazy(() => import('./components/FolderViewModal'));
import { Shortcut, Category, ShortcutPayload, WidgetConfig, WidgetId, BackgroundConfig, ClockConfig, ThemeId, CardConfig } from './types';
import {
  getShortcuts, saveShortcuts,
  getLayoutConfig, saveLayoutConfig,
  getBackgroundConfig, saveBackgroundConfig, PRESET_BACKGROUNDS,
  getViewState, saveViewState,
  getClockConfig, saveClockConfig,
  getCardConfig, saveCardConfig
} from './services/storageService';

const App: React.FC = () => {
  // Data State
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => getShortcuts());
  const [layout, setLayout] = useState<WidgetConfig[]>(() => getLayoutConfig());
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(() => getBackgroundConfig());
  const [clockConfig, setClockConfig] = useState<ClockConfig>(() => getClockConfig());
  const [cardConfig, setCardConfig] = useState<CardConfig>(() => getCardConfig());

  const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/alazndy";

  // --- Theme Management ---
  const activeTheme = useMemo(() => {
    if (bgConfig.type === 'theme') return bgConfig.value as ThemeId;
    return 'default';
  }, [bgConfig]);

  const themeStyles = useMemo(() => {
    switch (activeTheme) {
      case 'neon':
        return {
          wrapper: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
          overlay: 'bg-black/40 backdrop-blur-[2px]',
          accent: 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]',
          glass: 'border-pink-500/20 backdrop-blur-xl transition-all',
          glassBgRgb: '255,255,255',
          menuBg: 'rgba(20,20,30,0.97)',
          menuBorder: 'rgba(236,72,153,0.3)',
          menuBgRgb: '20,20,30',
          menuBorderRgb: '236,72,153',
          accentColor: '#ec4899',
        };
      case 'starship':
        return {
          wrapper: 'bg-[#050505] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black',
          overlay: 'bg-transparent',
          accent: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]',
          glass: 'border-white/5 backdrop-blur-lg transition-all',
          glassBgRgb: '255,255,255',
          menuBg: 'rgba(3,6,24,0.97)',
          menuBorder: 'rgba(96,165,250,0.2)',
          menuBgRgb: '3,6,24',
          menuBorderRgb: '96,165,250',
          accentColor: '#60a5fa',
        };
      case 'terminal':
        return {
          wrapper: 'bg-black',
          overlay: 'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]',
          accent: 'text-green-500 font-mono drop-shadow-[0_0_5px_#22c55e]',
          glass: 'border-green-500/30 font-mono hover:border-green-500/60 transition-all',
          glassBgRgb: '0,0,0',
          menuBg: 'rgba(0,8,2,0.97)',
          menuBorder: 'rgba(34,197,94,0.3)',
          menuBgRgb: '0,8,2',
          menuBorderRgb: '34,197,94',
          accentColor: '#22c55e',
        };
      case 'portal':
        return {
          wrapper: 'bg-[#0a0a0a]',
          overlay: 'bg-[radial-gradient(ellipse_100%_80%_at_0%_100%,rgba(255,153,0,0.55)_0%,transparent_70%),radial-gradient(ellipse_100%_80%_at_100%_100%,rgba(153,204,255,0.45)_0%,transparent_70%)]',
          accent: 'text-[#FF9900] drop-shadow-[0_0_15px_rgba(255,153,0,0.9)]',
          glass: 'border-[#FF9900]/40 backdrop-blur-3xl hover:border-[#FF9900]/60 transition-all',
          glassBgRgb: '20,20,20',
          menuBg: 'rgba(10,10,10,0.98)',
          menuBorder: 'rgba(255,153,0,0.4)',
          menuBgRgb: '10,10,10',
          menuBorderRgb: '255,153,0',
          accentColor: '#FF9900',
        };
      default:
        return {
          wrapper: 'bg-black',
          overlay: 'bg-black/30',
          accent: 'text-blue-400',
          glass: 'border-white/10 backdrop-blur-md',
          glassBgRgb: '255,255,255',
          menuBg: 'rgba(10,10,12,0.97)',
          menuBorder: 'rgba(255,255,255,0.1)',
          menuBgRgb: '10,10,12',
          menuBorderRgb: '255,255,255',
          accentColor: '#60a5fa',
        };
    }
  }, [activeTheme]);

  // View State
  const [viewState] = useState(() => getViewState());
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>(viewState.category);
  const [filterProfile, setFilterProfile] = useState<string | 'All'>(viewState.profile);

  // Folder State
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Background Image State
  const [activeBgUrl, setActiveBgUrl] = useState<string>(() => {
    const config = getBackgroundConfig();
    if (config.type === 'image') return config.value;
    if (config.type === 'random') {
      return config.value || PRESET_BACKGROUNDS[Math.floor(Math.random() * PRESET_BACKGROUNDS.length)];
    }
    return '';
  });

  const [isBgImageLoaded, setIsBgImageLoaded] = useState(true);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>('');

  // Settings Modal State
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);

  // Widget Drag Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Shortcut Drag Refs
  const shortcutDragItem = useRef<string | null>(null);
  const shortcutDragOverItem = useRef<string | null>(null);

  const isFirstRun = useRef(true);

  // --- Performance Optimizations ---

  // Memoize event handlers to prevent breaking React.memo inside ShortcutCard
  const handleShortcutDragStart = useCallback((e: React.DragEvent, id: string) => {
      shortcutDragItem.current = id;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleShortcutDrop = useCallback((e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const draggedId = shortcutDragItem.current;
      if (!draggedId || draggedId === targetId) return;

      setShortcuts(prev => {
          const draggedIndex = prev.findIndex(s => s.id === draggedId);
          const targetIndex = prev.findIndex(s => s.id === targetId);

          if (draggedIndex === -1 || targetIndex === -1) return prev;

          const targetShortcut = prev[targetIndex];
          const draggedShortcut = prev[draggedIndex];

          if (targetShortcut.isFolder) {
              const newShortcuts = [...prev];
              newShortcuts.splice(draggedIndex, 1);
              const newTargetIndex = newShortcuts.findIndex(s => s.id === targetId);
              if (newTargetIndex !== -1) {
                  const updatedTarget = {
                      ...newShortcuts[newTargetIndex],
                      children: [...(newShortcuts[newTargetIndex].children || []), draggedShortcut]
                  };
                  newShortcuts[newTargetIndex] = updatedTarget;
                  return newShortcuts;
              }
              return prev;
          }

          const newShortcuts = [...prev];
          newShortcuts.splice(draggedIndex, 1);
          newShortcuts.splice(targetIndex, 0, draggedShortcut);
          return newShortcuts;
      });

      shortcutDragItem.current = null;
      shortcutDragOverItem.current = null;
  }, []);

  const handleShortcutDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
  }, []);

  // Memoize callback props so ShortcutCard components don't unnecessarily re-render
  const handleEditShortcut = useCallback((s: Shortcut) => setEditingShortcut(s), []);
  const handleFolderClick = useCallback((s: Shortcut) => setActiveFolderId(s.id), []);

  // Memoize expensive array operations (mapping, Set creation, sorting, and filtering)
  // to prevent recalculations on unrelated state changes (e.g. widget drag/drop, opening modals)
  const activeCategories = useMemo(() => {
    return ['All', ...new Set(shortcuts.map(s => s.category))];
  }, [shortcuts]);

  const uniqueProfiles = useMemo(() => {
    return Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();
  }, [shortcuts]);

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(s => {
      const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
      const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
      return matchesCategory && matchesProfile;
    });
  }, [shortcuts, filterCategory, filterProfile]);

  const groups = useMemo(() => shortcuts.filter(s => s.isFolder), [shortcuts]);
  const tasksConfig = useMemo(() => layout.find(w => w.id === 'tasks'), [layout]);
  const mainWidgets = useMemo(() => layout.filter(w => w.id !== 'tasks'), [layout]);
  const isColorBg = useMemo(() => bgConfig.type === 'color', [bgConfig.type]);
  const isThemeBg = useMemo(() => bgConfig.type === 'theme', [bgConfig.type]);
  const activeFolder = useMemo(() => shortcuts.find(s => s.id === activeFolderId), [shortcuts, activeFolderId]);

  const fontStyle = useMemo((): React.CSSProperties => {
    const map: Record<string, string> = {
      geist: '"Geist Sans", system-ui, sans-serif',
      system: 'system-ui, sans-serif',
      mono: '"Geist Mono", "Courier New", monospace',
      serif: 'Georgia, serif',
    };
    return { fontFamily: map[cardConfig.font] ?? map.geist };
  }, [cardConfig.font]);

  const mainAlignClass = useMemo(() => {
    const map: Record<string, string> = {
      left: 'mr-auto ml-0',
      center: 'mx-auto',
      right: 'ml-auto mr-0',
    };
    return map[cardConfig.alignment] ?? 'mx-auto';
  }, [cardConfig.alignment]);

  // Persistence Effects
  useEffect(() => { saveShortcuts(shortcuts); }, [shortcuts]);
  useEffect(() => { saveLayoutConfig(layout); }, [layout]);
  useEffect(() => { saveBackgroundConfig(bgConfig); }, [bgConfig]);
  useEffect(() => { saveClockConfig(clockConfig); }, [clockConfig]);
  useEffect(() => { saveCardConfig(cardConfig); }, [cardConfig]);
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

  // --- Popup localStorage sync ---
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'gtab_shortcuts' && e.newValue) {
        try { setShortcuts(JSON.parse(e.newValue)); } catch { /* noop */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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

  // --- Actions ---

  const addShortcuts = useCallback((items: ShortcutPayload[], targetGroupId?: string) => {
    const newShortcuts: Shortcut[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID()
    }));

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

  const deleteShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
        const rootExists = prev.find(s => s.id === id);
        if (rootExists) {
            return prev.filter(s => s.id !== id);
        }

        return prev.map(s => {
            if (s.isFolder && s.children) {
                return {
                    ...s,
                    children: s.children.filter(child => child.id !== id)
                };
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

  const toggleWidgetVisibility = (id: WidgetId) => {
    setLayout(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], visible: !next[idx].visible };
      return next;
    });
  };

  const updateWidgetConfig = (id: WidgetId, updates: Partial<WidgetConfig>) => {
    setLayout(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const handleResizePointerDown = (e: React.PointerEvent, id: WidgetId) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const widgetEl = e.currentTarget.parentElement as HTMLElement;
    const startWidth = widgetEl.offsetWidth;
    const startHeight = widgetEl.offsetHeight;

    const oldTransition = widgetEl.style.transition;
    widgetEl.style.transition = 'none';

    const onPointerMove = (moveEvent: PointerEvent) => {
      const newWidth = Math.max(200, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));
      widgetEl.style.width = `${newWidth}px`;
      widgetEl.style.height = `${newHeight}px`;
    };

    const onPointerUp = () => {
      widgetEl.style.transition = oldTransition;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      updateWidgetConfig(id, { widthPx: widgetEl.offsetWidth, heightPx: widgetEl.offsetHeight });
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const resetLayout = () => {
    setLayout([
      { id: 'clock', visible: true, order: 0 },
      { id: 'search', visible: true, order: 1 },
      { id: 'tasks', visible: true, order: 2 },
      { id: 'categories', visible: true, order: 3 },
      { id: 'shortcuts', visible: true, order: 4 },
    ]);
  };

  // --- Widget DnD ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
    e.preventDefault();
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const renderedWidgets = layout.filter(w => w.id !== 'tasks');
      const draggedId = renderedWidgets[dragItem.current].id;
      const targetId = renderedWidgets[dragOverItem.current].id;
      const realDragIndex = layout.findIndex(w => w.id === draggedId);
      const realTargetIndex = layout.findIndex(w => w.id === targetId);

      if (realDragIndex !== -1 && realTargetIndex !== -1) {
          const _layout = [...layout];
          const draggedItemContent = _layout[realDragIndex];
          _layout.splice(realDragIndex, 1);
          _layout.splice(realTargetIndex, 0, draggedItemContent);
          setLayout(_layout.map((item, idx) => ({ ...item, order: idx })));
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // --- Rendering ---
  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'clock':
        return <Clock config={clockConfig} isEditMode={isEditMode} onOpenSettings={() => setIsClockModalOpen(true)} />;
      case 'search':
        return <SearchBar />;
      case 'tasks':
        return <TasksWidget />;
      case 'categories':
        return (
          <div className="flex flex-col gap-4 w-full mb-8 animate-fade-in">
            <div className="flex flex-wrap justify-center gap-2">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as Category | 'All')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-transparent ${
                    filterCategory === cat ? 'bg-white/90 text-black shadow-lg scale-105' : 'bg-black/30 text-white/70 hover:bg-white/20 hover:text-white border-white/10'
                  }`}
                >
                  {cat === 'All' ? 'Tümü' : cat}
                </button>
              ))}
            </div>
            {uniqueProfiles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/5 mx-auto w-fit backdrop-blur-sm">
                 <span className="text-xs text-white/40 font-semibold px-2 uppercase tracking-wider flex items-center gap-1"><UsersIcon className="w-3 h-3" /> Profil:</span>
                 <button onClick={() => setFilterProfile('All')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterProfile === 'All' ? 'bg-blue-500 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>Tümü</button>
                 {uniqueProfiles.map((profile) => (
                    <button key={profile} onClick={() => setFilterProfile(profile)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${filterProfile === profile ? 'bg-blue-500 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>{profile}</button>
                 ))}
              </div>
            )}
          </div>
        );
      case 'shortcuts':
        return (
          <div className="w-full">
            {filteredShortcuts.length === 0 ? (
               <div className="text-center text-white/50 py-12 bg-white/5 rounded-xl border border-white/5">
                 <FolderIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                 <p>Bu filtreye uygun kısayol bulunamadı.</p>
                 {(filterCategory !== 'All' || filterProfile !== 'All') && (
                   <button onClick={() => { setFilterCategory('All'); setFilterProfile('All'); }} className="text-blue-400 text-sm mt-2 hover:underline">Filtreleri Temizle</button>
                 )}
               </div>
            ) : (
                <div 
                  className="grid w-full pb-24" 
                  style={{ 
                    columnGap: `${cardConfig.gridGapX ?? 16}px`, 
                    rowGap: `${cardConfig.gridGapY ?? 16}px`,
                    gridTemplateColumns: `repeat(${cardConfig.gridCols ?? 6}, minmax(0, 1fr))`
                  }}
                >
                  {filteredShortcuts.map(shortcut => (
                      <ShortcutCard
                        key={shortcut.id}
                        shortcut={shortcut}
                        activeProfileFilter={filterProfile}
                        onDelete={deleteShortcut}
                        onEdit={handleEditShortcut}
                        onFolderClick={handleFolderClick}
                        cardConfig={cardConfig}
                        draggable={true}
                        onDragStart={handleShortcutDragStart}
                        onDragOver={handleShortcutDragOver}
                        onDrop={handleShortcutDrop}
                      />
                  ))}
                  <button 
                      onClick={() => {
                          setActiveFolderId(null);
                          setIsModalOpen(true);
                      }}
                      className={`group rounded-xl border border-white/5 border-dashed bg-transparent hover:bg-white/5 flex flex-col items-center justify-center transition-all opacity-30 hover:opacity-100 ${
                        (cardConfig?.size === 'sm' ? 'h-24' : cardConfig?.size === 'lg' ? 'h-40' : cardConfig?.size === 'xl' ? 'h-48' : 'h-32')
                      }`}
                  >
                      <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 mb-1 transition-colors"><PlusIcon className="w-5 h-5 text-white/50" /></div>
                      <span className="text-[11px] text-white/40 font-medium group-hover:text-white/60">Yeni Ekle</span>
                  </button>
                </div>
            )}
          </div>
        );
    }
  };

  const getWidgetLabel = (id: WidgetId) => {
    switch(id) {
      case 'clock': return 'Saat & Tarih';
      case 'search': return 'Arama Çubuğu';
      case 'tasks': return 'Görevler';
      case 'categories': return 'Kategori & Profil Filtreleri';
      case 'shortcuts': return 'Kısayol Izgarası';
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col text-white transition-colors duration-700 ${isThemeBg ? themeStyles.wrapper : ''}`}
      style={{
        '--theme-accent': themeStyles.accentColor,
        '--menu-bg': themeStyles.menuBg,
        '--menu-border': themeStyles.menuBorder,
        '--menu-bg-rgb': themeStyles.menuBgRgb,
        '--menu-border-rgb': themeStyles.menuBorderRgb,
        ...fontStyle,
      } as any}
    >
      <div className={`fixed inset-0 z-0 bg-black pointer-events-none select-none ${isThemeBg ? themeStyles.overlay : ''}`}>
          {isColorBg ? (
             <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: bgConfig.value }} />
          ) : isThemeBg ? (
             <div className="absolute inset-0" />
          ) : (
             <img 
                src={activeBgUrl}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: isBgImageLoaded ? 1 : 0, filter: 'brightness(0.4) grayscale(100%) contrast(1.1)' }}
                fetchPriority="high"
                loading="eager"
                decoding="async"
             />
          )}
      </div>

      {(tasksConfig?.visible || isEditMode) && (
        <div className={`fixed top-6 left-6 z-40 hidden md:block transition-opacity ${!tasksConfig?.visible && isEditMode ? 'opacity-50 grayscale' : 'opacity-100'}`}>
          <div className="relative">
            {isEditMode && (
                <button onClick={() => toggleWidgetVisibility('tasks')} className={`absolute -top-2 -right-2 p-1.5 rounded-full z-50 transition-colors shadow-md border border-white/10 ${tasksConfig?.visible ? 'bg-gray-800 text-white' : 'bg-red-500/80 text-white'}`}>
                  {tasksConfig?.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                </button>
            )}
            <TasksWidget />
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8 lg:p-16 h-full w-full">
        <header className="flex justify-end mb-6 space-x-2 sticky top-4 z-50">
           {isEditMode ? (
             <>
                <button onClick={() => setIsBgModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-colors text-white text-sm font-medium" style={{ backgroundColor: 'var(--theme-accent, #2563eb)' }}><PhotoIcon className="w-4 h-4" /><span className="hidden sm:inline">Görünüm</span></button>
                <button onClick={resetLayout} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 backdrop-blur-md transition-colors text-white/90 text-sm font-medium"><ArrowPathIcon className="w-4 h-4" /><span className="hidden sm:inline">Sıfırla</span></button>
                <button onClick={() => setIsEditMode(false)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 backdrop-blur-md transition-all text-white text-sm font-medium animate-fade-in"><CheckIcon className="w-4 h-4" /><span>Bitti</span></button>
             </>
           ) : (
             <>
                <a
                  href={BUY_ME_COFFEE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 backdrop-blur-md transition-all text-yellow-200 hover:text-yellow-100 text-sm font-medium group"
                >
                  <HeartIcon className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Kahve Ismarla</span>
                </a>
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all text-white/90 text-sm font-medium"><PencilIcon className="w-4 h-4" /><span className="hidden sm:inline">Düzenle</span></button>
             </>
           )}
        </header>

        <main className={`flex-1 flex flex-col items-center max-w-7xl w-full transition-all ${mainAlignClass}`}>
          <div className="w-full flex flex-row flex-wrap justify-center gap-6 items-start">
            {mainWidgets.map((widget, index) => {
              if (!widget.visible && !isEditMode) return null;
              
              const containerPadding = 'p-4 md:p-6';
              const isGlass = widget.glassEffect !== false;
              const showBorder = isGlass && widget.showBorder !== false;
              
              const glassStyle = isGlass 
                  ? `${activeTheme === 'custom' ? themeStyles.glass : themeStyles.glass} shadow-2xl shadow-black/20` 
                  : 'bg-transparent shadow-none border-transparent';
                  
              const editStyle = isEditMode ? 'border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5' : `${glassStyle} ${showBorder ? 'border-2' : 'border-0'}`;

              const dynamicStyle: React.CSSProperties = {
                 width: widget.widthPx ? `${widget.widthPx}px` : '100%',
                 height: widget.heightPx ? `${widget.heightPx}px` : 'auto',
                 backgroundColor: (!isEditMode && isGlass && activeTheme !== 'custom') ? 
                    `rgba(${themeStyles.glassBgRgb || '255,255,255'}, ${(widget.opacity ?? 10) / 100})` : undefined,
                 borderColor: (!isEditMode && showBorder && activeTheme !== 'custom') ? 
                    `rgba(${themeStyles.glassBgRgb || '255,255,255'}, ${(widget.borderOpacity ?? 20) / 100})` : undefined,
                 ...(activeTheme === 'custom' && !isEditMode && isGlass ? (themeStyles as any).glassStyle : {})
              };

              return (
                <div
                  key={widget.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`relative transition-all duration-300 rounded-2xl ${containerPadding} ${editStyle} ${!widget.visible && isEditMode ? 'opacity-50 grayscale' : 'opacity-100'} ${isEditMode ? 'cursor-move' : ''}`}
                  style={dynamicStyle}
                >
                  {isEditMode && (
                    <>
                        <div className="absolute -top-3 left-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2 z-20" style={{ backgroundColor: 'var(--theme-accent, #2563eb)' }}><Bars3Icon className="w-3 h-3" />{getWidgetLabel(widget.id)}</div>
                        <div className="absolute top-4 right-14 flex items-center gap-2 z-20" onPointerDown={(e) => e.stopPropagation()}>
                          <button onClick={(e) => { e.preventDefault(); updateWidgetConfig(widget.id, { glassEffect: widget.glassEffect === false ? true : false }) }} className={`p-1.5 rounded-full transition-all border border-white/20 ${widget.glassEffect === false ? 'bg-indigo-500/80 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-black/60 hover:bg-black/80 text-white/70'}`} title="Cam Efekti (Saydam/Açık)">
                             <SparklesIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleWidgetVisibility(widget.id); }} onPointerDown={(e) => e.stopPropagation()} className={`absolute top-4 right-4 p-1.5 rounded-full z-20 transition-all border border-white/20 ${widget.visible ? 'bg-black/60 hover:bg-black/80 text-white/70' : 'bg-red-500/80 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)] hover:bg-red-500'}`} title={widget.visible ? "Gizle" : "Göster"}>{widget.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}</button>

                        {widget.id === 'clock' && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); setIsClockModalOpen(true); }} 
                             onPointerDown={(e) => e.stopPropagation()}
                             className="absolute top-4 right-24 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/70 border border-white/20 z-20 transition-all"
                             title="Saat Detay Ayarları"
                           >
                             <Cog6ToothIcon className="w-4 h-4" />
                           </button>
                        )}

                        <div 
                           className="absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize opacity-50 hover:opacity-100 flex items-end justify-end p-1 z-30"
                           onPointerDown={(e) => handleResizePointerDown(e, widget.id)}
                           title="Boyutlandır"
                        >
                           <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 stroke-white stroke-2"><path d="M21 15L15 21M21 9L9 21"/></svg>
                        </div>
                    </>
                  )}
                  <div className={`w-full h-full ${activeTheme === 'terminal' ? 'font-mono' : ''}`}>
                     {renderWidgetContent(widget.id)}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <React.Suspense fallback={null}>
        {activeFolder && (
            <FolderViewModal
              folder={activeFolder}
              isOpen={true}
              onClose={() => setActiveFolderId(null)}
              onEditItem={(s) => setEditingShortcut(s)}
              onDeleteItem={(id) => deleteShortcut(id)}
              onAddItem={() => setIsModalOpen(true)}
            />
        )}
        <AddModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setPendingUrl(''); }}
          onAdd={addShortcuts}
          groups={groups}
          isInsideGroup={activeFolderId !== null}
          initialUrl={pendingUrl}
        />
        <ShortcutSettingsModal isOpen={!!editingShortcut} shortcut={editingShortcut} allShortcuts={shortcuts} onClose={() => setEditingShortcut(null)} onSave={updateShortcut} />
        <BackgroundSettingsModal
          isOpen={isBgModalOpen}
          currentConfig={bgConfig}
          onClose={() => setIsBgModalOpen(false)}
          onSave={setBgConfig}
          cardConfig={cardConfig}
          onSaveCard={setCardConfig}
          shortcuts={shortcuts}
          onImportShortcuts={setShortcuts}
          layout={layout}
          onSaveLayout={setLayout}
        />
        <ClockSettingsModal isOpen={isClockModalOpen} config={clockConfig} onClose={() => setIsClockModalOpen(false)} onSave={setClockConfig} />
      </React.Suspense>
    </div>
  );
};

export default App;
