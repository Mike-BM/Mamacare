import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Loader2, Phone, Video, FileText, 
  AlertTriangle, Shield, Calendar, MapPin, Plus, Paperclip, 
  Mic, Camera, Check, CheckCheck, Smile, HelpCircle, 
  MessageSquare, UserPlus, FileCheck, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'patient' | 'provider' | 'chw' | 'system' | 'hospital';
  content: string;
  created_at: string;
  message_type?: 'text' | 'image' | 'voice' | 'file' | 'appointment_update' | 'system_alert';
  is_read?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  type: 'patient' | 'provider' | 'group' | 'hospital';
  subtitle?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  metadata?: {
    week?: number;
    risk?: 'low' | 'medium' | 'high' | 'emergency';
    dueDate?: string;
    phone?: string;
    mrn?: string;
    village?: string;
  };
}

interface DoctorChatProps {
  perspective?: 'patient' | 'provider';
}

export const DoctorChat = ({ perspective = 'patient' }: DoctorChatProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulatedChannel, setShowSimulatedChannel] = useState(true);
  const [simulatedTemplate, setSimulatedTemplate] = useState<'none' | 'sms' | 'whatsapp'>('none');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDemo = localStorage.getItem("demoBypass") !== null;

  // 1. Initialize Conversations and active selection
  useEffect(() => {
    const loadChats = () => {
      let mockChats: Conversation[] = [];
      if (perspective === 'patient') {
        mockChats = [
          {
            id: 'conv-1',
            name: 'Dr. Eliza Keith',
            avatar: 'EK',
            type: 'provider',
            subtitle: 'Maternal Specialist',
            lastMessage: 'Let\'s check your BP again tomorrow morning.',
            time: '10:05 AM',
            unread: 0,
            metadata: {
              risk: 'medium',
              phone: '+254 712 345 678',
              dueDate: '2026-08-15',
              week: 24
            }
          },
          {
            id: 'conv-2',
            name: 'Aga Khan Referral Circle',
            avatar: 'AK',
            type: 'hospital',
            subtitle: 'Hospital Team',
            lastMessage: 'Referral processed successfully.',
            time: '5h ago',
            unread: 1,
            metadata: {
              risk: 'high',
              mrn: 'AKH-2026-4457'
            }
          },
          {
            id: 'conv-3',
            name: 'Kiambu Support Circle',
            avatar: 'KS',
            type: 'group',
            subtitle: 'You + Doctor + CHW Wanjiku',
            lastMessage: 'CHW Wanjiku: How are you feeling Ann?',
            time: 'Yesterday',
            unread: 0
          }
        ];
      } else {
        // Provider Perspective
        mockChats = [
          {
            id: 'conv-1',
            name: 'Mary Muthoni',
            avatar: 'MM',
            type: 'patient',
            subtitle: 'Week 24 · High Risk',
            lastMessage: 'Okay, thank you doctor!',
            time: '2m ago',
            unread: 1,
            metadata: {
              week: 24,
              risk: 'high',
              dueDate: 'Aug 15, 2026',
              phone: '0712 345 678',
              mrn: 'MC-2026-992'
            }
          },
          {
            id: 'conv-2',
            name: 'Grace Wanjiku',
            avatar: 'GW',
            type: 'patient',
            subtitle: 'Week 28 · Pre-eclampsia Alert',
            lastMessage: 'Thank you doctor.',
            time: '1h ago',
            unread: 0,
            metadata: {
              week: 28,
              risk: 'emergency',
              dueDate: 'July 10, 2026',
              phone: '0722 987 654',
              mrn: 'AKH-2026-4457'
            }
          },
          {
            id: 'conv-3',
            name: 'Ann Mwangi (CHW Referral)',
            avatar: 'AM',
            type: 'patient',
            subtitle: 'Week 12 · Rural Githunguri',
            lastMessage: 'Can I take iron supplements with milk?',
            time: '3h ago',
            unread: 0,
            metadata: {
              week: 12,
              risk: 'low',
              dueDate: 'Nov 30, 2026',
              phone: '0723 456 789',
              village: 'Githunguri'
            }
          }
        ];
      }

      setConversations(mockChats);
      setActiveConv(mockChats[0]);
    };

    loadChats();
  }, [perspective]);

  // 2. Load Messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;

    const loadMessages = () => {
      let initialMsgs: Message[] = [];
      if (activeConv.id === 'conv-1') {
        if (perspective === 'patient') {
          initialMsgs = [
            { id: '1', sender_id: 'provider', sender_type: 'provider', content: 'Hi Mary, I see your booking for Friday 10 AM. Can you check your blood pressure before our call? Any pharmacy can do it.', created_at: '9:30 AM' },
            { id: '2', sender_id: 'patient', sender_type: 'patient', content: 'Yes, it\'s 140/90. Is that bad?', created_at: '9:45 AM' },
            { id: '3', sender_id: 'provider', sender_type: 'provider', content: 'Slightly high. Let\'s move to tomorrow morning. I\'ll send a new link.', created_at: '10:00 AM' },
            { id: '4', sender_id: 'patient', sender_type: 'patient', content: 'Okay, thank you doctor!', created_at: '10:05 AM' }
          ];
        } else {
          // Doctor perspective viewing Mary Muthoni chat
          initialMsgs = [
            { id: '1', sender_id: 'provider', sender_type: 'provider', content: 'Hi Mary, I see your booking for Friday 10 AM. Can you check your blood pressure before our call? Any pharmacy can do it.', created_at: '9:30 AM' },
            { id: '2', sender_id: 'patient', sender_type: 'patient', content: 'Yes, it\'s 140/90. Is that bad?', created_at: '9:45 AM' },
            { id: '3', sender_id: 'provider', sender_type: 'provider', content: 'Slightly high. Let\'s move to tomorrow morning. I\'ll send a new link.', created_at: '10:00 AM' },
            { id: '4', sender_id: 'patient', sender_type: 'patient', content: 'Okay, thank you doctor!', created_at: '10:05 AM' }
          ];
        }
      } else if (activeConv.id === 'conv-2') {
        initialMsgs = [
          { id: '1', sender_id: 'hospital', sender_type: 'hospital', content: 'REFERRAL RECEIVED\nFrom: Aga Khan Hospital\nReferred by: Dr. James Ochieng\nPatient: Grace Wanjiku\nUrgency: URGENT\nMRN: AKH-2026-4457\nClinical Notes: Pre-eclampsia monitoring. BP is 150/95. Needs urgent telemedicine consult.', created_at: '5h ago', message_type: 'appointment_update' },
          { id: '2', sender_id: 'provider', sender_type: 'provider', content: 'I have reviewed the clinical chart. Grace, please rest and avoid salt. I will connect with you via video call at 2:00 PM today.', created_at: '4h ago' },
          { id: '3', sender_id: 'patient', sender_type: 'patient', content: 'Thank you doctor.', created_at: '1h ago' }
        ];
      } else {
        initialMsgs = [
          { id: '1', sender_id: 'chw', sender_type: 'chw', content: 'CHW REFERRAL\nFrom: CHW Wanjiku, Kiambu\nPatient: Ann Mwangi\nVillage: Githunguri\nPregnancy: 12 weeks\nCHW Notes: No transport to clinic, minor morning sickness.', created_at: 'Yesterday', message_type: 'system_alert' },
          { id: '2', sender_id: 'patient', sender_type: 'patient', content: 'Can I take iron supplements with milk?', created_at: '3h ago' }
        ];
      }
      setMessages(initialMsgs);
    };

    loadMessages();
  }, [activeConv, perspective]);

  // 3. Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 4. Send Message Functionality (Handles Demo Mode / Simulated Replies)
  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;

    const userMsgContent = input.trim();
    const newMsg: Message = {
      id: Math.random().toString(),
      sender_id: perspective === 'patient' ? 'patient' : 'provider',
      sender_type: perspective === 'patient' ? 'patient' : 'provider',
      content: userMsgContent,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message_type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Update conversation preview
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: userMsgContent, time: 'Just now' } : c));

    // Dynamic danger sign scanning
    const lowercaseContent = userMsgContent.toLowerCase();
    const flagsDanger = lowercaseContent.includes('bleed') || lowercaseContent.includes('blood') || lowercaseContent.includes('cramping') || lowercaseContent.includes('severe pain') || lowercaseContent.includes('dizzy');

    if (flagsDanger) {
      setTimeout(() => {
        const dangerAlert: Message = {
          id: Math.random().toString(),
          sender_id: 'system',
          sender_type: 'system',
          content: 'DANGER SIGN DETECTED: Symptoms matching maternal emergency risk. Patient advised to visit nearest clinic immediately. Telehealth triage triggered.',
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message_type: 'system_alert'
        };
        setMessages(prev => [...prev, dangerAlert]);
        toast.error('Emergency symptoms flagged by Nneka Health Guardian.', { duration: 6000 });
      }, 1000);
    }

    // Demo Auto Reply Simulation
    if (isDemo) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const doctorReplies = [
          "I understand, my dear. Let's make sure you get some rest today. I'll check on you shortly.",
          "Please log this in your Nneka Health health tab so I can view the graph before our session.",
          "That is absolutely fine. If you feel any dizzy spell, let me know immediately.",
          "Got it! I am reviewing your chart now. Stay close to the phone.",
          "Thank you for sharing. I've updated your patient summary. See you tomorrow!"
        ];
        const patientReplies = [
          "Thank you doctor! I will do that.",
          "Should I take my medicine now?",
          "Yes, I will rest. My feet feel less swollen now.",
          "Okay doctor, I have logged the blood pressure.",
          "Can my partner join the video call tomorrow?"
        ];
        
        const replyPool = perspective === 'patient' ? doctorReplies : patientReplies;
        const randomReply = replyPool[Math.floor(Math.random() * replyPool.length)];

        const replyMsg: Message = {
          id: Math.random().toString(),
          sender_id: perspective === 'patient' ? 'provider' : 'patient',
          sender_type: perspective === 'patient' ? 'provider' : 'patient',
          content: randomReply,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message_type: 'text'
        };

        setMessages(prev => [...prev, replyMsg]);
        setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: randomReply, time: 'Just now' } : c));
        
        // Trigger simulated notification
        toast.info(`New message in ${activeConv.name}`);
      }, 2000);
    }
  };

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'emergency': return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  // Simulated templates trigger
  const displayChannelPreview = (type: 'sms' | 'whatsapp') => {
    setSimulatedTemplate(type);
    toast.success(`Simulating standard patient ${type.toUpperCase()} template delivery`);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#0d1117]/80 rounded-[32px] border border-white/10 overflow-hidden relative backdrop-blur-xl">
      
      {/* ── Left Sidebar: Conversations list (30%) ── */}
      <div className="w-[320px] shrink-0 border-r border-white/10 flex flex-col bg-[#161b22]/40">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Inbox
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/5">
            <UserPlus className="w-4 h-4 text-white/60" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 relative group ${
                  activeConv?.id === conv.id 
                    ? 'bg-primary/10 border-primary/20 text-white' 
                    : 'bg-transparent border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary shrink-0 group-hover:scale-105 transition-transform">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm truncate">{conv.name}</span>
                    <span className="text-[10px] text-white/30 font-bold shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-white/50 truncate pr-4">{conv.lastMessage}</p>
                </div>
                {conv.unread && conv.unread > 0 ? (
                  <span className="absolute right-4 bottom-5 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,126,179,0.8)]" />
                ) : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* ── Center Area: Active conversation thread ── */}
      <div className="flex-1 flex flex-col bg-transparent">
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161b22]/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {activeConv.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{activeConv.name}</h4>
                  <p className="text-[11px] text-white/50 font-medium">{activeConv.subtitle || 'Active Session'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => toast.success('Calling patient phone... (Simulated)')}
                  className="h-9 w-9 rounded-full border-white/10 hover:bg-white/5"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4 text-white/60" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => toast.success('Launching telehealth consultation video...')}
                  className="h-9 w-9 rounded-full border-white/10 hover:bg-white/5"
                  title="Video Call"
                >
                  <Video className="w-4 h-4 text-white/60" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => displayChannelPreview('sms')}
                  className="h-9 rounded-xl border-white/10 hover:bg-white/5 font-bold text-xs"
                >
                  SMS Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => displayChannelPreview('whatsapp')}
                  className="h-9 rounded-xl border-white/10 hover:bg-white/5 font-bold text-xs"
                >
                  WhatsApp Preview
                </Button>
              </div>
            </div>

            {/* Smart Pre-Consultation Prompt & Alerts (Scanned from active metadata) */}
            {activeConv.metadata && activeConv.metadata.risk && activeConv.metadata.risk !== 'low' && (
              <div className="px-6 py-3 border-b border-orange-500/10 bg-orange-500/5 flex items-center justify-between gap-4 animate-in fade-in shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 block">Pre-Consultation Prep</span>
                    <p className="text-xs text-white/70">
                      Patient is {activeConv.metadata.week} weeks, risk level flagged as {activeConv.metadata.risk.toUpperCase()}. Suggest checking BP chart and advising on signs of Pre-eclampsia.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getRiskBadgeColor(activeConv.metadata.risk)}>
                  {activeConv.metadata.risk.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Messages Scroll Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isMe = msg.sender_id === (perspective === 'patient' ? 'patient' : 'provider');
                  
                  if (msg.message_type === 'appointment_update' || msg.message_type === 'system_alert') {
                    return (
                      <div key={msg.id} className="flex justify-center p-2">
                        <div className="max-w-[85%] bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center text-xs space-y-2 text-white/70 font-mono shadow-inner">
                          <p className="whitespace-pre-line text-left leading-relaxed">{msg.content}</p>
                          <span className="text-[9px] text-white/30 block mt-1">{msg.created_at}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id || index} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                          {activeConv.avatar}
                        </div>
                      )}
                      
                      <div className="flex flex-col max-w-[70%]">
                        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative shadow-md ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-slate-800/80 text-white/90 rounded-tl-none border border-slate-700/50'
                        }`}>
                          <p className="whitespace-pre-line break-words">{msg.content}</p>
                          
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/40 select-none">
                            <span>{msg.created_at}</span>
                            {isMe && (
                              <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                      {activeConv.avatar}
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-xs text-white/50 flex items-center gap-2">
                      Typing response
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input bar */}
            <div className="p-5 border-t border-white/10 bg-[#161b22]/20 shrink-0">
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" title="Attach file">
                  <Paperclip className="w-4 h-4 text-white/50" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" title="Voice note">
                  <Mic className="w-4 h-4 text-white/50" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" title="Camera upload">
                  <Camera className="w-4 h-4 text-white/50" />
                </Button>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex-1 flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={perspective === 'patient' ? "Text Dr. Eliza..." : "Text patient Wanjiku..."}
                    className="flex-1 bg-[#0d1117] border-white/10 h-11 focus-visible:ring-primary rounded-xl"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim()} className="h-11 w-11 rounded-xl bg-primary text-white hover:bg-primary/95 shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
              
              {/* Quick Actions Panel */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest mr-2">Quick Actions:</span>
                <Button variant="ghost" size="sm" onClick={() => toast.success('Patient history retrieved (compliance ISO 27001).')} className="h-7 text-[10px] font-bold text-white/60 hover:bg-white/5 border border-white/10 rounded-lg flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Record
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toast.success('Opening reschedule wizard...')} className="h-7 text-[10px] font-bold text-white/60 hover:bg-white/5 border border-white/10 rounded-lg flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Reschedule
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toast.success('Loading prescription catalog...')} className="h-7 text-[10px] font-bold text-white/60 hover:bg-white/5 border border-white/10 rounded-lg flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Prescribe
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toast.error('Emergency dispatch SOS logged Kenyan Ministry of Health.')} className="h-7 text-[10px] font-bold text-red-400 hover:bg-red-950/20 border border-red-900/40 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" /> SOS
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
            <MessageSquare className="w-12 h-12 text-white/10 mb-3" />
            <h4 className="font-bold">Inbox Empty</h4>
            <p className="text-xs max-w-xs mt-1">Select a conversation thread on the left to start direct telemedicine chat.</p>
          </div>
        )}
      </div>

      {/* ── Right Panel: Patient Profile details (if Provider) ── */}
      {perspective === 'provider' && activeConv && activeConv.metadata && (
        <div className="w-[280px] shrink-0 border-l border-white/10 bg-[#161b22]/30 p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-white/10">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary mx-auto mb-3 shadow-inner">
                {activeConv.avatar}
              </div>
              <h4 className="font-bold text-white">{activeConv.name}</h4>
              <p className="text-xs text-white/40 mt-0.5">{activeConv.metadata.mrn || 'Patient Record'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block">Pregnancy stage</span>
                <span className="text-sm font-bold text-white">Week {activeConv.metadata.week}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block">Due Date</span>
                <span className="text-sm font-bold text-white">{activeConv.metadata.dueDate || '2026-08-15'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block">Contact phone</span>
                <span className="text-sm font-bold text-white">{activeConv.metadata.phone || '0712 345 678'}</span>
              </div>
              {activeConv.metadata.village && (
                <div>
                  <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block">Village / Location</span>
                  <span className="text-sm font-bold text-white">{activeConv.metadata.village}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Guardian Shield</span>
            </div>
            <p className="text-white/60 leading-relaxed">
              Maternal vitals are synced with KMPDC network database. Risk indicators auto-generated.
            </p>
          </div>
        </div>
      )}

      {/* ── Overlay: SMS / WhatsApp simulated channels preview ── */}
      <AnimatePresence>
        {simulatedTemplate !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSimulatedTemplate('none')}
            className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative"
            >
              {simulatedTemplate === 'sms' ? (
                /* SMS UI Mock */
                <div className="bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden">
                  <div className="bg-slate-800 px-6 py-4 flex items-center gap-3 border-b border-slate-700">
                    <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-black text-white">NH</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Nneka Health</h4>
                      <p className="text-[10px] text-green-400">SMS Notification Channel</p>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-950 space-y-4 min-h-[220px] flex flex-col justify-end">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 text-xs max-w-[85%] text-slate-200 leading-relaxed">
                      Dr. Eliza Keith confirmed your appointment for Friday, May 30 at 10:00 AM.<br/><br/>
                      Video call link: <span className="text-primary hover:underline font-bold">https://nnekahealth.app/call/abc123</span><br/><br/>
                      Reply HELP for assistance. Reply CANCEL to reschedule.
                    </div>
                    <span className="text-[9px] text-slate-500 text-left pl-2">Delivered · Today 10:10 AM</span>
                  </div>
                  <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-center">
                    <Button onClick={() => setSimulatedTemplate('none')} className="bg-slate-800 text-white hover:bg-slate-700 font-bold px-6 h-10 rounded-xl">Close Preview</Button>
                  </div>
                </div>
              ) : (
                /* WhatsApp UI Mock */
                <div className="bg-[#075e54] border border-[#128c7e] rounded-[32px] overflow-hidden">
                  <div className="bg-[#075e54] px-6 py-4 flex items-center justify-between border-b border-[#128c7e]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#128c7e] flex items-center justify-center text-white"><Phone className="w-4 h-4" /></div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Nneka Health Support</h4>
                        <p className="text-[10px] text-[#25d366] font-bold">Business Account</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-[#efeae2] space-y-4 min-h-[240px] flex flex-col justify-end">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs max-w-[85%] text-slate-800 leading-relaxed shadow-sm relative">
                      <span className="text-[10px] font-black text-green-700 block mb-1">Nneka Health Chat Link</span>
                      *Dr. Eliza Keith sent you a message:*<br/><br/>
                      "Hi Mary, I see your booking for Friday 10 AM. Can you check your blood pressure at any pharmacy before our call? Share the reading with me."<br/><br/>
                      <span className="text-gray-400 italic block mt-2 text-[10px]">*Reply to this message to chat with your doctor.*</span>
                    </div>
                    <span className="text-[9px] text-slate-400 text-left pl-2">Delivered · Today 10:05 AM</span>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200 flex justify-center">
                    <Button onClick={() => setSimulatedTemplate('none')} className="bg-[#128c7e] hover:bg-[#075e54] text-white font-bold px-6 h-10 rounded-xl">Close Preview</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
