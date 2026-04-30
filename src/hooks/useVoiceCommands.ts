import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeminiChat } from './useGeminiChat';

export const useVoiceCommands = () => {
  const navigate = useNavigate();
  const { sendMessage } = useGeminiChat();

  const handleCommand = useCallback(async (command: { action: string, rawText: string }, context: any = {}) => {
    const { action, rawText } = command;
    
    switch (action) {
      case 'book':
        return {
          response: "I'll help you book an appointment. What type of visit do you need?",
          action: () => navigate('/mother-dashboard/appointments?action=book'),
          followUp: true
        };
        
      case 'call':
        return {
          response: "Connecting you to your provider, Dr. Eliza Keith. One moment please.",
          action: () => window.open('tel:+254712345678'),
          requiresConfirmation: true
        };
        
      case 'sos':
        return {
          response: "Emergency mode activated. I'm sharing your location and calling your emergency contact. Stay calm, help is coming.",
          action: () => triggerEmergencyProtocol(context),
          isEmergency: true
        };
        
      case 'log': {
        const logType = rawText.includes('weight') ? 'weight' 
          : rawText.includes('mood') ? 'mood'
          : rawText.includes('blood pressure') ? 'bp'
          : 'symptom';
          
        return {
          response: `I'll help you log your ${logType}. What would you like to record?`,
          action: () => navigate(`/mother-dashboard/health?log=${logType}`),
          followUp: true
        };
      }
        
      case 'baby': {
        const weeks = context.weeksPregnant || 24;
        const sizes: Record<number, string> = {
          12: 'a lime', 16: 'an avocado', 20: 'a banana', 24: 'an ear of corn',
          28: 'an eggplant', 32: 'a squash', 36: 'a honeydew melon', 40: 'a watermelon'
        };
        const size = sizes[weeks] || 'growing beautifully';
        
        return {
          response: `At ${weeks} weeks, your baby is about the size of ${size}. They're developing eyelashes and can hear your voice now. Keep talking to them!`,
          action: () => navigate('/mother-dashboard?tab=overview'),
          isInfo: true
        };
      }
        
      case 'tips': {
        const tipResponse = await sendMessage(rawText);
        return {
          response: tipResponse.reply,
          action: null,
          isInfo: true
        };
      }
        
      case 'appointment':
        return {
          response: "Your next appointment is a telehealth checkup with Dr. Eliza Keith on December 15th at 10 AM. Would you like me to remind you 1 hour before?",
          action: () => navigate('/mother-dashboard/appointments'),
          isInfo: true
        };
        
      case 'stop':
        return {
          response: "No problem. I'm here whenever you need me. Just say 'Hey Mama' or tap the microphone.",
          action: null,
          isDismissal: true
        };
        
      default: {
        const chatResponse = await sendMessage(rawText);
        return {
          response: chatResponse.reply,
          riskLevel: chatResponse.riskLevel,
          action: null
        };
      }
    }
  }, [navigate, sendMessage]);

  const triggerEmergencyProtocol = async (context: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        console.log('Emergency location:', latitude, longitude);
      });
    }
    
    if (context.emergencyContact) {
      window.open(`tel:${context.emergencyContact}`);
    }
    
    window.dispatchEvent(new CustomEvent('emergency-activated'));
  };

  return { handleCommand };
};

export default useVoiceCommands;
