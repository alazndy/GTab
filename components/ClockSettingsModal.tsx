
import React from 'react';
import { XMarkIcon, ClockIcon, CalendarIcon, SwatchIcon, VariableIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ClockConfig, FontFamily } from '../types';

interface ClockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClockConfig;
  onSave: (config: ClockConfig) => void;
}

const ClockSettingsModal: React.FC<ClockSettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [tempConfig, setTempConfig] = React.useState<ClockConfig>(config);

  React.useEffect(() => {
    if (isOpen) setTempConfig(config);
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  const fonts: { id: FontFamily; label: string }[] = [
    { id: 'geist', label: 'Geist Sans' },
    { id: 'system', label: 'Sistem' },
    { id: 'mono', label: 'Mono' },
    { id: 'serif', label: 'Serif' },
  ];

  const sizes: { id: 'sm' | 'md' | 'lg' | 'xl'; label: string }[] = [
    { id: 'sm', label: 'Küçük' },
    { id: 'md', label: 'Orta' },
    { id: 'lg', label: 'Büyük' },
    { id: 'xl', label: 'Ekstra' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-slide-up text-white overflow-hidden max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            Saat ve Tarih Ayarları
          </h2>
          <button onClick={onClose} title="Kapat" className="text-white/50 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
              <ClockIcon className="w-3.5 h-3.5" />
              Zaman Biçimi
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTempConfig({ ...tempConfig, format: '24h' })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tempConfig.format === '24h' 
                    ? 'bg-blue-500/20 border-blue-500 text-white' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-white/70'
                }`}
              >
                <div className="text-lg font-bold">17:49</div>
                <div className="text-xs opacity-60">24 Saat</div>
              </button>
              <button
                onClick={() => setTempConfig({ ...tempConfig, format: '12h' })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  tempConfig.format === '12h' 
                    ? 'bg-blue-500/20 border-blue-500 text-white' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-white/70'
                }`}
              >
                <div className="text-lg font-bold">05:49 PM</div>
                <div className="text-xs opacity-60">12 Saat</div>
              </button>
            </div>
            <div className="mt-4">
               <button 
                 onClick={() => setTempConfig({ ...tempConfig, showSeconds: !tempConfig.showSeconds })}
                 className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors w-full text-left"
               >
                 <div 
                   className={`w-10 h-5 rounded-full p-0.5 transition-colors ${tempConfig.showSeconds ? 'bg-blue-500' : 'bg-white/20'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${tempConfig.showSeconds ? 'translate-x-5' : 'translate-x-0'}`} />
                 </div>
                 <span className="text-sm text-white/80">Saniyeyi Göster</span>
               </button>
            </div>
          </div>

          <hr className="border-white/10" />

          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <VariableIcon className="w-3.5 h-3.5" />
                Yazı Tipi (Font)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTempConfig({ ...tempConfig, fontFamily: f.id })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      tempConfig.fontFamily === f.id 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <SwatchIcon className="w-3.5 h-3.5" />
                Boyut
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTempConfig({ ...tempConfig, fontSize: s.id })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      tempConfig.fontSize === s.id 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              Tarih Biçimi
            </h3>
            <div className="space-y-2">
              {[
                { id: 'full', label: 'Görünür', example: '19 Kasım Çarşamba' },
                { id: 'hidden', label: 'Gizli', example: '(Tarih gösterilmez)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTempConfig({ ...tempConfig, showDate: opt.id !== 'hidden' })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    (opt.id === 'hidden' && !tempConfig.showDate) || (opt.id !== 'hidden' && tempConfig.showDate)
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-medium text-white">{opt.example}</span>
                  <span className="text-xs text-white/40">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20 mt-auto">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            Kaydet
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClockSettingsModal;
