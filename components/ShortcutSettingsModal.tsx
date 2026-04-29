import React, { useState, useEffect } from 'react';
import { XMarkIcon, Squares2X2Icon, UsersIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolid } from '@heroicons/react/24/solid';
import { Shortcut } from '../types';
import { getFavicon } from './utils/shortcutUtils';

import { GeneralTab } from './shortcut-settings/GeneralTab';
import { ProfilesTab } from './shortcut-settings/ProfilesTab';

interface ShortcutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcut: Shortcut | null;
  allShortcuts?: Shortcut[];
  onSave: (updatedShortcut: Shortcut) => void;
}

const ShortcutSettingsModal: React.FC<ShortcutSettingsModalProps> = ({ isOpen, onClose, shortcut, allShortcuts = [], onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'profiles'>('general');
  const [formData, setFormData] = useState<Shortcut | null>(null);

  useEffect(() => {
    if (shortcut) {
      setFormData({
        ...shortcut,
        iconType: shortcut.iconType || 'favicon',
        profiles: shortcut.profiles || []
      });
    }
  }, [shortcut, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up text-white">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src={formData.iconType === 'image' && formData.iconValue ? formData.iconValue : getFavicon(formData.url)}
              className="w-6 h-6 rounded-sm" 
              onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24'}
              alt=""
            />
            <h2 className="text-xl font-semibold">Kısayol Ayarları</h2>
          </div>
          <button onClick={onClose} title="Kapat" className="text-white/50 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'general' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            Görünüm & İkon
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'profiles' ? 'bg-white/5 text-purple-400 border-b-2 border-purple-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Profiller ({formData.profiles?.length || 0})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'general' && (
            <GeneralTab formData={formData} setFormData={setFormData} />
          )}

          {activeTab === 'profiles' && (
            <ProfilesTab formData={formData} setFormData={setFormData} allShortcuts={allShortcuts} />
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
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
            <CheckSolid className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutSettingsModal;
