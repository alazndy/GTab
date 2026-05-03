import React, { useState } from 'react';
import {
  AdjustmentsHorizontalIcon, ArrowPathIcon,
  ViewColumnsIcon, ChevronDownIcon, ChevronUpIcon,
  Square3Stack3DIcon, ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { WIDGET_LABELS } from './SettingsShared';
import { WidgetConfig, BackgroundConfig } from '../../types';

interface WidgetsTabProps {
  localLayout: WidgetConfig[];
  setLocalLayout: (layout: WidgetConfig[]) => void;
  onSaveLayout: (layout: WidgetConfig[]) => void;
  currentConfig: BackgroundConfig;
  onSaveBgConfig: (config: BackgroundConfig) => void;
}

const Toggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? 'bg-blue-500' : 'bg-white/10'}`}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
  </button>
);

export const WidgetsTab: React.FC<WidgetsTabProps> = ({
  localLayout, setLocalLayout, onSaveLayout, currentConfig, onSaveBgConfig
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const visibleWidgets = localLayout.filter(w => w.visible);
  const gap = currentConfig.widgetGap ?? 24;

  const updateLayout = (next: WidgetConfig[]) => { setLocalLayout(next); onSaveLayout(next); };
  const updateBg = (partial: Partial<BackgroundConfig>) => onSaveBgConfig({ ...currentConfig, ...partial });

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── 1. Widget Göster / Gizle ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ViewColumnsIcon className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Widget Listesi</h3>
        </div>
        <p className="text-[11px] text-white/40 mb-4">
          Hangi widget'ların ekranda görüneceğini seç. Eklemek/çıkarmak için edit modundaki <strong className="text-white/60">+</strong> butonunu da kullanabilirsin.
        </p>
        <div className="flex flex-wrap gap-2">
          {localLayout.map(w => (
            <button
              key={w.id}
              onClick={() => updateLayout(localLayout.map(item => item.id === w.id ? { ...item, visible: !item.visible } : item))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                w.visible
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${w.visible ? 'bg-blue-400' : 'bg-white/20'}`} />
              {WIDGET_LABELS[w.id] || w.id}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Yerleşim ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Square3Stack3DIcon className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Yerleşim</h3>
        </div>

        {/* Widget gap slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Widgetlar Arası Boşluk</span>
            <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{gap}px</span>
          </div>
          <input
            type="range" min={0} max={80} step={4}
            value={gap}
            onChange={e => updateBg({ widgetGap: Number(e.target.value) })}
            className="w-full accent-green-400 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/20 mt-1">
            <span>0 – Sıfır boşluk</span>
            <span>80 – Geniş</span>
          </div>
        </div>

        {/* Serbest yerleşim toggle */}
        <div className="flex items-center justify-between py-3 border-t border-white/5">
          <div>
            <div className="text-xs font-medium text-white">Serbest Yerleşim</div>
            <div className="text-[10px] text-white/40 mt-0.5">
              {currentConfig.isFreeLayout ? 'Widgetları sürükleyip istediğin yere bırak' : 'Widgetlar otomatik grid düzeninde sıralanır'}
            </div>
          </div>
          <Toggle
            active={!!currentConfig.isFreeLayout}
            onChange={() => {
              const newIsFree = !currentConfig.isFreeLayout;
              updateBg({ isFreeLayout: newIsFree });
              if (newIsFree) {
                updateLayout(localLayout.map((w, idx) => ({
                  ...w,
                  x: w.x ?? (idx % 2) * 450 + 50,
                  y: w.y ?? Math.floor(idx / 2) * 350 + 50,
                })));
              }
            }}
          />
        </div>

        {/* Serbest modda konum sıfırlama */}
        {currentConfig.isFreeLayout && (
          <button
            onClick={() => {
              if (confirm('Tüm widget konumları sıfırlanacak. Emin misin?')) {
                updateLayout(localLayout.map(({ x, y, ...rest }) => rest));
              }
            }}
            className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-medium flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Konumları Sıfırla
          </button>
        )}
      </div>

      {/* ── 3. Opaklık & Çerçeve (gelişmiş) ── */}
      {visibleWidgets.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Opaklık & Çerçeve</h3>
              <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{visibleWidgets.length} widget</span>
            </div>
            {showAdvanced
              ? <ChevronUpIcon className="w-4 h-4 text-white/40" />
              : <ChevronDownIcon className="w-4 h-4 text-white/40" />}
          </button>

          {showAdvanced && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleWidgets.sort((a, b) => a.order - b.order).map(w => (
                <div key={w.id} className="border border-white/5 rounded-xl p-4 bg-black/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">{WIDGET_LABELS[w.id]}</span>
                    <button
                      onClick={() => updateLayout(localLayout.map(item => item.id === w.id ? { ...item, showBorder: item.showBorder === false ? true : false } : item))}
                      className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold transition-colors ${w.showBorder !== false ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'}`}
                    >
                      Çerçeve {w.showBorder !== false ? 'Açık' : 'Kapalı'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-[10px] text-white/40">
                      <span>Arkaplan</span><span>{w.opacity ?? 10}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={w.opacity ?? 10}
                      onChange={e => updateLayout(localLayout.map(item => item.id === w.id ? { ...item, opacity: Number(e.target.value) } : item))}
                      className="w-full accent-white/80 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {w.showBorder !== false && (
                    <div>
                      <div className="flex justify-between mb-1 text-[10px] text-white/40">
                        <span>Çerçeve</span><span>{w.borderOpacity ?? 20}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={5} value={w.borderOpacity ?? 20}
                        onChange={e => updateLayout(localLayout.map(item => item.id === w.id ? { ...item, borderOpacity: Number(e.target.value) } : item))}
                        className="w-full accent-green-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
