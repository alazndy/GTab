
import React, { memo } from 'react';
import { Shortcut, ShortcutProfile, CardConfig, IconSize } from '../types';
import { XMarkIcon, Cog6ToothIcon, ArrowTopRightOnSquareIcon, UserIcon, FolderIcon, BoltIcon } from '@heroicons/react/24/outline';
import { getFavicon, resolveTargetUrl } from './utils/shortcutUtils';

interface ShortcutCardProps {
  shortcut: Shortcut;
  activeProfileFilter?: string | 'All';
  onDelete: (id: string) => void;
  onEdit: (shortcut: Shortcut) => void;
  onFolderClick?: (shortcut: Shortcut) => void;
  cardConfig?: CardConfig;

  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}

const SHAPE_CLASS: Record<string, string> = {
  sharp: 'rounded-none',
  rounded: 'rounded-xl',
  pill: 'rounded-3xl',
};

const SIZE_CLASS: Record<string, string> = {
  sm: 'h-24',
  md: 'h-32',
  lg: 'h-40',
  xl: 'h-48',
};

const SIZE_ICON: Record<string, string> = {
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const ICON_SIZE_CLASS: Record<IconSize, string> = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

const SIZE_PADDING: Record<string, string> = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
  xl: 'p-4',
};

const SIZE_MB: Record<string, string> = {
  sm: 'mb-1',
  md: 'mb-2',
  lg: 'mb-3',
  xl: 'mb-3',
};

const ShortcutCard: React.FC<ShortcutCardProps> = memo(({
  shortcut,
  activeProfileFilter = 'All',
  onDelete,
  onEdit,
  onFolderClick,
  cardConfig,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const isFolder = shortcut.isFolder;
  const hasProfiles = shortcut.profiles && shortcut.profiles.length > 0;

  const shapeClass = SHAPE_CLASS[cardConfig?.shape ?? 'rounded'];
  const sizeClass = SIZE_CLASS[cardConfig?.size ?? 'md'];
  const bgOpacity = cardConfig?.bgOpacity ?? 10;
  const iconClass = cardConfig?.iconSize
    ? ICON_SIZE_CLASS[cardConfig.iconSize]
    : SIZE_ICON[cardConfig?.size ?? 'md'];
  const paddingClass = SIZE_PADDING[cardConfig?.size ?? 'md'];
  const mbClass = SIZE_MB[cardConfig?.size ?? 'md'];
  const isSmall = (cardConfig?.size ?? 'md') === 'sm';

  const activeProfile = (activeProfileFilter !== 'All' && shortcut.profiles)
    ? shortcut.profiles.find(p => p.name === activeProfileFilter)
    : undefined;
  const defaultProfile = (!activeProfile && shortcut.defaultProfileId && shortcut.profiles)
    ? shortcut.profiles.find(p => p.id === shortcut.defaultProfileId)
    : undefined;
  const displayProfile = activeProfile || defaultProfile;
  const targetUrl = resolveTargetUrl(shortcut, displayProfile);

  const renderIconContent = (s: Shortcut, iconSz = "w-10 h-10", mb = "mb-3") => {
    const iconUrl = s.iconType === 'image' && s.iconValue ? s.iconValue : getFavicon(s.url, shortcut.url);
    
    return (
      <img
        src={iconUrl}
        alt={s.title}
        loading="lazy"
        decoding="async"
        className={`${iconSz} ${mb} rounded-md shadow-md object-contain ${s.iconType === 'image' ? 'bg-white/10' : ''} flex-shrink-0`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = getFavicon(s.url, shortcut.url);
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

  const handleOpenAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    shortcut.children?.forEach(child => {
      const url = resolveTargetUrl(child);
      if (url) window.open(url, '_blank');
    });
  };

  const handleProfileClick = (e: React.MouseEvent, profile: ShortcutProfile) => {
    e.stopPropagation();
    e.preventDefault();
    const url = resolveTargetUrl(shortcut, profile);
    const link = document.createElement('a');
    link.href = url;
    link.click();
  };

  const cardWidthStyle = cardConfig?.cardWidth ? { width: `${cardConfig.cardWidth}%` } : undefined;
  const glowClass = cardConfig?.glowEnabled ? 'hover:shadow-[0_0_20px_var(--theme-accent,rgba(59,130,246,0.5))]' : 'hover:shadow-xl';

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
            style={cardWidthStyle}
        >
            <div
                onClick={handleMainClick}
                className={`relative backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-y-1 w-full overflow-hidden ${shapeClass} ${sizeClass} ${paddingClass} ${glowClass} ${cardConfig?.showCardBorder !== false ? 'border' : 'border-0'}`}
                style={{ 
                  backgroundColor: `rgba(255,255,255,${bgOpacity / 100})`,
                  borderColor: cardConfig?.showCardBorder !== false ? `rgba(255,255,255,${(cardConfig?.cardBorderOpacity ?? 10) / 100})` : 'transparent'
                }}
            >
                <div className={`grid grid-cols-2 gap-1 p-1 bg-black/20 rounded-lg flex-shrink-0 ${isSmall ? 'w-9 h-9 mb-1' : 'w-[52px] h-[52px] mb-2'}`}>
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
                
                <span className={`text-white font-medium text-center truncate w-full px-1 leading-tight ${isSmall ? 'text-[11px]' : 'text-sm'}`}>
                    {shortcut.title}
                </span>
                {!isSmall && (
                  <div className="text-[10px] text-white/40 mt-0.5">
                    {children.length} öğe
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    {children.length > 0 && (
                      <button
                        onClick={handleOpenAll}
                        title="Hepsini Aç"
                        className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-yellow-500/80 hover:text-white transition-all"
                      >
                        <BoltIcon className="w-3 h-3" />
                      </button>
                    )}
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
        style={cardWidthStyle}
    >
      <div
        className={`relative backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-sm w-full overflow-hidden ${shapeClass} ${sizeClass} ${paddingClass} ${glowClass} ${
          cardConfig?.showCardBorder !== false ? 'border' : 'border-0'
        }`}
        style={{
          backgroundColor: activeProfile
            ? 'rgba(59,130,246,0.2)'
            : defaultProfile
            ? `rgba(255,255,255,${(bgOpacity + 5) / 100})`
            : `rgba(255,255,255,${bgOpacity / 100})`,
          borderColor: cardConfig?.showCardBorder !== false 
            ? (activeProfile ? 'rgba(59,130,246,0.4)' : `rgba(255,255,255,${(cardConfig?.cardBorderOpacity ?? 10) / 100})`)
            : 'transparent'
        }}
      >
        
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

        <a href={targetUrl} className="flex flex-col items-center w-full h-full justify-center relative min-w-0">
          {renderIconContent(shortcut, iconClass, mbClass)}
          <span className={`text-white font-medium text-center truncate w-full px-1 leading-tight ${isSmall ? 'text-[11px]' : 'text-sm'}`}>
            {shortcut.title}
          </span>
          {!isSmall && (
            <div className="text-xs text-white/50 mt-1 flex items-center gap-1 h-4 min-w-0 max-w-full">
              {displayProfile ? (
                <span className={`flex items-center gap-1 font-medium animate-fade-in truncate ${activeProfile ? 'text-blue-200' : 'text-white/70'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${displayProfile.avatarColor || 'bg-blue-400'} ${!activeProfile && 'ring-1 ring-white/20'}`} />
                  {displayProfile.name}
                </span>
              ) : (
                <>
                  {hasProfiles && <UserIcon className="w-2.5 h-2.5 flex-shrink-0" />}
                  <span className="truncate">{shortcut.category}</span>
                </>
              )}
            </div>
          )}
        </a>
      </div>

      {hasProfiles && !activeProfile && (
        <div className="absolute top-[95%] left-1/2 -translate-x-1/2 min-w-[180px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-40">
          <div className="backdrop-blur-xl rounded-xl p-2 shadow-2xl flex flex-col gap-1" 
             style={{ 
               backgroundColor: `rgba(var(--menu-bg-rgb, 10,10,12), ${(cardConfig?.menuOpacity ?? 95) / 100})`, 
               border: `${cardConfig?.menuBorderOpacity === 0 ? '0px' : '1px'} solid rgba(var(--menu-border-rgb, 255,255,255), ${(cardConfig?.menuBorderOpacity ?? 10) / 100})` 
             }}>
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
