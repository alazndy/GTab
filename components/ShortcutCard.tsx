
import React from 'react';
import { Shortcut, ShortcutProfile } from '../types';
import { X, Settings, ExternalLink, User } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

interface ShortcutCardProps {
  shortcut: Shortcut;
  activeProfileFilter?: string | 'All';
  onDelete: (id: string) => void;
  onEdit: (shortcut: Shortcut) => void;
}

const ShortcutCard: React.FC<ShortcutCardProps> = ({ shortcut, activeProfileFilter = 'All', onDelete, onEdit }) => {
  const hasProfiles = shortcut.profiles && shortcut.profiles.length > 0;

  // 1. Determine if we are targeting a specific profile via GLOBAL FILTER
  const activeProfile = (activeProfileFilter !== 'All' && shortcut.profiles)
    ? shortcut.profiles.find(p => p.name === activeProfileFilter)
    : undefined;

  // 2. Determine if there is a DEFAULT PROFILE set for this shortcut (if no global filter is active)
  const defaultProfile = (!activeProfile && shortcut.defaultProfileId && shortcut.profiles)
    ? shortcut.profiles.find(p => p.id === shortcut.defaultProfileId)
    : undefined;

  // 3. The profile to visually represent and link to
  const displayProfile = activeProfile || defaultProfile;

  // 4. Calculate Target URL
  const targetUrl = displayProfile 
    ? (displayProfile.url && displayProfile.url.trim() !== '' ? displayProfile.url : shortcut.url)
    : shortcut.url;

  const getFavicon = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return 'https://picsum.photos/64/64';
    }
  };

  const renderIcon = () => {
    if (shortcut.iconType === 'lucide' && shortcut.iconValue) {
      return <DynamicIcon name={shortcut.iconValue} className="w-10 h-10 mb-3 text-white drop-shadow-md" />;
    }
    if (shortcut.iconType === 'image' && shortcut.iconValue) {
      return (
        <img 
          src={shortcut.iconValue} 
          alt={shortcut.title} 
          className="w-10 h-10 rounded-md mb-3 shadow-md object-contain bg-white/10"
          onError={(e) => (e.target as HTMLImageElement).src = getFavicon(shortcut.url)}
        />
      );
    }
    // Default to favicon
    return (
        <img 
          src={getFavicon(shortcut.url)} 
          alt={shortcut.title} 
          className="w-10 h-10 rounded-md mb-3 shadow-md object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=?';
          }}
        />
    );
  };

  const handleProfileClick = (e: React.MouseEvent, profile: ShortcutProfile) => {
    e.stopPropagation();
    e.preventDefault();
    const pUrl = profile.url && profile.url.trim() !== '' ? profile.url : shortcut.url;
    window.location.href = pUrl;
  };

  return (
    <div className="group relative z-0 hover:z-20">
      {/* Main Card */}
      <div className={`relative backdrop-blur-md border rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:-translate-y-1 shadow-sm hover:shadow-xl h-32 w-full overflow-hidden
        ${activeProfile 
            ? 'bg-blue-500/20 border-blue-500/30 shadow-blue-500/10' 
            : defaultProfile
                ? 'bg-white/10 border-white/20 shadow-white/5' // Slight distinction for default profile
                : 'bg-white/10 border-white/10 hover:bg-white/20'
        }
      `}>
        
        {/* Actions (Edit/Delete) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(shortcut);
            }}
            className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-blue-500/80 hover:text-white transition-all"
            title="Ayarlar"
          >
            <Settings size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(shortcut.id);
            }}
            className="p-1.5 rounded-full bg-black/20 text-white/70 hover:bg-red-500/80 hover:text-white transition-all"
            title="Kaldır"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content */}
        <a 
          href={targetUrl} 
          className="flex flex-col items-center w-full h-full justify-center relative"
        >
          {renderIcon()}
          <span className="text-white font-medium text-sm text-center truncate w-full px-2">
            {shortcut.title}
          </span>
          <div className="text-xs text-white/50 mt-1 flex items-center gap-1 h-4">
            {displayProfile ? (
                // Show active or default profile badge
                <span className={`flex items-center gap-1 font-medium animate-fade-in ${activeProfile ? 'text-blue-200' : 'text-white/70'}`}>
                    <div className={`w-2 h-2 rounded-full ${displayProfile.avatarColor || 'bg-blue-400'} ${!activeProfile && 'ring-1 ring-white/20'}`} />
                    {displayProfile.name}
                </span>
            ) : (
                // Show default category info
                <>
                    {hasProfiles && <User size={10} />}
                    {shortcut.category}
                </>
            )}
          </div>
        </a>
      </div>

      {/* Hover Profiles List - Only show if NO specific profile is filtered */}
      {hasProfiles && !activeProfile && (
        <div className="absolute top-[95%] left-0 w-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
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
                      {shortcut.defaultProfileId === profile.id && (
                          <div className="w-1 h-1 rounded-full bg-white/50" title="Varsayılan" />
                      )}
                  </div>
                </div>
                <ExternalLink size={10} className="text-white/30 opacity-0 group-hover/profile:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortcutCard;
