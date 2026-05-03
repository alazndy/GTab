import React, { useState, useEffect } from 'react';
import {
  XMarkIcon, PhotoIcon, PaintBrushIcon, Squares2X2Icon,
  ServerStackIcon, AdjustmentsHorizontalIcon, SwatchIcon,
  CircleStackIcon, Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  BackgroundConfig, BackgroundType, CardConfig,
  Shortcut, WidgetConfig, CustomThemeConfig, StocksConfig, AIConfig
} from '../types';
import {
  exportShortcutsToFile, importShortcutsFromFile,
  DEFAULT_CUSTOM_THEME, getStocksConfig, saveStocksConfig,
  getAIConfig, saveAIConfig
} from '../services/storageService';
import { BackgroundTab, BgMode } from './settings/BackgroundTab';
import { CardsTab } from './settings/CardsTab';
import { WidgetsTab } from './settings/WidgetsTab';
import { DataTab } from './settings/DataTab';
import { ThemeEditorTab } from './settings/ThemeEditorTab';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BackgroundConfig;
  onSave: (config: BackgroundConfig) => void;
  cardConfig: CardConfig;
  onSaveCard: (config: CardConfig) => void;
  shortcuts: Shortcut[];
  onImportShortcuts: (shortcuts: Shortcut[]) => void;
  layout: WidgetConfig[];
  onSaveLayout: (layout: WidgetConfig[]) => void;
  aiConfig: AIConfig;
  onSaveAIConfig: (config: AIConfig) => void;
}

type PageId = 'background' | 'theme-editor' | 'widgets' | 'shortcuts' | 'backup' | 'stocks' | 'ai';

