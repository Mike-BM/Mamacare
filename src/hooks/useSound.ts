import { useCallback, useRef, useEffect } from 'react';
import { SOUNDS, playSound } from '../utils/audio';

export const useSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((soundUrl: string, options: { volume?: number, loop?: boolean } = {}) => {
    const { volume = 0.5, loop = false } = options;
    
    // Stop any existing sound from this hook instance if needed
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    const audio = playSound(soundUrl, volume);
    if (audio) {
      audio.loop = loop;
      audioRef.current = audio;
    }
    
    return audio;
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return { play, stop, SOUNDS };
};
