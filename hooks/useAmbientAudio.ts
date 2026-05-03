import { useState, useEffect, useCallback } from 'react';
import { AmbientSoundId, AmbientAudioState } from '../types';

// Singleton state managed outside the hook to ensure consistency across components
let globalAudio: HTMLAudioElement | null = null;
let globalState: AmbientAudioState = {
  currentSoundId: null,
  isPlaying: false,
  volume: 0.5,
};

let activeHooks = 0;
const listeners = new Set<(state: AmbientAudioState) => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener({ ...globalState }));
};

const updateState = (updates: Partial<AmbientAudioState>) => {
  globalState = { ...globalState, ...updates };
  notifyListeners();
};

export const useAmbientAudio = () => {
  const [state, setState] = useState<AmbientAudioState>(globalState);

  useEffect(() => {
    activeHooks++;
    const listener = (newState: AmbientAudioState) => setState(newState);
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
      activeHooks--;
      
      if (activeHooks === 0 && globalAudio) {
        globalAudio.pause();
        globalAudio = null;
        updateState({ isPlaying: false, currentSoundId: null });
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      // We don't null globalAudio here to reuse the object, but we could
    }
    updateState({ isPlaying: false });
  }, []);

  const play = useCallback((soundId: AmbientSoundId) => {
    // Stop previous if any
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
    }

    try {
      const audioPath = `/sounds/${soundId}.mp3`;
      globalAudio = new Audio(audioPath);
      globalAudio.loop = true;
      globalAudio.volume = globalState.volume;

      const playPromise = globalAudio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            updateState({ currentSoundId: soundId, isPlaying: true });
          })
          .catch((error) => {
            console.error(`Failed to play ambient sound: ${soundId}`, error);
            console.warn(`Make sure ${audioPath} exists in the public directory.`);
            updateState({ isPlaying: false });
          });
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
      updateState({ isPlaying: false });
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const safeVolume = Math.max(0, Math.min(1, volume));
    if (globalAudio) {
      globalAudio.volume = safeVolume;
    }
    updateState({ volume: safeVolume });
  }, []);

  return {
    ...state,
    play,
    stop,
    setVolume,
  };
};
