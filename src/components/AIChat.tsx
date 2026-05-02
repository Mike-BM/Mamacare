import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Mic, MicOff, AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'emergency';
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on selection mapping
      const langMap: Record<string, string> = {
        'English': 'en-US',
        'Swahili': 'sw-KE',
        'Yoruba': 'yo-NG',
        'Hausa': 'ha-NG',
        'Zulu': 'zu-ZA'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'emergency': return 'bg-red-600 animate-pulse';
      default: return 'bg-transparent';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Mocking user ID if not logged in
      let userId = '00000000-0000-0000-0000-000000000000';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) userId = session.user.id;
      } catch (e) {
        console.error("Auth fetch failed", e);
      }
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        riskLevel: data.riskLevel,
      };

      if (data.riskLevel === 'emergency') {
        setShowEmergencyBanner(true);
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I am so sorry, my dear, but I am having trouble connecting. If you are experiencing serious symptoms, please go to the nearest hospital immediately.',
        riskLevel: 'emergency'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-md border border-border rounded-2xl overflow-hidden relative min-h-[500px]">
      {showEmergencyBanner && (
        <div className="bg-red-600 text-white p-3 flex justify-between items-center animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span className="font-semibold text-sm">EMERGENCY RISK DETECTED: Please seek immediate medical attention or go to the nearest hospital.</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setShowEmergencyBanner(false)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,126,179,0.3)]">
              <span className="text-xl">👩🏾‍⚕️</span>
            </div>
            Dr. Nneka
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your virtual midwife. Tap the microphone to talk to me.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Swahili">Swahili</SelectItem>
              <SelectItem value="Yoruba">Yoruba</SelectItem>
              <SelectItem value="Hausa">Hausa</SelectItem>
              <SelectItem value="Zulu">Zulu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-5xl">👩🏾‍⚕️</div>
              <p className="text-lg font-medium text-foreground/90">Hello! I'm Dr. Nneka.</p>
              <p className="text-sm mt-2 text-foreground/60">I'm your virtual midwife. Ask me about your pregnancy, nutrition, or baby care in {language}.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setInput("I have a headache")}>Headache</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setInput("I'm feeling cramps")}>Cramps</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setInput("Is this normal?")}>Is this normal?</Badge>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 relative">
                  <Bot className="w-5 h-5 text-primary" />
                  {message.riskLevel && (
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getRiskColor(message.riskLevel)}`} title={`Risk: ${message.riskLevel}`} />
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } relative`}
              >
                <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">{message.content}</p>
                {message.role === 'assistant' && message.riskLevel && message.riskLevel !== 'low' && (
                  <div className={`mt-2 text-xs font-semibold px-2 py-1 rounded inline-block ${
                    message.riskLevel === 'emergency' ? 'bg-red-500/20 text-red-500' :
                    message.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-yellow-500/20 text-yellow-600'
                  }`}>
                    {message.riskLevel.toUpperCase()} RISK
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-secondary" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 flex flex-col gap-2">
                <div className="text-sm font-medium text-primary flex items-center gap-2">
                  Dr. Nneka is thinking
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 sm:p-6 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 relative"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Dr. Nneka..."
            disabled={isLoading}
            className="flex-1 pr-12"
          />
          <Button 
            type="button" 
            variant={isListening ? "default" : "outline"}
            className={`shrink-0 transition-colors absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'border-transparent bg-transparent hover:bg-muted'}`}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-muted-foreground" />}
          </Button>
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shrink-0 rounded-xl">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};