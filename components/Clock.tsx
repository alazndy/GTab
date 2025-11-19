import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { ClockConfig } from '../types';

interface ClockProps {
  config: ClockConfig;
  isEditMode?: boolean;
  onOpenSettings?: () => void;
}

const Clock: React.FC<ClockProps> = ({ config, isEditMode = false, onOpenSettings }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: config.showSeconds ? '2-digit' : undefined,
      hour12: config.timeFormat === '12h',
    };
    return date.toLocaleTimeString('tr-TR', options);
  };

  const formatDate = (date: Date) => {
    if (config.dateFormat === 'hidden') return null;

    const options: Intl.DateTimeFormatOptions = {};
    
    switch (config.dateFormat) {
      case 'full':
        options.weekday = 'long';
        options.day = 'numeric';
        options.month = 'long';
        break;
      case 'long':
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'medium':
        options.day = 'numeric';
        options.month = 'short';
        options.weekday = 'short';
        break;
      case 'short':
        return date.toLocaleDateString('tr-TR');
    }

    return date.toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="relative text-center text-white drop-shadow-md mb-8 animate-fade-in select-none group/clock">
      <h1 className="text-8xl font-light tracking-tighter tabular-nums">
        {formatTime(time)}
      </h1>
      {config.dateFormat !== 'hidden' && (
        <p className="text-xl font-medium opacity-90 mt-2">{formatDate(time)}</p>
      )}
      
      {isEditMode && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings?.();
          }}
          className="absolute -top-2 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer z-30"
          title="Saat Ayarları"
        >
          <Settings size={18} />
        </button>
      )}
    </div>
  );
};

export default Clock;