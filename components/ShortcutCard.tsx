
import React, { memo } from 'react';
import { Shortcut, ShortcutProfile } from '../types';
import { XMarkIcon, Cog6ToothIcon, ArrowTopRightOnSquareIcon, UserIcon, FolderIcon } from '@heroicons/react/24/outline';

interface ShortcutCardProps {
  shortcut: Shortcut;
  activeProfileFilter?: string | 'All';
  onDelete: (id: string) => void;
  onEdit: (shortcut: Shortcut) => void;
  onFolderClick?: (shortcut: Shortcut) => void;
  
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
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

const resolveTargetUrl = (shortcut: Shortcut, profile?: ShortcutProfile) => {
  const mainUrl = ensureProtocol(shortcut.url);
  if (!profile) return mainUrl;
  const pUrl = profile.url?.trim();
  if (!pUrl) return mainUrl;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(pUrl)) {
     if (mainUrl.includes('google.com') || mainUrl.includes('youtube.com')) {
        try {
            const urlObj = new URL(mainUrl);
            urlObj.searchParams.set('authuser', pUrl);
            return urlObj.toString();
        } catch {
            const separator = mainUrl.includes('?') ? '&' : '?';
            return `${mainUrl}${separator}authuser=${pUrl}`;
        }
     }
     return `mailto:${pUrl}`;
  }
  return ensureProtocol(pUrl);
};

