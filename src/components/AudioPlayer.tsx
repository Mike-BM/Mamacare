import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  src: string;
  label?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export const AudioPlayer = ({ src, label, autoplay = false, loop = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && autoplay) {
      audioRef.current.play().catch(console.error);
    }
  }, [autoplay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-card/30 backdrop-blur-md border border-border rounded-xl p-4">
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        onEnded={() => setIsPlaying(false)}
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="hover:bg-primary/20"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </Button>

      {label && <span className="text-sm text-foreground">{label}</span>}

      <div className="flex items-center gap-2 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="hover:bg-primary/20"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={(value) => setVolume(value[0])}
          max={100}
          step={1}
          className="w-24"
        />
      </div>
    </div>
  );
};