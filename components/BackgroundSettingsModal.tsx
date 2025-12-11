
import React, { useState } from 'react';
import { XMarkIcon, CheckIcon, PhotoIcon, SwatchIcon, ArrowPathIcon, LinkIcon } from '@heroicons/react/24/outline';
import { BackgroundConfig, BackgroundType } from '../types';
import { PRESET_BACKGROUNDS } from '../services/storageService';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BackgroundConfig;
  onSave: (config: BackgroundConfig) => void;
}

const SOLID_COLORS = [
  { name: 'Tam Siyah', value: '#000000' },
  { name: 'Koyu Gri', value: '#121212' },
  { name: 'Gece Mavisi', value: '#0f172a' },
  { name: 'Derin Mor', value: '#1e1b4b' },
  { name: 'Orman Yeşili', value: '#022c22' },
  { name: 'Koyu Bordo', value: '#450a0a' },
];

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({ isOpen, onClose, currentConfig, onSave }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'color' | 'custom'>('presets');
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleSave = (type: BackgroundType, value: string) => {
    onSave({ type, value });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up text-white">
        
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-blue-400" />
            Arka Plan Ayarları
          </h2>
          <button onClick={onClose} title="Kapat" className="text-white/50 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'presets' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            Hazır Temalar
          </button>
          <button
            onClick={() => setActiveTab('color')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'color' ? 'bg-white/5 text-purple-400 border-b-2 border-purple-400' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            Düz Renk
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'custom' ? 'bg-white/5 text-emerald-400 border-b-2 border-emerald-400' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            Özel Resim
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-black/20">
          
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <button 
                onClick={() => handleSave('random', '')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-center gap-3 mb-4 group
                  ${currentConfig.type === 'random' 
                    ? 'bg-blue-500/20 border-blue-500' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
              >
                <ArrowPathIcon className={`w-5 h-5 ${currentConfig.type === 'random' ? 'text-blue-400' : 'text-white/60'}`} />
                <div className="text-left">
                   <div className="text-sm font-medium text-white">Rastgele Değiştir</div>
                   <div className="text-xs text-white/50">Her açılışta farklı bir soyut tema gösterir.</div>
                </div>
                {currentConfig.type === 'random' && <CheckIcon className="w-5 h-5 ml-auto text-blue-400" />}
              </button>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRESET_BACKGROUNDS.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handleSave('image', url)}
                    className={`relative aspect-video rounded-lg overflow-hidden group border-2 transition-all
                      ${currentConfig.value === url && currentConfig.type === 'image' 
                        ? 'border-blue-500 scale-95 shadow-lg shadow-blue-500/20' 
                        : 'border-transparent hover:border-white/30'
                      }`}
                  >
                    <img src={url} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                    {(currentConfig.value === url && currentConfig.type === 'image') && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <CheckIcon className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'color' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SOLID_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleSave('color', color.value)}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-3 hover:scale-105
                    ${currentConfig.value === color.value && currentConfig.type === 'color'
                      ? 'bg-white/10 border-blue-500' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                >
                  <div 
                    className="w-full h-24 rounded-lg shadow-inner border border-white/5" 
                    style={{ backgroundColor: color.value }} 
                  />
                  <span className="text-sm font-medium text-white/90">{color.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="flex flex-col gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-sm text-emerald-200">
                  İnternetten beğendiğiniz bir resmin veya GIF'in bağlantısını (URL) buraya yapıştırın.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Resim Bağlantısı (URL)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input 
                      type="text" 
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => {
                        if(customUrl.trim()) handleSave('image', customUrl);
                    }}
                    disabled={!customUrl.trim()}
                    className="px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Uygula
                  </button>
                </div>
              </div>

              {currentConfig.type === 'image' && (
                <div className="mt-4">
                   <p className="text-xs text-white/50 mb-2">Şu anki arkaplan:</p>
                   <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black/50 relative">
                     <img src={currentConfig.value || PRESET_BACKGROUNDS[0]} className="w-full h-full object-cover opacity-50" alt="Preview" />
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BackgroundSettingsModal;