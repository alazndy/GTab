import { ThemeId } from '../types';

export const getThemeStyles = (activeTheme: ThemeId | 'default') => {
  switch (activeTheme) {
    case 'neon':
      return {
        wrapper: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        overlay: 'bg-black/40 backdrop-blur-[2px]',
        overlayStyle: {},
        accent: 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]',
        glass: 'border-pink-500/20 backdrop-blur-xl transition-all',
        glassBgRgb: '255,255,255',
        menuBg: 'rgba(20,20,30,0.97)',
        menuBorder: 'rgba(236,72,153,0.3)',
        menuBgRgb: '20,20,30',
        menuBorderRgb: '236,72,153',
        accentColor: '#ec4899',
      };
    case 'starship':
      return {
        wrapper: 'bg-[#050505] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black',
        overlay: '',
        overlayStyle: {},
        accent: 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]',
        glass: 'border-white/5 backdrop-blur-lg transition-all',
        glassBgRgb: '255,255,255',
        menuBg: 'rgba(3,6,24,0.97)',
        menuBorder: 'rgba(96,165,250,0.2)',
        menuBgRgb: '3,6,24',
        menuBorderRgb: '96,165,250',
        accentColor: '#60a5fa',
      };
    case 'terminal':
      return {
        wrapper: 'bg-black',
        overlay: '',
        overlayStyle: {
          backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))',
          backgroundSize: '100% 2px, 3px 100%'
        },
        accent: 'text-green-500 font-mono drop-shadow-[0_0_5px_#22c55e]',
        glass: 'border-green-500/30 font-mono hover:border-green-500/60 transition-all',
        glassBgRgb: '0,0,0',
        menuBg: 'rgba(0,8,2,0.97)',
        menuBorder: 'rgba(34,197,94,0.3)',
        menuBgRgb: '0,8,2',
        menuBorderRgb: '34,197,94',
        accentColor: '#22c55e',
      };
    case 'portal':
      return {
        wrapper: 'bg-[#060606]',
        overlay: '',
        overlayStyle: {},
        orbs: [
          { color: 'rgba(255,153,0,0.45)', size: '90vmax', animClass: 'animate-orb-a' },
          { color: 'rgba(0,163,255,0.35)', size: '90vmax', animClass: 'animate-orb-b' },
        ],
        accent: 'text-[#FF9900] drop-shadow-[0_0_15px_rgba(255,153,0,0.9)]',
        glass: 'border-[#FF9900]/40 backdrop-blur-3xl hover:border-[#FF9900]/60 transition-all',
        glassBgRgb: '20,20,20',
        menuBg: 'rgba(10,10,10,0.98)',
        menuBorder: 'rgba(255,153,0,0.4)',
        menuBgRgb: '10,10,10',
        menuBorderRgb: '255,153,0',
        accentColor: '#FF9900',
      };
    default:
      return {
        wrapper: 'bg-black',
        overlay: 'bg-black/30',
        overlayStyle: {},
        accent: 'text-blue-400',
        glass: 'border-white/10 backdrop-blur-md',
        glassBgRgb: '255,255,255',
        menuBg: 'rgba(10,10,12,0.97)',
        menuBorder: 'rgba(255,255,255,0.1)',
        menuBgRgb: '10,10,12',
        menuBorderRgb: '255,255,255',
        accentColor: '#60a5fa',
      };
  }
};
