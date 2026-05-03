import React, { useRef, useCallback, useMemo, Suspense } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import TasksWidget from './components/TasksWidget';
import GmailWidget from './components/GmailWidget';
import CalendarWidget from './components/CalendarWidget';
import StocksWidget from './components/StocksWidget';
import GoogleTasksWidget from './components/GoogleTasksWidget';
import GoogleKeepWidget from './components/GoogleKeepWidget';
import WeatherWidget from './components/WeatherWidget';
import PomodoroWidget from './components/PomodoroWidget';
import SpotifyWidget from './components/SpotifyWidget';
import { WidgetPicker } from './components/WidgetPicker';
import RSSWidget from './components/RSSWidget';
import GitHubWidget from './components/GitHubWidget';

const AddModal = React.lazy(() => import('./components/AddModal'));
const ShortcutSettingsModal = React.lazy(() => import('./components/ShortcutSettingsModal'));
const BackgroundSettingsModal = React.lazy(() => import('./components/BackgroundSettingsModal'));
const ClockSettingsModal = React.lazy(() => import('./components/ClockSettingsModal'));
const FolderViewModal = React.lazy(() => import('./components/FolderViewModal'));

import { Shortcut, Category, WidgetId, ThemeId } from './types';
import { useGTab } from './context/GTabContext';
import { useWidgetDnD } from './hooks/useWidgetDnD';
import { useWidgetResizer } from './hooks/useWidgetResizer';
import { useFreeLayoutDrag } from './hooks/useFreeLayoutDrag';

import { getThemeStyles } from './utils/themeStyles';
import { AppBackground } from './components/AppBackground';
import { HeaderControls } from './components/HeaderControls';
import { WidgetWrapper } from './components/WidgetWrapper';
import { CategoryFilterWidget } from './components/CategoryFilterWidget';
import { ShortcutGridWidget } from './components/ShortcutGridWidget';
import QuoteDisplay from './components/QuoteDisplay';

