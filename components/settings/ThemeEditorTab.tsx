import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { SectionLabel } from './SettingsShared';
import { CustomThemeConfig } from '../../types';
import { DEFAULT_CUSTOM_THEME } from '../../services/storageService';

interface ThemeEditorTabProps {
  customTheme: CustomThemeConfig;
  updateCustomTheme: (updates: Partial<CustomThemeConfig>) => void;
}

export const ThemeEditorTab: React.FC<ThemeEditorTabProps> = ({ customTheme, updateCustomTheme }) => {
  return (
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
  );
};
