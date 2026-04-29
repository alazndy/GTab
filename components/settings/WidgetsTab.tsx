import React, { useState } from 'react';
import { AdjustmentsHorizontalIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon, ViewColumnsIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { WIDGET_LABELS } from './SettingsShared';
import { WidgetConfig, BackgroundConfig } from '../../types';

interface WidgetsTabProps {
  localLayout: WidgetConfig[];
  setLocalLayout: (layout: WidgetConfig[]) => void;
  onSaveLayout: (layout: WidgetConfig[]) => void;
  currentConfig: BackgroundConfig;
  onSaveBgConfig: (config: BackgroundConfig) => void;
}

export const WidgetsTab: React.FC<WidgetsTabProps> = ({ localLayout, setLocalLayout, onSaveLayout, currentConfig, onSaveBgConfig }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const visibleWidgets = localLayout.filter(w => w.visible);

  return (
    <div className="space-y-5 animate-fade-in">

        {/* ── 1. Widget Aç/Kapat ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <ViewColumnsIcon className="w-4 h-4 text-blue-400"/> Widget Yönetimi
            </h3>
            <p className="text-[11px] text-white/40 mb-4">Görmek istediğiniz alanları açıp kapatın.</p>
            <div className="flex flex-wrap gap-2">
                {localLayout.map(w => (
                    <button
                        key={w.id}
                        onClick={() => {
                            const next = localLayout.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item);
                            setLocalLayout(next); onSaveLayout(next);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${w.visible ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                    >
                        {w.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                        {WIDGET_LABELS[w.id] || w.id}
                    </button>
                ))}
            </div>
        </div>

        {/* ── 2. Yerleşim Ayarları ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-green-400"/> Yerleşim
            </h3>
            
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="text-xs font-medium text-white">Serbest Yerleşim</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">Kapalıyken grid, açıkken serbest konumlandırma.</p>
                </div>
                <button 
                    onClick={() => {
                      const newIsFree = !currentConfig.isFreeLayout;
                      onSaveBgConfig({ ...currentConfig, isFreeLayout: newIsFree });
                      if (newIsFree) {
                        const newLayout = localLayout.map((w, idx) => {
                          if (w.x === undefined || w.y === undefined) {
                            return { ...w, x: (idx % 2) * 450 + 50, y: Math.floor(idx / 2) * 350 + 50 };
                          }
                          return w;
                        });
                        setLocalLayout(newLayout);
                        onSaveLayout(newLayout);
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${currentConfig.isFreeLayout ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${currentConfig.isFreeLayout ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
            </div>

            {currentConfig.isFreeLayout && (
                <button 
                    onClick={() => {
                      if (confirm('Tüm widget konumları sıfırlanacak. Emin misiniz?')) {
                        const newLayout = localLayout.map(w => {
                          const { x, y, ...rest } = w;
                          return rest;
                        });
                        setLocalLayout(newLayout);
                        onSaveLayout(newLayout);
                      }
                    }}
                    className="mt-2 w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-medium flex items-center justify-center gap-2"
                >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Konumları Sıfırla
                </button>
            )}
        </div>

        {/* ── 3. Detaylı Ayarlar (Açılır-Kapanır) ── */}
        {visibleWidgets.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="w-4 h-4 text-purple-400"/> Opaklık & Çerçeve
                    </h3>
                    {showAdvanced ? <ChevronUpIcon className="w-4 h-4 text-white/40" /> : <ChevronDownIcon className="w-4 h-4 text-white/40" />}
                </button>

                {showAdvanced && (
                    <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleWidgets
                            .sort((a, b) => a.order - b.order)
                            .map(w => (
                            <div key={w.id} className="border border-white/5 rounded-xl p-4 bg-black/20">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-medium text-white/90">{WIDGET_LABELS[w.id]}</h4>
                                    <button onClick={() => {
                                        const next = localLayout.map(item => item.id === w.id ? { ...item, showBorder: item.showBorder === false ? true : false } : item);
                                        setLocalLayout(next); onSaveLayout(next);
                                        }}
                                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold transition-colors ${w.showBorder !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                    >
                                        Çerçeve: {w.showBorder !== false ? 'Açık' : 'Kapalı'}
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between mb-1 text-[10px] text-white/40"><span>Arkaplan</span><span>{w.opacity ?? 10}%</span></div>
                                        <input type="range" min={0} max={100} step={5} value={w.opacity ?? 10} onChange={e => {
                                                const next = localLayout.map(item => item.id === w.id ? { ...item, opacity: Number(e.target.value) } : item);
                                                setLocalLayout(next); onSaveLayout(next);
                                            }}
                                            className="w-full accent-white/80 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {w.showBorder !== false && (
                                        <div>
                                            <div className="flex justify-between mb-1 text-[10px] text-white/40"><span>Çerçeve</span><span>{w.borderOpacity ?? 20}%</span></div>
                                            <input type="range" min={0} max={100} step={5} value={w.borderOpacity ?? 20} onChange={e => {
                                                const next = localLayout.map(item => item.id === w.id ? { ...item, borderOpacity: Number(e.target.value) } : item);
                                                setLocalLayout(next); onSaveLayout(next);
                                            }}
                                            className="w-full accent-green-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
