
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon, CheckIcon, PhotoIcon, ArrowPathIcon, LinkIcon,
  SparklesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, PaintBrushIcon,
  Squares2X2Icon, ServerStackIcon, AdjustmentsHorizontalIcon,
  SwatchIcon, EyeIcon, DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import {
  BackgroundConfig, BackgroundType, CardConfig,
  CardShape, CardSize, CardAlignment, FontFamily, IconSize, Shortcut,
  WidgetConfig, WidgetId, CustomThemeConfig
} from '../types';
import { PRESET_BACKGROUNDS, exportShortcutsToFile, importShortcutsFromFile, DEFAULT_CUSTOM_THEME } from '../services/storageService';

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

// ── Sabitler ──────────────────────────────────────────────

const THEMES = [
  { id: 'default', name: 'Varsayılan', desc: 'Klasik glassmorphism.', gradient: 'from-slate-800 to-slate-900' },
  { id: 'neon',    name: 'Neon Cyber', desc: 'Mor-pembe neon geçişi.', gradient: 'from-indigo-900 via-purple-900 to-pink-900' },
  { id: 'starship',name: 'Starship',   desc: 'Derin uzay, mavi aksan.', gradient: 'from-gray-950 to-blue-950' },
  { id: 'terminal',name: 'Terminal',   desc: 'Retro yeşil-siyah.', gradient: 'from-black to-green-950' },
  { id: 'portal',  name: 'Aperture',   desc: '#FF9900 turuncu · #99CCFF mavi portal.', gradient: 'from-[#131313] via-[#1a1a1a] to-[#2A2A2A]' },
  { id: 'custom',  name: 'Özel Tema',  desc: 'Kendi renklerini belirle.', gradient: 'from-blue-600 via-purple-600 to-pink-600' },
];

const SOLID_COLORS = [
  { name: 'Siyah',       value: '#000000' },
  { name: 'Koyu Gri',    value: '#121212' },
  { name: 'Gece Mavisi', value: '#0f172a' },
  { name: 'Derin Mor',   value: '#1e1b4b' },
  { name: 'Orman',       value: '#022c22' },
  { name: 'Bordo',       value: '#450a0a' },
];

const SHAPES: { id: CardShape; label: string; radius: number }[] = [
  { id: 'sharp',   label: 'Keskin',  radius: 0  },
  { id: 'rounded', label: 'Yuvarlak', radius: 12 },
  { id: 'pill',    label: 'Kapsül',  radius: 24 },
];

const SIZES: { id: CardSize; label: string; bars: number }[] = [
  { id: 'sm', label: 'Küçük',     bars: 1 },
  { id: 'md', label: 'Orta',      bars: 2 },
  { id: 'lg', label: 'Büyük',     bars: 3 },
  { id: 'xl', label: 'Çok Büyük', bars: 4 },
];

const ALIGNMENTS: { id: CardAlignment; label: string; bars: [boolean, boolean, boolean] }[] = [
  { id: 'left',   label: 'Sol',    bars: [true,  false, false] },
  { id: 'center', label: 'Merkez', bars: [false, true,  false] },
  { id: 'right',  label: 'Sağ',    bars: [false, false, true]  },
];

const FONTS: { id: FontFamily; label: string; style: React.CSSProperties }[] = [
  { id: 'geist',  label: 'Geist Sans',  style: { fontFamily: '"Geist Sans", system-ui, sans-serif' } },
  { id: 'system', label: 'Sistem',      style: { fontFamily: 'system-ui, sans-serif' } },
  { id: 'mono',   label: 'Monospace',   style: { fontFamily: '"Geist Mono", monospace' } },
  { id: 'serif',  label: 'Serif',       style: { fontFamily: 'Georgia, serif' } },
];

const ICON_SIZES: { id: IconSize; label: string; px: number }[] = [
  { id: 'xs', label: 'Çok Küçük', px: 16 },
  { id: 'sm', label: 'Küçük',     px: 24 },
  { id: 'md', label: 'Orta',      px: 32 },
  { id: 'lg', label: 'Büyük',     px: 44 },
];

const WIDGET_LABELS: Record<WidgetId, string> = {
  clock:      'Saat & Tarih',
  search:     'Arama Çubuğu',
  tasks:      'Görevler',
  categories: 'Kategori & Profil',
  shortcuts:  'Kısayollar',
};

