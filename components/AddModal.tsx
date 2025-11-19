
import React, { useState } from 'react';
import { X, Wand2, Plus, Loader2 } from 'lucide-react';
import { Category, ShortcutPayload } from '../types';
import { generateSmartShortcuts, categorizeLink } from '../services/geminiService';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: ShortcutPayload[]) => void;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        // Optional: Use AI to auto-categorize if "Other" is selected
        let finalCategory = category;
        if (finalCategory === Category.OTHER && process.env.API_KEY) {
             // Only try to categorize valid web URLs with AI, skip protocols
             if (url.startsWith('http')) {
                finalCategory = await categorizeLink(title, url);
             }
        }

        onAdd([{ title, url, category: finalCategory }]);
        onClose();
        resetForm();
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const suggestions = await generateSmartShortcuts(prompt);
      if (suggestions.length > 0) {
        onAdd(suggestions);
        onClose();
        resetForm();
      } else {
        alert("Üzgünüm, öneri oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCategory(Category.OTHER);
    setPrompt('');
    setMode('manual');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-gray-900/90 border border-white/10 rounded-2xl shadow-2xl p-6 animate-slide-up text-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex space-x-4 mb-6 border-b border-white/10 pb-2">
          <button 
            onClick={() => setMode('manual')}
            className={`pb-2 text-sm font-medium transition-colors ${mode === 'manual' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/60 hover:text-white'}`}
          >
            Manuel Ekle
          </button>
          <button 
             onClick={() => setMode('ai')}
             className={`pb-2 text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'ai' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/60 hover:text-white'}`}
          >
            <Wand2 size={16} />
            AI Sihirbazı
          </button>
        </div>

        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Başlık</label>
              <input 
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
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Kısayol Ekle
            </button>
          </form>
        ) : (
          <form onSubmit={handleAISubmit} className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-purple-200 leading-relaxed">
                Gemini AI sizin için birden fazla kısayol oluşturabilir. <br/>
                Örn: "En popüler React kütüphaneleri", "Haber siteleri", "Sosyal medya araçları"
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Ne eklemek istersin?</label>
              <textarea 
                required
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none resize-none"
                placeholder="Örn: Tasarımcılar için en iyi ilham kaynaklarını ekle..."
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              AI ile Oluştur
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddModal;