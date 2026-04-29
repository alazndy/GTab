import React, { useCallback } from 'react';

interface UseWidgetResizerProps {
  snapGridSize?: number;
  onResizeEnd: (widthPx: number, heightPx: number) => void;
}

export const useWidgetResizer = ({ snapGridSize = 20, onResizeEnd }: UseWidgetResizerProps) => {
  const handlePointerDown = useCallback((e: React.PointerEvent, widgetEl: HTMLElement) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = widgetEl.offsetWidth;
    const startHeight = widgetEl.offsetHeight;

    const oldTransition = widgetEl.style.transition;
    widgetEl.style.transition = 'none';
    
    // Add visual cue for resizing
    widgetEl.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-black', 'z-50', 'scale-[1.01]');

    const onPointerMove = (moveEvent: PointerEvent) => {
      let newWidth = Math.max(200, startWidth + (moveEvent.clientX - startX));
      let newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));

      // Snap to grid
      if (snapGridSize > 0) {
        newWidth = Math.round(newWidth / snapGridSize) * snapGridSize;
        newHeight = Math.round(newHeight / snapGridSize) * snapGridSize;
      }

      widgetEl.style.width = `${newWidth}px`;
      widgetEl.style.height = `${newHeight}px`;
    };

    const onPointerUp = () => {
      widgetEl.style.transition = oldTransition;
      widgetEl.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-black', 'z-50', 'scale-[1.01]');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      
      onResizeEnd(widgetEl.offsetWidth, widgetEl.offsetHeight);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }, [snapGridSize, onResizeEnd]);

  return { handlePointerDown };
};
