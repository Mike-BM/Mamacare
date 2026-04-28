import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Calendar, MessageCircle, Users, Bell, User, CheckCircle2, Bot, Activity, QrCode, TrendingUp, Search, Home, Settings, Wallet, Video, ArrowRight, ShieldCheck, Download, Plus, Smartphone, SmartphoneNfc, FileText, LogOut, Car, CloudOff, Mic, Smile, Edit3, Pill } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AIChat } from "@/components/AIChat";
import { DynamicGreeting } from "@/components/DynamicGreeting";
import { WeeklyTips } from "@/components/WeeklyTips";
import { MoodTracker } from "@/components/MoodTracker";
import { BackgroundMedia } from "@/components/BackgroundMedia";
import { PregnancyProgressTabs } from "@/components/PregnancyProgressTabs";
import { EmergencySOS } from "@/components/EmergencySOS";
import { SymptomTriageBubble } from "@/components/SymptomTriageBubble";
import { FinancialLayer } from "@/components/FinancialLayer";
import { TelemedicineSuite } from "@/components/TelemedicineSuite";
import { WearableMedicationWidgets } from "@/components/WearableMedicationWidgets";
import { VoiceInterface } from "@/components/VoiceInterface";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const TABS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "health", label: "Health", icon: Activity },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "ai", label: "Dr. Nneka (AI)", icon: Bot },
  { id: "community", label: "Community", icon: Users },
  { id: "wallet", label: "MamaFund & Wallet", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MotherDashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "overview";

  const [isLoading, setIsLoading] = useState(true);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const SUPPORTIVE_MESSAGES = [
    "You're doing amazing, Mama 💕",
    "Baby is growing strong today 🌱",
    "Remember to hydrate, Mama 💧",
    "Only 16 weeks to go! 🎉",
    "Your last checkup looked great 👏",
    "Baby can hear your voice now 🎵",
    "Rest well, you and baby deserve it 🌙",
    "Logged! You're taking great care 💕"
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  const [tasks, setTasks] = useState([
    { id: 1, label: "Log morning weight", done: true },
    { id: 2, label: "Read week 24 tips", done: false },
    { id: 3, label: "Community check-in", done: false },
  ]);
  const completedTasks = tasks.filter(t => t.done).length;
  const taskProgress = (completedTasks / tasks.length) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    const handleOnline = () => { setIsOffline(false); toast.success("Back online."); };
    const handleOffline = () => { setIsOffline(true); toast.error("Offline Mode."); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SUPPORTIVE_MESSAGES.length);
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(messageInterval);
    };
  }, []);

  const handleTabChange = (newTab: string) => {
    navigate(`/mother-dashboard/${newTab}`);
  };

  const toggleLiteMode = () => {
    setIsLiteMode(!isLiteMode);
    toast.info(!isLiteMode ? "Lite Mode enabled" : "Rich Mode enabled");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex space-x-8">
        <Skeleton className="w-[240px] h-screen bg-white/5 rounded-2xl hidden md:block" />
        <div className="flex-1 space-y-6">
          <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
          <Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-background ${isLiteMode ? '[&_.glass-card]:bg-card [&_.glass-card]:backdrop-blur-none [&_.animate-fade-in-up]:animate-none [&_.animate-fade-in-right]:animate-none [&_.hover\\:-translate-y-1]:hover:translate-y-0' : ''}`}>
      {!isLiteMode && <BackgroundMedia />}

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-[260px] glass-card border-r border-white/10 relative z-40 h-full p-4 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary animate-pulse" fill="currentColor" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MamaCare
          </h1>
        </div>

        {/* Quick Stats Mini - More Subtle */}
        <div className="mb-8 px-2">
          <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest mb-3">
            <span>Vital Signs</span>
            <span>Updated 2 days ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">Weight</span>
              <span className="font-bold">68kg</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase">BP</span>
              <span className="font-bold">110/70</span>
            </div>
          </div>
        </div>

        {/* Mini Nav */}
        <nav className="space-y-1 mb-8 flex-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === t.id 
                  ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary text-primary font-medium' 
                  : 'hover:bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              <t.icon className={`w-5 h-5 ${activeTab === t.id ? 'animate-pulse' : ''}`} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Baba Mode Invite */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-secondary" />
            </div>
            <h4 className="text-xs font-bold text-white">Baba Mode</h4>
          </div>
          <p className="text-[10px] text-white/60 mb-3 leading-relaxed">Inviting your partner helps them track baby's growth and support you better.</p>
          <Button variant="glass" size="sm" className="w-full h-7 text-[10px] rounded-lg">Invite Partner</Button>
        </div>

        {/* Daily Tasks inside Sidebar */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Daily Tasks</h4>
            <span className="text-xs text-primary">{completedTasks}/{tasks.length}</span>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${task.done ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${task.done ? 'bg-primary border-primary' : 'border-white/30'}`}>
                  {task.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`text-xs ${task.done ? 'text-white/50 line-through' : 'text-white/90'}`}>{task.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile (Moved from header) */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left">
                <div className="relative h-10 w-10 shrink-0">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=transparent" alt="Profile" className="w-full h-full rounded-full border border-white/20" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-bold text-white truncate">Eliza Keith</span>
                  <span className="text-xs text-white/50 truncate">eliza@example.com</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleTabChange('settings')}><User className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => navigate("/")}><LogOut className="w-4 h-4 mr-2" /> Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-30">
        
        {/* Header */}
        <header className={`border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between shrink-0 transition-colors ${isLiteMode ? 'bg-background' : 'backdrop-blur-xl bg-background/60'}`}>
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
            <span className="font-bold">MamaCare</span>
          </div>
          
          <div className="hidden md:flex flex-col justify-center">
            <span className="text-lg font-medium">Good Evening, Eliza ✨</span>
            <span key={messageIndex} className="text-xs text-primary font-medium animate-fade-in-up">
              {SUPPORTIVE_MESSAGES[messageIndex]}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleLiteMode} className="relative hover:bg-white/5 rounded-full" title="Toggle Lite Mode">
              {isLiteMode ? <SmartphoneNfc className="w-5 h-5 text-muted-foreground" /> : <Smartphone className="w-5 h-5 text-primary" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-full">
                  <Bell className="w-5 h-5 text-white/80" />
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#e74c3c]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-card border-white/10">
                <div className="p-3 border-b border-white/10 font-semibold text-sm">Notifications</div>
                <DropdownMenuItem className="p-3 hover:bg-white/5 cursor-pointer">Appointment tomorrow at 10 AM</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Tab Navigation (Sticky Below Header) */}
        <div className="hidden md:flex border-b border-white/10 px-8 py-4 shrink-0 overflow-x-auto hide-scrollbar backdrop-blur-md bg-background/40">
          <div className="flex gap-3">
            {TABS.filter(t => t.id !== 'settings').map(t => {
              const isActive = activeTab === t.id;
              
              let previewContent = null;
              if (t.id === 'overview') previewContent = (
                <div className="flex flex-col w-full mt-1.5"><span className="text-[10px] text-primary font-bold">60% complete</span><span className="text-[10px] text-white/50 truncate">Next: Viability Milestone</span></div>
              );
              else if (t.id === 'health') previewContent = (
                <div className="flex flex-col w-full mt-1.5"><span className="text-[10px] text-green-400 font-bold">Last log: Yesterday</span><span className="text-[10px] text-white/50 flex items-center gap-1">Vitals stable <Activity className="w-2 h-2" /></span></div>
              );
              else if (t.id === 'appointments') previewContent = (
                <div className="flex items-center justify-between w-full mt-1.5"><span className="text-[10px] text-white/70">Today, 2:00 PM</span><Badge className="h-4 text-[8px] px-1.5 py-0 bg-primary hover:bg-primary/90 transition-colors animate-pulse">Join Call</Badge></div>
              );
              else if (t.id === 'ai') previewContent = (
                <div className="flex flex-col w-full mt-1.5"><span className="text-[10px] text-primary font-bold">3 unread messages</span><span className="text-[10px] text-white/50 truncate italic w-full">"Feeling fatigued? Try..."</span></div>
              );
              else if (t.id === 'community') previewContent = (
                <div className="flex flex-col w-full mt-1.5"><span className="text-[10px] text-tertiary font-bold">+12 new replies</span><span className="text-[10px] text-white/50 truncate w-full">#ThirdTrimesterSleep</span></div>
              );
              else if (t.id === 'wallet') previewContent = (
                <div className="flex flex-col w-full mt-1.5"><div className="flex justify-between items-center"><span className="text-[10px] text-secondary font-bold">$12.50 balance</span><span className="text-[8px] text-white/40 hover:text-white transition-colors cursor-pointer">Add Funds</span></div><div className="w-full h-1 bg-white/10 rounded-full mt-1"><div className="w-1/4 h-full bg-secondary rounded-full"></div></div></div>
              );

              return (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`flex flex-col items-start min-w-[170px] max-w-[190px] p-3 rounded-xl transition-all duration-300 border text-left ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 shadow-[0_0_15px_rgba(255,126,179,0.1)] scale-105' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <t.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-white/50'} ${(t.id === 'ai' || t.id === 'appointments') && !isActive ? 'animate-[pulse_2s_ease-in-out_infinite] text-primary/70' : ''}`} />
                    <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-white/90'}`}>{t.label}</span>
                  </div>
                  {previewContent && (
                    <div className="w-full overflow-hidden opacity-90">
                      {previewContent}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Tab Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8 animate-fade-in-up">
            
            {activeTab === "overview" && (
              <div className="space-y-6">
                <DynamicGreeting userName="Eliza" />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Pregnancy Progress (2/3 width) */}
                  <div className="lg:col-span-2">
                    <PregnancyProgressTabs currentWeek={24} totalWeeks={40} />
                  </div>

                  {/* Right: Next Appointment Preview (1/3 width) */}
                  <Card className="p-6 glass-card border-white/10 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col shadow-lg" onClick={() => handleTabChange('appointments')}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white/90">Next Appointment</h4>
                        <p className="text-xs text-white/50 italic">Telehealth Checkup</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex-1 flex flex-col justify-center">
                      <p className="text-lg font-black text-white mb-1">Today, 2:00 PM</p>
                      <p className="text-sm text-white/70 mb-4">Dr. Eliza Keith • Routine check</p>
                      <Button size="sm" variant="hero" className="w-full h-8 text-xs animate-pulse">Join Call Now</Button>
                    </div>
                  </Card>
                </div>

                {/* Row 2: Daily Tasks (Full Width) */}
                <Card className="p-4 glass-card border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-white/90">Daily Tasks ({completedTasks}/{tasks.length})</h4>
                    </div>
                    <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${taskProgress}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${task.done ? 'bg-primary/10 border-primary/20 opacity-70' : 'bg-white/5 border-white/10 hover:bg-white/15'}`}
                        onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${task.done ? 'bg-primary border-primary' : 'border-white/30'}`}>
                          {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${task.done ? 'text-white/50 line-through' : 'text-white/90 font-medium'}`}>{task.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Row 3: Community Pulse (Scrollable Cards) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-tertiary" />
                      <h4 className="font-bold text-white/90">Community Pulse</h4>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-tertiary font-bold hover:bg-tertiary/10" onClick={() => handleTabChange('community')}>View All Discussions →</Button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                    {[
                      { id: 1, topic: "#ThirdTrimesterSleep", mamas: 12, text: "I've found that using a C-shaped pillow helps with the back pain. Anyone else struggling with side-sleeping positions lately?", trending: true },
                      { id: 2, topic: "#BabyKickCounters", mamas: 45, text: "My little one is so active at 10 PM! Is it normal for them to have a specific 'playtime' every night?", trending: false },
                      { id: 3, topic: "#NestingMode", mamas: 8, text: "Just organized the baby clothes for the 5th time. The urge to clean everything is getting real! 🧹✨", trending: false }
                    ].map(topic => (
                      <Card key={topic.id} className="min-w-[280px] md:min-w-[320px] p-5 glass-card border-white/10 hover:border-tertiary/50 transition-all cursor-pointer snap-center flex flex-col group h-[180px]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-tertiary text-xs font-black uppercase tracking-wider">{topic.topic}</span>
                          {topic.trending && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] h-5">Trending</Badge>}
                        </div>
                        <p className="text-sm text-white/80 line-clamp-3 mb-auto italic leading-relaxed">"{topic.text}"</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {[1, 2].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-white/10 flex items-center justify-center text-[8px] shadow-sm">🤰</div>
                              ))}
                            </div>
                            <span className="text-[10px] text-white/50 font-bold">{topic.mamas} mamas discussing</span>
                          </div>
                          <span className="text-xs text-tertiary font-bold group-hover:translate-x-1 transition-transform">Join →</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "health" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Health Dashboard</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <WearableMedicationWidgets />
                    <MoodTracker />
                  </div>
                  <div className="space-y-6">
                    <Card className="p-5 glass-card border-white/10 hover:border-white/20 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-green-400" />
                          <h4 className="font-semibold">Apple Watch</h4>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Connected</Badge>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-white/50 mb-1">Heart Rate</p>
                          <div className="text-3xl font-bold flex items-baseline gap-1">
                            72 <span className="text-xs font-normal text-white/50">bpm</span>
                          </div>
                          <p className="text-xs text-white/40 mt-1">Last sync: 2 min ago</p>
                        </div>
                        <div className="w-24 h-12 flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {[4, 7, 5, 8, 6, 9, 7].map((h, i) => (
                            <div key={i} className="w-full bg-green-500 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                          ))}
                        </div>
                      </div>
                    </Card>
                    <Card className="p-5 glass-card border-white/10">
                      <h4 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Health Journal</h4>
                      <div className="space-y-3 mb-4">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Mild swelling</span>
                            <span className="text-xs text-white/50">Yesterday</span>
                          </div>
                          <p className="text-xs text-white/70">Noticed some swelling in ankles after walking.</p>
                        </div>
                      </div>
                      <Button className="w-full bg-white/10 hover:bg-white/20 border-0" variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Add Entry
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Appointments</h2>
                  <Button className="bg-primary hover:bg-primary/90 text-white"><Plus className="w-4 h-4 mr-2" /> Book New</Button>
                </div>
                <Card className="p-6 glass-card border-white/10">
                  <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                    <Badge className="bg-primary text-white cursor-pointer hover:bg-primary/90">Upcoming</Badge>
                    <Badge variant="outline" className="text-white/70 cursor-pointer hover:bg-white/10">Past</Badge>
                    <Badge variant="outline" className="text-white/70 cursor-pointer hover:bg-white/10">Missed</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Video className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">Telehealth Checkup</h4>
                          <p className="text-white/70 text-sm">Dr. Eliza Keith • Routine check</p>
                          <p className="text-primary text-sm font-medium mt-1">Today, 2:00 PM</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-primary hover:bg-primary/90 text-white">Join Call</Button>
                        <Button variant="outline" className="border-white/20"><Car className="w-4 h-4 mr-2" /> Book MamaRide</Button>
                        <Button variant="outline" className="border-white/20">Reschedule</Button>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                          <Activity className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">Detailed Ultrasound</h4>
                          <p className="text-white/70 text-sm">Dr. Emily Chen • Imaging Dept</p>
                          <p className="text-secondary text-sm font-medium mt-1">Next Week, Tue 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="border-white/20">Prep Instructions</Button>
                        <Button variant="outline" className="border-white/20 text-white/50">Reschedule</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="h-[calc(100vh-180px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden glass-card border border-white/10 flex flex-col">
                  <div className="p-4 border-b border-white/10 bg-background/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Dr. Nneka</h3>
                        <p className="text-xs text-white/60">Your trusted AI Midwife</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Online</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0">
                    <AIChat />
                  </div>
                </div>
                <div className="space-y-6 h-full overflow-y-auto hidden lg:block">
                  <Card className="p-5 glass-card border-white/10">
                    <h4 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" /> Risk Assessment</h4>
                    <p className="text-sm text-white/70 mb-3">Based on your latest logs, your pregnancy is progressing normally. No immediate risks detected.</p>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-right text-white/50">Overall Health Score: 85/100</p>
                  </Card>
                  <Card className="p-5 glass-card border-white/10">
                    <h4 className="font-semibold mb-4">Recommended Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-white/10 border-white/20 py-1.5 px-3">Managing Fatigue</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-white/10 border-white/20 py-1.5 px-3">Week 24 Diet</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-white/10 border-white/20 py-1.5 px-3">Baby Movement Patterns</Badge>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "community" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 glass-card border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Users className="w-6 h-6 text-primary" /> Group Chat Rooms
                        </h3>
                        <div className="flex gap-2">
                          <Badge className="bg-white/10 hover:bg-white/20 cursor-pointer">My Groups</Badge>
                          <Badge variant="outline" className="border-white/10 hover:bg-white/10 cursor-pointer">Browse</Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/20 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-xl">🤰</div>
                            <div>
                              <h4 className="font-bold flex items-center gap-2">3rd Trimester Mamas <span className="w-2 h-2 rounded-full bg-green-500"></span></h4>
                              <p className="text-sm text-white/70">Eliza J: Does anyone else feel like... </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-primary text-white">3 New</Badge>
                            <p className="text-xs text-white/40 mt-1">31 online</p>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">🧘‍♀️</div>
                            <div>
                              <h4 className="font-bold text-white/90">Pregnancy Yoga</h4>
                              <p className="text-sm text-white/60">Instructor: Class starts in 10 mins!</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40 mt-1">12 online</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 glass-card border-white/10">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-tertiary" /> Community Pulse</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-tertiary/50 transition-colors cursor-pointer">
                          <span className="text-tertiary text-sm font-bold">#ThirdTrimesterSleep</span>
                          <p className="text-sm text-white/80 mt-2 mb-3">Has anyone found a good pregnancy pillow that actually supports your back?</p>
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span>12 mamas discussing</span>
                            <span>Join →</span>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-tertiary/50 transition-colors cursor-pointer">
                          <span className="text-tertiary text-sm font-bold">#HospitalBag</span>
                          <p className="text-sm text-white/80 mt-2 mb-3">What are the absolute essentials you packed for delivery?</p>
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span>45 mamas discussing</span>
                            <span>Join →</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-6">
                    <Card className="p-5 glass-card border-white/10 bg-gradient-to-br from-background to-secondary/10">
                      <h4 className="font-bold text-lg mb-2">Mentor Matching</h4>
                      <p className="text-sm text-white/70 mb-4">Connect with an experienced mom who has been through it all.</p>
                      <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">Find a Mentor</Button>
                    </Card>
                    <Card className="p-5 glass-card border-white/10 text-center">
                      <QrCode className="w-16 h-16 mx-auto text-white/50 mb-4" />
                      <h4 className="font-bold mb-2">Partner Mode</h4>
                      <p className="text-sm text-white/60 mb-4">Scan QR to invite your partner to MamaCare.</p>
                      <Button variant="outline" className="w-full border-white/20">Show QR Code</Button>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="space-y-6">
                <FinancialLayer />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 glass-card border-white/10 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <User className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold">Profile & Preferences</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Lite Mode</p>
                          <p className="text-xs text-white/60">Disables heavy animations and effects</p>
                        </div>
                        <Switch checked={isLiteMode} onCheckedChange={toggleLiteMode} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-xs text-white/60">Receive alerts for appointments and tips</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Language</p>
                        </div>
                        <select className="bg-background border border-white/20 rounded-md px-2 py-1 text-sm outline-none">
                          <option>English</option>
                          <option>Swahili</option>
                          <option>French</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 glass-card border-white/10 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <ShieldCheck className="w-6 h-6 text-green-400" />
                      <h3 className="text-xl font-bold">Privacy & Data</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-sm font-medium flex items-center gap-2"><CloudOff className="w-4 h-4 text-primary" /> Mama's Book (Offline Mode)</p>
                        <p className="text-xs text-white/60 mt-1">Your data is synced locally and works entirely offline for 30 days.</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-sm font-medium flex items-center gap-2"><LockIcon /> End-to-End Encrypted</p>
                        <p className="text-xs text-white/60 mt-1">Your health data is securely encrypted.</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Anonymous Research Opt-in</p>
                          <p className="text-xs text-white/60">Help improve maternal health algorithms</p>
                        </div>
                        <Switch />
                      </div>
                      <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 mt-2">
                        <Download className="w-4 h-4 mr-2" /> Download My Data
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around p-2 pb-safe">
        {TABS.slice(0, 5).map((t, index) => {
          if (index === 2) {
            // Center SOS or Main action button placeholder
            return (
              <div key="center-action" className="relative -top-5">
                <button 
                  onClick={() => handleTabChange('ai')}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 text-white transform transition active:scale-95"
                >
                  <Bot className="w-7 h-7" />
                </button>
              </div>
            );
          }
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`p-3 flex flex-col items-center gap-1 ${activeTab === t.id ? 'text-primary' : 'text-white/50 hover:text-white/80'}`}
            >
              <t.icon className={`w-6 h-6 ${activeTab === t.id ? 'animate-pulse drop-shadow-[0_0_8px_rgba(255,126,179,0.8)]' : ''}`} />
            </button>
          );
        })}
      </nav>

      {/* Global Floating Elements */}
      <div className="fixed bottom-24 md:bottom-8 left-4 md:left-6 z-50">
        <EmergencySOS />
      </div>
      <SymptomTriageBubble />
      <VoiceInterface />
    </div>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  );
}
