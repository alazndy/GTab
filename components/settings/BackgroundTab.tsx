import React from 'react';
import { CheckIcon, ArrowPathIcon, LinkIcon } from '@heroicons/react/24/outline';
import { THEMES, SOLID_COLORS } from './SettingsShared';
import { BackgroundConfig, BackgroundType } from '../../types';
import { PRESET_BACKGROUNDS } from '../../services/storageService';

export type BgMode = 'themes' | 'presets' | 'color' | 'custom';

export const BG_MODES: { id: BgMode; label: string }[] = [
  { id: 'themes',  label: 'Tema'    },
  { id: 'presets', label: 'Fotoğraf' },
  { id: 'color',   label: 'Renk'   },
  { id: 'custom',  label: 'Özel URL' },
];

interface BackgroundTabProps {
  bgMode: BgMode;
  setBgMode: (mode: BgMode) => void;
  currentConfig: BackgroundConfig;
  applyBg: (type: BackgroundType, value: string) => void;
  customUrl: string;
  setCustomUrl: (url: string) => void;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({ bgMode, setBgMode, currentConfig, applyBg, customUrl, setCustomUrl }) => {
  return (
    <div className="flex flex-col gap-6">
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
  );
};
