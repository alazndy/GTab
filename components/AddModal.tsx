
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, FolderPlusIcon, LinkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Category, Shortcut, ShortcutPayload } from '../types';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: ShortcutPayload[], targetGroupId?: string) => void;
  groups: Shortcut[];
  isInsideGroup: boolean;
  initialUrl?: string;
}

type Step = 'choose' | 'shortcut' | 'group';

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd, groups, isInsideGroup, initialUrl }) => {
  const [step, setStep] = useState<Step>('choose');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [targetGroupId, setTargetGroupId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(initialUrl || isInsideGroup ? 'shortcut' : 'choose');
      setTitle('');
      setUrl(initialUrl ?? '');
      setCategory(Category.OTHER);
      setTargetGroupId('');
    }
  }, [isOpen, isInsideGroup, initialUrl]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd([{ title: title.trim(), url: url.trim(), category }], targetGroupId || undefined);
    handleClose();
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd([{ title: title.trim(), url: '', category: Category.OTHER, isFolder: true, children: [] }]);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-sm bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-slide-up text-white overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          {step !== 'choose' && !isInsideGroup && (
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          )}
          <span className="text-sm font-semibold flex-1">
            {step === 'choose' && 'Ne eklemek istiyorsun?'}
            {step === 'shortcut' && (isInsideGroup ? 'Gruba Kısayol Ekle' : 'Kısayol Ekle')}
            {step === 'group' && 'Grup Oluştur'}
          </span>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">

          {/* ── ADIM 1: Seç ── */}
          {step === 'choose' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep('shortcut')}
                className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LinkIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">Kısayol</div>
                  <div className="text-[11px] text-white/40 mt-0.5 leading-tight">URL veya uygulama linki</div>
                </div>
              </button>

              <button
                onClick={() => setStep('group')}
                className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderPlusIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">Grup</div>
                  <div className="text-[11px] text-white/40 mt-0.5 leading-tight">Linkleri bir arada tut</div>
                </div>
              </button>
            </div>
          )}

          {/* ── ADIM 2A: Kısayol formu ── */}
          {step === 'shortcut' && (
            <form onSubmit={handleAddShortcut} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Ad</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Spotify"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">URL veya Protokol</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://... veya spotify: steam:"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-white/20 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat} className="bg-black">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Grup seçici — sadece zaten bir grup içinde DEĞİLSEK göster */}
              {!isInsideGroup && (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Nereye eklensin?
                  </label>
                  <select
                    value={targetGroupId}
                    onChange={(e) => setTargetGroupId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  >
                    <option value="" className="bg-black">Ana sayfaya ekle</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id} className="bg-black">
                        📁 {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-1"
              >
                <PlusIcon className="w-4 h-4" />
                Ekle
              </button>
            </form>
          )}

          {/* ── ADIM 2B: Grup formu ── */}
          {step === 'group' && (
            <form onSubmit={handleAddGroup} className="flex flex-col gap-4">
              <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs text-yellow-200/70 leading-relaxed">
                  Grubu oluşturduktan sonra üzerine tıklayarak içine kısayol ekleyebilirsin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Grup Adı</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Geliştirici Araçları"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-yellow-500/50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-1"
              >
                <FolderPlusIcon className="w-4 h-4" />
                Grubu Oluştur
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddModal;
