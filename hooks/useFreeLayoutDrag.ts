import React, { useCallback } from 'react';
import { WidgetConfig, WidgetId } from '../types';

interface UseFreeLayoutDragProps {
  snapGridSize?: number;
  updateWidgetConfig: (id: WidgetId, config: Partial<WidgetConfig>) => void;
}

export const useFreeLayoutDrag = ({ snapGridSize = 20, updateWidgetConfig }: UseFreeLayoutDragProps) => {
  const handlePointerDown = useCallback((e: React.PointerEvent, widget: WidgetConfig, widgetEl: HTMLElement) => {
    // Sadece sol tık ile sürükleme yapılsın
    if (e.button !== 0) return;
    
    // Quick settings vs tıklandığında sürüklenmeyi önle
    if ((e.target as HTMLElement).closest('button')) return;

    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    
    const startWidgetX = widget.x ?? widgetEl.offsetLeft;
    const startWidgetY = widget.y ?? widgetEl.offsetTop;

    const oldTransition = widgetEl.style.transition;
    widgetEl.style.transition = 'none';
    widgetEl.style.zIndex = '50';
    
    // Add visual cue for dragging
    widgetEl.classList.add('ring-2', 'ring-blue-500/50', 'scale-[1.02]');

    // Gather other widgets for collision detection
    const parent = widgetEl.parentElement;
    const otherWidgets: { left: number, top: number, right: number, bottom: number }[] = [];
    if (parent) {
      const items = parent.querySelectorAll('.widget-item');
      items.forEach(item => {
        if (item === widgetEl) return;
        const el = item as HTMLElement;
        otherWidgets.push({
          left: el.offsetLeft,
          top: el.offsetTop,
          right: el.offsetLeft + el.offsetWidth,
          bottom: el.offsetTop + el.offsetHeight
        });
      });
    }

    let isColliding = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      let newX = startWidgetX + (moveEvent.clientX - startX);
      let newY = startWidgetY + (moveEvent.clientY - startY);

      // Snap to grid
      if (snapGridSize > 0) {
        newX = Math.round(newX / snapGridSize) * snapGridSize;
        newY = Math.round(newY / snapGridSize) * snapGridSize;
      }

      const newRight = newX + widgetEl.offsetWidth;
      const newBottom = newY + widgetEl.offsetHeight;

      isColliding = otherWidgets.some(other => {
        // Strict overlap (we add +1 or -1 if we wanted borders to touch, but exact matches are fine since border isn't content)
        return !(newRight <= other.left ||
                 newX >= other.right ||
                 newBottom <= other.top ||
                 newY >= other.bottom);
      });

      if (isColliding) {
        widgetEl.classList.add('ring-red-500', 'ring-4');
        widgetEl.classList.remove('ring-blue-500/50', 'ring-2');
      } else {
        widgetEl.classList.add('ring-blue-500/50', 'ring-2');
        widgetEl.classList.remove('ring-red-500', 'ring-4');
      }

      widgetEl.style.left = `${newX}px`;
      widgetEl.style.top = `${newY}px`;
    };

    const onPointerUp = () => {
      widgetEl.style.transition = oldTransition;
      widgetEl.style.zIndex = '';
      widgetEl.classList.remove('ring-red-500', 'ring-4', 'ring-2', 'ring-blue-500/50', 'scale-[1.02]');
      
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      
      if (isColliding) {
        // Revert position with a smooth transition
        widgetEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        widgetEl.style.left = `${startWidgetX}px`;
        widgetEl.style.top = `${startWidgetY}px`;
        return; // Do not save state
      }

      // Compute final snapped positions to save to state
      let finalX = startWidgetX + (parseInt(widgetEl.style.left) - startWidgetX);
      let finalY = startWidgetY + (parseInt(widgetEl.style.top) - startWidgetY);
      
      if (isNaN(finalX)) finalX = widgetEl.offsetLeft;
      if (isNaN(finalY)) finalY = widgetEl.offsetTop;

      updateWidgetConfig(widget.id, { x: finalX, y: finalY });
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }, [snapGridSize, updateWidgetConfig]);

  return { handlePointerDown };
};
