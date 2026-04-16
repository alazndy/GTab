
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

  // Cache the formatter instances to prevent expensive Intl.DateTimeFormat instantiation on every render tick
  const timeFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: config.showSeconds ? '2-digit' : undefined,
      hour12: config.format === '12h'
    });
  }, [config.showSeconds, config.format]);

  const dateFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="text-center mb-8 animate-fade-in relative group" style={{ fontFamily: clockStyle.fontFamily }}>

      <div 
        className={`${clockStyle.sizeClass} font-thin tracking-tight drop-shadow-lg transition-all duration-700`}
        style={{ color: 'var(--theme-accent, white)' }}
      >
        {timeFormatter.format(time)}
      </div>
      {config.showDate && (
        <div className="text-lg md:text-xl text-white/70 mt-2 font-light capitalize">
          {dateFormatter.format(time)}
        </div>
      )}
    </div>
  );
};

export default Clock;