const App: React.FC = () => {
  const {
    shortcuts, setShortcuts,
    layout, setLayout,
    bgConfig, setBgConfig,
    clockConfig, setClockConfig,
    cardConfig, setCardConfig,
    filterCategory, setFilterCategory,
    filterProfile, setFilterProfile,
    activeFolderId, setActiveFolderId,
    isEditMode, setIsEditMode,
    isModalOpen, setIsModalOpen,
    isBgModalOpen, setIsBgModalOpen,
    isClockModalOpen, setIsClockModalOpen,
    editingShortcut, setEditingShortcut,
    pendingUrl, setPendingUrl,
    activeBgUrl,
    isBgImageLoaded,
    addShortcuts, deleteShortcut, updateShortcut,
    toggleWidgetVisibility, updateWidgetConfig, resetLayout
  } = useGTab();

  // --- Theme Management ---
  const activeTheme = useMemo(() => {
    if (bgConfig.type === 'theme') return bgConfig.value as ThemeId;
    return 'default';
  }, [bgConfig]);

  const themeStyles = useMemo(() => getThemeStyles(activeTheme), [activeTheme]);

  // --- Logic Hooks ---
  const [showQuickSettings, setShowQuickSettings] = React.useState<WidgetId | null>(null);

  const { draggedId, dragOverId, liveLayout, onDragStart, onDragEnter, onDragOver, onDragEnd } = useWidgetDnD({
    layout,
    onReorder: setLayout
  });

  const { handlePointerDown: freeLayoutDragHandler } = useFreeLayoutDrag({
    snapGridSize: 20,
    updateWidgetConfig
  });

  const { handlePointerDown: resizeHandler } = useWidgetResizer({ snapGridSize: 20 });

  // Extract logic moved to ShortcutGridWidget and CategoryFilterWidget

  const groups = useMemo(() => shortcuts.filter(s => s.isFolder), [shortcuts]);
  const mainWidgets = layout;
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

  const canvasMinHeight = useMemo(() => {
    if (!bgConfig.isFreeLayout) return 'auto';
    const maxY = mainWidgets.reduce((max, w) => {
      if (!w.visible && !isEditMode) return max;
      const bottom = (w.y !== undefined ? w.y : 0) + (w.heightPx || 400);
      return Math.max(max, bottom);
    }, 600);
    return `${maxY + 100}px`;
  }, [mainWidgets, bgConfig.isFreeLayout, isEditMode]);

  const mainAlignClass = useMemo(() => {
    const map: Record<string, string> = {
      left: 'mr-auto ml-0',
      center: 'mx-auto',
      right: 'ml-auto mr-0',
    };
    return map[cardConfig.alignment] ?? 'mx-auto';
  }, [cardConfig.alignment]);

  // --- Rendering Helper ---
  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'clock':
        return <Clock config={clockConfig} isEditMode={isEditMode} onOpenSettings={() => setIsClockModalOpen(true)} />;
      case 'search':
        return <SearchBar />;
      case 'tasks':
        return <TasksWidget />;
      case 'categories':
        return <CategoryFilterWidget />;
      case 'shortcuts':
        return <ShortcutGridWidget />;
      case 'gmail': return <GmailWidget />;
      case 'calendar': return <CalendarWidget />;
      case 'stocks': return <StocksWidget />;
      case 'google-tasks': return <GoogleTasksWidget />;
      case 'google-keep': return <GoogleKeepWidget />;
      case 'weather': return <WeatherWidget />;
      case 'pomodoro': return <PomodoroWidget />;
      case 'spotify': return <SpotifyWidget />;
      case 'rss': return <RSSWidget />;
      case 'github': return <GitHubWidget />;
      default: return null;
    }
  };

  const getWidgetLabel = (id: WidgetId) => {
    switch(id) {
      case 'clock': return 'Saat & Tarih';
      case 'search': return 'Arama Çubuğu';
      case 'tasks': return 'Görevler (Yerel)';
      case 'categories': return 'Kategori & Profil Filtreleri';
      case 'shortcuts': return 'Kısayol Izgarası';
      case 'gmail': return 'Gmail';
      case 'calendar': return 'Takvim';
      case 'stocks': return 'Borsa';
      case 'google-tasks': return 'Google Görevler';
      case 'google-keep': return 'Google Keep';
      case 'weather': return 'Hava Durumu';
      case 'pomodoro': return 'Pomodoro';
      case 'spotify': return 'Spotify';
      case 'rss': return 'RSS / Haber';
      case 'github': return 'GitHub Aktivite';
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
      <AppBackground 
        bgConfig={bgConfig} 
        isThemeBg={isThemeBg} 
        isColorBg={isColorBg} 
        activeBgUrl={activeBgUrl} 
        isBgImageLoaded={isBgImageLoaded} 
        themeOverlayClass={themeStyles.overlay || ''} 
        themeOverlayStyle={themeStyles.overlayStyle}
        themeOrbs={themeStyles.orbs}
      />

      {/* Header, main content, etc. */}

      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-6 lg:p-8 h-full w-full">
        <HeaderControls 
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          setIsBgModalOpen={setIsBgModalOpen}
          resetLayout={resetLayout}
        />

        <main className={`flex-1 flex flex-col items-center w-full transition-all ${mainAlignClass} ${bgConfig.isFreeLayout ? 'relative' : ''}`}>
          <div 
            className={`w-full ${bgConfig.isFreeLayout ? 'absolute top-0 left-0' : 'flex flex-row flex-wrap justify-start items-start'}`}
            style={!bgConfig.isFreeLayout ? { gap: `${bgConfig.widgetGap ?? 24}px` } : undefined}
            style={bgConfig.isFreeLayout ? { minHeight: canvasMinHeight } : undefined}
          >
            {mainWidgets.map((widget, index) => {
              if (!widget.visible) return null;
              
              return (
                <WidgetWrapper
                  key={widget.id}
                  widget={widget}
                  index={index}
                  isEditMode={isEditMode}
                  activeTheme={activeTheme}
                  themeStyles={themeStyles}
                  showQuickSettings={showQuickSettings}
                  setShowQuickSettings={setShowQuickSettings}
                  draggedId={draggedId}
                  dragOverId={dragOverId}
                  onDragStart={onDragStart}
                  onDragEnter={onDragEnter}
                  onDragOver={onDragOver}
                  onDragEnd={onDragEnd}
                  updateWidgetConfig={updateWidgetConfig}
                  setIsBgModalOpen={setIsBgModalOpen}
                  setIsClockModalOpen={setIsClockModalOpen}
                  toggleWidgetVisibility={toggleWidgetVisibility}
                  resizeHandler={resizeHandler}
                  getWidgetLabel={getWidgetLabel}
                  isFreeLayout={bgConfig.isFreeLayout}
                  onPointerDownFreeDrag={freeLayoutDragHandler}
                >
                  {renderWidgetContent(widget.id)}
                </WidgetWrapper>
              );
            })}
          </div>
        </main>
      </div>

      {isEditMode && (
        <WidgetPicker
          layout={layout}
          toggleWidgetVisibility={toggleWidgetVisibility}
        />
      )}

      <Suspense fallback={null}>
        {activeFolder && (
            <FolderViewModal
              folder={activeFolder} isOpen={true} onClose={() => setActiveFolderId(null)}
              onEditItem={setEditingShortcut} onDeleteItem={deleteShortcut} onAddItem={() => setIsModalOpen(true)}
            />
        )}
        <AddModal
          isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setPendingUrl(''); }}
          onAdd={addShortcuts} groups={groups} isInsideGroup={activeFolderId !== null} initialUrl={pendingUrl}
        />
        <ShortcutSettingsModal isOpen={!!editingShortcut} shortcut={editingShortcut} allShortcuts={shortcuts} onClose={() => setEditingShortcut(null)} onSave={updateShortcut} />
        <BackgroundSettingsModal
          isOpen={isBgModalOpen} currentConfig={bgConfig} onClose={() => setIsBgModalOpen(false)} onSave={setBgConfig}
          cardConfig={cardConfig} onSaveCard={setCardConfig} shortcuts={shortcuts} onImportShortcuts={setShortcuts}
          layout={layout} onSaveLayout={setLayout}
        />
        <ClockSettingsModal isOpen={isClockModalOpen} config={clockConfig} onClose={() => setIsClockModalOpen(false)} onSave={setClockConfig} />
      </Suspense>

      <QuoteDisplay />
    </div>
  );
};

export default App;
