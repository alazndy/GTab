import React from 'react';
import { WidgetConfig, WidgetId } from '../types';
import { useGTab } from '../context/GTabContext';
import {
  Bars3Icon,
  Cog6ToothIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { WidgetQuickSettings } from './WidgetQuickSettings';

interface WidgetWrapperProps {
  widget: WidgetConfig;
  index: number;
  isEditMode: boolean;
  activeTheme: string;
  themeStyles: any;
  showQuickSettings: WidgetId | null;
  setShowQuickSettings: (id: WidgetId | null) => void;
  draggedId: string | null;
  dragOverId: string | null;
  onDragStart: (e: React.DragEvent, id: string, index: number) => void;
  onDragEnter: (e: React.DragEvent, id: string, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  updateWidgetConfig: (id: WidgetId, config: Partial<WidgetConfig>) => void;
  setIsBgModalOpen: (val: boolean) => void;
  setIsClockModalOpen: (val: boolean) => void;
  toggleWidgetVisibility: (id: WidgetId) => void;
  resizeHandler: (e: React.PointerEvent, element: HTMLElement, onEnd: (w: number, h: number) => void) => void;
  getWidgetLabel: (id: WidgetId) => string;
  isFreeLayout?: boolean;
  onPointerDownFreeDrag?: (e: React.PointerEvent, widget: WidgetConfig, el: HTMLElement) => void;
  children: React.ReactNode;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  widget,
  index,
  isEditMode,
  activeTheme,
  themeStyles,
  showQuickSettings,
  setShowQuickSettings,
  draggedId,
  dragOverId,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragEnd,
  updateWidgetConfig,
  setIsBgModalOpen,
  setIsClockModalOpen,
  toggleWidgetVisibility,
  resizeHandler,
  getWidgetLabel,
  isFreeLayout,
  onPointerDownFreeDrag,
  children
}) => {
  const isDragged = draggedId === widget.id && !isFreeLayout;
  const isDragOver = dragOverId === widget.id && !isDragged && !isFreeLayout;

  const isGlass = widget.glassEffect !== false;
  const showBorder = isGlass && widget.showBorder !== false;
  const glassStyle = isGlass ? `${themeStyles.glass} shadow-2xl shadow-black/20` : 'bg-transparent border-transparent';
  
  const editStyle = isEditMode 
    ? `border-2 border-dashed ${isDragged ? 'opacity-20 scale-95' : 'opacity-100'} ${isDragOver ? 'border-blue-400 bg-blue-500/10 scale-[1.02] z-40' : 'border-white/20 hover:border-white/40'}`
    : `${glassStyle} ${showBorder ? 'border-2' : 'border-0'}`;

  const dynamicStyle: React.CSSProperties = {
     width: widget.widthPx ? `${widget.widthPx}px` : '100%',
     height: widget.heightPx ? `${widget.heightPx}px` : 'auto',
     backgroundColor: (isGlass && activeTheme !== 'custom') ? 
        `rgba(${themeStyles.glassBgRgb || '255,255,255'}, ${(widget.opacity ?? 10) / 100})` : undefined,
     borderColor: (showBorder && activeTheme !== 'custom') ? 
        `rgba(${themeStyles.glassBgRgb || '255,255,255'}, ${(widget.borderOpacity ?? 20) / 100})` : undefined,
     ...(isFreeLayout && {
        position: 'absolute',
        left: widget.x !== undefined ? `${widget.x}px` : `${(index % 2) * 450 + 50}px`,
        top: widget.y !== undefined ? `${widget.y}px` : `${Math.floor(index / 2) * 350 + 50}px`,
     })
  };

  return (
    <div
      draggable={isEditMode && showQuickSettings !== widget.id && !isFreeLayout}
      onDragStart={!isFreeLayout ? (e) => onDragStart(e, widget.id, index) : undefined}
      onDragEnter={!isFreeLayout ? (e) => onDragEnter(e, widget.id, index) : undefined}
      onDragOver={!isFreeLayout ? onDragOver : undefined}
      onDragEnd={!isFreeLayout ? onDragEnd : undefined}
      onPointerDown={isEditMode && isFreeLayout && onPointerDownFreeDrag ? (e) => onPointerDownFreeDrag(e, widget, e.currentTarget) : undefined}
      className={`widget-item transition-all duration-300 rounded-2xl p-4 md:p-6 ${editStyle} ${isEditMode ? 'cursor-move' : ''} ${isFreeLayout ? '' : 'relative'}`}
      style={dynamicStyle}
      data-widget-id={widget.id}
    >
      {isEditMode && (
        <>
            <div className="absolute -top-3 left-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2 z-20" style={{ backgroundColor: 'var(--theme-accent, #2563eb)' }}><Bars3Icon className="w-3 h-3" />{getWidgetLabel(widget.id)}</div>
            
            <div className="absolute top-4 right-4 flex items-center gap-2 z-30" onPointerDown={(e) => e.stopPropagation()}>
              <div 
                className="relative group/settings"
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickSettings(showQuickSettings === widget.id ? null : widget.id);
                  }}
                  className={`p-1.5 rounded-full transition-all border border-white/20 ${showQuickSettings === widget.id ? 'bg-blue-500 text-white' : 'bg-black/60 hover:bg-black/80 text-white/70'}`}
                >
                   <Cog6ToothIcon className="w-4 h-4" />
                </button>

                {showQuickSettings === widget.id && (
                  <WidgetQuickSettings 
                    widget={widget} 
                    onClose={() => setShowQuickSettings(null)} 
                    setIsBgModalOpen={setIsBgModalOpen} 
                    setIsClockModalOpen={setIsClockModalOpen} 
                  />
                )}
              </div>

              <button onClick={(e) => { e.preventDefault(); updateWidgetConfig(widget.id, { glassEffect: widget.glassEffect === false ? true : false }) }} className={`p-1.5 rounded-full transition-all border border-white/20 ${widget.glassEffect === false ? 'bg-indigo-500/80 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-black/60 hover:bg-black/80 text-white/70'}`} title="Cam Efekti">
                 <SparklesIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleWidgetVisibility(widget.id); }}
                className="p-1.5 rounded-full transition-all border border-red-500/40 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white"
                title="Kaldır"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div 
               className="absolute bottom-1 right-1 w-10 h-10 cursor-nwse-resize opacity-50 hover:opacity-100 flex items-end justify-end p-2 z-30"
               onPointerDown={(e) => resizeHandler(e, e.currentTarget.parentElement as HTMLElement, (w, h) => updateWidgetConfig(widget.id, { widthPx: w, heightPx: h }))}
               title="Boyutlandır (Grid 20px)"
            >
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-white stroke-2"><path d="M21 15L15 21M21 9L9 21"/></svg>
            </div>
        </>
      )}
      <div className={`w-full h-full ${activeTheme === 'terminal' ? 'font-mono' : ''}`}>
         {children}
      </div>
    </div>
  );
};