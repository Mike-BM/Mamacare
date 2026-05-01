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

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { PaywallOverlay } from "@/components/PaywallOverlay";

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
  const [isPremium, setIsPremium] = useState(false);
  const [paywallConfig, setPaywallConfig] = useState<{
    isOpen: boolean;
    featureName: string;
    featureValue: string;
    perks: string[];
    price: number;
    onSuccess: () => void;
  }>({
    isOpen: false,
    featureName: "",
    featureValue: "",
    perks: [],
    price: 7,
    onSuccess: () => {}
  });

  const triggerPaywall = (config: Partial<typeof paywallConfig>) => {
    setPaywallConfig(prev => ({
      ...prev,
      ...config,
      isOpen: true
    }));
  };

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
          <Button 
            variant="glass" 
            size="sm" 
            className="w-full h-7 text-[10px] rounded-lg"
            onClick={() => {
              if (!isPremium) {
                triggerPaywall({
                  featureName: "Baba Mode",
                  featureValue: "Share this journey together",
                  perks: ["✓ Partner sync", "✓ Shared countdown", "✓ Daily support tips for him", "✓ Private family chat"],
                  price: 7,
                  onSuccess: () => setIsPremium(true)
                });
              }
            }}
          >
            Invite Partner
          </Button>
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
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Good Evening, Eliza ✨</h1>
            <span key={messageIndex} className="text-sm text-primary font-medium animate-fade-in-up mt-1">
              {SUPPORTIVE_MESSAGES[messageIndex]}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleLiteMode} className="relative hover:bg-white/5 rounded-full" title="Toggle Lite Mode">
              {isLiteMode ? <SmartphoneNfc className="w-5 h-5 text-muted-foreground" /> : <Smartphone className="w-5 h-5 text-primary" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-full transition-transform active:scale-95">
                  <Bell className="w-6 h-6 text-white/80" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(231,76,60,0.6)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-card border-white/10">
                <div className="p-3 border-b border-white/10 font-semibold text-sm">Notifications</div>
                <DropdownMenuItem className="p-3 hover:bg-white/5 cursor-pointer">Appointment tomorrow at 10 AM</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>


        {/* Main Tab Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8 animate-fade-in-up">
            
            {activeTab === "overview" && (
              <div className="space-y-6">
                <DynamicGreeting userName="Eliza" />
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: Pregnancy Progress (60%) */}
                  <div className="lg:col-span-3">
                    <PregnancyProgressTabs currentWeek={24} totalWeeks={40} />
                  </div>

                  {/* Right: Next Appointment Preview (40%) */}
                  <div className="lg:col-span-2">
                    <Card className="h-full p-6 glass-card border-white/10 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col shadow-lg" onClick={() => handleTabChange('appointments')}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white/90">Next Appointment</h4>
                          <p className="text-xs text-white/50 italic">Telehealth Checkup</p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex-1 flex flex-col justify-center">
                        <p className="text-lg font-black text-white mb-1">Today, 2:00 PM</p>
                        <p className="text-sm text-white/70 mb-6">Dr. Eliza Keith • Routine check</p>
                        <Button 
                          size="sm" 
                          variant="hero" 
                          className="w-full h-10 text-xs animate-pulse font-bold"
                          onClick={(e) => {
                            if (!isPremium) {
                              e.stopPropagation();
                              triggerPaywall({
                                featureName: "Telehealth Video Call",
                                featureValue: "See your doctor from home",
                                perks: ["✓ 3 video calls/month", "✓ Priority booking", "✓ Secure data storage", "✓ Direct chat with doctor"],
                                price: 7,
                                onSuccess: () => setIsPremium(true)
                              });
                            }
                          }}
                        >
                          Join Call Now
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Row 2: Daily Tasks (Full Width section) */}
                <Card className="p-5 glass-card border-white/10">
                  <div className="space-y-4">
                    {/* Header row */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-white/90">Daily Tasks</h4>
                          <span className="text-xs text-primary font-bold shrink-0 ml-2">{completedTasks}/{tasks.length} Completed</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${taskProgress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Task pills row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer transition-all border ${task.done ? 'bg-primary/10 border-primary/20 opacity-70' : 'bg-white/5 border-white/10 hover:bg-white/15'}`}
                          onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}
                        >
                          <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center border transition-colors ${task.done ? 'bg-primary border-primary' : 'border-white/30'}`}>
                            {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm truncate ${task.done ? 'text-white/50 line-through' : 'text-white/90 font-medium'}`}>{task.label}</span>
                        </div>
                      ))}
                    </div>
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
                
                {/* Top row: Band (60%) + Watch (40%) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <WearableMedicationWidgets />
                  </div>
                  <div className="lg:col-span-2">
                    <Card className="p-6 glass-card border-white/10 hover:border-white/20 transition-all group h-full flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-400" />
                          </div>
                          <h4 className="font-bold text-lg">Apple Watch</h4>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 h-8 font-bold"
                          onClick={() => {
                            if (!isPremium) {
                              triggerPaywall({
                                featureName: "Wearable Sync",
                                featureValue: "Track baby's heartbeat & your health",
                                perks: ["✓ Real-time sync", "✓ Automatic health logs", "✓ Abnormal heart rate alerts", "✓ Sleep quality tracking"],
                                price: 7,
                                onSuccess: () => setIsPremium(true)
                              });
                            }
                          }}
                        >
                          Connect Device
                        </Button>
                      </div>
                      <div className="flex items-end justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div>
                          <p className="text-sm text-white/50 mb-1 font-medium uppercase tracking-wider">Heart Rate</p>
                          <div className="text-4xl font-black flex items-baseline gap-1">
                            72 <span className="text-sm font-normal text-white/40">bpm</span>
                          </div>
                          <p className="text-xs text-white/30 mt-2">Last sync: 2 min ago</p>
                        </div>
                        <div className="w-32 h-16 flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {[4, 7, 5, 8, 6, 9, 7, 8, 5, 9].map((h, i) => (
                            <div key={i} className="w-full bg-green-500 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Middle: Weight Chart (Full Width) */}
                <Card className="p-6 glass-card border-white/10">
                  <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Weight Progress
                  </h4>
                  <div className="h-48 w-full bg-white/5 rounded-2xl border border-white/5 flex items-end justify-between px-8 pb-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
                      <div className="w-full h-px bg-white/5"></div>
                      <div className="w-full h-px bg-white/5"></div>
                    </div>
                    {[65, 65.5, 66, 66.8, 67.2, 67.8, 68].map((w, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 relative z-10">
                        <div className="w-10 bg-primary/40 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${(w-60)*10}px` }}></div>
                        <span className="text-[10px] text-white/50 font-bold">W{20+i}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Bottom row: Meds (60%) + Journal (40%) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                   <div className="lg:col-span-3">
                     <Card className="p-6 glass-card border-white/10 h-full">
                       <div className="flex items-center justify-between mb-6">
                         <h4 className="font-bold text-lg flex items-center gap-2"><Pill className="w-5 h-5 text-primary" /> Medication Checklist</h4>
                         <Badge className="bg-primary/20 text-primary border-primary/30">2 Reminders</Badge>
                       </div>
                       <div className="space-y-3">
                         {["Prenatal Vitamins", "Iron Supplement"].map((med, i) => (
                           <div key={med} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">💊</div>
                               <div>
                                 <p className="font-bold text-white">{med}</p>
                                 <p className="text-xs text-white/40">1 pill • 8:00 AM</p>
                               </div>
                             </div>
                             <Button size="sm" variant={i === 0 ? "hero" : "glass"} className="h-9 px-4 rounded-xl font-bold">{i === 0 ? "Taken" : "Take Now"}</Button>
                           </div>
                         ))}
                       </div>
                     </Card>
                   </div>
                   <div className="lg:col-span-2">
                     <Card className="p-6 glass-card border-white/10 h-full">
                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-secondary" /> Health Journal</h4>
                        <div className="space-y-3 mb-6">
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-white">Mild swelling</span>
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Yesterday</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">Noticed some swelling in ankles after walking. Drank extra water.</p>
                          </div>
                        </div>
                        <Button className="w-full bg-white/10 hover:bg-white/20 border-0 h-11 rounded-xl font-bold" variant="outline">
                          <Plus className="w-4 h-4 mr-2" /> Add New Entry
                        </Button>
                     </Card>
                   </div>
                </div>

                {/* Bottom: Mood Tracker (Full Width) */}
                <MoodTracker />
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Appointments</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left Side: Upcoming Appointments (60%) */}
                  <div className="lg:col-span-3 space-y-4">
                    <Card className="p-6 glass-card border-white/10 h-full">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" /> Upcoming Visits
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-white/10 transition-all group flex-wrap">
                          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Video className="w-7 h-7 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-xl text-white">Telehealth Checkup</h4>
                              <p className="text-white/60 text-sm font-medium">Dr. Eliza Keith • Routine check</p>
                              <p className="text-primary text-sm font-bold mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-md">Today, 2:00 PM</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 shrink-0 flex-wrap">
                            <Button 
                              className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl"
                              onClick={() => {
                                if (!isPremium) {
                                  triggerPaywall({
                                    featureName: "Telehealth Video Call",
                                    featureValue: "See your doctor from home",
                                    perks: ["✓ 3 video calls/month", "✓ Priority booking", "✓ Secure data storage", "✓ Direct chat with doctor"],
                                    price: 7,
                                    onSuccess: () => setIsPremium(true)
                                  });
                                }
                              }}
                            >
                              Join Call
                            </Button>
                            <Button variant="outline" className="border-white/20 h-11 px-4 rounded-xl hover:bg-white/5">Reschedule</Button>
                          </div>
                        </div>

                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-white/10 transition-all group opacity-80 flex-wrap">
                          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
                            <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Activity className="w-7 h-7 text-secondary" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-xl text-white">Detailed Ultrasound</h4>
                              <p className="text-white/60 text-sm font-medium">Dr. Emily Chen • Imaging Dept</p>
                              <p className="text-secondary text-sm font-bold mt-1 bg-secondary/10 inline-block px-2 py-0.5 rounded-md">Next Week, Tue 10:00 AM</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 shrink-0 flex-wrap">
                            <Button variant="outline" className="border-white/20 h-11 px-6 rounded-xl hover:bg-white/5">Prep Instructions</Button>
                            <Button variant="outline" className="border-white/20 text-white/50 h-11 px-4 rounded-xl hover:bg-white/5">Reschedule</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Side: Stats & Actions (40%) */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 glass-card border-white/10">
                      <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button className="h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold">
                          <Plus className="w-6 h-6" />
                          <span>Book New</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 rounded-2xl font-bold">
                          <Smartphone className="w-6 h-6 text-primary" />
                          <span>Call Nurse</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 rounded-2xl font-bold">
                          <Search className="w-6 h-6 text-secondary" />
                          <span>Find Hospital</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 rounded-2xl font-bold">
                          <Car className="w-6 h-6 text-tertiary" />
                          <span>MamaRide</span>
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-primary/10 to-transparent">
                       <h3 className="text-lg font-bold mb-4">Visit Summary</h3>
                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-white/60">Total Visits</span>
                           <span className="text-xl font-black text-white">8</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-white/60">Completed</span>
                           <span className="text-xl font-black text-green-400">6</span>
                         </div>
                         <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                           <div className="bg-green-400 h-full w-[75%]"></div>
                         </div>
                       </div>
                    </Card>
                  </div>
                </div>

                {/* Below: Past Appointments (Collapsible) */}
                <Card className="p-4 glass-card border-white/10">
                   <Button variant="ghost" className="w-full flex justify-between items-center hover:bg-white/5 h-12 rounded-xl">
                     <span className="font-bold text-white/70">View 6 Past Appointments</span>
                     <ArrowRight className="w-4 h-4" />
                   </Button>
                </Card>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 h-full rounded-[32px] overflow-hidden glass-card border border-white/10 flex flex-col">
                  <div className="p-5 border-b border-white/10 bg-background/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Bot className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Dr. Nneka</h3>
                        <p className="text-xs text-white/50 font-medium">Your trusted AI Midwife</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">Online</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0 relative">
                    {!isPremium && (
                      <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="glass-card p-6 sm:p-8 border border-white/20 rounded-[32px] text-center w-full max-w-[90%] md:max-w-sm shadow-2xl">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-bounce" />
                          </div>
                          <h4 className="text-xl sm:text-2xl font-black mb-3">Dr. Nneka is here 24/7</h4>
                          <p className="text-xs sm:text-sm text-white/60 mb-6 sm:mb-8 leading-relaxed">You've used your 5 free messages for today. Unlock unlimited chat to get instant support anytime.</p>
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-black rounded-2xl shadow-lg shadow-primary/20"
                            onClick={() => triggerPaywall({
                              featureName: "Unlimited AI Chat",
                              featureValue: "Dr. Nneka is here 24/7",
                              perks: ["✓ Unlimited AI chat", "✓ Real-time risk assessment", "✓ Personalized nutrition plans", "✓ Priority support"],
                              price: 7,
                              onSuccess: () => setIsPremium(true)
                            })}
                          >
                            Unlock Unlimited for $7/mo
                          </Button>
                          <button className="text-xs text-white/30 mt-6 font-bold hover:text-white uppercase tracking-widest" onClick={() => setActiveTab('overview')}>Maybe tomorrow</button>
                        </div>
                      </div>
                    )}
                    <AIChat />
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-6 h-full overflow-y-auto hidden lg:block">
                  <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-green-500/5 to-transparent">
                    <h4 className="font-bold text-lg mb-6 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-green-400" /> Risk Assessment</h4>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 mb-6">
                      <p className="text-sm text-white/80 leading-relaxed">Based on your latest logs, your pregnancy is progressing normally. No immediate risks detected.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/50">
                        <span>Health Score</span>
                        <span>85/100</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 glass-card border-white/10">
                    <h4 className="font-bold text-lg mb-6">Recommended Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Managing Fatigue", "Week 24 Diet", "Baby Movement Patterns", "Safe Exercises"].map(topic => (
                        <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-primary/10 border-white/10 hover:border-primary/30 py-2 px-4 rounded-xl text-sm font-medium transition-all">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 glass-card border-white/10">
                     <h4 className="font-bold text-lg mb-4">Chat History</h4>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
                          <span className="text-white/70">Iron intake query</span>
                          <span className="text-[10px] text-white/30 font-bold">2h ago</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
                          <span className="text-white/70">Sleeping positions</span>
                          <span className="text-[10px] text-white/30 font-bold">Yesterday</span>
                        </div>
                     </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "community" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left Side: Chat Rooms (60%) */}
                  <div className="lg:col-span-3 space-y-6">
                    <Card className="p-8 glass-card border-white/10">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black flex items-center gap-3">
                          <Users className="w-8 h-8 text-primary" /> Group Chat Rooms
                        </h3>
                        <Button 
                          className="bg-primary hover:bg-primary/90 text-white font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20"
                          onClick={() => {
                            if (!isPremium) {
                              triggerPaywall({
                                featureName: "Community Posting",
                                featureValue: "Join the conversation with 2,400+ mamas",
                                perks: ["✓ Post in community", "✓ Get replies & support", "✓ Join trimester groups", "✓ Anonymous mode"],
                                price: 3,
                                onSuccess: () => setIsPremium(true)
                              });
                            }
                          }}
                        >
                          + New Post
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { id: 1, title: "3rd Trimester Mamas", lastMsg: "Eliza J: Does anyone else feel like...", online: 31, icon: "🤰", isNew: true },
                          { id: 2, title: "Pregnancy Yoga", lastMsg: "Instructor: Class starts in 10 mins!", online: 12, icon: "🧘‍♀️", isNew: false }
                        ].map((group) => (
                          <div key={group.id} className={`p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-all flex items-center justify-between border ${group.isNew ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${group.isNew ? 'bg-primary/20' : 'bg-white/10'}`}>{group.icon}</div>
                              <div>
                                <h4 className="font-black text-white text-lg flex items-center gap-2">{group.title} {group.isNew && <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>}</h4>
                                <p className="text-sm text-white/50 mt-1">{group.lastMsg}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {group.isNew && <Badge className="bg-primary text-white font-bold px-3 py-1 mb-2">3 New</Badge>}
                              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{group.online} online</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Right Side: Matching & Partner (40%) */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 glass-card border-white/10 bg-gradient-to-br from-secondary/10 to-transparent flex flex-col justify-between h-[280px]">
                      <div>
                        <h4 className="font-black text-2xl mb-3">Mentor Matching</h4>
                        <p className="text-sm text-white/60 leading-relaxed mb-6">Connect with an experienced mom who has been through it all. Get personalized advice and 1-on-1 support.</p>
                      </div>
                      <Button className="w-full bg-secondary hover:bg-secondary/90 text-white h-14 text-lg font-black rounded-2xl shadow-lg shadow-secondary/20">Find a Mentor</Button>
                    </Card>

                    <Card className="p-8 glass-card border-white/10 text-center flex flex-col items-center justify-center h-[280px]">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                        <QrCode className="w-10 h-10 text-white/40" />
                      </div>
                      <h4 className="font-black text-xl mb-2">Partner Mode</h4>
                      <p className="text-sm text-white/50 mb-6 px-4">Scan QR to invite your partner to track the journey with you.</p>
                      <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 rounded-2xl font-bold uppercase tracking-widest text-xs">Show QR Code</Button>
                    </Card>
                  </div>
                </div>

                {/* Below: Community Pulse (Full Width Scroll) */}
                <div className="space-y-6 pt-6">
                   <div className="flex items-center justify-between">
                     <h4 className="font-black text-2xl flex items-center gap-3"><TrendingUp className="w-7 h-7 text-tertiary" /> Community Pulse</h4>
                     <Button variant="link" className="text-tertiary font-black uppercase tracking-widest text-xs">View All Conversations →</Button>
                   </div>
                   <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
                     {[
                       { id: 1, topic: "#ThirdTrimesterSleep", mamas: 12, text: "I've found that using a C-shaped pillow helps with the back pain. Anyone else struggling with side-sleeping positions lately?", trending: true },
                       { id: 2, topic: "#BabyKickCounters", mamas: 45, text: "My little one is so active at 10 PM! Is it normal for them to have a specific 'playtime' every night?", trending: false },
                       { id: 3, topic: "#NestingMode", mamas: 8, text: "Just organized the baby clothes for the 5th time. The urge to clean everything is getting real! 🧹✨", trending: false }
                     ].map(topic => (
                       <Card key={topic.id} className="min-w-[320px] p-6 glass-card border-white/10 hover:border-tertiary/50 transition-all cursor-pointer snap-center flex flex-col justify-between h-[220px] group">
                         <div>
                           <div className="flex items-center justify-between mb-4">
                             <span className="text-tertiary text-xs font-black uppercase tracking-wider">{topic.topic}</span>
                             {topic.trending && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] h-5">Trending</Badge>}
                           </div>
                           <p className="text-sm text-white/80 leading-relaxed italic line-clamp-3">"{topic.text}"</p>
                         </div>
                         <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                           <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{topic.mamas} mamas discussing</span>
                           <span className="text-xs text-tertiary font-black group-hover:translate-x-1 transition-transform">Join Discussion →</span>
                         </div>
                       </Card>
                     ))}
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
      
      <PaywallOverlay 
        isOpen={paywallConfig.isOpen}
        onClose={() => setPaywallConfig(prev => ({ ...prev, isOpen: false }))}
        onSuccess={paywallConfig.onSuccess}
        featureName={paywallConfig.featureName}
        featureValue={paywallConfig.featureValue}
        perks={paywallConfig.perks}
        price={paywallConfig.price}
      />
    </div>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  );
}
