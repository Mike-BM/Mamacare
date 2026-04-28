import React, { useState, useEffect, useCallback } from 'react';
import { Mic, VolumeX, Waves, Activity } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceInterface = ({ userContext }: { userContext?: any }) => {
  const [showVoiceUI, setShowVoiceUI] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [commandHistory, setCommandHistory] = useState<any[]>([]);
  
  const {
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
  } = useVoice({
    language: userContext?.language || 'en',
    continuous: false,
    onWakeWord: () => {
      setShowVoiceUI(true);
      playTone('wake');
    }
  });

  const { handleCommand } = useVoiceCommands();

  useEffect(() => {
    if (transcript && !isListening) {
      processVoiceInput(transcript);
    }
  }, [transcript, isListening]);

  const processVoiceInput = async (text: string) => {
    const command = parseCommand(text);
    
    setCommandHistory(prev => [...prev, { type: 'user', text, timestamp: Date.now() }]);
    
    const result = await handleCommand(command, userContext);
    
    setCommandHistory(prev => [...prev, { 
      type: 'assistant', 
      text: result.response,
      riskLevel: result.riskLevel,
      timestamp: Date.now() 
    }]);
    
    setLastResponse(result);
    
    if (result.action) {
      result.action();
    }
    
    if (!result.isDismissal) {
      await speak(result.response, { useElevenLabs: true });
    }
    
    if (result.isInfo && !result.followUp) {
      setTimeout(() => setShowVoiceUI(false), 5000);
    }
  };

  const handleMicPress = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setShowVoiceUI(true);
      playTone('start');
      startListening();
    }
  }, [isListening, startListening, stopListening, playTone]);

  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isListening && !isSpeaking && !showVoiceUI) {
      timeout = setTimeout(() => setIsIdle(true), 5000);
    } else {
      setIsIdle(false);
    }
    return () => clearTimeout(timeout);
  }, [isListening, isSpeaking, showVoiceUI]);

  return (
    <>
      <motion.button
        className={`fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 flex items-center justify-center shadow-lg transition-all duration-500 overflow-hidden ${
          isIdle ? 'w-4 h-4 rounded-full opacity-60 hover:opacity-100 hover:scale-[2]' : 'w-12 h-12 rounded-full'
        } ${
          isListening 
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
            : 'bg-gradient-to-br from-primary to-secondary shadow-[0_0_15px_rgba(255,126,179,0.3)]'
        }`}
        whileTap={{ scale: 0.9 }}
        whileHover={isIdle ? {} : { scale: 1.1 }}
        onClick={() => {
          if (isIdle) {
            setIsIdle(false);
          } else {
            handleMicPress();
          }
        }}
        id="voice-trigger"
      >
        {!isIdle && (
          isListening ? (
            <Activity className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )
        )}
        
        {isListening && !isIdle && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {showVoiceUI && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isListening ? 'bg-red-500 animate-pulse' : 
                  isSpeaking ? 'bg-green-500' : 'bg-white/30'
                }`} />
                <span className="text-white/70 text-sm">
                  {isListening ? 'Listening...' : 
                   isSpeaking ? 'Speaking...' : 
                   wakeWordActive ? 'Hey Mama! 👋' : 'Tap mic to talk'}
                </span>
              </div>
              
              <button 
                onClick={() => setShowVoiceUI(false)}
                className="text-white/50 hover:text-white"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            </div>

            {isListening && (
              <div className="flex justify-center items-center h-16 mb-4 gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full"
                    animate={{
                      height: [10, 30 + Math.random() * 30, 10],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mb-4">
              {interimTranscript && (
                <p className="text-white/50 text-lg italic">{interimTranscript}</p>
              )}
              {transcript && !interimTranscript && (
                <p className="text-white text-lg">{transcript}</p>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {commandHistory.slice(-3).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${
                    item.type === 'user' 
                      ? 'bg-white/5 ml-8' 
                      : item.riskLevel === 'emergency' || item.isEmergency
                        ? 'bg-red-500/10 border border-red-500/30 mr-8'
                        : 'bg-pink-500/10 border border-pink-500/20 mr-8'
                  }`}
                >
                  <p className={`text-sm ${
                    item.type === 'user' ? 'text-white/70' : 'text-white'
                  }`}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {!isListening && !isSpeaking && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'How big is my baby?', icon: '👶' },
                  { text: 'Book appointment', icon: '📅' },
                  { text: 'Log my weight', icon: '⚖️' },
                  { text: 'I need help', icon: '🆘' },
                ].map((cmd) => (
                  <button
                    key={cmd.text}
                    onClick={() => { playTone('start'); processVoiceInput(cmd.text); }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 hover:border-pink-500/30 transition-all text-left flex items-center gap-2"
                  >
                    <span>{cmd.icon}</span>
                    {cmd.text}
                  </button>
                ))}
              </div>
            )}

            {lastResponse?.isEmergency && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-center"
              >
                <p className="text-red-300 font-bold text-lg">🚨 Emergency Activated</p>
                <p className="text-red-200/70 text-sm mt-1">
                  Location shared • Emergency contact called
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence>
          {wakeWordActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 py-2 bg-pink-500/20 backdrop-blur-md border border-pink-500/30 rounded-full text-pink-300 text-sm flex items-center gap-2 shadow-lg"
            >
              <Waves className="w-4 h-4" />
              "Hey Mama" detected
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
