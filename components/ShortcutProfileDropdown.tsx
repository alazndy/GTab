import React from 'react';
import { ShortcutProfile, CardConfig } from '../types';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ShortcutProfileDropdownProps {
  profiles: ShortcutProfile[];
  cardConfig?: CardConfig;
  onProfileClick: (e: React.MouseEvent, profile: ShortcutProfile) => void;
}

export const ShortcutProfileDropdown: React.FC<ShortcutProfileDropdownProps> = ({
  profiles,
  cardConfig,
  onProfileClick
}) => {
  if (!profiles || profiles.length === 0) return null;

  return (
    <div className="absolute top-[95%] left-1/2 -translate-x-1/2 min-w-[180px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-40">
      <div 
        className="backdrop-blur-xl rounded-xl p-2 shadow-2xl flex flex-col gap-1" 
        style={{ 
          backgroundColor: `rgba(var(--menu-bg-rgb, 10,10,12), ${(cardConfig?.menuOpacity ?? 95) / 100})`, 
          border: `${cardConfig?.menuBorderOpacity === 0 ? '0px' : '1px'} solid rgba(var(--menu-border-rgb, 255,255,255), ${(cardConfig?.menuBorderOpacity ?? 10) / 100})` 
        }}
      >
        <div className="text-[10px] text-white/40 px-2 py-1 uppercase tracking-wider font-semibold">Profiller</div>
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={(e) => onProfileClick(e, profile)}
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
  );
};
