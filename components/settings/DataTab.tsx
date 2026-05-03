import React, { useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ServerStackIcon, CheckIcon, XMarkIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { SectionLabel } from './SettingsShared';
import { Shortcut, StocksConfig, AIConfig } from '../../types';
import { exportFullBackup, importFullBackup } from '../../services/storageService';

interface DataTabProps {
  shortcuts: Shortcut[];
  doExport: () => void;
  doImport: () => void;
  importStatus: 'idle' | 'ok' | 'err';
  importError: string;
  stocksConfig: StocksConfig;
  setStocksConfig: (config: StocksConfig) => void;
  saveStocksConfig: (config: StocksConfig) => void;
  aiConfig: AIConfig;
  setAIConfig: (config: AIConfig) => void;
  saveAIConfig: (config: AIConfig) => void;
  initialSection?: 'backup' | 'stocks' | 'ai';
}

export const DataTab: React.FC<DataTabProps> = ({
  shortcuts, doExport, doImport, importStatus, importError,
  stocksConfig, setStocksConfig, saveStocksConfig,
  aiConfig, setAIConfig, saveAIConfig,
  initialSection
}) => {
  const [fullImportStatus, setFullImportStatus] = useState<'idle' | 'err'>('idle');
  const [fullImportError, setFullImportError] = useState('');

  const handleFullImport = async () => {
    try {
      setFullImportStatus('idle');
      await importFullBackup();
    } catch (e: any) {
      setFullImportStatus('err');
      setFullImportError(e.message || 'İçe aktarma başarısız.');
    }
  };

  const showBackup = !initialSection || initialSection === 'backup';
  const showStocks = !initialSection || initialSection === 'stocks';
  const showAI = !initialSection || initialSection === 'ai';

  return (
    <div className="flex flex-col gap-8">

      {showBackup && (
        <>
          {/* Tam Yedekleme */}
          <div className="flex flex-col gap-4">
            <SectionLabel>Tam Yedekleme</SectionLabel>
            <p className="text-xs text-white/40 leading-relaxed">
              Tüm ayarları, widget yerleşimini, temayı, kısayolları ve notları tek bir dosyada yedekle. İçe aktarınca sayfa yenilenir.
            </p>

            <button onClick={exportFullBackup} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CircleStackIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium">Tam Yedek Al</div>
                <div className="text-xs text-white/40 mt-0.5">Yerleşim · Tema · Kısayollar · Notlar · Ayarlar</div>
              </div>
              <ArrowDownTrayIcon className="w-4 h-4 text-white/30" />
            </button>

            <button onClick={handleFullImport} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <ArrowUpTrayIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium">Tam Yedek Yükle</div>
                <div className="text-xs text-white/40 mt-0.5">gtab-full-backup-*.json · Tüm veriler değişir</div>
              </div>
            </button>

            {fullImportStatus === 'err' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <XMarkIcon className="w-4 h-4 flex-shrink-0" />{fullImportError}
              </div>
            )}
          </div>

          {/* Sadece Kısayollar */}
          <div className="flex flex-col gap-4">
            <SectionLabel>Sadece Kısayollar</SectionLabel>
            <p className="text-xs text-white/40 leading-relaxed">
              Yalnızca kısayolları yedekle veya başka bir profil/cihazdan aktar.
            </p>

            <button onClick={doExport} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                <ArrowDownTrayIcon className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium">Kısayolları Dışa Aktar</div>
                <div className="text-xs text-white/40 mt-0.5">{shortcuts.length} kısayol · JSON indir</div>
              </div>
            </button>

            <button onClick={doImport} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                <ArrowUpTrayIcon className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium">Kısayolları İçe Aktar</div>
                <div className="text-xs text-white/40 mt-0.5">JSON dosyasından yükle · mevcut liste değişir</div>
              </div>
            </button>

            {importStatus === 'ok' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/15 text-white/80 text-sm">
                <CheckIcon className="w-4 h-4 flex-shrink-0" />Kısayollar başarıyla yüklendi.
              </div>
            )}
            {importStatus === 'err' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <XMarkIcon className="w-4 h-4 flex-shrink-0" />{importError}
              </div>
            )}
          </div>
        </>
      )}

      {showStocks && (
        <div className="flex flex-col gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ServerStackIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Borsa Verileri (Alpha Vantage)</h3>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Borsa verileri Alpha Vantage üzerinden çekilir. Ücretsiz bir API anahtarı kullanarak daha kararlı veriler alabilirsiniz.
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Alpha Vantage API Key</label>
              <input
                type="password"
                value={stocksConfig.apiKey}
                onChange={e => { const n = { ...stocksConfig, apiKey: e.target.value }; setStocksConfig(n); saveStocksConfig(n); }}
                placeholder="API Key yapıştırın..."
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Takip Edilen Semboller</label>
              <input
                type="text"
                value={stocksConfig.symbols.join(', ')}
                onChange={e => {
                  const symbols = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  const n = { ...stocksConfig, symbols };
                  setStocksConfig(n);
                  saveStocksConfig(n);
                }}
                placeholder="AAPL, MSFT, GOOGL..."
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {showAI && (
        <div className="flex flex-col gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <ServerStackIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Yapay Zeka (Gemini AI)</h3>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Komut paleti ve akıllı özellikler için Google Gemini API kullanılır. 
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline ml-1">Buradan ücretsiz anahtar alabilirsiniz.</a>
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Gemini API Key</label>
              <input
                type="password"
                value={aiConfig.geminiApiKey}
                onChange={e => { 
                  const n = { ...aiConfig, geminiApiKey: e.target.value }; 
                  setAIConfig(n); 
                  saveAIConfig(n); 
                }}
                placeholder="API Key yapıştırın..."
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/20 focus:border-purple-500/50 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Komut Paleti Kısayolu</label>
              <select
                value={aiConfig.commandPaletteShortcut || 'Alt+K'}
                onChange={e => {
                  const n = { ...aiConfig, commandPaletteShortcut: e.target.value };
                  setAIConfig(n);
                  saveAIConfig(n);
                }}
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-all appearance-none"
              >
                <option value="Alt+K">Alt + K (Önerilen)</option>
                <option value="Ctrl+K">Ctrl + K</option>
                <option value="Cmd+K">Cmd + K (Mac)</option>
                <option value="Ctrl+Space">Ctrl + Space</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-white">Status Bar Aktif</div>
                  <div className="text-[10px] text-white/40">Sayfanın en altında ince bilgi çubuğu</div>
                </div>
                <button
                  onClick={() => {
                    const n = { ...aiConfig, statusBarEnabled: !aiConfig.statusBarEnabled };
                    setAIConfig(n);
                    saveAIConfig(n);
                  }}
                  className={`w-10 h-5 rounded-full transition-all relative ${aiConfig.statusBarEnabled ? 'bg-purple-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${aiConfig.statusBarEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Status Bar Kısayolu</label>
                <select
                  value={aiConfig.statusBarShortcut || 'Alt+S'}
                  onChange={e => {
                    const n = { ...aiConfig, statusBarShortcut: e.target.value };
                    setAIConfig(n);
                    saveAIConfig(n);
                  }}
                  disabled={!aiConfig.statusBarEnabled}
                  className={`w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-all appearance-none ${!aiConfig.statusBarEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="Alt+S">Alt + S</option>
                  <option value="Ctrl+S">Ctrl + S</option>
                  <option value="Cmd+S">Cmd + S (Mac)</option>
                  <option value="Alt+B">Alt + B</option>
                  <option value="Ctrl+B">Ctrl + B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Dock Pozisyonu</label>
                <select
                  value={aiConfig.dockPosition || 'top-center'}
                  onChange={e => {
                    const n = { ...aiConfig, dockPosition: e.target.value as any };
                    setAIConfig(n);
                    saveAIConfig(n);
                  }}
                  disabled={!aiConfig.statusBarEnabled}
                  className={`w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-all appearance-none ${!aiConfig.statusBarEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="top-center">Üst Orta</option>
                  <option value="bottom-center">Alt Orta</option>
                  <option value="top-right">Sağ Üst</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
