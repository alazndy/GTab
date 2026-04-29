import React from 'react';
import { PhotoIcon, ArrowPathIcon, CheckIcon, HeartIcon, PencilIcon } from '@heroicons/react/24/outline';

interface HeaderControlsProps {
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  setIsBgModalOpen: (val: boolean) => void;
  resetLayout: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  isEditMode,
  setIsEditMode,
  setIsBgModalOpen,
  resetLayout
}) => {
  const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/alazndy";

  return (
    <header className="flex justify-end mb-6 space-x-2 sticky top-4 z-50">
       {isEditMode ? (
         <>
            <button onClick={() => setIsBgModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-colors text-white text-sm font-medium" style={{ backgroundColor: 'var(--theme-accent, #2563eb)' }}><PhotoIcon className="w-4 h-4" /><span className="hidden sm:inline">Görünüm</span></button>
            <button onClick={resetLayout} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 backdrop-blur-md transition-colors text-white/90 text-sm font-medium"><ArrowPathIcon className="w-4 h-4" /><span className="hidden sm:inline">Sıfırla</span></button>
            <button onClick={() => setIsEditMode(false)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 backdrop-blur-md transition-all text-white text-sm font-medium animate-fade-in"><CheckIcon className="w-4 h-4" /><span>Bitti</span></button>
         </>
       ) : (
         <>
            <a href={BUY_ME_COFFEE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 backdrop-blur-md transition-all text-yellow-200 hover:text-yellow-100 text-sm font-medium group">
              <HeartIcon className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Kahve Ismarla</span>
            </a>
            <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all text-white/90 text-sm font-medium"><PencilIcon className="w-4 h-4" /><span className="hidden sm:inline">Düzenle</span></button>
         </>
       )}
    </header>
  );
};
