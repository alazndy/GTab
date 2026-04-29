import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowPathIcon, ChevronDownIcon, PlusIcon, TrashIcon, PencilIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, CheckIcon as CheckSolid } from '@heroicons/react/24/solid';
import { Shortcut, ShortcutProfile } from '../../types';

export const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
  'bg-rose-500', 'bg-gray-500'
];

interface ProfilesTabProps {
  formData: Shortcut;
  setFormData: (data: Shortcut) => void;
  allShortcuts: Shortcut[];
}

export const ProfilesTab: React.FC<ProfilesTabProps> = ({ formData, setFormData, allShortcuts }) => {
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileUrl, setNewProfileUrl] = useState('');
  const [newProfileColor, setNewProfileColor] = useState(COLORS[10]);
  
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const suggestedProfiles = useMemo(() => {
    const suggestions = new Map<string, { name: string; color: string; url?: string }>();
    
    allShortcuts.forEach(s => {
      s.profiles?.forEach(p => {
        if (p.name && !suggestions.has(p.name)) {
          suggestions.set(p.name, { 
            name: p.name, 
            color: p.avatarColor || COLORS[0],
            url: p.url
          });
        }
      });
    });

    return Array.from(suggestions.values());
  }, [allShortcuts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetProfileForm = () => {
    setEditingProfileId(null);
    setNewProfileName('');
    setNewProfileUrl('');
    setNewProfileColor(COLORS[10]);
    setIsColorPickerOpen(false);
  };

  const handleProfileSubmit = () => {
    if (!newProfileName.trim()) return;

    if (editingProfileId) {
      const updatedProfiles = formData.profiles?.map(p => {
        if (p.id === editingProfileId) {
          return {
            ...p,
            name: newProfileName,
            url: newProfileUrl.trim() || undefined,
            avatarColor: newProfileColor
          };
        }
        return p;
      });
      
      setFormData({ ...formData, profiles: updatedProfiles });
    } else {
      const newProfile: ShortcutProfile = {
        id: crypto.randomUUID(),
        name: newProfileName,
        url: newProfileUrl.trim() || undefined,
        avatarColor: newProfileColor
      };

      setFormData({
        ...formData,
        profiles: [...(formData.profiles || []), newProfile]
      });
    }

    resetProfileForm();
  };

  const handleEditProfile = (profile: ShortcutProfile) => {
    setEditingProfileId(profile.id);
    setNewProfileName(profile.name);
    setNewProfileUrl(profile.url || '');
    setNewProfileColor(profile.avatarColor || COLORS[10]);
  };

  const applySuggestion = (suggestion: { name: string, color: string, url?: string }) => {
    setNewProfileName(suggestion.name);
    setNewProfileColor(suggestion.color);
    setNewProfileUrl(suggestion.url || '');
  };

  const removeProfile = (id: string) => {
    const isDefault = formData.defaultProfileId === id;
    setFormData({
      ...formData,
      defaultProfileId: isDefault ? undefined : formData.defaultProfileId,
      profiles: formData.profiles?.filter(p => p.id !== id)
    });
    
    if (editingProfileId === id) {
      resetProfileForm();
    }
  };

  const toggleDefaultProfile = (id: string) => {
    setFormData({
      ...formData,
      defaultProfileId: formData.defaultProfileId === id ? undefined : id
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <p className="text-xs text-purple-200">
          Profiller, aynı sitede farklı hesaplar (örn: İş, Kişisel Gmail) kullanmanızı sağlar. <br/>
          Yıldız ikonuna tıklayarak varsayılan profili seçebilirsiniz.
        </p>
      </div>

      <div className={`bg-white/5 p-4 rounded-xl border transition-colors space-y-3 z-20 relative ${editingProfileId ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">
            {editingProfileId ? 'Profili Düzenle' : 'Yeni Profil Ekle'}
          </span>
          {editingProfileId && (
            <button onClick={resetProfileForm} className="text-xs text-white/50 hover:text-white flex items-center gap-1">
              <ArrowPathIcon className="w-2.5 h-2.5" /> Vazgeç
            </button>
          )}
        </div>

        {!editingProfileId && suggestedProfiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-[10px] text-white/40 w-full">Kayıtlı Profillerden Seç:</span>
            {suggestedProfiles.map(suggestion => {
                const exists = formData.profiles?.some(p => p.name === suggestion.name);
                if (exists) return null;

                return (
                    <button
                        key={suggestion.name}
                        onClick={() => applySuggestion(suggestion)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                    >
                        <div className={`w-2 h-2 rounded-full ${suggestion.color}`}></div>
                        <span className="text-xs text-white/80 group-hover:text-white">{suggestion.name}</span>
                    </button>
                );
            })}
          </div>
        )}
        
        <div className="flex gap-3">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Profil Adı (Örn: İş, Kişisel)"
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
            />
          </div>
          
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="flex items-center justify-between gap-2 h-full bg-black/40 hover:bg-black/60 rounded-lg px-3 border border-white/10 min-w-[80px] transition-colors"
            >
                <div className={`w-5 h-5 rounded-full shadow-sm ${newProfileColor} border border-white/20`}></div>
                <ChevronDownIcon className="w-3.5 h-3.5 text-white/50" />
            </button>

            {isColorPickerOpen && (
              <div className="absolute top-full right-0 mt-2 p-3 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl grid grid-cols-6 gap-2 w-[220px] z-50 animate-fade-in">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setNewProfileColor(c);
                      setIsColorPickerOpen(false);
                    }}
                    className={`w-6 h-6 rounded-full transition-all hover:scale-110 flex items-center justify-center ${c} ${newProfileColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-black/70' : ''}`}
                  >
                    {newProfileColor === c && <CheckSolid className="w-3 h-3 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <input 
          type="text" 
          placeholder="Özel URL veya E-posta Adresi"
          value={newProfileUrl}
          onChange={e => setNewProfileUrl(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-purple-500/50 focus:outline-none font-mono text-xs"
        />
          <p className="text-[10px] text-white/40">İpucu: Tam URL (https://...) veya Google uygulamaları için e-posta adresi girebilirsiniz.</p>
        
        <button 
          onClick={handleProfileSubmit}
          disabled={!newProfileName.trim()}
          className={`w-full text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2
            ${editingProfileId ? 'bg-purple-600 hover:bg-purple-500' : 'bg-white/10 hover:bg-white/20'}
          `}
        >
          {editingProfileId ? (
            <><CheckSolid className="w-3.5 h-3.5" /> Güncelle</>
          ) : (
            <><PlusIcon className="w-3.5 h-3.5" /> Ekle</>
          )}
        </button>
      </div>

      <div className="space-y-2">
          {formData.profiles && formData.profiles.length > 0 ? (
            formData.profiles.map((profile) => (
              <div key={profile.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all group ${formData.defaultProfileId === profile.id ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-full shrink-0 ${profile.avatarColor || 'bg-gray-500'} flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/10`}>
                    {profile.name.substring(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                        <span className="truncate">{profile.name}</span>
                        {formData.defaultProfileId === profile.id && (
                            <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0">Varsayılan</span>
                        )}
                    </div>
                    <div className="text-xs text-white/40 truncate max-w-[200px]">{profile.url || 'Ana URL'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => toggleDefaultProfile(profile.id)}
                        className={`p-2 rounded-lg transition-colors ${formData.defaultProfileId === profile.id ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-white/20 hover:text-yellow-400 hover:bg-white/10'}`}
                        title={formData.defaultProfileId === profile.id ? "Varsayılanı Kaldır" : "Varsayılan Yap"}
                    >
                        {formData.defaultProfileId === profile.id ? <StarSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleEditProfile(profile)}
                      className={`p-2 rounded-lg transition-colors ${editingProfileId === profile.id ? 'text-blue-400 bg-blue-400/10' : 'text-white/30 hover:text-blue-400 hover:bg-blue-400/10'}`}
                      title="Düzenle"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeProfile(profile.id)}
                      className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
              Henüz profil eklenmemiş. <br/>
              "Yeni Profil Ekle" formunu kullanın.
            </div>
          )}
      </div>
    </div>
  );
};
