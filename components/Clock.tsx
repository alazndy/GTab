
import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ClockConfig } from '../types';

interface ClockProps {
  config: ClockConfig;
  isEditMode?: boolean;
  onOpenSettings?: () => void;
}

const Clock: React.FC<ClockProps> = ({ config, isEditMode, onOpenSettings }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clockStyle = React.useMemo(() => {
    const fonts: Record<string, string> = {
      geist: '"Geist Sans", system-ui, sans-serif',
      system: 'system-ui, sans-serif',
      mono: '"Geist Mono", monospace',
      serif: 'Georgia, serif',
    };
    
    const sizes: Record<string, string> = {
      sm: 'text-4xl md:text-5xl',
      md: 'text-5xl md:text-6xl',
      lg: 'text-6xl md:text-8xl',
      xl: 'text-7xl md:text-9xl',
    };

    return {
      fontFamily: fonts[config.fontFamily || 'geist'],
      sizeClass: sizes[config.fontSize || 'xl']
    };
  }, [config.fontFamily, config.fontSize]);

  const formatTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: config.showSeconds ? '2-digit' : undefined,
      hour12: config.format === '12h'
    };
    return time.toLocaleTimeString('tr-TR', options);
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return time.toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="text-center mb-8 animate-fade-in relative group" style={{ fontFamily: clockStyle.fontFamily }}>
      {isEditMode && onOpenSettings && (
        <button 
          onClick={onOpenSettings}
          className="absolute -right-2 top-0 p-2 rounded-full bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
          title="Saat Ayarları"
        >
          <Cog6ToothIcon className="w-4 h-4 text-white" />
        </button>
      )}
      <div 
        className={`${clockStyle.sizeClass} font-thin tracking-tight drop-shadow-lg transition-all duration-700`}
        style={{ color: 'var(--theme-accent, white)' }}
      >
        {formatTime()}
      </div>
      {config.showDate && (
        <div className="text-lg md:text-xl text-white/70 mt-2 font-light capitalize">
          {formatDate()}
        </div>
      )}
    </div>
  );
};

export default Clock;