interface NavPage {
  id: PageId;
  icon: React.ReactNode;
  label: string;
  group: string;
  accent: string;
  hidden?: boolean;
}

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen, onClose, currentConfig, onSave, cardConfig, onSaveCard,
  shortcuts, onImportShortcuts, layout, onSaveLayout, aiConfig, onSaveAIConfig
}) => {
  const [page, setPage]                 = useState<PageId>('background');
  const [bgMode, setBgMode]             = useState<BgMode>('themes');
  const [customUrl, setCustomUrl]       = useState('');
  const [localCard, setLocalCard]       = useState<CardConfig>(cardConfig);
  const [localLayout, setLocalLayout]   = useState<WidgetConfig[]>(layout);
  const [stocksConfig, setStocksConfig] = useState<StocksConfig>({ apiKey: '', symbols: [] });
  const [localAIConfig, setLocalAIConfig] = useState<AIConfig>({ geminiApiKey: '' });
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [importError, setImportError]   = useState('');
  const [customTheme, setCustomTheme]   = useState<CustomThemeConfig>(currentConfig.customTheme || DEFAULT_CUSTOM_THEME);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isCustomTheme = currentConfig.type === 'theme' && currentConfig.value === 'custom';

  const PAGES: NavPage[] = [
    { id: 'background',   icon: <PhotoIcon className="w-4 h-4" />,                    label: 'Arka Plan',       group: 'GÖRÜNÜM',   accent: 'violet' },
    { id: 'theme-editor', icon: <PaintBrushIcon className="w-4 h-4" />,               label: 'Tema Editörü',    group: 'GÖRÜNÜM',   accent: 'violet', hidden: !isCustomTheme },
    { id: 'widgets',      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,    label: 'Widgetlar',       group: 'EKRAN',     accent: 'blue' },
    { id: 'shortcuts',    icon: <Squares2X2Icon className="w-4 h-4" />,               label: 'Kısayollar',      group: 'EKRAN',     accent: 'pink' },
    { id: 'backup',       icon: <CircleStackIcon className="w-4 h-4" />,              label: 'Yedekleme',       group: 'SİSTEM',    accent: 'emerald' },
    { id: 'stocks',       icon: <ServerStackIcon className="w-4 h-4" />,              label: 'Borsa API',       group: 'SİSTEM',    accent: 'emerald' },
    { id: 'ai',           icon: <ServerStackIcon className="w-4 h-4" />,              label: 'Yapay Zeka',      group: 'SİSTEM',    accent: 'emerald' },
  ];

  const visiblePages = PAGES.filter(p => !p.hidden);

  const ACCENT_MAP: Record<string, { nav: string; dot: string; badge: string }> = {
    violet:  { nav: 'bg-violet-500/15 text-violet-300 border-l-2 border-violet-400',  dot: 'bg-violet-400',  badge: 'bg-violet-500/20 text-violet-300' },
    blue:    { nav: 'bg-blue-500/15 text-blue-300 border-l-2 border-blue-400',        dot: 'bg-blue-400',    badge: 'bg-blue-500/20 text-blue-300' },
    pink:    { nav: 'bg-pink-500/15 text-pink-300 border-l-2 border-pink-400',        dot: 'bg-pink-400',    badge: 'bg-pink-500/20 text-pink-300' },
    emerald: { nav: 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  };

  useEffect(() => {
    if (isOpen) {
      setLocalCard(cardConfig);
      setLocalLayout(layout);
      setStocksConfig(getStocksConfig());
      setLocalAIConfig(getAIConfig());
      if (currentConfig.customTheme) setCustomTheme(currentConfig.customTheme);
    }
  }, [isOpen, cardConfig, layout]);

  if (!isOpen) return null;

  const applyBg = (type: BackgroundType, value: string) => {
    const isCustom = type === 'theme' && value === 'custom';
    onSave({ ...currentConfig, type, value, customTheme: isCustom ? customTheme : undefined });
    if (isCustom) setPage('theme-editor');
    else onClose();
  };

  const cardSet = <K extends keyof CardConfig>(k: K, v: CardConfig[K]) => {
    const next = { ...localCard, [k]: v };
    setLocalCard(next);
    onSaveCard(next);
  };

  const updateCustomTheme = (updates: Partial<CustomThemeConfig>) => {
    const next = { ...customTheme, ...updates };
    setCustomTheme(next);
    onSave({ ...currentConfig, customTheme: next });
  };

  const doExport = () => exportShortcutsToFile(shortcuts);
  const doImport = async () => {
    setImportStatus('idle');
    try {
      const data = await importShortcutsFromFile();
      onImportShortcuts(data);
      setImportStatus('ok');
    } catch (e) {
      setImportStatus('err');
      setImportError(e instanceof Error ? e.message : 'Bilinmeyen hata');
    }
  };

  const activePage = PAGES.find(p => p.id === page) || PAGES[0];
  const accentStyles = ACCENT_MAP[activePage.accent];

  // Group pages for sidebar rendering
  const groups = Array.from(new Set(visiblePages.map(p => p.group)));

  const navigateTo = (id: PageId) => {
    setPage(id);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <SwatchIcon className="w-4 h-4 text-white/60" />
          </div>
          <div>
            <div className="text-xs font-bold text-white/80">GTab</div>
            <div className="text-[10px] text-white/30">Ayarlar</div>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map(group => (
          <div key={group}>
            <div className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
              {group}
            </div>
            <div className="space-y-0.5">
              {visiblePages
                .filter(p => p.group === group)
                .map(p => {
                  const isActive = page === p.id;
                  const ac = ACCENT_MAP[p.accent];
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigateTo(p.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? ac.nav
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span className={isActive ? '' : 'opacity-60'}>{p.icon}</span>
                      <span>{p.label}</span>
                      {isActive && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${ac.dot}`} />}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Version badge */}
      <div className="px-4 py-3 border-t border-white/8">
        <div className="text-[10px] text-white/20 text-center">v4.4.1</div>
      </div>
    </nav>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0c0c12] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden text-white">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex w-52 flex-col flex-shrink-0 bg-black/30 border-r border-white/8">
          <SidebarContent />
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        {mobileSidebarOpen && (
          <>
            <div className="md:hidden absolute inset-0 bg-black/50 z-10" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="md:hidden absolute left-0 top-0 bottom-0 w-52 bg-[#0c0c12] border-r border-white/10 z-20 flex flex-col">
              <SidebarContent />
            </aside>
          </>
        )}

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Content Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 shrink-0 bg-black/20">
            {/* Mobile menu */}
            <button
              className="md:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Bars3Icon className="w-4 h-4" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{activePage.group}</span>
              <span className="text-white/15">/</span>
              <span className={`text-xs font-semibold ${ACCENT_MAP[activePage.accent].badge.split(' ')[1]}`}>
                {activePage.label}
              </span>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {page === 'background' && (
              <BackgroundTab
                bgMode={bgMode}
                setBgMode={setBgMode}
                currentConfig={currentConfig}
                applyBg={applyBg}
                customUrl={customUrl}
                setCustomUrl={setCustomUrl}
              />
            )}

            {page === 'theme-editor' && (
              <ThemeEditorTab customTheme={customTheme} updateCustomTheme={updateCustomTheme} />
            )}

            {page === 'widgets' && (
              <WidgetsTab
                localLayout={localLayout}
                setLocalLayout={setLocalLayout}
                onSaveLayout={onSaveLayout}
                currentConfig={currentConfig}
                onSaveBgConfig={onSave}
              />
            )}

            {page === 'shortcuts' && (
              <CardsTab localCard={localCard} cardSet={cardSet} />
            )}

            {(page === 'backup' || page === 'stocks' || page === 'ai') && (
              <DataTab
                shortcuts={shortcuts}
                doExport={doExport}
                doImport={doImport}
                importStatus={importStatus}
                importError={importError}
                stocksConfig={stocksConfig}
                setStocksConfig={setStocksConfig}
                saveStocksConfig={saveStocksConfig}
                aiConfig={localAIConfig}
                setAIConfig={setLocalAIConfig}
                saveAIConfig={onSaveAIConfig}
                initialSection={page === 'ai' ? 'ai' : (page === 'stocks' ? 'stocks' : 'backup')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;
