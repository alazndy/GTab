import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { EnvelopeIcon, CheckCircleIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PomodoroStatus { phase: 'work' | 'short-break' | 'long-break'; timeLeft: number; running: boolean; sessions: number; }
interface SpotifyStatus { name: string; artist: string; isPlaying: boolean; }
interface WeatherStatus { temp: number; city: string; }

const PHASE_LABELS = { work: 'Odak', 'short-break': 'Kısa Mola', 'long-break': 'Uzun Mola' };
const PHASE_COLORS = { work: 'text-red-400', 'short-break': 'text-green-400', 'long-break': 'text-blue-400' };

const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const Divider = () => <div className="w-px h-4 bg-white/10 mx-0.5" />;

const StatusBar: React.FC = () => {
  const [pomodoro, setPomodoro]     = useState<PomodoroStatus | null>(null);
  const [weather, setWeather]       = useState<WeatherStatus | null>(null);
  const [gmailUnread, setGmailUnread] = useState<number>(0);
  const [spotify, setSpotify]       = useState<SpotifyStatus | null>(null);
  const [taskCount, setTaskCount]   = useState(0);
  const [hidden, setHidden]         = useState(false);

  // Pomodoro
  useEffect(() => {
    const handler = (e: any) => setPomodoro(e.detail);
    window.addEventListener('gtab:pomodoro-status', handler);
    return () => window.removeEventListener('gtab:pomodoro-status', handler);
  }, []);

  // Sync to chrome.storage for content script
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const status = { pomodoro, gmailUnread, taskCount, weather, spotify };
    chrome.storage.local.set({ gtab_global_status: status });
  }, [pomodoro, gmailUnread, taskCount, weather, spotify]);

  // Listen for pomodoro commands from content script
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const check = () => {
      chrome.storage.local.get(['gtab_pomo_cmd'], (r) => {
        if (r.gtab_pomo_cmd && Date.now() - r.gtab_pomo_cmd.ts < 3000) {
          window.dispatchEvent(new CustomEvent('gtab:pomodoro', { detail: r.gtab_pomo_cmd.cmd }));
          chrome.storage.local.remove('gtab_pomo_cmd');
        }
      });
    };
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  // Poll localStorage every 10s
  useEffect(() => {
    const load = () => {
      try {
        const w = localStorage.getItem('gtab_weather_v2');
        if (w) { const d = JSON.parse(w); setWeather({ temp: d.temp, city: d.city }); }
      } catch {}
      const gmail = localStorage.getItem('gtab_status_gmail_unread');
      if (gmail !== null) setGmailUnread(parseInt(gmail) || 0);
      try {
        const sp = localStorage.getItem('gtab_status_spotify');
        if (sp) setSpotify(JSON.parse(sp));
      } catch {}
      try {
        const tasks = JSON.parse(localStorage.getItem('gtab_tasks') || '[]') as { completed: boolean }[];
        setTaskCount(tasks.filter(t => !t.completed).length);
      } catch {}
    };
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  const togglePomodoro = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('gtab:pomodoro', {
      detail: pomodoro?.running ? 'stop' : 'start'
    }));
  };

  const hasAnything = !!pomodoro || gmailUnread > 0 || taskCount > 0 || !!weather || !!spotify;
  if (!hasAnything) return null;

  if (hidden) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setHidden(false)}
          className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full p-2 text-white/30 hover:text-white/60 transition-colors shadow-lg"
          title="Status bar'ı göster"
        >
          <EyeSlashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
      <div className="flex items-center gap-0.5 bg-black/65 backdrop-blur-2xl border border-white/10 rounded-full px-1.5 py-1 shadow-2xl pointer-events-auto">

        {/* Pomodoro */}
        {pomodoro && (
          <button
            onClick={togglePomodoro}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${PHASE_COLORS[pomodoro.phase]}`}
          >
            <span className="text-[11px] font-mono font-bold tracking-wider">{fmt(pomodoro.timeLeft)}</span>
            <span className="text-[9px] opacity-60 font-medium">{PHASE_LABELS[pomodoro.phase]}</span>
            {pomodoro.running
              ? <PauseIcon className="w-2.5 h-2.5 opacity-70" />
              : <PlayIcon className="w-2.5 h-2.5 opacity-70" />
            }
          </button>
        )}

        {pomodoro && (gmailUnread > 0 || taskCount > 0 || weather || spotify) && <Divider />}

        {/* Gmail */}
        {gmailUnread > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-red-400">
            <EnvelopeIcon className="w-3 h-3" />
            <span className="text-[11px] font-bold">{gmailUnread}</span>
          </div>
        )}

        {/* Tasks */}
        {taskCount > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-emerald-400">
            <CheckCircleIcon className="w-3 h-3" />
            <span className="text-[11px] font-bold">{taskCount}</span>
          </div>
        )}

        {(gmailUnread > 0 || taskCount > 0) && (weather || spotify) && <Divider />}

        {/* Weather */}
        {weather && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sky-400">
            <span className="text-[11px]">🌤</span>
            <span className="text-[11px] font-bold">{weather.temp}°</span>
          </div>
        )}

        {weather && spotify && <Divider />}

        {/* Spotify */}
        {spotify && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-green-400 max-w-[180px]">
            <span className="text-[10px]">♪</span>
            <span className="text-[10px] truncate">{spotify.name}</span>
            <span className="text-[9px] text-white/30 truncate hidden sm:block">— {spotify.artist}</span>
            {spotify.isPlaying
              ? <PauseIcon className="w-2.5 h-2.5 shrink-0 opacity-60" />
              : <PlayIcon className="w-2.5 h-2.5 shrink-0 opacity-60" />
            }
          </div>
        )}

        {/* Hide button */}
        <button
          onClick={() => setHidden(true)}
          className="ml-1 p-1 text-white/15 hover:text-white/40 transition-colors rounded-full"
          title="Gizle"
        >
          <EyeSlashIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
