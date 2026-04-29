import React, { useRef, useCallback, useMemo } from 'react';
import { useGTab } from '../context/GTabContext';
import { Shortcut } from '../types';
import ShortcutCard from './ShortcutCard';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

export const ShortcutGridWidget: React.FC = () => {
  const { 
    shortcuts, setShortcuts, 
    filterCategory, setFilterCategory, 
    filterProfile, setFilterProfile,
    cardConfig,
    setEditingShortcut,
    setActiveFolderId,
    setIsModalOpen,
    deleteShortcut
  } = useGTab();

  // Shortcut Drag Refs
  const shortcutDragItem = useRef<string | null>(null);
  const shortcutDragOverItem = useRef<string | null>(null);

  const handleShortcutDragStart = useCallback((e: React.DragEvent, id: string) => {
      shortcutDragItem.current = id;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleShortcutDrop = useCallback((e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const draggedId = shortcutDragItem.current;
      if (!draggedId || draggedId === targetId) return;

      setShortcuts(prev => {
          const draggedIndex = prev.findIndex(s => s.id === draggedId);
          const targetIndex = prev.findIndex(s => s.id === targetId);
          if (draggedIndex === -1 || targetIndex === -1) return prev;
          const targetShortcut = prev[targetIndex];
          const draggedShortcut = prev[draggedIndex];
          if (targetShortcut.isFolder) {
              const newShortcuts = [...prev];
              newShortcuts.splice(draggedIndex, 1);
              const newTargetIndex = newShortcuts.findIndex(s => s.id === targetId);
              if (newTargetIndex !== -1) {
                  const updatedTarget = {
                      ...newShortcuts[newTargetIndex],
                      children: [...(newShortcuts[newTargetIndex].children || []), draggedShortcut]
                  };
                  newShortcuts[newTargetIndex] = updatedTarget;
                  return newShortcuts;
              }
              return prev;
          }
          const newShortcuts = [...prev];
          newShortcuts.splice(draggedIndex, 1);
          newShortcuts.splice(targetIndex, 0, draggedShortcut);
          return newShortcuts;
      });
      shortcutDragItem.current = null;
      shortcutDragOverItem.current = null;
  }, [setShortcuts]);

  const handleShortcutDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
  }, []);

  const handleEditShortcut = useCallback((s: Shortcut) => setEditingShortcut(s), [setEditingShortcut]);
  const handleFolderClick = useCallback((s: Shortcut) => setActiveFolderId(s.id), [setActiveFolderId]);

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(s => {
      const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
      const matchesProfile = filterProfile === 'All' || (s.profiles && s.profiles.some(p => p.name === filterProfile));
      return matchesCategory && matchesProfile;
    });
  }, [shortcuts, filterCategory, filterProfile]);

  return (
    <div className="w-full">
      {filteredShortcuts.length === 0 ? (
         <div className="text-center text-white/50 py-12 bg-white/5 rounded-xl border border-white/5">
           <FolderIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
           <p>Bu filtreye uygun kısayol bulunamadı.</p>
           {(filterCategory !== 'All' || filterProfile !== 'All') && (
             <button onClick={() => { setFilterCategory('All'); setFilterProfile('All'); }} className="text-blue-400 text-sm mt-2 hover:underline">Filtreleri Temizle</button>
           )}
         </div>
      ) : (
          <div 
            className="grid w-full pb-24" 
            style={{ 
              columnGap: `${cardConfig.gridGapX ?? 16}px`, 
              rowGap: `${cardConfig.gridGapY ?? 16}px`,
              gridTemplateColumns: `repeat(${cardConfig.gridCols ?? 6}, minmax(0, 1fr))`
            }}
          >
            {filteredShortcuts.map(shortcut => (
                <ShortcutCard
                  key={shortcut.id}
                  shortcut={shortcut}
                  activeProfileFilter={filterProfile}
                  onDelete={deleteShortcut}
                  onEdit={handleEditShortcut}
                  onFolderClick={handleFolderClick}
                  cardConfig={cardConfig}
                  draggable={true}
                  onDragStart={handleShortcutDragStart}
                  onDragOver={handleShortcutDragOver}
                  onDrop={handleShortcutDrop}
                />
            ))}
            <button 
                onClick={() => {
                    setActiveFolderId(null);
                    setIsModalOpen(true);
                }}
                className={`group rounded-xl border border-white/5 border-dashed bg-transparent hover:bg-white/5 flex flex-col items-center justify-center transition-all opacity-30 hover:opacity-100 ${
                  (cardConfig?.size === 'sm' ? 'h-24' : cardConfig?.size === 'lg' ? 'h-40' : cardConfig?.size === 'xl' ? 'h-48' : 'h-32')
                }`}
            >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 mb-1 transition-colors"><PlusIcon className="w-5 h-5 text-white/50" /></div>
                <span className="text-[11px] text-white/40 font-medium group-hover:text-white/60">Yeni Ekle</span>
            </button>
          </div>
      )}
    </div>
  );
};
