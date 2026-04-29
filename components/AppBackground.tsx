import React from 'react';
import { BackgroundConfig } from '../types';

interface GlowOrb {
  color: string;
  size: string;
  animClass: string;
}

interface AppBackgroundProps {
  bgConfig: BackgroundConfig;
  isThemeBg: boolean;
  isColorBg: boolean;
  activeBgUrl: string;
  isBgImageLoaded: boolean;
  themeOverlayClass: string;
  themeOverlayStyle?: React.CSSProperties;
  themeOrbs?: GlowOrb[];
}

export const AppBackground: React.FC<AppBackgroundProps> = ({
  bgConfig,
  isThemeBg,
  isColorBg,
  activeBgUrl,
  isBgImageLoaded,
  themeOverlayClass,
  themeOverlayStyle,
  themeOrbs
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {/* Base Background Layer */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Theme Overlay Layer (Static gradients/filters) */}
      {isThemeBg && themeOverlayClass && (
        <div className={`absolute -inset-[10%] transition-opacity duration-700 animate-glow-drift ${themeOverlayClass}`} style={themeOverlayStyle} />
      )}

      {/* Animated Glow Orbs */}
      {isThemeBg && themeOrbs && themeOrbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${orb.animClass}`}
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(30px)',
          }}
        />
      ))}
      
      {/* Color Background Layer */}
      {isColorBg && (
         <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: bgConfig.value }} />
      )}
      
      {/* Image Background Layer */}
      {!isThemeBg && !isColorBg && (
         <img 
            src={activeBgUrl}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: isBgImageLoaded ? 0.6 : 0, filter: 'brightness(0.6) contrast(1.1)' }}
         />
      )}
    </div>
  );
};
