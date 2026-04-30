import { useState, useCallback, useRef, useEffect } from 'react';

const WAKE_WORD = 'hey mama';
const VOICE_LANG_MAP: Record<string, string> = {
  'en': 'en-US',
  'sw': 'sw-KE',
  'yo': 'yo-NG',
  'ha': 'ha-NG',
  'ig': 'ig-NG',
  'zu': 'zu-ZA',
  'am': 'am-ET',
  'fr': 'fr-FR',
  'ar': 'ar-SA'
};

interface UseVoiceOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onWakeWord?: () => void;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoice = (options: UseVoiceOptions = {}) => {
  const {
    language = 'en',
    continuous = false,
    interimResults = true,
    onWakeWord,
    onResult,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Speech Recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const errorMsg = 'Speech recognition not supported in this browser';
      console.error(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = VOICE_LANG_MAP[language] || 'en-US';
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Continuous mode should restart if not manually stopped, but we leave it to explicit start/stop to avoid loops
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        setInterimTranscript('');
        
        // Check for wake word
        if (final.toLowerCase().includes(WAKE_WORD)) {
          setWakeWordActive(true);
          onWakeWord?.();
          // Play confirmation sound
          playTone('wake');
        }
        
        onResult?.(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onError?.(event.error);
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [language, continuous, interimResults, onWakeWord, onResult, onError]);

  // Start listening
  const startListening = useCallback(() => {
    try {
      const recognition = recognitionRef.current || initRecognition();
      if (recognition) {
        recognition.start();
      }
    } catch (err: any) {
      console.error('Failed to start listening:', err);
      onError?.(err.message || 'Failed to start');
    }
  }, [initRecognition, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Text-to-Speech with Dr. Nneka voice
  const speak = useCallback(async (text: string, speakOptions: any = {}) => {
    const { 
      rate = 0.9, // Slightly slower for clarity
      pitch = 1.0,
      volume = 1.0,
      useElevenLabs = false
    } = speakOptions;

    setIsSpeaking(true);

    try {
      if (useElevenLabs) { // Check if we want to use premium voice
        await speakWithElevenLabs(text, { rate, pitch, volume, language });
      } else {
        await speakWithNativeTTS(text, { rate, pitch, volume, language });
      }
    } catch (err) {
      console.error('TTS error:', err);
      // Fallback to native
      await speakWithNativeTTS(text, { rate, pitch, volume, language });
    } finally {
      setIsSpeaking(false);
    }
  }, [language]);

  // Native TTS implementation
  const speakWithNativeTTS = (text: string, options: any) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;
      utterance.lang = VOICE_LANG_MAP[options.language] || 'en-US';

      // Try to find a warm female voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Google US English')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = resolve;
      utterance.onerror = resolve;
      
      window.speechSynthesis.speak(utterance);
    });
  };

  // ElevenLabs TTS (premium voice)
  const speakWithElevenLabs = async (text: string, options: any) => {
    const response = await fetch('/api/ai/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: options.language })
    });
    
    if (!response.ok) {
      throw new Error("ElevenLabs generation failed");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.playbackRate = options.rate;
    audio.volume = options.volume;
    
    return new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  };

  // Play tone feedback
  const playTone = useCallback((type: 'wake' | 'start' | 'error') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'wake':
        oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'start':
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
        break;
    }
  }, []);

  // Voice command parser
  const parseCommand = useCallback((text: string) => {
    const lower = text.toLowerCase();
    
    const commands: Record<string, RegExp> = {
      book: /book\s+(?:an?\s+)?appointment|schedule\s+(?:a\s+)?visit/i,
      call: /call\s+(?:my\s+)?doctor|call\s+(?:the\s+)?hospital/i,
      sos: /help|emergency|sos|i need help/i,
      log: /log\s+(?:my\s+)?(?:weight|symptom|mood|blood pressure)|i feel/i,
      baby: /how\s+big\s+is\s+(?:my\s+)?baby|baby\s+size/i,
      tips: /give\s+me\s+tips|advice|what\s+should\s+i\s+do/i,
      appointment: /when\s+is\s+(?:my\s+)?next\s+appointment|upcoming\s+visits/i,
      stop: /stop\s+listening|cancel|nevermind/i
    };
    
    for (const [action, regex] of Object.entries(commands)) {
      if (regex.test(lower)) {
        return { action, rawText: text };
      }
    }
    
    return { action: 'chat', rawText: text };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    wakeWordActive,
    startListening,
    stopListening,
    speak,
    playTone,
    parseCommand,
    setWakeWordActive
  };
};

export default useVoice;
