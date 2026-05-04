import React, { useRef, useCallback, useMemo, Suspense } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { WidgetPicker } from './components/WidgetPicker';
import CommandPalette from './components/CommandPalette';
import { renderWidget, getWidgetLabel } from './registries/widgetRegistry';

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
import QuoteDisplay from './components/QuoteDisplay';
import StatusBar from './components/StatusBar';

import { resolveTargetUrl, getFavicon } from './components/utils/shortcutUtils';

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
    aiConfig, setAIConfig,
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  // Global Sync for Dock/Status Bar
  React.useEffect(() => {
    const sync = () => {
      const statusBarShortcuts = shortcuts
        .filter(s => s.category === Category.STATUS_BAR)
        .map(s => {
          const profile = s.profiles?.find(p => p.id === s.defaultProfileId);
          const url = resolveTargetUrl(s, profile);
          return {
            title: s.title,
            url,
            icon: getFavicon(url, s.url)
          };
        });

      let pomodoro = null;
      let weather = null;
      let spotify = null;
      let gmailUnread = 0;
      let taskCount = 0;

      try {
        const w = localStorage.getItem('gtab_weather_v2');
        if (w) { const d = JSON.parse(w); weather = { temp: d.temp }; }
      } catch {}
      
      const gmail = localStorage.getItem('gtab_status_gmail_unread');
      if (gmail !== null) gmailUnread = parseInt(gmail) || 0;
      
      try {
        const sp = localStorage.getItem('gtab_status_spotify');
        if (sp) spotify = JSON.parse(sp);
      } catch {}
      
      taskCount = shortcuts.reduce((acc, s) => {
        // This is a rough estimation since tasks state is handled by GTabContext
        // but we'll use the proper tasks state from the hook below
        return acc;
      }, 0);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
         // Reading tasks and pomodoro status requires fresh data
         // For now, we'll sync shortcuts and the basics. 
         // Real-time pomodoro sync happens via event listener below.
         chrome.storage.local.get(['gtab_global_status'], (result) => {
           const currentStatus = result.gtab_global_status || {};
           chrome.storage.local.set({
             gtab_global_status: {
               ...currentStatus,
               navShortcuts: statusBarShortcuts,
               weather,
               gmailUnread,
               spotify,
               theme: {
                 accent: themeStyles.accentColor,
                 bg: themeStyles.menuBg,
                 border: themeStyles.menuBorder
               }
             }
           });
         });
         }
         };

         sync();
         const id = setInterval(sync, 30_000); // Sync every 30s
         return () => clearInterval(id);
         }, [shortcuts, themeStyles]);
  // Real-time Pomodoro & Tasks Sync
  const { tasks } = useGTab();
  React.useEffect(() => {
    const handlePomo = (e: any) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['gtab_global_status'], (result) => {
          chrome.storage.local.set({
            gtab_global_status: {
              ...(result.gtab_global_status || {}),
              pomodoro: e.detail
            }
          });
        });
      }
    };
    window.addEventListener('gtab:pomodoro-status', handlePomo);

    // Sync tasks
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['gtab_global_status'], (result) => {
        chrome.storage.local.set({
          gtab_global_status: {
            ...(result.gtab_global_status || {}),
            taskCount: tasks.filter(t => !t.completed).length
          }
        });
      });
    }

    return () => window.removeEventListener('gtab:pomodoro-status', handlePomo);
  }, [tasks]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = aiConfig.commandPaletteShortcut || 'Alt+K';
      
      let isTriggered = false;
      if (shortcut === 'Alt+K') isTriggered = e.altKey && e.key.toLowerCase() === 'k';
      else if (shortcut === 'Ctrl+K') isTriggered = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      else if (shortcut === 'Cmd+K') isTriggered = e.metaKey && e.key.toLowerCase() === 'k';
      else if (shortcut === 'Ctrl+Space') isTriggered = (e.ctrlKey || e.metaKey) && e.code === 'Space';

      if (isTriggered) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiConfig.commandPaletteShortcut]);

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
            style={{
              ...(!bgConfig.isFreeLayout ? { gap: `${bgConfig.widgetGap ?? 24}px` } : {}),
              ...(bgConfig.isFreeLayout ? { minHeight: canvasMinHeight } : {})
            }}
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
                  {renderWidget(widget.id)}
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
          aiConfig={aiConfig} onSaveAIConfig={setAIConfig}
        />
        <ClockSettingsModal isOpen={isClockModalOpen} config={clockConfig} onClose={() => setIsClockModalOpen(false)} onSave={setClockConfig} />
      </Suspense>

      <QuoteDisplay />
      <StatusBar />
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
};

export default App;
