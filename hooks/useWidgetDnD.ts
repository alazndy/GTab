import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WidgetConfig, WidgetId } from '../types';

interface UseWidgetDnDProps {
  layout: WidgetConfig[];
  onReorder: (newLayout: WidgetConfig[]) => void;
}

export const useWidgetDnD = ({ layout, onReorder }: UseWidgetDnDProps) => {
  const [draggedId, setDraggedId] = useState<WidgetId | null>(null);
  const [dragOverId, setDragOverId] = useState<WidgetId | null>(null);
  const [liveLayout, setLiveLayout] = useState<WidgetConfig[]>(layout);

  const draggedItemRef = useRef<WidgetConfig | null>(null);

  // Keep liveLayout in sync with layout when not dragging
  useEffect(() => {
    if (!draggedId) {
      setLiveLayout(layout);
    }
  }, [layout, draggedId]);

  const onDragStart = useCallback((e: React.DragEvent, id: WidgetId) => {
    setDraggedId(id);
    const item = layout.find(w => w.id === id);
    if (item) draggedItemRef.current = item;
    
    e.dataTransfer.effectAllowed = "move";
    
    // Add a slight delay to allow the ghost image to be created before making the original translucent
    setTimeout(() => {
        const el = e.target as HTMLElement;
        if (el) el.classList.add('opacity-20');
    }, 0);
  }, [layout]);

  const onDragEnter = useCallback((e: React.DragEvent, targetId: WidgetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setDragOverId(targetId);

    setLiveLayout(prev => {
      const draggedIndex = prev.findIndex(w => w.id === draggedId);
      const targetIndex = prev.findIndex(w => w.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newLayout = [...prev];
      const draggedItem = newLayout[draggedIndex];
      newLayout.splice(draggedIndex, 1);
      newLayout.splice(targetIndex, 0, draggedItem);
      
      return newLayout.map((item, idx) => ({ ...item, order: idx }));
    });
  }, [draggedId]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.target as HTMLElement;
    if (el) el.classList.remove('opacity-20');

    // Commit the live layout to storage
    onReorder(liveLayout);
    
    draggedItemRef.current = null;
    setDraggedId(null);
    setDragOverId(null);
  }, [liveLayout, onReorder]);

  return {
    draggedId,
    dragOverId,
    liveLayout,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragEnd
  };
};
