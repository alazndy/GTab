import React from 'react';
import { Squares2X2Icon, SparklesIcon, DevicePhoneMobileIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { SectionLabel, OptionBtn, ALIGNMENTS, SIZES, SHAPES, FONTS, ICON_SIZES } from './SettingsShared';
import { CardConfig } from '../../types';

interface CardsTabProps {
  localCard: CardConfig;
  cardSet: <K extends keyof CardConfig>(k: K, v: CardConfig[K]) => void;
}

export const CardsTab: React.FC<CardsTabProps> = ({ localCard, cardSet }) => {
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
            <Squares2X2Icon className="w-5 h-5 text-blue-400"/> Düzen ve Yerleşim
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Kart Genişliği (%)</SectionLabel>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{localCard.cardWidth ?? 100}%</span>
                </div>
                <div className="flex items-center gap-3">
                    <DevicePhoneMobileIcon className="w-4 h-4 text-white/20" />
                    <input type="range" min={20} max={100} step={1} value={localCard.cardWidth ?? 100} onChange={e => cardSet('cardWidth', Number(e.target.value))} className="flex-1 accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Bir Satırdaki Kısayol (Kolon)</SectionLabel>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{localCard.gridCols ?? 6}</span>
                </div>
                <input type="range" min={2} max={12} step={1} value={localCard.gridCols ?? 6} onChange={e => cardSet('gridCols', Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Yatay Aralık</SectionLabel>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{localCard.gridGapX ?? 16}px</span>
                </div>
                <input type="range" min={0} max={64} step={2} value={localCard.gridGapX ?? 16} onChange={e => cardSet('gridGapX', Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Dikey Aralık</SectionLabel>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{localCard.gridGapY ?? 16}px</span>
                </div>
                <input type="range" min={0} max={64} step={2} value={localCard.gridGapY ?? 16} onChange={e => cardSet('gridGapY', Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="md:col-span-2 mt-2">
                <div className="mb-3"><SectionLabel>Sayfa Hizalaması</SectionLabel></div>
                <div className="grid grid-cols-3 gap-3">
                    {ALIGNMENTS.map(a => (
                        <OptionBtn key={a.id} active={localCard.alignment === a.id} onClick={() => cardSet('alignment', a.id)} className="p-3 flex flex-col items-center gap-2">
                            <div className="flex gap-1 items-end h-4">
                                {a.bars.map((filled, i) => <div key={i} className={`w-2 h-3 rounded-sm ${filled ? 'bg-white/70' : 'bg-white/15'}`} />)}
                            </div>
                            <span className="text-xs">{a.label}</span>
                        </OptionBtn>
                    ))}
                </div>
            </div>
        </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-pink-400"/> Görünüm ve Efektler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="space-y-8">
                <div>
                    <div className="mb-3"><SectionLabel>Kart Boyutu</SectionLabel></div>
                    <div className="grid grid-cols-4 gap-2">
                        {SIZES.map(s => (
                            <OptionBtn key={s.id} active={localCard.size === s.id} onClick={() => cardSet('size', s.id)} className="p-3 flex flex-col items-center gap-2">
                                <div className="flex flex-col gap-0.5 w-full items-center">
                                    {Array.from({ length: s.bars }).map((_, i) => <div key={i} className="w-6 h-1.5 bg-white/30 rounded-sm" />)}
                                </div>
                                <span className="text-xs">{s.label}</span>
                            </OptionBtn>
                        ))}
                    </div>
                </div>
                
                <div>
                    <div className="mb-3"><SectionLabel>Köşe Şekli</SectionLabel></div>
                    <div className="grid grid-cols-3 gap-2">
                        {SHAPES.map(s => (
                            <OptionBtn key={s.id} active={localCard.shape === s.id} onClick={() => cardSet('shape', s.id)} className="p-3 flex flex-col items-center gap-2">
                                <div className="w-10 h-6 bg-white/20" style={{ borderRadius: s.radius }} />
                                <span className="text-xs">{s.label}</span>
                            </OptionBtn>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="mb-3"><SectionLabel>Hover Parlama (Glow)</SectionLabel></div>
                    <button onClick={() => cardSet('glowEnabled', !localCard.glowEnabled)} className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all ${localCard.glowEnabled ? 'bg-pink-500/10 border-pink-500/50 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}>
                        <div className={`p-2 rounded-lg transition-colors ${localCard.glowEnabled ? 'bg-pink-500 text-white' : 'bg-white/10'}`}><SparklesIcon className="w-4 h-4" /></div>
                        <span className="text-sm font-medium">Efekti Aç</span>
                        <div className={`ml-auto w-10 h-5 rounded-full p-0.5 transition-colors ${localCard.glowEnabled ? 'bg-pink-500' : 'bg-white/20'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${localCard.glowEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel>Arkaplan Opaklığı</SectionLabel>
                        <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded">{localCard.bgOpacity}%</span>
                    </div>
                    <input type="range" min={0} max={80} step={5} value={localCard.bgOpacity} onChange={e => cardSet('bgOpacity', Number(e.target.value))} className="w-full accent-white h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                            <SectionLabel>Kart Kenarlığı (Border)</SectionLabel>
                            <button onClick={() => cardSet('showCardBorder', !localCard.showCardBorder)} className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition-colors ${localCard.showCardBorder !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {localCard.showCardBorder !== false ? 'Görünür' : 'Gizli'}
                            </button>
                    </div>
                    {localCard.showCardBorder !== false && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40 w-12">Opaklık:</span>
                            <input type="range" min={0} max={100} step={5} value={localCard.cardBorderOpacity ?? 10} onChange={e => cardSet('cardBorderOpacity', Number(e.target.value))} className="flex-1 accent-white/80 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded">{localCard.cardBorderOpacity ?? 10}%</span>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                    <div className="mb-2"><SectionLabel>Profil Menü Stili</SectionLabel></div>
                    <div>
                        <div className="flex justify-between mb-2 text-xs text-white/50"><span>Arkaplan Matlığı</span></div>
                        <div className="flex items-center gap-3">
                            <input type="range" min={20} max={100} step={5} value={localCard.menuOpacity ?? 95} onChange={e => cardSet('menuOpacity', Number(e.target.value))} className="flex-1 accent-white/80 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded">{localCard.menuOpacity ?? 95}%</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2 text-xs text-white/50"><span>Çerçeve Belirginliği</span></div>
                        <div className="flex items-center gap-3">
                            <input type="range" min={0} max={100} step={5} value={localCard.menuBorderOpacity ?? 10} onChange={e => cardSet('menuBorderOpacity', Number(e.target.value))} className="flex-1 accent-white/40 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded">{localCard.menuBorderOpacity ?? 10}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
            <PaintBrushIcon className="w-5 h-5 text-orange-400"/> Tipografi ve İkonlar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
                <div className="mb-3"><SectionLabel>Yazı Tipi</SectionLabel></div>
                <div className="grid grid-cols-2 gap-3">
                    {FONTS.map(f => (
                        <OptionBtn key={f.id} active={localCard.font === f.id} onClick={() => cardSet('font', f.id)} className="px-4 py-3 flex items-center justify-between">
                            <span className="text-base" style={f.style}>Aa</span>
                            <span className="text-xs">{f.label}</span>
                        </OptionBtn>
                    ))}
                </div>
            </div>
            <div>
                <div className="mb-3"><SectionLabel>İkon Boyutu</SectionLabel></div>
                <div className="grid grid-cols-4 gap-3">
                    {ICON_SIZES.map(s => (
                        <OptionBtn key={s.id} active={localCard.iconSize === s.id} onClick={() => cardSet('iconSize', s.id)} className="p-3 flex flex-col items-center gap-2">
                            <div className="rounded-md bg-white/20 flex-shrink-0" style={{ width: s.px / 2, height: s.px / 2 }} />
                            <span className="text-xs">{s.label}</span>
                        </OptionBtn>
                    ))}
                </div>
            </div>
        </div>
        </div>
    </div>
  );
};