const ShortcutCard: React.FC<ShortcutCardProps> = memo(({ 
  shortcut, 
  activeProfileFilter = 'All', 
  onDelete, 
  onEdit, 
  onFolderClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const isFolder = shortcut.isFolder;
  const hasProfiles = shortcut.profiles && shortcut.profiles.length > 0;

  const activeProfile = (activeProfileFilter !== 'All' && shortcut.profiles)
    ? shortcut.profiles.find(p => p.name === activeProfileFilter)
    : undefined;
  const defaultProfile = (!activeProfile && shortcut.defaultProfileId && shortcut.profiles)
    ? shortcut.profiles.find(p => p.id === shortcut.defaultProfileId)
    : undefined;
  const displayProfile = activeProfile || defaultProfile;
  const targetUrl = resolveTargetUrl(shortcut, displayProfile);

  const getFavicon = (url: string) => {
    try {
        const fullUrl = ensureProtocol(url);
        if (fullUrl.startsWith('mailto:')) return getFavicon(shortcut.url);
        const domain = new URL(fullUrl).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return 'https://picsum.photos/64/64';
    }
  };

  const renderIconContent = (s: Shortcut, sizeClass = "w-10 h-10") => {
    if (s.iconType === 'image' && s.iconValue) {
      return (
        <img 
          src={s.iconValue} 
          alt={s.title} 
          loading="lazy"
          decoding="async"
          className={`${sizeClass} rounded-md mb-3 shadow-md object-contain bg-white/10`}
          onError={(e) => (e.target as HTMLImageElement).src = getFavicon(s.url)}
        />
      );
    }
    return (
        <img 
          src={getFavicon(s.url)} 
          alt={s.title} 
          loading="lazy"
          decoding="async"
          className={`${sizeClass} rounded-md mb-3 shadow-md object-contain`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=?';
          }}
        />
    );
  };

  const handleMainClick = (e: React.MouseEvent) => {
    if (isFolder && onFolderClick) {
        e.preventDefault();
        onFolderClick(shortcut);
    }
  };

  const handleProfileClick = (e: React.MouseEvent, profile: ShortcutProfile) => {
    e.stopPropagation();
    e.preventDefault();
    const url = resolveTargetUrl(shortcut, profile);
    const link = document.createElement('a');
    link.href = url;
    link.click();
  };

  if (isFolder) {
      const children = shortcut.children || [];
      const previewItems = children.slice(0, 4);

      return (
        <div 
            className="group relative z-0 hover:z-20"
            draggable={draggable}
            onDragStart={(e) => onDragStart?.(e, shortcut.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop?.(e, shortcut.id)}
        >
            <div 
                onClick={handleMainClick}
                className="relative backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl h-32 w-full overflow-hidden bg-white/5 hover:bg-white/10"
            >
                <div className="grid grid-cols-2 gap-1.5 mb-2 p-1.5 bg-black/20 rounded-lg w-[52px] h-[52px]">
                   {previewItems.map(child => (
                       <div key={child.id} className="flex items-center justify-center w-full h-full overflow-hidden">
                           <img 
                             src={child.iconType === 'image' ? child.iconValue : getFavicon(child.url)} 
                             className="w-4 h-4 rounded-[2px] object-cover" 
                             alt="" 
                             onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                           />
                       </div>
                   ))}
                   {children.length === 0 && <FolderIcon className="w-5 h-5 text-white/20 col-span-2 row-span-2 mx-auto my-auto" />}
                </div>
                
                <span className="text-white font-medium text-sm text-center truncate w-full px-2">
                    {shortcut.title}
                </span>
                <div className="text-[10px] text-white/40 mt-0.5">
                    {children.length} öğe
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(shortcut); }}
                        title="Ayarlar"
                        className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-blue-500/80 hover:text-white transition-all"
                    >
                        <Cog6ToothIcon className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(shortcut.id); }}
                        title="Sil"
                        className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-red-500/80 hover:text-white transition-all"
                    >
                        <XMarkIcon className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div 
        className="group relative z-0 hover:z-20"
        draggable={draggable}
        onDragStart={(e) => onDragStart?.(e, shortcut.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop?.(e, shortcut.id)}
    >
      <div className={`relative backdrop-blur-md border rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:-translate-y-1 shadow-sm hover:shadow-xl h-32 w-full overflow-hidden
        ${activeProfile 
            ? 'bg-blue-500/20 border-blue-500/30 shadow-blue-500/10' 
            : defaultProfile
                ? 'bg-white/10 border-white/20 shadow-white/5'
                : 'bg-white/10 border-white/10 hover:bg-white/20'
        }
      `}>
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(shortcut); }}
            title="Ayarlar"
            className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-blue-500/80 hover:text-white transition-all"
          >
            <Cog6ToothIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(shortcut.id); }}
            title="Sil"
            className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-red-500/80 hover:text-white transition-all"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>

        <a href={targetUrl} className="flex flex-col items-center w-full h-full justify-center relative">
          {renderIconContent(shortcut)}
          <span className="text-white font-medium text-sm text-center truncate w-full px-2">
            {shortcut.title}
          </span>
          <div className="text-xs text-white/50 mt-1 flex items-center gap-1 h-4">
            {displayProfile ? (
                <span className={`flex items-center gap-1 font-medium animate-fade-in ${activeProfile ? 'text-blue-200' : 'text-white/70'}`}>
                    <div className={`w-2 h-2 rounded-full ${displayProfile.avatarColor || 'bg-blue-400'} ${!activeProfile && 'ring-1 ring-white/20'}`} />
                    {displayProfile.name}
                </span>
            ) : (
                <>
                    {hasProfiles && <UserIcon className="w-2.5 h-2.5" />}
                    {shortcut.category}
                </>
            )}
          </div>
        </a>
      </div>

      {hasProfiles && !activeProfile && (
        <div className="absolute top-[95%] left-0 w-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-40">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1">
            <div className="text-[10px] text-white/40 px-2 py-1 uppercase tracking-wider font-semibold">Profiller</div>
            {shortcut.profiles!.map((profile) => (
              <button
                key={profile.id}
                onClick={(e) => handleProfileClick(e, profile)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left group/profile relative"
              >
                <div className={`w-6 h-6 rounded-full ${profile.avatarColor || 'bg-blue-500'} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                  {profile.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate flex items-center gap-2">
                      {profile.name}
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 text-white/30 opacity-0 group-hover/profile:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ShortcutCard;
