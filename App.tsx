
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  PhotoIcon 
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
import { Shortcut, Category, ShortcutPayload, WidgetConfig, WidgetId, BackgroundConfig, ClockConfig } from './types';
import { 
  getShortcuts, saveShortcuts, 
  getLayoutConfig, saveLayoutConfig, 
  getBackgroundConfig, saveBackgroundConfig, PRESET_BACKGROUNDS,
  getViewState, saveViewState,
  getClockConfig, saveClockConfig
} from './services/storageService';

const App: React.FC = () => {
  // Data State
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => getShortcuts());
  const [layout, setLayout] = useState<WidgetConfig[]>(() => getLayoutConfig());
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(() => getBackgroundConfig());
  const [clockConfig, setClockConfig] = useState<ClockConfig>(() => getClockConfig());
  
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
  
  // Settings Modal State
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);

  // Widget Drag Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Shortcut Drag Refs
  const shortcutDragItem = useRef<string | null>(null);
  const shortcutDragOverItem = useRef<string | null>(null);

  const isFirstRun = useRef(true);

  // Persistence Effects
  useEffect(() => { saveShortcuts(shortcuts); }, [shortcuts]);
  useEffect(() => { saveLayoutConfig(layout); }, [layout]);
  useEffect(() => { saveBackgroundConfig(bgConfig); }, [bgConfig]);
  useEffect(() => { saveClockConfig(clockConfig); }, [clockConfig]);
  useEffect(() => { saveViewState({ category: filterCategory, profile: filterProfile }); }, [filterCategory, filterProfile]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (bgConfig.type === 'color') {
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

  // --- Actions ---

  const addShortcuts = useCallback((items: ShortcutPayload[]) => {
    const newShortcuts: Shortcut[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID()
    }));

    if (activeFolderId) {
        setShortcuts(prev => prev.map(s => {
            if (s.id === activeFolderId && s.isFolder) {
                return {
                    ...s,
                    children: [...(s.children || []), ...newShortcuts]
                };
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
        const rootExists = prev.find(s => s.id === updated.id);
        if (rootExists) {
            return prev.map(s => s.id === updated.id ? updated : s);
        }

        return prev.map(s => {
            if (s.isFolder && s.children) {
                const childExists = s.children.find(c => c.id === updated.id);
                if (childExists) {
                    return {
                        ...s,
                        children: s.children.map(c => c.id === updated.id ? updated : c)
                    };
                }
            }
            return s;
        });
    });
  }, []);

  const toggleWidgetVisibility = (id: WidgetId) => {
    setLayout(prev => prev.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
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

  // --- Shortcut DnD ---
  const handleShortcutDragStart = (e: React.DragEvent, id: string) => {
      shortcutDragItem.current = id;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
  };

  const handleShortcutDrop = (e: React.DragEvent, targetId: string) => {
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
  };

  const handleShortcutDragOver = (e: React.DragEvent) => {
      e.preventDefault();
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
        const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
        const uniqueProfiles = Array.from(new Set(shortcuts.flatMap(s => s.profiles?.map(p => p.name) || []))).sort();
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
        const filteredShortcuts = shortcuts.filter(s => {
            const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
            const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
            return matchesCategory && matchesProfile;
        });
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 gap-y-8 w-full pb-24">
                  {filteredShortcuts.map(shortcut => (
                      <ShortcutCard 
                        key={shortcut.id} 
                        shortcut={shortcut}
                        activeProfileFilter={filterProfile}
                        onDelete={deleteShortcut}
                        onEdit={(s) => setEditingShortcut(s)}
                        onFolderClick={(s) => setActiveFolderId(s.id)}
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
                      className="group h-32 rounded-xl border border-white/10 border-dashed bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 hover:border-white/30"
                  >
                      <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 mb-2 transition-colors"><PlusIcon className="w-6 h-6 text-white/70" /></div>
                      <span className="text-sm text-white/60 font-medium">Yeni Ekle</span>
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

  const tasksConfig = layout.find(w => w.id === 'tasks');
  const mainWidgets = layout.filter(w => w.id !== 'tasks');
  const isColorBg = bgConfig.type === 'color';

  const activeFolder = shortcuts.find(s => s.id === activeFolderId);

  return (
    <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col text-white">
      <div className="fixed inset-0 z-0 bg-black pointer-events-none select-none">
          {isColorBg ? (
             <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: bgConfig.value }} />
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
                <button onClick={() => setIsBgModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/80 hover:bg-blue-500 border border-blue-400/30 backdrop-blur-md transition-colors text-white text-sm font-medium"><PhotoIcon className="w-4 h-4" /><span className="hidden sm:inline">Arkaplan</span></button>
                <button onClick={resetLayout} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 backdrop-blur-md transition-colors text-white/90 text-sm font-medium"><ArrowPathIcon className="w-4 h-4" /><span className="hidden sm:inline">Sıfırla</span></button>
                <button onClick={() => setIsEditMode(false)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 backdrop-blur-md transition-all text-white text-sm font-medium animate-fade-in"><CheckIcon className="w-4 h-4" /><span>Bitti</span></button>
             </>
           ) : (
             <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all text-white/90 text-sm font-medium"><PencilIcon className="w-4 h-4" /><span className="hidden sm:inline">Düzenle</span></button>
           )}
        </header>

        <main className="flex-1 flex flex-col items-center max-w-7xl mx-auto w-full transition-all">
          <div className="w-full flex flex-col gap-6">
            {mainWidgets.map((widget, index) => {
              if (!widget.visible && !isEditMode) return null;
              return (
                <div
                  key={widget.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className={`relative w-full transition-all duration-200 rounded-2xl ${isEditMode ? 'bg-white/5 border-2 border-dashed border-white/20 p-4 cursor-move hover:bg-white/10 hover:border-white/40' : 'border-2 border-transparent'} ${!widget.visible && isEditMode ? 'opacity-50 grayscale' : 'opacity-100'}`}
                >
                  {isEditMode && (
                    <>
                        <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2 z-20"><Bars3Icon className="w-3 h-3" />{getWidgetLabel(widget.id)}</div>
                        <button onClick={() => toggleWidgetVisibility(widget.id)} className={`absolute top-4 right-4 p-2 rounded-full z-20 transition-colors ${widget.visible ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-300 hover:bg-red-500/40'}`} title={widget.visible ? "Gizle" : "Göster"}>{widget.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}</button>
                    </>
                  )}
                  <div className={`w-full ${isEditMode ? '' : ''}`}>
                     {renderWidgetContent(widget.id)}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <React.Suspense fallback={null}>
        <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addShortcuts} />
        <ShortcutSettingsModal isOpen={!!editingShortcut} shortcut={editingShortcut} allShortcuts={shortcuts} onClose={() => setEditingShortcut(null)} onSave={updateShortcut} />
        <BackgroundSettingsModal isOpen={isBgModalOpen} currentConfig={bgConfig} onClose={() => setIsBgModalOpen(false)} onSave={setBgConfig} />
        <ClockSettingsModal isOpen={isClockModalOpen} config={clockConfig} onClose={() => setIsClockModalOpen(false)} onSave={setClockConfig} />
        
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
      </React.Suspense>
    </div>
  );
};

export default App;
