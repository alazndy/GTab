
import React from 'react';
import { Shortcut, ShortcutProfile } from '../types';
import { XMarkIcon, PlusIcon, FolderOpenIcon, TrashIcon, Cog6ToothIcon, BoltIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface FolderViewModalProps {
  folder: Shortcut;
  isOpen: boolean;
  onClose: () => void;
  onEditItem: (item: Shortcut) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
}

const ensureProtocol = (url: string | undefined) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const getFavicon = (url: string) => {
  try {
    const fullUrl = ensureProtocol(url);
    if (fullUrl.startsWith('mailto:')) return 'https://picsum.photos/64/64';
    const domain = new URL(fullUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return 'https://picsum.photos/64/64';
  }
};

const resolveUrl = (shortcut: Shortcut, profile?: ShortcutProfile): string => {
  const mainUrl = ensureProtocol(shortcut.url);
  if (!profile) return mainUrl;
  const pUrl = profile.url?.trim();
  if (!pUrl) return mainUrl;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(pUrl)) {
    if (mainUrl.includes('google.com') || mainUrl.includes('youtube.com')) {
      try {
        const u = new URL(mainUrl);
        u.searchParams.set('authuser', pUrl);
        return u.toString();
      } catch {
        const sep = mainUrl.includes('?') ? '&' : '?';
        return `${mainUrl}${sep}authuser=${pUrl}`;
      }
    }
    return `mailto:${pUrl}`;
  }
  return ensureProtocol(pUrl);
};

const openUrl = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const FolderViewModal: React.FC<FolderViewModalProps> = ({
  folder, isOpen, onClose, onEditItem, onDeleteItem, onAddItem
}) => {
  if (!isOpen) return null;

  const children = folder.children || [];

  const handleOpenAll = () => {
    children.forEach(child => {
      const url = resolveUrl(child);
      if (url) window.open(url, '_blank');
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-slide-up text-white max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <FolderOpenIcon className="w-7 h-7 text-yellow-400 flex-shrink-0" />
          <h2 className="text-lg font-semibold flex-1 truncate">{folder.title}</h2>
          <div className="flex items-center gap-2">
            {children.length > 0 && (
              <button
                onClick={handleOpenAll}
                title="Hepsini aynı anda aç"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 hover:bg-yellow-500/30 border border-yellow-500/25 text-yellow-300 text-xs font-medium transition-all"
              >
                <BoltIcon className="w-3.5 h-3.5" />
                Hepsini Aç
              </button>
            )}
            <button
              onClick={onClose}
              title="Kapat"
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {children.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <FolderOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Bu grup boş.</p>
              <p className="text-xs mt-1 text-white/30">Aşağıdan kısayol ekleyebilirsin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {children.map(item => {
                const hasProfiles = item.profiles && item.profiles.length > 0;
                const mainUrl = resolveUrl(item);
                const favicon = item.iconType === 'image' && item.iconValue
                  ? item.iconValue
                  : getFavicon(item.url);

                return (
                  <div key={item.id} className="group relative flex flex-col bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl overflow-hidden transition-all">

                    {/* Main click area */}
                    <a
                      href={mainUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 gap-2 flex-1 hover:bg-white/5 transition-colors"
                    >
                      <img
                        src={favicon}
                        alt={item.title}
                        className="w-9 h-9 rounded-md object-contain flex-shrink-0"
                        onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36?text=?'}
                      />
                      <span className="text-xs text-white/90 font-medium truncate w-full text-center leading-tight">
                        {item.title}
                      </span>
                    </a>

                    {/* Profiles */}
                    {hasProfiles && (
                      <div className="border-t border-white/8 px-2 py-2 flex flex-wrap gap-1.5 justify-center">
                        {item.profiles!.map(profile => (
                          <button
                            key={profile.id}
                            onClick={() => openUrl(resolveUrl(item, profile))}
                            title={`${profile.name} ile aç`}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all hover:scale-105 hover:brightness-110 ${profile.avatarColor || 'bg-blue-500/70'} text-white`}
                          >
                            <span>{profile.name.substring(0, 1).toUpperCase()}</span>
                            <span className="max-w-[48px] truncate">{profile.name}</span>
                            <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Edit / Delete (hover) */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.preventDefault(); onEditItem(item); }}
                        title="Düzenle"
                        className="p-1 rounded-full bg-black/40 hover:bg-blue-500/80 transition-colors"
                      >
                        <Cog6ToothIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); onDeleteItem(item.id); }}
                        title="Sil"
                        className="p-1 rounded-full bg-black/40 hover:bg-red-500/80 transition-colors"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onAddItem}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Bu Gruba Kısayol Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderViewModal;
