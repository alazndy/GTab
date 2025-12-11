
import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, FolderPlusIcon } from '@heroicons/react/24/outline';
import { Category, ShortcutPayload } from '../types';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: ShortcutPayload[]) => void;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'manual' | 'folder'>('manual');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHER);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd([{ title, url, category }]);
    onClose();
    resetForm();
  };

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd([{
        title,
        url: '',
        category: Category.OTHER,
        isFolder: true,
        children: []
    }]);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCategory(Category.OTHER);
    setMode('manual');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-gray-900/90 border border-white/10 rounded-2xl shadow-2xl p-6 animate-slide-up text-white">
        <button 
          onClick={onClose}
          title="Kapat"
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex space-x-4 mb-6 border-b border-white/10 pb-2">
          <button 
            onClick={() => setMode('manual')}
            className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap ${mode === 'manual' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:text-white'}`}
          >
            Manuel Ekle
          </button>
          <button 
             onClick={() => setMode('folder')}
             className={`pb-2 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${mode === 'folder' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-white/60 hover:text-white'}`}
          >
            <FolderPlusIcon className="w-4 h-4" />
            Klasör
          </button>
        </div>

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Başlık</label>
              <input 
                id="shortcut-title"
                name="title"
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                placeholder="Örn: Spotify veya Twitter"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">URL veya Protokol</label>
              <input 
                id="shortcut-url"
                name="url"
                type="text" 
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none font-mono"
                placeholder="https://... veya spotify: steam:"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Kategori</label>
              <select 
                id="shortcut-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-blue-500/50 focus:outline-none"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <PlusIcon className="w-4 h-4" />
              Kısayol Ekle
            </button>
          </form>
        )}

        {mode === 'folder' && (
           <form onSubmit={handleFolderSubmit} className="space-y-4">
             <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-200 leading-relaxed">
                  Kısayollarınızı gruplamak için bir klasör oluşturun. Daha sonra kısayolları sürükleyip içine bırakabilirsiniz.
                </p>
             </div>
             <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Klasör Adı</label>
                <input 
                  id="folder-name"
                  name="folder-name"
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-yellow-500/50 focus:outline-none"
                  placeholder="Örn: Geliştirici Araçları"
                />
             </div>
             <button 
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
             >
                <FolderPlusIcon className="w-4 h-4" />
                Klasör Oluştur
             </button>
           </form>
        )}
      </div>
    </div>
  );
};

export default AddModal;
