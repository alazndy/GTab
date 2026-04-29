import React from 'react';
import { WidgetConfig } from '../types';
import { useGTab } from '../context/GTabContext';
import { 
  SunIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  Square2StackIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface WidgetQuickSettingsProps {
  widget: WidgetConfig;
  onClose: () => void;
  setIsBgModalOpen: (val: boolean) => void;
  setIsClockModalOpen: (val: boolean) => void;
}

export const WidgetQuickSettings: React.FC<WidgetQuickSettingsProps> = ({
  widget,
  onClose,
  setIsBgModalOpen,
  setIsClockModalOpen
}) => {
  const { 
    clockConfig, setClockConfig, 
    cardConfig, setCardConfig,
    stocksConfig, setStocksConfig,
    updateWidgetConfig
  } = useGTab();

  const renderSpecialSettings = () => {
    switch (widget.id) {
      case 'clock':
        return (
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-3">
             <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
                <ClockIcon className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Saat Ayarları</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/60">24 Saat Formatı</span>
                <button 
                  onClick={() => setClockConfig(prev => ({ ...prev, format: prev.format === '24h' ? '12h' : '24h' }))}
                  className={`text-[9px] px-2 py-1 rounded border transition-all ${clockConfig.format === '24h' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}
                >
                  {clockConfig.format === '24h' ? 'AÇIK' : 'KAPALI'}
                </button>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/60">Saniyeleri Göster</span>
                <button 
                  onClick={() => setClockConfig(prev => ({ ...prev, showSeconds: !prev.showSeconds }))}
                  className={`text-[9px] px-2 py-1 rounded border transition-all ${clockConfig.showSeconds ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}
                >
                  {clockConfig.showSeconds ? 'AÇIK' : 'KAPALI'}
                </button>
             </div>
          </div>
        );
      case 'shortcuts':
        return (
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-3">
             <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
                <Squares2X2Icon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Kısayol Tasarımı</span>
             </div>
             
             <div className="space-y-1.5">
                <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Kart Şekli</span>
                <div className="flex gap-1">
                   {['sharp', 'rounded', 'pill'].map(s => (
                     <button 
                        key={s}
                        onClick={() => setCardConfig(prev => ({ ...prev, shape: s as any }))}
                        className={`flex-1 py-1 text-[8px] rounded border transition-all ${cardConfig.shape === s ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10'}`}
                     >
                       {s.toUpperCase()}
                     </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onClick={() => setCardConfig(prev => ({ ...prev, glowEnabled: !prev.glowEnabled }))}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded-lg border text-[9px] font-bold transition-all ${cardConfig.glowEnabled ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-white/5 text-white/30 border-white/10'}`}
                >
                  <SparklesIcon className="w-3 h-3" /> GLOW
                </button>
                <button 
                  onClick={() => setCardConfig(prev => ({ ...prev, showCardBorder: !prev.showCardBorder }))}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded-lg border text-[9px] font-bold transition-all ${cardConfig.showCardBorder ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}
                >
                  <Square2StackIcon className="w-3 h-3" /> KENARLIK
                </button>
             </div>

             <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase tracking-widest">
                    <span>Arka Plan Opaklığı</span>
                    <span className="text-indigo-400">{cardConfig.bgOpacity}%</span>
                  </div>
                  <input 
                    type="range" min={0} max={100} step={5} 
                    value={cardConfig.bgOpacity} 
                    onChange={e => setCardConfig(prev => ({ ...prev, bgOpacity: Number(e.target.value) }))} 
                    className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                  />
                </div>

                {cardConfig.showCardBorder && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase tracking-widest">
                      <span>Kenarlık Opaklığı</span>
                      <span className="text-blue-400">{cardConfig.cardBorderOpacity ?? 20}%</span>
                    </div>
                    <input 
                      type="range" min={0} max={100} step={5} 
                      value={cardConfig.cardBorderOpacity ?? 20} 
                      onChange={e => setCardConfig(prev => ({ ...prev, cardBorderOpacity: Number(e.target.value) }))} 
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                )}
             </div>
          </div>
        );
      case 'stocks':
        return (
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-3">
             <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Semboller</span>
             </div>
             <div className="flex flex-wrap gap-1">
                {stocksConfig.symbols.map(s => (
                  <div key={s} className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] font-bold uppercase">{s}</div>
                ))}
                <button onClick={() => setIsBgModalOpen(true)} className="px-2 py-0.5 bg-white/5 text-white/30 border border-white/10 rounded text-[9px] hover:bg-white/10">+</button>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="absolute top-full right-0 mt-3 w-72 bg-[#0c0c0c]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-4 animate-fade-in select-none z-50 overflow-hidden"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Hızlı Ayarlar</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsBgModalOpen(true); onClose(); }} 
          className="text-[9px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-2 py-1 rounded-md transition-all border border-white/5"
        >
          Tüm Ayarlar
        </button>
      </div>

      {/* Widget-Specific Settings */}
      {renderSpecialSettings()}
      
      {/* Görünüm Kartı */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunIcon className="w-4 h-4 text-orange-400/80" />
              <span className="text-[10px] font-medium text-white/60">Opaklık</span>
            </div>
            <span className="text-[10px] font-bold text-orange-400">{widget.opacity ?? 10}%</span>
          </div>
          <input 
            type="range" min={0} max={100} step={5} 
            value={widget.opacity ?? 10} 
            onChange={e => updateWidgetConfig(widget.id, { opacity: Number(e.target.value) })} 
            className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Square2StackIcon className="w-4 h-4 text-blue-400/80" />
              <span className="text-[10px] font-medium text-white/60">Kenarlık</span>
            </div>
            <button 
              onClick={() => updateWidgetConfig(widget.id, { showBorder: widget.showBorder === false ? true : false })} 
              className={`text-[9px] px-2.5 py-1 rounded-md border transition-all font-bold ${widget.showBorder !== false ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-white/30 border-white/10'}`}
            >
              {widget.showBorder !== false ? 'AKTİF' : 'PASİF'}
            </button>
          </div>
          {widget.showBorder !== false && (
            <input 
              type="range" min={0} max={100} step={5} 
              value={widget.borderOpacity ?? 20} 
              onChange={e => updateWidgetConfig(widget.id, { borderOpacity: Number(e.target.value) })} 
              className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
            />
          )}
        </div>
      </div>

      {/* Boyutlar Kartı */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/5 grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-4 h-4 text-indigo-400/80" />
              <span className="text-[10px] font-medium text-white/60">Genişlik</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-400">{widget.widthPx ? `${widget.widthPx}px` : 'Auto'}</span>
          </div>
          <input 
            type="range" min={200} max={1600} step={10} 
            value={widget.widthPx ?? 400} 
            onChange={e => updateWidgetConfig(widget.id, { widthPx: Number(e.target.value) })} 
            className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="w-4 h-4 text-indigo-400/80" />
              <span className="text-[10px] font-medium text-white/60">Yükseklik</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-400">{widget.heightPx ? `${widget.heightPx}px` : 'Auto'}</span>
          </div>
          <input 
            type="range" min={100} max={1200} step={10} 
            value={widget.heightPx ?? 200} 
            onChange={e => updateWidgetConfig(widget.id, { heightPx: Number(e.target.value) })} 
            className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
      </div>

      {/* Genel Ayar Modal Butonları */}
      {widget.id === 'clock' && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsClockModalOpen(true); onClose(); }} 
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/50 text-[9px] uppercase font-bold rounded-lg border border-white/5 transition-all flex items-center justify-center gap-2"
        >
          <ClockIcon className="w-3.5 h-3.5" /> Tüm Saat Stil Ayarlarını Aç
        </button>
      )}
    </div>
  );
};
