
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Trash2, Save, LayoutGrid, Users, Search, ChevronDown, Check, Star, Pencil, RotateCcw } from 'lucide-react';
import { Shortcut, ShortcutProfile, IconType, Category } from '../types';
import DynamicIcon, { iconMap } from './DynamicIcon';

interface ShortcutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcut: Shortcut | null;
  allShortcuts?: Shortcut[];
  onSave: (updatedShortcut: Shortcut) => void;
}

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
  'bg-rose-500', 'bg-gray-500'
];

const ShortcutSettingsModal: React.FC<ShortcutSettingsModalProps> = ({ isOpen, onClose, shortcut, allShortcuts = [], onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'profiles'>('general');
  const [formData, setFormData] = useState<Shortcut | null>(null);
  
  // Icon Search State
  const [iconSearch, setIconSearch] = useState('');
  
  // Profile state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileUrl, setNewProfileUrl] = useState('');
  const [newProfileColor, setNewProfileColor] = useState(COLORS[10]);
  
  // Color Picker State
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Calculate unique profile suggestions from all shortcuts
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

  // Memoize filtered icons to prevent lag during typing
  // IMPORTANT: We limit the results to 60 to prevent the DOM from freezing
  // when rendering 1000+ icons at once.
  const filteredIcons = useMemo(() => {
    const searchLower = iconSearch.toLowerCase().trim();
    const keys = Object.keys(iconMap);
    
    if (!searchLower) return keys.slice(0, 60); // Show top 60 default
    
    return keys
        .filter(name => name.toLowerCase().includes(searchLower))
        .slice(0, 60); // Limit results for performance
  }, [iconSearch]);

  useEffect(() => {
    if (shortcut) {
      setFormData({
        ...shortcut,
        iconType: shortcut.iconType || 'favicon',
        profiles: shortcut.profiles || []
      });
      setIconSearch(''); // Reset search when opening
      resetProfileForm();
    }
  }, [shortcut, isOpen]);

  // Close color picker when clicking outside
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

  if (!isOpen || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const handleProfileSubmit = () => {
    if (!newProfileName.trim()) return;

    if (editingProfileId) {
      // Update existing
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
      // Create new
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
    // Optional: focus input
  };

  const applySuggestion = (suggestion: { name: string, color: string, url?: string }) => {
    setNewProfileName(suggestion.name);
    setNewProfileColor(suggestion.color);
    setNewProfileUrl(suggestion.url || '');
  };

  const removeProfile = (id: string) => {
    // If deleting the default profile, clear the defaultProfileId
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {formData.iconType === 'lucide' && formData.iconValue ? (
              <DynamicIcon name={formData.iconValue} className="text-blue-400" size={24} />
            ) : (
               <img 
                src={formData.url.startsWith('http') 
                    ? `https://www.google.com/s2/favicons?domain=${new URL(formData.url).hostname}&sz=64` 
                    : 'https://via.placeholder.com/24'}
                className="w-6 h-6 rounded-sm" 
                onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24'}
                alt=""
               />
            )}
            <h2 className="text-xl font-semibold">Kısayol Ayarları</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'general' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutGrid size={16} />
            Görünüm & İkon
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'profiles' ? 'bg-white/5 text-purple-400 border-b-2 border-purple-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users size={16} />
            Profiller ({formData.profiles?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Başlık</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                  >
                    {Object.values(Category).map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/60 mb-1">Ana URL veya Protokol</label>
                  <input 
                    type="text" 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    placeholder="https://... veya spotify:"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-3">İkon Tipi</label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="iconType"
                      checked={formData.iconType === 'favicon'}
                      onChange={() => setFormData({...formData, iconType: 'favicon'})}
                      className="accent-blue-500"
                    />
                    <span className="text-sm">Otomatik (Favicon)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="iconType"
                      checked={formData.iconType === 'lucide'}
                      onChange={() => setFormData({...formData, iconType: 'lucide', iconValue: formData.iconValue || 'Globe'})}
                      className="accent-blue-500"
                    />
                    <span className="text-sm">Lucide İkon</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="iconType"
                      checked={formData.iconType === 'image'}
                      onChange={() => setFormData({...formData, iconType: 'image'})}
                      className="accent-blue-500"
                    />
                    <span className="text-sm">Özel Resim URL</span>
                  </label>
                </div>

                {formData.iconType === 'lucide' && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs text-white/50">
                         Toplam {Object.keys(iconMap).length} ikon bulundu. Aramak için yazın:
                      </p>
                    </div>
                    
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                        <input 
                            type="text" 
                            placeholder="İkon ara... (örn: wifi, cpu, car)" 
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500/50 focus:outline-none placeholder-white/30"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar content-start min-h-[100px]">
                      {filteredIcons.length > 0 ? (
                        filteredIcons.map((iconName) => (
                          <button
                            key={iconName}
                            onClick={() => setFormData({...formData, iconValue: iconName})}
                            className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 w-14 h-14 justify-center ${
                              formData.iconValue === iconName 
                                ? 'bg-blue-500 text-white shadow-lg scale-110 z-10' 
                                : 'bg-black/30 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                            title={iconName}
                          >
                            <DynamicIcon name={iconName} size={20} />
                          </button>
                        ))
                      ) : (
                        <div className="w-full text-center py-8 text-xs text-white/30 italic">
                          "{iconSearch}" ile eşleşen ikon bulunamadı.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.iconType === 'image' && (
                  <div>
                     <input 
                      type="text" 
                      placeholder="https://example.com/logo.png"
                      value={formData.iconValue || ''}
                      onChange={e => setFormData({...formData, iconValue: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                    />
                    {formData.iconValue && (
                      <img src={formData.iconValue} alt="Preview" className="w-12 h-12 mt-2 rounded-md object-contain bg-white/5" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="space-y-6">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <p className="text-xs text-purple-200">
                  Profiller, aynı sitede farklı hesaplar (örn: İş, Kişisel Gmail) kullanmanızı sağlar. <br/>
                  Yıldız ikonuna tıklayarak varsayılan profili seçebilirsiniz.
                </p>
              </div>

              {/* Add/Edit Profile Form */}
              <div className={`bg-white/5 p-4 rounded-xl border transition-colors space-y-3 z-20 relative ${editingProfileId ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                    {editingProfileId ? 'Profili Düzenle' : 'Yeni Profil Ekle'}
                  </span>
                  {editingProfileId && (
                    <button onClick={resetProfileForm} className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                      <RotateCcw size={10} /> Vazgeç
                    </button>
                  )}
                </div>

                {/* Suggestions Section */}
                {!editingProfileId && suggestedProfiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[10px] text-white/40 w-full">Kayıtlı Profillerden Seç:</span>
                    {suggestedProfiles.map(suggestion => {
                        // Don't suggest if already exists in this shortcut
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
                  
                  {/* Custom Color Picker */}
                  <div className="relative" ref={colorPickerRef}>
                    <button
                      onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                      className="flex items-center justify-between gap-2 h-full bg-black/40 hover:bg-black/60 rounded-lg px-3 border border-white/10 min-w-[80px] transition-colors"
                    >
                       <div className={`w-5 h-5 rounded-full shadow-sm ${newProfileColor} border border-white/20`}></div>
                       <ChevronDown size={14} className="text-white/50" />
                    </button>

                    {isColorPickerOpen && (
                      <div className="absolute top-full right-0 mt-2 p-3 bg-gray-800 border border-white/10 rounded-xl shadow-2xl grid grid-cols-6 gap-2 w-[220px] z-50 animate-fade-in">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setNewProfileColor(c);
                              setIsColorPickerOpen(false);
                            }}
                            className={`w-6 h-6 rounded-full transition-all hover:scale-110 flex items-center justify-center ${c} ${newProfileColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' : ''}`}
                          >
                            {newProfileColor === c && <Check size={12} className="text-white drop-shadow-md" />}
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
                    <><Save size={14} /> Güncelle</>
                  ) : (
                    <><Plus size={14} /> Ekle</>
                  )}
                </button>
              </div>

              {/* List Profiles */}
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
                                <Star size={16} fill={formData.defaultProfileId === profile.id ? "currentColor" : "none"} />
                            </button>
                            <button 
                              onClick={() => handleEditProfile(profile)}
                              className={`p-2 rounded-lg transition-colors ${editingProfileId === profile.id ? 'text-blue-400 bg-blue-400/10' : 'text-white/30 hover:text-blue-400 hover:bg-blue-400/10'}`}
                              title="Düzenle"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => removeProfile(profile.id)}
                              className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={16} />
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
          )}

        </div>

        {/* Footer */}
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
            <Save size={16} />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutSettingsModal;
