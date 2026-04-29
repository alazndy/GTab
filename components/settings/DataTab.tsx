import React from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ServerStackIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SectionLabel } from './SettingsShared';
import { Shortcut, StocksConfig } from '../../types';

interface DataTabProps {
  shortcuts: Shortcut[];
  doExport: () => void;
  doImport: () => void;
  importStatus: 'idle' | 'ok' | 'err';
  importError: string;
  stocksConfig: StocksConfig;
  setStocksConfig: (config: StocksConfig) => void;
  saveStocksConfig: (config: StocksConfig) => void;
}

export const DataTab: React.FC<DataTabProps> = ({ shortcuts, doExport, doImport, importStatus, importError, stocksConfig, setStocksConfig, saveStocksConfig }) => {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
        <SectionLabel>Yedekleme</SectionLabel>
        <p className="text-xs text-white/40 leading-relaxed">
            Tüm kısayolları ve profilleri JSON dosyası olarak yedekle veya başka cihazdan aktar.
        </p>

        <button
            onClick={doExport}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-all"
        >
            <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
            <ArrowDownTrayIcon className="w-5 h-5 text-white/60" />
            </div>
            <div>
            <div className="text-sm font-medium">Dışa Aktar</div>
            <div className="text-xs text-white/40 mt-0.5">{shortcuts.length} kısayol · JSON indir</div>
            </div>
        </button>

        <button
            onClick={doImport}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-all"
        >
            <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
            <ArrowUpTrayIcon className="w-5 h-5 text-white/60" />
            </div>
            <div>
            <div className="text-sm font-medium">İçe Aktar</div>
            <div className="text-xs text-white/40 mt-0.5">JSON dosyasından yükle · mevcut liste değişir</div>
            </div>
        </button>

        {importStatus === 'ok' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/15 text-white/80 text-sm">
            <CheckIcon className="w-4 h-4 flex-shrink-0" />
            Kısayollar başarıyla yüklendi.
            </div>
        )}
        {importStatus === 'err' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <XMarkIcon className="w-4 h-4 flex-shrink-0" />
            {importError}
            </div>
        )}
        </div>

        <div className="flex flex-col gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
            <ServerStackIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Borsa Verileri (Alpha Vantage)</h3>
        </div>
        
        <p className="text-xs text-white/40 leading-relaxed">
            Borsa verileri Alpha Vantage üzerinden çekilir. Ücretsiz bir API anahtarı kullanarak daha kararlı veriler alabilirsiniz. Sembolleri virgülle ayırarak girin (Örn: AAPL, TSLA, BTCUSD).
        </p>

        <div className="space-y-4">
            <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Alpha Vantage API Key</label>
            <input
                type="password"
                value={stocksConfig.apiKey}
                onChange={e => {
                const next = { ...stocksConfig, apiKey: e.target.value };
                setStocksConfig(next);
                saveStocksConfig(next);
                }}
                placeholder="API Key yapıştırın (Varsayılan aktif)..."
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none transition-all"
            />
            </div>

            <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">Takip Edilen Semboller</label>
            <input
                type="text"
                value={stocksConfig.symbols.join(', ')}
                onChange={e => {
                const symbols = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                const next = { ...stocksConfig, symbols };
                setStocksConfig(next);
                saveStocksConfig(next);
                }}
                placeholder="AAPL, MSFT, GOOGL..."
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none transition-all"
            />
            </div>
        </div>
        </div>
    </div>
  );
};
