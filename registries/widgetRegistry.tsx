import React from 'react';
import {
  ClockIcon, MagnifyingGlassIcon, ListBulletIcon, TagIcon,
  Squares2X2Icon, EnvelopeIcon, CalendarIcon, ChartBarIcon,
  CheckCircleIcon, DocumentTextIcon, CloudIcon, StopCircleIcon,
  MusicalNoteIcon, RssIcon, CodeBracketIcon
} from '@heroicons/react/24/outline';
import { WidgetId } from '../types';

import Clock              from '../components/Clock';
import SearchBar          from '../components/SearchBar';
import TasksWidget        from '../components/TasksWidget';
import { CategoryFilterWidget } from '../components/CategoryFilterWidget';
import { ShortcutGridWidget }   from '../components/ShortcutGridWidget';
import GmailWidget        from '../components/GmailWidget';
import CalendarWidget     from '../components/CalendarWidget';
import StocksWidget       from '../components/StocksWidget';
import GoogleTasksWidget  from '../components/GoogleTasksWidget';
import GoogleKeepWidget   from '../components/GoogleKeepWidget';
import WeatherWidget      from '../components/WeatherWidget';
import PomodoroWidget     from '../components/PomodoroWidget';
import SpotifyWidget      from '../components/SpotifyWidget';
import RSSWidget          from '../components/RSSWidget';
import GitHubWidget       from '../components/GitHubWidget';

export interface WidgetMeta {
  id: WidgetId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  pickerGradient: string;
  component: React.FC;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const WIDGET_REGISTRY: WidgetMeta[] = [
  { id: 'clock',        label: 'Saat & Tarih',            Icon: ClockIcon,          pickerGradient: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',       component: Clock },
  { id: 'search',       label: 'Arama Çubuğu',            Icon: MagnifyingGlassIcon, pickerGradient: 'from-violet-500/20 to-violet-600/10 border-violet-500/30', component: SearchBar },
  { id: 'tasks',        label: 'Görevler',                Icon: ListBulletIcon,     pickerGradient: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30', component: TasksWidget },
  { id: 'categories',   label: 'Kategori Filtresi',       Icon: TagIcon,            pickerGradient: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',   component: CategoryFilterWidget },
  { id: 'shortcuts',    label: 'Kısayollar',              Icon: Squares2X2Icon,     pickerGradient: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',         component: ShortcutGridWidget },
  { id: 'gmail',        label: 'Gmail',                   Icon: EnvelopeIcon,       pickerGradient: 'from-red-500/20 to-red-600/10 border-red-500/30',            component: GmailWidget },
  { id: 'calendar',     label: 'Takvim',                  Icon: CalendarIcon,       pickerGradient: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',         component: CalendarWidget },
  { id: 'stocks',       label: 'Borsa',                   Icon: ChartBarIcon,       pickerGradient: 'from-green-500/20 to-green-600/10 border-green-500/30',      component: StocksWidget },
  { id: 'google-tasks', label: 'Google Görevler',         Icon: CheckCircleIcon,    pickerGradient: 'from-blue-400/20 to-blue-500/10 border-blue-400/30',         component: GoogleTasksWidget,  defaultWidth: 350, defaultHeight: 500 },
  { id: 'google-keep',  label: 'Notlar',                  Icon: DocumentTextIcon,   pickerGradient: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',   component: GoogleKeepWidget,   defaultWidth: 400, defaultHeight: 600 },
  { id: 'weather',      label: 'Hava Durumu',             Icon: CloudIcon,          pickerGradient: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',            component: WeatherWidget,      defaultWidth: 280, defaultHeight: 320 },
  { id: 'pomodoro',     label: 'Pomodoro',                Icon: StopCircleIcon,     pickerGradient: 'from-red-400/20 to-red-500/10 border-red-400/30',            component: PomodoroWidget,     defaultWidth: 280, defaultHeight: 380 },
  { id: 'spotify',      label: 'Spotify',                 Icon: MusicalNoteIcon,    pickerGradient: 'from-green-400/20 to-green-500/10 border-green-400/30',      component: SpotifyWidget,      defaultWidth: 280, defaultHeight: 400 },
  { id: 'rss',          label: 'RSS / Haber',             Icon: RssIcon,            pickerGradient: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',   component: RSSWidget,          defaultWidth: 380, defaultHeight: 500 },
  { id: 'github',       label: 'GitHub Aktivite',         Icon: CodeBracketIcon,    pickerGradient: 'from-gray-500/20 to-gray-600/10 border-gray-500/30',         component: GitHubWidget,       defaultWidth: 320, defaultHeight: 480 },
];

export const WIDGET_MAP = new Map<WidgetId, WidgetMeta>(
  WIDGET_REGISTRY.map(w => [w.id, w])
);

export const getWidgetLabel = (id: WidgetId): string =>
  WIDGET_MAP.get(id)?.label ?? id;

export const renderWidget = (id: WidgetId): React.ReactNode => {
  const meta = WIDGET_MAP.get(id);
  if (!meta) return null;
  const Component = meta.component;
  return <Component />;
};
