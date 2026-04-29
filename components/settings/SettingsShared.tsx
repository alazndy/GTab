import React from 'react';
import { CardShape, CardSize, CardAlignment, FontFamily, IconSize, WidgetId } from '../../types';

export const THEMES = [
  { id: 'default', name: 'Varsayılan', desc: 'Klasik glassmorphism.', gradient: 'from-slate-800 to-slate-900' },
  { id: 'neon',    name: 'Neon Cyber', desc: 'Mor-pembe neon geçişi.', gradient: 'from-indigo-900 via-purple-900 to-pink-900' },
  { id: 'starship',name: 'Starship',   desc: 'Derin uzay, mavi aksan.', gradient: 'from-gray-950 to-blue-950' },
  { id: 'terminal',name: 'Terminal',   desc: 'Retro yeşil-siyah.', gradient: 'from-black to-green-950' },
  { id: 'portal',  name: 'Aperture',   desc: '#FF9900 turuncu · #99CCFF mavi portal.', gradient: 'from-[#131313] via-[#1a1a1a] to-[#2A2A2A]' },
  { id: 'custom',  name: 'Özel Tema',  desc: 'Kendi renklerini belirle.', gradient: 'from-blue-600 via-purple-600 to-pink-600' },
];

export const SOLID_COLORS = [
  { name: 'Siyah',       value: '#000000' },
  { name: 'Koyu Gri',    value: '#121212' },
  { name: 'Gece Mavisi', value: '#0f172a' },
  { name: 'Derin Mor',   value: '#1e1b4b' },
  { name: 'Orman',       value: '#022c22' },
  { name: 'Bordo',       value: '#450a0a' },
];

export const SHAPES: { id: CardShape; label: string; radius: number }[] = [
  { id: 'sharp',   label: 'Keskin',  radius: 0  },
  { id: 'rounded', label: 'Yuvarlak', radius: 12 },
  { id: 'pill',    label: 'Kapsül',  radius: 24 },
];

export const SIZES: { id: CardSize; label: string; bars: number }[] = [
  { id: 'sm', label: 'Küçük',     bars: 1 },
  { id: 'md', label: 'Orta',      bars: 2 },
  { id: 'lg', label: 'Büyük',     bars: 3 },
  { id: 'xl', label: 'Çok Büyük', bars: 4 },
];

export const ALIGNMENTS: { id: CardAlignment; label: string; bars: [boolean, boolean, boolean] }[] = [
  { id: 'left',   label: 'Sol',    bars: [true,  false, false] },
  { id: 'center', label: 'Merkez', bars: [false, true,  false] },
  { id: 'right',  label: 'Sağ',    bars: [false, false, true]  },
];

export const FONTS: { id: FontFamily; label: string; style: React.CSSProperties }[] = [
  { id: 'geist',  label: 'Geist Sans',  style: { fontFamily: '"Geist Sans", system-ui, sans-serif' } },
  { id: 'system', label: 'Sistem',      style: { fontFamily: 'system-ui, sans-serif' } },
  { id: 'mono',   label: 'Monospace',   style: { fontFamily: '"Geist Mono", monospace' } },
  { id: 'serif',  label: 'Serif',       style: { fontFamily: 'Georgia, serif' } },
];

export const ICON_SIZES: { id: IconSize; label: string; px: number }[] = [
  { id: 'xs', label: 'Çok Küçük', px: 16 },
  { id: 'sm', label: 'Küçük',     px: 24 },
  { id: 'md', label: 'Orta',      px: 32 },
  { id: 'lg', label: 'Büyük',     px: 44 },
];

export const WIDGET_LABELS: Record<WidgetId, string> = {
  clock:      'Saat & Tarih',
  search:     'Arama Çubuğu',
  tasks:      'Görevler',
  categories: 'Kategori & Profil',
  shortcuts:  'Kısayollar',
  gmail:      'Gmail',
  calendar:   'Takvim',
  stocks:     'Borsa',
  'google-tasks': 'Google Görevler',
  'google-keep': 'Google Keep',
  'weather': 'Hava Durumu',
  'pomodoro': 'Pomodoro Timer',
  'spotify': 'Spotify',
};

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0">{children}</p>
);

export const OptionBtn: React.FC<{
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
