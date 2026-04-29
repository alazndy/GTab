import React, { useState, useEffect } from 'react';
import {
  XMarkIcon, PhotoIcon, PaintBrushIcon,
  Squares2X2Icon, ServerStackIcon, AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  BackgroundConfig, BackgroundType, CardConfig,
  Shortcut, WidgetConfig, CustomThemeConfig, StocksConfig
} from '../types';
import { exportShortcutsToFile, importShortcutsFromFile, DEFAULT_CUSTOM_THEME, getStocksConfig, saveStocksConfig } from '../services/storageService';

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
}

type Section = 'background' | 'cards' | 'widgets' | 'data' | 'theme-editor';

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen, onClose, currentConfig, onSave, cardConfig, onSaveCard, shortcuts, onImportShortcuts, layout, onSaveLayout
}) => {
  const [section, setSection]         = useState<Section>('background');
  const [bgMode, setBgMode]           = useState<BgMode>('themes');
  const [customUrl, setCustomUrl]     = useState('');
  const [localCard, setLocalCard]     = useState<CardConfig>(cardConfig);
  const [localLayout, setLocalLayout] = useState<WidgetConfig[]>(layout);
  const [stocksConfig, setStocksConfig] = useState<StocksConfig>({ apiKey: '', symbols: [] });
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [importError, setImportError] = useState('');

  // Custom Theme State
  const [customTheme, setCustomTheme] = useState<CustomThemeConfig>(currentConfig.customTheme || DEFAULT_CUSTOM_THEME);

  useEffect(() => {
    if (isOpen) {
        setLocalCard(cardConfig);
        setLocalLayout(layout);
        setStocksConfig(getStocksConfig());
        if (currentConfig.customTheme) setCustomTheme(currentConfig.customTheme);
    }
  }, [isOpen, cardConfig, layout, currentConfig.customTheme]);

  if (!isOpen) return null;

  const applyBg  = (type: BackgroundType, value: string) => { 
    onSave({ type, value, customTheme: value === 'custom' ? customTheme : undefined }); 
    if (value !== 'custom') onClose(); 
    else setSection('theme-editor');
  };

  const cardSet  = <K extends keyof CardConfig>(k: K, v: CardConfig[K]) => {
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

  const NAV: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: 'background', icon: <PhotoIcon className="w-5 h-5" />,                      label: 'Arkaplan'  },
    { id: 'cards',      icon: <Squares2X2Icon className="w-5 h-5" />,                 label: 'Kart & Yazı' },
    { id: 'widgets',    icon: <AdjustmentsHorizontalIcon className="w-5 h-5" />,      label: 'Alanlar'   },
    { id: 'data',       icon: <ServerStackIcon className="w-5 h-5" />,                label: 'Veri'      },
  ];

  if (currentConfig.type === 'theme' && currentConfig.value === 'custom') {
    NAV.splice(1, 0, { id: 'theme-editor', icon: <PaintBrushIcon className="w-5 h-5" />, label: 'Tema Editörü' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up text-white">

        {/* ── Başlık ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/20">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <PaintBrushIcon className="w-4 h-4 text-white/50" />
            Görünüm Ayarları
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Gövde: sidebar + içerik ── */}
        <div className="flex flex-1 min-h-0">

          {/* Sidebar */}
          <nav className="w-44 flex-shrink-0 flex flex-col gap-1.5 p-4 border-r border-white/5 bg-black/20">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-2 mb-2">Ayarlar Menüsü</div>
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  section === n.id
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          {/* İçerik */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-black/5">
            {section === 'background' && (
                <BackgroundTab 
                    bgMode={bgMode} 
                    setBgMode={setBgMode} 
                    currentConfig={currentConfig} 
                    applyBg={applyBg} 
                    customUrl={customUrl} 
                    setCustomUrl={setCustomUrl} 
                />
            )}
            
            {section === 'theme-editor' && (
                <ThemeEditorTab 
                    customTheme={customTheme} 
                    updateCustomTheme={updateCustomTheme} 
                />
            )}

            {section === 'cards' && (
                <CardsTab 
                    localCard={localCard} 
                    cardSet={cardSet} 
                />
            )}

            {section === 'widgets' && (
                <WidgetsTab 
                    localLayout={localLayout} 
                    setLocalLayout={setLocalLayout} 
                    onSaveLayout={onSaveLayout} 
                    currentConfig={currentConfig}
                    onSaveBgConfig={onSave}
                />
            )}

            {section === 'data' && (
                <DataTab 
                    shortcuts={shortcuts} 
                    doExport={doExport} 
                    doImport={doImport} 
                    importStatus={importStatus} 
                    importError={importError} 
                    stocksConfig={stocksConfig} 
                    setStocksConfig={setStocksConfig} 
                    saveStocksConfig={saveStocksConfig} 
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;
