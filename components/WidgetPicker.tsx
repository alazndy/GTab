import React, { useState } from 'react';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  ClockIcon, MagnifyingGlassIcon, ListBulletIcon, Squares2X2Icon,
  EnvelopeIcon, CalendarIcon, ChartBarIcon, CheckCircleIcon,
  DocumentTextIcon, CloudIcon, MusicalNoteIcon,
  TagIcon, StopCircleIcon, RssIcon, CodeBracketIcon
} from '@heroicons/react/24/outline';
import { WidgetId, WidgetConfig } from '../types';

const WIDGET_META: Record<WidgetId, { label: string; icon: React.ReactNode; color: string }> = {
  clock:          { label: 'Saat & Tarih',        icon: <ClockIcon className="w-6 h-6" />,            color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  search:         { label: 'Arama Çubuğu',         icon: <MagnifyingGlassIcon className="w-6 h-6" />,  color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30' },
  tasks:          { label: 'Görevler',              icon: <ListBulletIcon className="w-6 h-6" />,       color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  categories:     { label: 'Kategori Filtresi',     icon: <TagIcon className="w-6 h-6" />,              color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
  shortcuts:      { label: 'Kısayollar',            icon: <Squares2X2Icon className="w-6 h-6" />,       color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30' },
  gmail:          { label: 'Gmail',                 icon: <EnvelopeIcon className="w-6 h-6" />,         color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
  calendar:       { label: 'Takvim',                icon: <CalendarIcon className="w-6 h-6" />,         color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' },
  stocks:         { label: 'Borsa',                 icon: <ChartBarIcon className="w-6 h-6" />,         color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
  'google-tasks': { label: 'Google Görevler',       icon: <CheckCircleIcon className="w-6 h-6" />,      color: 'from-blue-400/20 to-blue-500/10 border-blue-400/30' },
  'google-keep':  { label: 'Notlar',                icon: <DocumentTextIcon className="w-6 h-6" />,     color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' },
  weather:        { label: 'Hava Durumu',           icon: <CloudIcon className="w-6 h-6" />,            color: 'from-sky-500/20 to-sky-600/10 border-sky-500/30' },
  pomodoro:       { label: 'Pomodoro',              icon: <StopCircleIcon className="w-6 h-6" />,       color: 'from-red-400/20 to-red-500/10 border-red-400/30' },
  spotify:        { label: 'Spotify',               icon: <MusicalNoteIcon className="w-6 h-6" />,      color: 'from-green-400/20 to-green-500/10 border-green-400/30' },
  rss:            { label: 'RSS / Haber',           icon: <RssIcon className="w-6 h-6" />,              color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
  github:         { label: 'GitHub',                icon: <CodeBracketIcon className="w-6 h-6" />,      color: 'from-gray-500/20 to-gray-600/10 border-gray-500/30' },
};

interface WidgetPickerProps {
  layout: WidgetConfig[];
  toggleWidgetVisibility: (id: WidgetId) => void;
}

export const WidgetPicker: React.FC<WidgetPickerProps> = ({ layout, toggleWidgetVisibility }) => {
  const [open, setOpen] = useState(false);

  const visible = layout.filter(w => w.visible);
  const hidden = layout.filter(w => !w.visible);

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? 'bg-white/20 rotate-45 border border-white/30'
            : 'bg-white/10 hover:bg-white/20 border border-white/20'
        }`}
        title="Widget ekle / kaldır"
      >
        <PlusIcon className="w-6 h-6 text-white" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-400 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-black/80 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
          {/* Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

          {/* Active widgets */}
          {visible.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Aktif Widgetlar</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {visible.map(w => {
                  const meta = WIDGET_META[w.id];
                  return (
                    <div
                      key={w.id}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border bg-gradient-to-b ${meta.color}`}
                    >
                      <div className="text-white/70">{meta.icon}</div>
                      <span className="text-[10px] text-white/60 font-medium text-center leading-tight">{meta.label}</span>
                      <button
                        onClick={() => toggleWidgetVisibility(w.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center shadow-lg transition-colors"
                        title="Kaldır"
                      >
                        <XMarkIcon className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available widgets */}
          {hidden.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Eklenebilir Widgetlar</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {hidden.map(w => {
                  const meta = WIDGET_META[w.id];
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidgetVisibility(w.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border bg-gradient-to-b ${meta.color} opacity-50 hover:opacity-100 transition-all hover:scale-105`}
                    >
                      <div className="text-white/70">{meta.icon}</div>
                      <span className="text-[10px] text-white/60 font-medium text-center leading-tight">{meta.label}</span>
                      <div className="w-4 h-4 border-2 border-dashed border-white/30 rounded-full" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hidden.length === 0 && visible.length > 0 && (
            <p className="text-center text-white/20 text-xs py-4">Tüm widgetlar aktif.</p>
          )}
        </div>
      </div>
    </>
  );
};
