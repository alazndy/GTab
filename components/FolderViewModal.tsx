
import React from 'react';
import { Shortcut } from '../types';
import { XMarkIcon, PlusIcon, FolderOpenIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

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
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
      return trimmed;
    }
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

const FolderViewModal: React.FC<FolderViewModalProps> = ({ folder, isOpen, onClose, onEditItem, onDeleteItem, onAddItem }) => {
    if (!isOpen) return null;

    const children = folder.children || [];

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-lg bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl p-6 animate-slide-up text-white max-h-[80vh] flex flex-col">
                <button 
                    onClick={onClose}
                    title="Kapat"
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <FolderOpenIcon className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-xl font-semibold">{folder.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children.length === 0 ? (
                        <div className="text-center py-12 text-white/40">
                            <FolderOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Bu klasör boş.</p>
                            <p className="text-xs mt-1">Kısayol eklemek için aşağıdaki butona tıklayın.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {children.map(item => (
                                <a
                                    key={item.id}
                                    href={ensureProtocol(item.url)}
                                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 flex flex-col items-center transition-all hover:scale-105"
                                >
                                    <img 
                                        src={item.iconType === 'image' ? item.iconValue : getFavicon(item.url)} 
                                        alt={item.title}
                                        className="w-8 h-8 rounded-md mb-2 object-contain"
                                        onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=?'}
                                    />
                                    <span className="text-xs text-white/90 truncate w-full text-center">{item.title}</span>

                                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={onAddItem}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Bu Klasöre Ekle
                </button>
            </div>
        </div>
    );
};

export default FolderViewModal;