// ── Alt bileşenler ───────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">{children}</p>
);

const OptionBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ active, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`transition-all text-left ${active
      ? 'bg-white/10 border-white/30 text-white'
      : 'bg-white/5 border-white/8 text-white/60 hover:bg-white/8 hover:text-white/80'
    } border rounded-xl ${className}`}
  >
    {children}
  </button>
);

// ── Ana bileşen ──────────────────────────────────────────

type Section = 'background' | 'cards' | 'widgets' | 'data' | 'theme-editor';
type BgMode  = 'themes' | 'presets' | 'color' | 'custom';

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen, onClose, currentConfig, onSave, cardConfig, onSaveCard, shortcuts, onImportShortcuts, layout, onSaveLayout
}) => {
  const [section, setSection]         = useState<Section>('background');
  const [bgMode, setBgMode]           = useState<BgMode>('themes');
  const [customUrl, setCustomUrl]     = useState('');
  const [localCard, setLocalCard]     = useState<CardConfig>(cardConfig);
  const [localLayout, setLocalLayout] = useState<WidgetConfig[]>(layout);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [importError, setImportError] = useState('');

  // Custom Theme State
  const [customTheme, setCustomTheme] = useState<CustomThemeConfig>(currentConfig.customTheme || DEFAULT_CUSTOM_THEME);

  useEffect(() => {
    if (isOpen) {
        setLocalCard(cardConfig);
        setLocalLayout(layout);
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

  const widgetSet = (id: WidgetId, opacity: number) => {
    const next = localLayout.map(w => w.id === id ? { ...w, opacity } : w);
    setLocalLayout(next);
    onSaveLayout(next);
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

  const BG_MODES: { id: BgMode; label: string }[] = [
    { id: 'themes',  label: 'Tema'    },
    { id: 'presets', label: 'Fotoğraf' },
    { id: 'color',   label: 'Renk'   },
    { id: 'custom',  label: 'Özel URL' },
  ];

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
          <nav className="w-36 flex-shrink-0 flex flex-col gap-1 p-3 border-r border-white/8 bg-black/10">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                  section === n.id
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          {/* İçerik */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-black/5">

            {/* ═══ ARKAPLAN ═══ */}
            {section === 'background' && (
              <div className="flex flex-col gap-6">

                {/* Mod seçici chips */}
                <div className="flex gap-2 flex-wrap">
                  {BG_MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setBgMode(m.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        bgMode === m.id
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Tema */}
                {bgMode === 'themes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEMES.map(t => {
                      const active = currentConfig.type === 'theme' && currentConfig.value === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => applyBg('theme', t.id)}
                          className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${
                            active
                              ? 'border-blue-500/50 ring-1 ring-blue-500/20'
                              : 'border-white/8 hover:border-white/20'
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
                          <div className="relative flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-white">{t.name}</div>
                              <div className="text-xs text-white/50 mt-0.5">{t.desc}</div>
                            </div>
                            {active && <CheckIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fotoğraf */}
                {bgMode === 'presets' && (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => applyBg('random', '')}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        currentConfig.type === 'random'
                          ? 'bg-white/10 border-white/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/8'
                      }`}
                    >
                      <ArrowPathIcon className="w-4 h-4 text-white/60 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Rastgele</div>
                        <div className="text-xs text-white/40">Her açılışta farklı bir fotoğraf</div>
                      </div>
                      {currentConfig.type === 'random' && <CheckIcon className="w-4 h-4 ml-auto text-white" />}
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_BACKGROUNDS.map((url, i) => {
                        const active = currentConfig.type === 'image' && currentConfig.value === url;
                        return (
                          <button
                            key={i}
                            onClick={() => applyBg('image', url)}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                              active ? 'border-white/60 scale-95' : 'border-transparent hover:border-white/20'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {active && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <CheckIcon className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Renk */}
                {bgMode === 'color' && (
                  <div className="grid grid-cols-3 gap-3">
                    {SOLID_COLORS.map(c => {
                      const active = currentConfig.type === 'color' && currentConfig.value === c.value;
                      return (
                        <button
                          key={c.value}
                          onClick={() => applyBg('color', c.value)}
                          className={`rounded-xl border overflow-hidden transition-all ${
                            active ? 'border-white/50 scale-95' : 'border-white/8 hover:border-white/25'
                          }`}
                        >
                          <div className="h-16" style={{ backgroundColor: c.value }} />
                          <div className={`px-3 py-2 text-xs font-medium text-center ${active ? 'text-white' : 'text-white/60'}`}>
                            {c.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Özel URL */}
                {bgMode === 'custom' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-white/50 leading-relaxed">
                      Herhangi bir resim veya GIF URL'sini yapıştır.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                        <input
                          type="text"
                          value={customUrl}
                          onChange={e => setCustomUrl(e.target.value)}
                          placeholder="https://example.com/bg.jpg"
                          className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => customUrl.trim() && applyBg('image', customUrl)}
                        disabled={!customUrl.trim()}
                        className="px-5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                      >
                        Uygula
                      </button>
                    </div>
                    {currentConfig.type === 'image' && currentConfig.value && (
                      <div className="rounded-xl overflow-hidden border border-white/10 h-36">
                        <img src={currentConfig.value} className="w-full h-full object-cover opacity-60" alt="Önizleme" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══ TEMA EDİTÖRÜ ═══ */}
            {section === 'theme-editor' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <SectionLabel>Temel Renkler</SectionLabel>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Arkaplan Rengi</span>
                                    <input type="color" value={customTheme.wrapperBg} onChange={e => updateCustomTheme({ wrapperBg: e.target.value })} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Aksan Rengi (Neon)</span>
                                    <input type="color" value={customTheme.accentColor} onChange={e => updateCustomTheme({ accentColor: e.target.value })} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Yazı Rengi</span>
                                    <input type="color" value={customTheme.textColor} onChange={e => updateCustomTheme({ textColor: e.target.value })} className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionLabel>Cam (Glass) Efekti</SectionLabel>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Cam Rengi (RGBA)</span>
                                    <input type="text" value={customTheme.glassBg} onChange={e => updateCustomTheme({ glassBg: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-32 focus:outline-none" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Cam Çerçeve (RGBA)</span>
                                    <input type="text" value={customTheme.glassBorder} onChange={e => updateCustomTheme({ glassBorder: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-32 focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionLabel>Menüler</SectionLabel>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Menü Arkaplan</span>
                                    <input type="text" value={customTheme.menuBg} onChange={e => updateCustomTheme({ menuBg: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-32 focus:outline-none" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Menü Çerçeve</span>
                                    <input type="text" value={customTheme.menuBorder} onChange={e => updateCustomTheme({ menuBorder: e.target.value })} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-32 focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => updateCustomTheme(DEFAULT_CUSTOM_THEME)}
                        className="text-[10px] text-white/30 hover:text-white transition-colors w-fit flex items-center gap-1"
                    >
                        <ArrowPathIcon className="w-3 h-3" /> Varsayılana Dön
                    </button>
                </div>
            )}

            {/* ═══ KART & YAZI ═══ */}
            {section === 'cards' && (
              <div className="flex flex-col gap-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Genişlik */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <SectionLabel>Kart Genişliği (%)</SectionLabel>
                            <span className="text-[10px] font-bold text-blue-400">{localCard.cardWidth ?? 100}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <DevicePhoneMobileIcon className="w-4 h-4 text-white/20" />
                            <input
                                type="range" min={20} max={100} step={1}
                                value={localCard.cardWidth ?? 100}
                                onChange={e => cardSet('cardWidth', Number(e.target.value))}
                                className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Parlama Efekti */}
                    <div>
                        <SectionLabel>Kart Parlama (Glow)</SectionLabel>
                        <button 
                            onClick={() => cardSet('glowEnabled', !localCard.glowEnabled)}
                            className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${
                                localCard.glowEnabled 
                                    ? 'bg-blue-500/10 border-blue-500/50 text-white' 
                                    : 'bg-white/5 border-white/10 text-white/40'
                            }`}
                        >
                            <div className={`p-1.5 rounded-lg transition-colors ${localCard.glowEnabled ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>
                                <SparklesIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium">Hover Parlama Efekti</span>
                            <div className="ml-auto">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${localCard.glowEnabled ? 'bg-blue-500' : 'bg-white/20'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localCard.glowEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Kart Aralığı */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <SectionLabel>Yatay Aralık</SectionLabel>
                                <span className="text-[10px] font-bold text-blue-400">{localCard.gridGapX ?? 16}px</span>
                            </div>
                            <input
                                type="range" min={0} max={64} step={2}
                                value={localCard.gridGapX ?? 16}
                                onChange={e => cardSet('gridGapX', Number(e.target.value))}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <SectionLabel>Dikey Aralık</SectionLabel>
                                <span className="text-[10px] font-bold text-blue-400">{localCard.gridGapY ?? 16}px</span>
                            </div>
                            <input
                                type="range" min={0} max={64} step={2}
                                value={localCard.gridGapY ?? 16}
                                onChange={e => cardSet('gridGapY', Number(e.target.value))}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Izgara Kolon Sayısı */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <SectionLabel>Bir Satırdaki Kısayol Sayısı (Grid Columns)</SectionLabel>
                            <span className="text-[10px] font-bold text-blue-400">{localCard.gridCols ?? 6} Kolon</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min={2} max={12} step={1}
                                value={localCard.gridCols ?? 6}
                                onChange={e => cardSet('gridCols', Number(e.target.value))}
                                className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-white/5" />

                {/* Kart Çerçeve Ayarları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                             <SectionLabel>Kart Çerçevesi</SectionLabel>
                             <button 
                                onClick={() => cardSet('showCardBorder', !localCard.showCardBorder)}
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${localCard.showCardBorder !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                             >
                                {localCard.showCardBorder !== false ? 'Açık' : 'Kapalı'}
                             </button>
                        </div>
                        <p className="text-[10px] text-white/30 mb-3">Her bir URL kartının etrafındaki ince çizgiyi yönetir.</p>
                        {localCard.showCardBorder !== false && (
                            <div className="flex items-center gap-3">
                                <input
                                    type="range" min={0} max={100} step={5}
                                    value={localCard.cardBorderOpacity ?? 10}
                                    onChange={e => cardSet('cardBorderOpacity', Number(e.target.value))}
                                    className="flex-1 accent-white/80 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-[10px] text-white/50 w-8 tabular-nums">{localCard.cardBorderOpacity ?? 10}%</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <SectionLabel>Profil Menüsü Opaklığı</SectionLabel>
                        <p className="text-[10px] text-white/30 mb-3">Profil seçme listesinin saydamlığını ve çerçevesini ayarlar.</p>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1 text-[10px] text-white/40"><span>Arkaplan</span><span className="tabular-nums">{localCard.menuOpacity ?? 95}%</span></div>
                                <input
                                    type="range" min={20} max={100} step={5}
                                    value={localCard.menuOpacity ?? 95}
                                    onChange={e => cardSet('menuOpacity', Number(e.target.value))}
                                    className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-[10px] text-white/40"><span>Çerçeve</span><span className="tabular-nums">{localCard.menuBorderOpacity ?? 10}%</span></div>
                                <input
                                    type="range" min={0} max={100} step={5}
                                    value={localCard.menuBorderOpacity ?? 10}
                                    onChange={e => cardSet('menuBorderOpacity', Number(e.target.value))}
                                    className="w-full accent-white/40 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-white/5" />

                {/* Opaklık */}
                <div>
                  <SectionLabel>Kart İçi Arkaplan Opaklığı</SectionLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={0} max={80} step={5}
                      value={localCard.bgOpacity}
                      onChange={e => cardSet('bgOpacity', Number(e.target.value))}
                      className="flex-1 accent-white/80"
                    />
                    <span className="text-xs text-white/50 w-8 text-right tabular-nums">{localCard.bgOpacity}%</span>
                  </div>
                </div>

                {/* Şekil */}
                <div>
                  <SectionLabel>Köşe Şekli</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {SHAPES.map(s => (
                      <OptionBtn
                        key={s.id}
                        active={localCard.shape === s.id}
                        onClick={() => cardSet('shape', s.id)}
                        className="p-3 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-10 h-6 bg-white/20"
                          style={{ borderRadius: s.radius }}
                        />
                        <span className="text-xs">{s.label}</span>
                      </OptionBtn>
                    ))}
                  </div>
                </div>

                {/* Boyut */}
                <div>
                  <SectionLabel>Kart Boyutu</SectionLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZES.map(s => (
                      <OptionBtn
                        key={s.id}
                        active={localCard.size === s.id}
                        onClick={() => cardSet('size', s.id)}
                        className="p-3 flex flex-col items-center gap-2"
                      >
                        <div className="flex flex-col gap-0.5 w-full items-center">
                          {Array.from({ length: s.bars }).map((_, i) => (
                            <div key={i} className="w-6 h-1.5 bg-white/30 rounded-sm" />
                          ))}
                        </div>
                        <span className="text-xs">{s.label}</span>
                      </OptionBtn>
                    ))}
                  </div>
                </div>

                {/* Hizalama */}
                <div>
                  <SectionLabel>Sayfa Hizalaması</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {ALIGNMENTS.map(a => (
                      <OptionBtn
                        key={a.id}
                        active={localCard.alignment === a.id}
                        onClick={() => cardSet('alignment', a.id)}
                        className="p-3 flex flex-col items-center gap-2"
                      >
                        <div className="flex gap-1 items-end h-4">
                          {a.bars.map((filled, i) => (
                            <div
                              key={i}
                              className={`w-2 h-3 rounded-sm ${filled ? 'bg-white/70' : 'bg-white/15'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs">{a.label}</span>
                      </OptionBtn>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <SectionLabel>Yazı Tipi</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <OptionBtn
                        key={f.id}
                        active={localCard.font === f.id}
                        onClick={() => cardSet('font', f.id)}
                        className="px-4 py-3 flex items-center justify-between"
                      >
                        <span className="text-base" style={f.style}>Aa</span>
                        <span className="text-xs">{f.label}</span>
                      </OptionBtn>
                    ))}
                  </div>
                </div>

                {/* İkon Boyutu */}
                <div>
                  <SectionLabel>İkon Boyutu</SectionLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_SIZES.map(s => (
                      <OptionBtn
                        key={s.id}
                        active={localCard.iconSize === s.id}
                        onClick={() => cardSet('iconSize', s.id)}
                        className="p-3 flex flex-col items-center gap-2"
                      >
                        <div
                          className="rounded-md bg-white/20 flex-shrink-0"
                          style={{ width: s.px / 2, height: s.px / 2 }}
                        />
                        <span className="text-xs">{s.label}</span>
                      </OptionBtn>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ═══ ALANLAR ═══ */}
            {section === 'widgets' && (
              <div className="flex flex-col gap-6">
                <p className="text-xs text-white/40 leading-relaxed">
                  Her ana alanın(widget) arkaplan opaklığını ve çerçeve görünümünü bağımsız ayarlayabilirsiniz.
                </p>
                {localLayout
                  .filter(w => w.id !== 'tasks')
                  .sort((a, b) => a.order - b.order)
                  .map(w => (
                    <div key={w.id} className="border border-white/5 rounded-xl p-4 bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <SectionLabel>{WIDGET_LABELS[w.id]}</SectionLabel>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50">Çerçeve:</span>
                          <button 
                             onClick={() => {
                               const next = localLayout.map(item => item.id === w.id ? { ...item, showBorder: item.showBorder === false ? true : false } : item);
                               setLocalLayout(next); onSaveLayout(next);
                             }}
                             className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${w.showBorder !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                          >
                            {w.showBorder !== false ? 'Açık' : 'Kapalı'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="flex justify-between mb-1 text-xs text-white/40"><span>Arkaplan Opaklığı</span><span className="tabular-nums">{w.opacity ?? 10}%</span></div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range" min={0} max={100} step={5}
                              value={w.opacity ?? 10}
                              onChange={e => {
                                 const next = localLayout.map(item => item.id === w.id ? { ...item, opacity: Number(e.target.value) } : item);
                                 setLocalLayout(next); onSaveLayout(next);
                              }}
                              className="flex-1 accent-white/80 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {w.showBorder !== false && (
                          <div>
                            <div className="flex justify-between mb-1 text-xs text-white/40"><span>Çerçeve Opaklığı</span><span className="tabular-nums">{w.borderOpacity ?? 20}%</span></div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range" min={0} max={100} step={5}
                                value={w.borderOpacity ?? 20}
                                onChange={e => {
                                   const next = localLayout.map(item => item.id === w.id ? { ...item, borderOpacity: Number(e.target.value) } : item);
                                   setLocalLayout(next); onSaveLayout(next);
                                }}
                                className="flex-1 accent-blue-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ═══ VERİ ═══ */}
            {section === 'data' && (
              <div className="flex flex-col gap-4">
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;
