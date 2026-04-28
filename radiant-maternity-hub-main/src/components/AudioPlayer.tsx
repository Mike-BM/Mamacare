import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AudioPlayer = ({ text, title }: { text: string; title: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Estimate duration (average speaking rate: 150 words/minute)
    const wordCount = text.split(' ').length;
    const estimatedMinutes = wordCount / 150;
    setDuration(estimatedMinutes * 60);
  }, [text]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speak();
    }
  };

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slower for maternal content
    utterance.pitch = 1.1; // Slightly warmer
    
    // Find warm female voice
    const voices = window.speechSynthesis.getVoices();
    const warmVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Victoria') ||
      v.name.includes('Google US English')
    );
    if (warmVoice) utterance.voice = warmVoice;

    utterance.onboundary = (event) => {
      const percent = (event.charIndex / text.length) * 100;
      setProgress(percent);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const skip = (seconds: number) => {
    // Simple implementation: restart and approximate
    window.speechSynthesis.cancel();
    // In production, track char index and resume, for now we just restart
    speak();
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 my-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">{title}</p>
          <p className="text-white/50 text-xs">Listen • {Math.ceil(duration / 60)} min</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => skip(-10)} className="text-white/50 hover:text-white">
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center hover:shadow-lg hover:shadow-pink-500/30 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
        
        <button onClick={() => skip(10)} className="text-white/50 hover:text-white">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};