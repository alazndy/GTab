import React from 'react';
import { Shortcut, Category } from '../../types';

interface GeneralTabProps {
  formData: Shortcut;
  setFormData: (data: Shortcut) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
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
            {Object.values(Category).map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
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

      <div>
        <label className="block text-xs font-medium text-white/60 mb-3">İkon Tipi</label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="iconType"
              checked={formData.iconType === 'favicon'}
              onChange={() => setFormData({...formData, iconType: 'favicon', iconValue: undefined})}
              className="accent-blue-500"
            />
            <span className="text-sm">Otomatik (Favicon)</span>
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
  );
};
