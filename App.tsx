
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Folder, GripVertical, Eye, EyeOff, Pencil, Check, RefreshCcw, Users, Image as ImageIcon } from 'lucide-react';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import ShortcutCard from './components/ShortcutCard';
import TasksWidget from './components/TasksWidget';
import AddModal from './components/AddModal';
import ShortcutSettingsModal from './components/ShortcutSettingsModal';
import BackgroundSettingsModal from './components/BackgroundSettingsModal';
import { Shortcut, Category, ShortcutPayload, WidgetConfig, WidgetId, BackgroundConfig } from './types';
import { 
  getShortcuts, saveShortcuts, 
  getLayoutConfig, saveLayoutConfig, 
  getBackgroundConfig, saveBackgroundConfig, PRESET_BACKGROUNDS,
  getViewState, saveViewState 
} from './services/storageService';

const App: React.FC = () => {
  // Data State
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [layout, setLayout] = useState<WidgetConfig[]>([]);
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>({ type: 'random', value: '' });
  const [activeBgUrl, setActiveBgUrl] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterProfile, setFilterProfile] = useState<string | 'All'>('All');
  
  // Settings Modal State
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);

  // Drag Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Initial Load
  useEffect(() => {
    setShortcuts(getShortcuts());
    setLayout(getLayoutConfig());
    const loadedBgConfig = getBackgroundConfig();
    setBgConfig(loadedBgConfig);
    
    // Load View State
    const viewState = getViewState();
    setFilterCategory(viewState.category);
    setFilterProfile(viewState.profile);

    // Determine initial visual background
    if (loadedBgConfig.type === 'image') {
      setActiveBgUrl(loadedBgConfig.value);
    } else if (loadedBgConfig.type === 'random') {
      const randomBg = PRESET_BACKGROUNDS[Math.floor(Math.random() * PRESET_BACKGROUNDS.length)];
      setActiveBgUrl(randomBg);
    } else {
      setActiveBgUrl(''); // Color mode
    }
    
    setIsInitialized(true);
  }, []);

  // Persistence effects
  useEffect(() => {
    // Only save if initialized to prevent overwriting data with empty array on mount
    if (isInitialized) {
      saveShortcuts(shortcuts);
    }
  }, [shortcuts, isInitialized]);

  useEffect(() => {
    if (layout.length > 0) saveLayoutConfig(layout);
  }, [layout]);

  useEffect(() => {
    saveBackgroundConfig(bgConfig);
    
    // Update visual state based on config change
    if (bgConfig.type === 'image') {
      setActiveBgUrl(bgConfig.value);
    } else if (bgConfig.type === 'color') {
      setActiveBgUrl('');
    }
    // Random is handled only on mount or explicit shuffle, so we don't change it here to prevent jitter
  }, [bgConfig]);

  useEffect(() => {
    if (isInitialized) {
      saveViewState({ category: filterCategory, profile: filterProfile });
    }
  }, [filterCategory, filterProfile, isInitialized]);

  // Actions
  const addShortcuts = (items: ShortcutPayload[]) => {
    const newShortcuts: Shortcut[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID()
    }));
    setShortcuts(prev => [...prev, ...newShortcuts]);
  };

  const deleteShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  };

  const updateShortcut = (updated: Shortcut) => {
    setShortcuts(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

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

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault(); 
  };

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
          
          const reorderedLayout = _layout.map((item, idx) => ({ ...item, order: idx }));
          setLayout(reorderedLayout);
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Render Components
  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'clock':
        return <Clock />;
      case 'search':
        return <SearchBar />;
      case 'tasks':
        return <TasksWidget />;
      case 'categories':
        const activeCategories = ['All', ...new Set(shortcuts.map(s => s.category))];
        const uniqueProfiles = Array.from(new Set(
            shortcuts.flatMap(s => s.profiles?.map(p => p.name) || [])
        )).sort();

        return (
          <div className="flex flex-col gap-4 w-full mb-8 animate-fade-in">
            <div className="flex flex-wrap justify-center gap-2">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as Category | 'All')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-transparent ${
                    filterCategory === cat 
                      ? 'bg-white/90 text-black shadow-lg scale-105' 
                      : 'bg-black/30 text-white/70 hover:bg-white/20 hover:text-white border-white/10'
                  }`}
                >
                  {cat === 'All' ? 'Tümü' : cat}
                </button>
              ))}
            </div>
            {uniqueProfiles.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/5 mx-auto w-fit backdrop-blur-sm">
                 <span className="text-xs text-white/40 font-semibold px-2 uppercase tracking-wider flex items-center gap-1">
                   <Users size={12} />
                   Profil:
                 </span>
                 <button
                    onClick={() => setFilterProfile('All')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        filterProfile === 'All'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                 >
                    Tümü
                 </button>
                 {uniqueProfiles.map((profile) => (
                    <button
                        key={profile}
                        onClick={() => setFilterProfile(profile)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                            filterProfile === profile
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {profile}
                    </button>
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
                 <Folder size={48} className="mx-auto mb-4 opacity-50" />
                 <p>Bu filtreye uygun kısayol bulunamadı.</p>
                 {(filterCategory !== 'All' || filterProfile !== 'All') && (
                   <button 
                        onClick={() => { setFilterCategory('All'); setFilterProfile('All'); }} 
                        className="text-blue-400 text-sm mt-2 hover:underline"
                    >
                     Filtreleri Temizle
                   </button>
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
                      />
                  ))}
                  
                  <button 
                      onClick={() => setIsModalOpen(true)}
                      className="group h-32 rounded-xl border border-white/10 border-dashed bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 hover:border-white/30"
                  >
                      <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 mb-2 transition-colors">
                        <Plus className="text-white/70" size={24} />
                      </div>
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

  // Style logic
  const backgroundStyle: React.CSSProperties = {
     filter: 'brightness(0.4) grayscale(100%) contrast(1.1)', 
     opacity: 1
  };

  if (bgConfig.type === 'color') {
     backgroundStyle.backgroundColor = bgConfig.value;
     backgroundStyle.backgroundImage = 'none';
     backgroundStyle.filter = 'none'; // Don't apply grayscale to solid colors
  } else {
     backgroundStyle.backgroundImage = `url('${activeBgUrl}')`;
     // Keep existing filter for images to ensure text readability
  }

  return (
    <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col text-white">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 bg-black"
        style={backgroundStyle}
      />

      {/* Floating Tasks Widget (Top Left) */}
      {(tasksConfig?.visible || isEditMode) && (
        <div className={`fixed top-6 left-6 z-40 hidden md:block transition-opacity ${!tasksConfig?.visible && isEditMode ? 'opacity-50 grayscale' : 'opacity-100'}`}>
          <div className="relative">
            {isEditMode && (
                <button
                  onClick={() => toggleWidgetVisibility('tasks')}
                  className={`absolute -top-2 -right-2 p-1.5 rounded-full z-50 transition-colors shadow-md border border-white/10 ${tasksConfig?.visible ? 'bg-gray-800 text-white' : 'bg-red-500/80 text-white'}`}
                >
                  {tasksConfig?.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
            )}
            <TasksWidget />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8 lg:p-16 h-full w-full">
        
        {/* Header Area (Edit Buttons) */}
        <header className="flex justify-end mb-6 space-x-2 sticky top-4 z-50">
           {isEditMode ? (
             <>
                <button 
                  onClick={() => setIsBgModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/80 hover:bg-blue-500 border border-blue-400/30 backdrop-blur-md transition-colors text-white text-sm font-medium"
                >
                  <ImageIcon size={16} />
                  <span className="hidden sm:inline">Arkaplan</span>
                </button>
                <button 
                  onClick={resetLayout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 backdrop-blur-md transition-colors text-white/90 text-sm font-medium"
                >
                  <RefreshCcw size={16} />
                  <span className="hidden sm:inline">Sıfırla</span>
                </button>
                <button 
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 backdrop-blur-md transition-all text-white text-sm font-medium animate-fade-in"
                >
                  <Check size={16} />
                  <span>Bitti</span>
                </button>
             </>
           ) : (
             <button 
               onClick={() => setIsEditMode(true)}
               className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all text-white/90 text-sm font-medium"
             >
               <Pencil size={16} />
               <span className="hidden sm:inline">Düzenle</span>
             </button>
           )}
        </header>

        <main className="flex-1 flex flex-col items-center max-w-7xl mx-auto w-full transition-all">
          
          {/* Main Widgets Loop (Excluding Tasks) */}
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
                  className={`
                    relative w-full transition-all duration-200 rounded-2xl
                    ${isEditMode 
                      ? 'bg-white/5 border-2 border-dashed border-white/20 p-4 cursor-move hover:bg-white/10 hover:border-white/40' 
                      : 'border-2 border-transparent'
                    }
                    ${!widget.visible && isEditMode ? 'opacity-50 grayscale' : 'opacity-100'}
                  `}
                >
                  {isEditMode && (
                    <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2 z-20">
                      <GripVertical size={12} />
                      {getWidgetLabel(widget.id)}
                    </div>
                  )}

                  {isEditMode && (
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full z-20 transition-colors ${widget.visible ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-300 hover:bg-red-500/40'}`}
                      title={widget.visible ? "Gizle" : "Göster"}
                    >
                      {widget.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  )}

                  <div className={`w-full ${isEditMode ? 'pointer-events-none' : ''}`}>
                     {renderWidgetContent(widget.id)}
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>

      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addShortcuts} 
      />

      <ShortcutSettingsModal
        isOpen={!!editingShortcut}
        shortcut={editingShortcut}
        onClose={() => setEditingShortcut(null)}
        onSave={updateShortcut}
      />

      <BackgroundSettingsModal
        isOpen={isBgModalOpen}
        currentConfig={bgConfig}
        onClose={() => setIsBgModalOpen(false)}
        onSave={setBgConfig}
      />
    </div>
  );
};

export default App;
