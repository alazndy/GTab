import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, ForwardIcon, ArrowPathIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { useAmbientAudio } from '../hooks/useAmbientAudio';
import { AmbientSoundId } from '../types';

type Phase = 'work' | 'short-break' | 'long-break';

const DURATIONS: Record<Phase, number> = {
  work: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const PHASE_LABELS: Record<Phase, string> = {
  work: 'Odak',
  'short-break': 'Kısa Mola',
  'long-break': 'Uzun Mola',
};

const PHASE_TEXT: Record<Phase, string> = {
  work: 'text-red-400',
  'short-break': 'text-green-400',
  'long-break': 'text-blue-400',
};

const PHASE_STROKE: Record<Phase, string> = {
  work: 'stroke-red-400',
  'short-break': 'stroke-green-400',
  'long-break': 'stroke-blue-400',
};

const PHASE_BG: Record<Phase, string> = {
  work: 'bg-red-500',
  'short-break': 'bg-green-500',
  'long-break': 'bg-blue-500',
};

const CIRCUMFERENCE = 2 * Math.PI * 54;

const PomodoroWidget: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const { currentSoundId, isPlaying, volume, play, stop, pause, setVolume } = useAmbientAudio();

  // Listen for global pomodoro events
  useEffect(() => {
    const handleCommand = (e: any) => {
      if (e.detail === 'start') setRunning(true);
      if (e.detail === 'stop') setRunning(false);
    };
    window.addEventListener('gtab:pomodoro', handleCommand);
    return () => window.removeEventListener('gtab:pomodoro', handleCommand);
  }, []);

  // Auto-play/pause ambient sound tied to focus session
  useEffect(() => {
    if (running && phase === 'work' && currentSoundId && !isPlaying) {
      play(currentSoundId);
    } else if ((!running || phase !== 'work') && isPlaying) {
      pause();
    }
  }, [running, phase, currentSoundId, isPlaying, play, pause]);

  const progress = (DURATIONS[phase] - timeLeft) / DURATIONS[phase];
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const switchPhase = (p: Phase) => {
    setRunning(false);
    setPhase(p);
    setTimeLeft(DURATIONS[p]);
  };

  const advance = useCallback((auto: boolean) => {
    setRunning(false);
    setSessions(prev => {
      const next = phase === 'work' && auto ? prev + 1 : prev;
      if (phase === 'work') {
        const nextPhase = next > 0 && next % 4 === 0 ? 'long-break' : 'short-break';
        setPhase(nextPhase);
        setTimeLeft(DURATIONS[nextPhase]);
      } else {
        setPhase('work');
        setTimeLeft(DURATIONS.work);
      }
      return next;
    });
  }, [phase]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              phase === 'work' ? '⏰ Odak tamamlandı! Mola zamanı.' : '✅ Mola bitti! Odağa dön.'
            );
          }
          advance(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, advance]);

  const reset = () => {
    setRunning(false);
    setTimeLeft(DURATIONS[phase]);
  };

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col overflow-hidden">
      {/* Phase tabs */}
      <div className="flex border-b border-white/10 shrink-0">
        {(['work', 'short-break', 'long-break'] as Phase[]).map(p => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={`flex-1 py-2 text-[10px] font-medium transition-colors ${
              phase === p
                ? `${PHASE_TEXT[p]} border-b-2 border-current -mb-px`
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Ring + timer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle
              cx="64" cy="64" r="54" fill="none"
              className={`${PHASE_STROKE[phase]} transition-all duration-700`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-light text-white tracking-wide">{fmt(timeLeft)}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${PHASE_TEXT[phase]}`}>
              {PHASE_LABELS[phase]}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="p-2 text-white/30 hover:text-white/60 transition-colors">
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className={`p-3 rounded-full transition-all ${PHASE_BG[phase]} hover:opacity-90 shadow-lg`}
          >
            {running
              ? <PauseIcon className="w-6 h-6 text-white" />
              : <PlayIcon className="w-6 h-6 text-white" />
            }
          </button>
          <button onClick={() => advance(false)} className="p-2 text-white/30 hover:text-white/60 transition-colors">
            <ForwardIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Sounds */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[180px] pt-2">
          <div className="flex items-center justify-between w-full bg-white/5 rounded-full px-2 py-1 border border-white/5">
            <button
              onClick={() => stop()}
              className={`p-1.5 rounded-full transition-all ${!currentSoundId ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
              title="Sesi Kapat"
            >
              <span className="text-xs">🔇</span>
            </button>
            {(['rain', 'coffee', 'forest', 'white-noise'] as AmbientSoundId[]).map((id) => (
              <button
                key={id}
                onClick={() => play(id)}
                className={`p-1.5 rounded-full transition-all ${currentSoundId === id ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                title={id}
              >
                <span className="text-xs">
                  {id === 'rain' && '🌧️'}
                  {id === 'coffee' && '☕'}
                  {id === 'forest' && '🌳'}
                  {id === 'white-noise' && '🔊'}
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 w-full px-1">
            <SpeakerWaveIcon className="w-3 h-3 text-white/20" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/40 hover:accent-white/60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Session dots */}
      <div className="border-t border-white/10 py-3 flex items-center justify-center gap-3 shrink-0">
        <span className="text-[10px] text-white/25">Tamamlanan</span>
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < sessions % 4 ? 'bg-red-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/25">{sessions} pomodoro</span>
      </div>
    </div>
  );
};

export default PomodoroWidget;
