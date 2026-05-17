import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Calendar, MessageCircle, Users, Bell, User, CheckCircle2, Bot, Activity, QrCode, TrendingUp, Search, Home, Settings, Wallet, Video, ArrowRight, ArrowLeft, ShieldCheck, Download, Plus, Smartphone, SmartphoneNfc, FileText, LogOut, Car, CloudOff, Mic, Smile, Edit3, Pill, Loader2, MapPin, XCircle, AlertCircle, Lock, Phone } from "lucide-react";
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
import { MentorshipChat } from "@/components/MentorshipChat";
import { useSound } from "@/hooks/useSound";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingFlow } from "@/components/BookingFlow";
import { VideoCallModal } from "@/components/VideoCallModal";
import { supabase } from "@/integrations/supabase/client";

const TABS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "health", label: "Health", icon: Activity },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "ai", label: "Dr. Nneka (AI)", icon: Bot },
  { id: "community", label: "Community", icon: Users },
  { id: "wallet", label: "MamaFund & Wallet", icon: Wallet },
  { id: "hospitals", label: "Find Hospitals", icon: Search },
  { id: "settings", label: "Settings", icon: Settings },
];

const TabNavigator = ({ currentTabId, onTabChange }: { currentTabId: string, onTabChange: (id: string) => void }) => {
  const currentIndex = TABS.findIndex(t => t.id === currentTabId);
  const prevTab = currentIndex > 0 ? TABS[currentIndex - 1] : null;
  const nextTab = currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null;

  if (!prevTab && !nextTab) return null;

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5 pb-12">
      {prevTab ? (
        <Button 
          variant="ghost" 
          onClick={() => onTabChange(prevTab.id)}
          className="group flex flex-col items-start gap-1 h-auto py-3 px-4 hover:bg-white/5 rounded-2xl transition-all active:scale-95"
        >
          <span className="text-[10px] uppercase font-black tracking-widest text-white/30 group-hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Previous Section
          </span>
          <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{prevTab.label}</span>
        </Button>
      ) : <div />}

      {nextTab ? (
        <Button 
          variant="ghost" 
          onClick={() => onTabChange(nextTab.id)}
          className="group flex flex-col items-end gap-1 h-auto py-3 px-4 hover:bg-white/5 rounded-2xl transition-all text-right active:scale-95"
        >
          <span className="text-[10px] uppercase font-black tracking-widest text-white/30 group-hover:text-primary transition-colors flex items-center gap-2">
            Next Section <ArrowRight className="w-3 h-3" />
          </span>
          <span className="text-sm font-bold text-white group-hover:-translate-x-1 transition-transform">{nextTab.label}</span>
        </Button>
      ) : <div />}
    </div>
  );
};

export default function MotherDashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "overview";
  const { play, stop, SOUNDS } = useSound();
  const [isCalling, setIsCalling] = useState<string | null>(null);

  // Navigation History tracking for the "Back" button
  const [navHistory, setNavHistory] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab && navHistory[navHistory.length - 1] !== activeTab) {
      setNavHistory(prev => [...prev, activeTab]);
    }
  }, [activeTab]);

  const handleBack = () => {
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop(); // Remove current
      const lastTab = newHistory.pop(); // Get previous
      setNavHistory(newHistory);
      navigate(`/mother-dashboard/${lastTab}`);
    } else {
      navigate('/mother-dashboard/overview');
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isHospitalContactOpen, setIsHospitalContactOpen] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isPremium, setIsPremium] = useState(true);
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

  const [activeRequest, setActiveRequest] = useState<'none' | 'nurse' | 'ride'>('none');
  const [requestProgress, setRequestProgress] = useState(0);

  const [isRideModalOpen, setIsRideModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: "Loading...", 
    email: "",
    pregnancy_week: 0,
    avatar_url: "",
    is_anonymous: false
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<any>(null);
  const [motherId, setMotherId] = useState<string | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [currentRoomUrl, setCurrentRoomUrl] = useState("");
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);

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

  const [appointments, setAppointments] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); toast.success("Back online."); };
    const handleOffline = () => { setIsOffline(true); toast.error("Offline Mode."); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const demoBypass = localStorage.getItem("demoBypass");
        
        if (!session && !demoBypass) {
          navigate("/");
          return;
        }

        if (demoBypass) {
          setUserProfile({
            name: "Demo Mama",
            email: demoBypass,
            pregnancy_week: 24,
            avatar_url: "",
            is_anonymous: false
          });
          setMotherId("demo-mother-id");
          setIsLoading(false);
          return;
        }

        const userId = session.user.id;
        
        // 0. Fetch Hospitals
        const { data: hospitalData } = await supabase.from('hospitals').select('*');
        if (hospitalData) setHospitals(hospitalData);

        // 1. Fetch Profile/Mother data
        const { data: motherData } = await supabase
          .from('mothers')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (motherData) {
          setMotherId(motherData.id);
          setUserProfile({
            name: motherData.full_name || session.user.email?.split('@')[0] || "MamaCare Africa User",
            email: session.user.email || "",
            pregnancy_week: motherData.pregnancy_week || 0,
            avatar_url: motherData.avatar_url || "",
            is_anonymous: motherData.is_anonymous || false
          });

          // 2. Fetch Appointments
          const { data: appts } = await supabase
            .from('appointments')
            .select(`
              *,
              hospitals (
                name,
                specialists
              )
            `)
            .eq('mother_id', motherData.id)
            .order('appointment_date', { ascending: true });
          
          if (appts) setAppointments(appts);
        }

        // 3. Fetch Community Posts
        const { data: posts } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (posts) setCommunityPosts(posts);

      } catch (err) {
        console.error("Mamacare Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SUPPORTIVE_MESSAGES.length);
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(messageInterval);
    };
  }, []);

  const QuickActionsList = () => (
    <div className={`grid ${isSimpleMode ? 'grid-cols-1 sm:grid-cols-2 gap-6' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'} mb-8 animate-in fade-in slide-in-from-top duration-500`}>
      <Button 
        className={`${isSimpleMode ? 'h-32 rounded-[32px] border-4' : 'h-28 rounded-[24px] border-2'} flex flex-col gap-3 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 active:scale-95 transition-all border-white/10`}
        onClick={() => setIsBookingOpen(true)}
      >
        <div className={`${isSimpleMode ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-white/20 flex items-center justify-center`}>
          <Plus className={isSimpleMode ? 'w-8 h-8' : 'w-6 h-6'} />
        </div>
        <span className={isSimpleMode ? 'text-xl' : 'text-sm'}>{isSimpleMode ? "Uteuzi Mpya" : "Book New"}</span>
      </Button>
      <Button 
        variant="outline" 
        className={`${isSimpleMode ? 'h-32 rounded-[32px] border-4' : 'h-28 rounded-[24px] border-2'} flex flex-col gap-3 glass-card border-white/10 hover:bg-white/5 font-black active:scale-95 transition-all`}
        onClick={() => handleTabChange('hospitals')}
      >
        <div className={`${isSimpleMode ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-secondary/20 flex items-center justify-center`}>
          <Search className={`${isSimpleMode ? 'w-8 h-8' : 'w-6 h-6'} text-secondary`} />
        </div>
        <span className={isSimpleMode ? 'text-xl' : 'text-sm'}>{isSimpleMode ? "Tafuta Hospitali" : "Find Hospital"}</span>
      </Button>
      <Button 
        variant="outline" 
        className={`${isSimpleMode ? 'h-32 rounded-[32px] border-4' : 'h-28 rounded-[24px] border-2'} flex flex-col gap-3 glass-card border-white/10 hover:bg-white/5 font-black active:scale-95 transition-all`}
        onClick={() => setIsRideModalOpen(true)}
      >
        <div className={`${isSimpleMode ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-tertiary/20 flex items-center justify-center`}>
          <Car className={`${isSimpleMode ? 'w-8 h-8' : 'w-6 h-6'} text-tertiary`} />
        </div>
        <span className={isSimpleMode ? 'text-xl' : 'text-sm'}>{isSimpleMode ? "MamaRide" : "MamaRide"}</span>
      </Button>
      <Button 
        variant="outline" 
        className={`${isSimpleMode ? 'h-32 rounded-[32px] border-4 border-primary/40' : 'h-28 rounded-[24px] border-2 border-primary/20'} flex flex-col gap-3 glass-card hover:bg-white/5 font-black active:scale-95 transition-all bg-primary/5`}
        onClick={() => setIsHospitalContactOpen(true)}
      >
        <div className={`${isSimpleMode ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-primary/20 flex items-center justify-center animate-pulse`}>
          <Phone className={`${isSimpleMode ? 'w-8 h-8' : 'w-6 h-6'} text-primary`} />
        </div>
        <span className={isSimpleMode ? 'text-xl' : 'text-sm'}>{isSimpleMode ? "Piga Simu" : "Call Nurse"}</span>
      </Button>
    </div>
  );

  // Play baby laugh when all tasks are done
  useEffect(() => {
    if (taskProgress === 100 && tasks.length > 0) {
      play(SOUNDS.BABY_LAUGH, { volume: 0.4 });
    }
  }, [taskProgress]);

  const handleTabChange = (newTab: string) => {
    navigate(`/mother-dashboard/${newTab}`);
  };

  const toggleLiteMode = () => {
    setIsLiteMode(!isLiteMode);
    toast.info(!isLiteMode ? "Lite Mode enabled" : "Rich Mode enabled");
  };

  const handleJoinCall = async () => {
    stop(); // Stop any ringing or notification sounds immediately
    setIsGeneratingRoom(true);
    const toastId = toast.loading("Connecting to secure consultation...");
    
    try {
      const { data, error } = await supabase.functions.invoke('create-video-room', {
        body: { appointment_id: motherId || 'live_chat' }
      });

      if (error || !data?.url) {
        toast.error("Video consultation is only available for confirmed appointments.");
        toast.dismiss(toastId);
        return;
      }

      setCurrentRoomUrl(data.url);
      setIsVideoCallOpen(true);
      toast.dismiss(toastId);
    } catch (err: any) {
      toast.error("Could not connect to consultation. Please check your internet.");
      toast.dismiss(toastId);
    } finally {
      setIsGeneratingRoom(false);
    }
  };

  const startNurseRequest = () => {
    setActiveRequest('nurse');
    setRequestProgress(0);
    const toastId = toast.loading("Locating nearest available nurse...");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setRequestProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        toast.success("Nurse Ivy is now calling your phone!", { id: toastId });
        play(SOUNDS.CALL_RINGING, { loop: true, volume: 0.2 });
      }
    }, 400);
  };

  const requestMamaRide = async (type: string) => {
    if (!motherId) {
      toast.error("Profile not loaded. Please try again.");
      return;
    }

    setActiveRequest('ride');
    setRequestProgress(0);
    const toastId = toast.loading(`Requesting ${type} MamaRide...`);
    
    try {
      const { data, error } = await supabase
        .from('mamaride_requests')
        .insert({
          mother_id: motherId,
          ride_type: type,
          pickup_location: "Current Location", // In a real app, use Geolocation API
          status: 'requested'
        })
        .select()
        .single();

      if (error) throw error;

      setRequestProgress(50);
      toast.success("Request sent! Locating nearest driver...", { id: toastId });

      // Live tracking update
      setTimeout(() => {
        setRequestProgress(100);
        play(SOUNDS.RIDE_FOUND);
        toast.success("Driver Found: John (4 mins away)");
      }, 3000);

    } catch (err: any) {
      console.error("Ride request failed:", err);
      toast.error("Failed to request ride. Please call the hospital directly.", { id: toastId });
      setActiveRequest('none');
    }
  };

  const unlockVault = () => {
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      setIsWalletUnlocked(true);
      toast.success("Wallet Decrypted Successfully", { icon: "🔐" });
    }, 1500);
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
            MamaCare Africa
          </h1>
        </div>

        {/* Quick Stats Mini - More Subtle */}
        <div className="mb-8 px-2">
          <div className="flex flex-row items-center justify-between flex-row-mobile-stack text-[10px] text-white/40 uppercase tracking-widest mb-3">
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
          <div className="flex flex-row items-center justify-between flex-row-mobile-stack">
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
                  <span className="text-sm font-bold text-white truncate">{userProfile.name}</span>
                  <span className="text-xs text-white/50 truncate">{userProfile.email || "stacy@example.com"}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setIsProfileModalOpen(true)}><User className="w-4 h-4 mr-2" /> My Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleTabChange('settings')}><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}><LogOut className="w-4 h-4 mr-2" /> Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-30">
        
        {/* Header */}
        <header className={`border-b border-white/10 px-4 md:px-8 py-3 flex flex-row items-center justify-between flex-row-mobile-stack shrink-0 transition-colors w-full max-w-[100vw] overflow-hidden ${isLiteMode ? 'bg-background' : 'backdrop-blur-xl bg-background/60'}`}>
          <div className="md:hidden flex items-center gap-2">
            {activeTab !== "overview" ? (
              <Button variant="ghost" size="icon" onClick={handleBack} className="p-0 h-8 w-8 hover:bg-white/5 rounded-full active:scale-90 transition-transform">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </Button>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              </div>
            )}
            <span className="font-bold">MamaCare Africa</span>
          </div>
          
          <div className="hidden md:flex flex-col justify-center">
            <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent truncate max-w-[300px] lg:max-w-none">
              Good Evening, {userProfile.name.split(' ')[0]} ✨
            </h1>
            <span key={messageIndex} className="text-sm text-primary font-medium animate-fade-in-up mt-1">
              {SUPPORTIVE_MESSAGES[messageIndex]}
            </span>
          </div>
          
          <div className="md:hidden flex flex-col items-center flex-1">
             <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Mother Dashboard</span>
             <h1 className="text-lg font-bold text-white truncate max-w-[150px]">{userProfile.name.split(' ')[0]}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsSimpleMode(!isSimpleMode);
                toast.success(isSimpleMode ? "Back to Modern Mode" : "Mama Mboga Mode Active 🇰🇪");
                if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
              }} 
              className={`flex items-center gap-2 rounded-full px-4 h-10 font-black border transition-all ${isSimpleMode ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 text-white/50'}`}
            >
              <Smile className="w-5 h-5" />
              <span className="hidden sm:inline">{isSimpleMode ? "MODERN" : "RAHISI"}</span>
            </Button>

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
                <div className="p-3 border-b border-white/10 font-semibold text-sm">{isSimpleMode ? "Ujumbe" : "Notifications"}</div>
                <DropdownMenuItem className="p-3 hover:bg-white/5 cursor-pointer">{isSimpleMode ? "Uteuzi kesho saa 4 asubuhi" : "Appointment tomorrow at 10 AM"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>


        {/* Main Tab Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full space-y-6 pb-24 md:pb-8"
            >
            
            {activeTab === "settings" && (
              <div className="max-w-2xl mx-auto space-y-8 pb-12">
                <h2 className="text-2xl font-bold">Account Settings</h2>
                
                <Card className="p-8 glass-card border-white/10 space-y-6">
                  <h3 className="text-lg font-bold">Preferences</h3>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold">Lite Mode</p>
                      <p className="text-xs text-white/50">Reduces animations for better battery life</p>
                    </div>
                    <Button 
                      variant={isLiteMode ? "hero" : "outline"} 
                      size="sm" 
                      onClick={toggleLiteMode}
                      className="rounded-lg h-9 px-6 font-bold"
                    >
                      {isLiteMode ? "ON" : "OFF"}
                    </Button>
                  </div>
                </Card>

                <Card className="p-8 glass-card border-destructive/20 bg-destructive/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Danger Zone</h3>
                      <p className="text-xs text-destructive/70">Right to Deletion (ODPC Kenya Compliance)</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-black/40 rounded-2xl border border-destructive/10">
                    <p className="text-sm font-medium mb-4">Deleting your account will permanently remove:</p>
                    <ul className="text-xs space-y-2 text-white/50 mb-6">
                      <li className="flex items-center gap-2">❌ All medical health records & logs</li>
                      <li className="flex items-center gap-2">❌ Your encrypted MamaFund wallet balance</li>
                      <li className="flex items-center gap-2">❌ Community posts and messages</li>
                    </ul>
                    <Button 
                      variant="destructive" 
                      className="w-full h-12 rounded-2xl font-black shadow-lg shadow-destructive/20"
                      onClick={() => {
                        const confirm = window.confirm("Are you 100% sure? This action is permanent and complies with your ODPC right to deletion.");
                        if (confirm) {
                          const toastId = toast.loading("Permanently deleting records...");
                          setTimeout(() => {
                            toast.success("Account and data deleted successfully.", { id: toastId });
                            navigate("/");
                          }, 2000);
                        }
                      }}
                    >
                      DELETE MY ACCOUNT & DATA
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            

            {activeTab === "overview" && (
              <div className="space-y-6">
                <QuickActionsList />
                {isSimpleMode ? (
                  <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center p-6 bg-gradient-to-b from-primary/20 to-transparent rounded-[40px] border border-white/10">
                      <h2 className="text-4xl font-black mb-2">Habari, {userProfile.name.split(' ')[0]}!</h2>
                      <p className="text-xl text-white/70 font-bold">Uko wiki ya {userProfile.pregnancy_week}. Mtoto anaendelea vizuri. ❤️</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <Button 
                        className="h-32 rounded-[32px] bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white flex flex-row items-center justify-center gap-6 shadow-2xl shadow-red-600/30 active:scale-95 transition-transform border-4 border-white/20"
                        onClick={() => handleTabChange('ai')}
                      >
                        <Bot className="w-12 h-12" />
                        <span className="text-3xl font-black tracking-tight uppercase text-center">Ongea na Daktari (AI)</span>
                      </Button>

                      <Card className="p-8 glass-card border-white/10 rounded-[40px] bg-white/5">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                              <Calendar className="w-10 h-10 text-primary" />
                           </div>
                           <div className="flex-1">
                              <h3 className="text-2xl font-black">{isSimpleMode ? "Uteuzi Ujao" : "Next Visit"}</h3>
                              <p className="text-lg text-white/70 font-bold">
                                {appointments[0] ? new Date(appointments[0].appointment_date).toLocaleDateString() : "Hakuna uteuzi"}
                              </p>
                           </div>
                           <ArrowRight className="w-8 h-8 text-white/30" />
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <>
                    <DynamicGreeting userName={userProfile.is_anonymous ? "MamaCare Africa User" : userProfile.name.split(' ')[0]} />
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: Pregnancy Progress (60%) */}
                  <div className="lg:col-span-3">
                    <PregnancyProgressTabs currentWeek={24} totalWeeks={40} />
                  </div>

                  {/* Right: Next Appointment Preview (40%) */}
                  <div className="lg:col-span-2">
                    <Card 
                      className="h-full p-6 glass-card border-white/10 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col shadow-lg haptic-press" 
                      onClick={() => {
                        handleTabChange('appointments');
                        if (navigator.vibrate) navigator.vibrate(5);
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white/90">Next Appointment</h4>
                          <p className="text-xs text-white/50 italic">{appointments[0]?.appointment_type || "Telehealth Checkup"}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex-1 flex flex-col justify-center">
                        <p className="text-lg font-black text-white mb-1">
                          {appointments[0] ? new Date(appointments[0].appointment_date).toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }) : "No upcoming visits"}
                        </p>
                        <p className="text-sm text-white/70 mb-6">
                          {appointments[0]?.hospitals?.name || "Nairobi Women's Hospital"} • {appointments[0]?.notes || "Routine check"}
                        </p>
                        <Button 
                          size="sm" 
                          variant="hero" 
                          className="w-full h-11 text-xs animate-pulse font-bold"
                          disabled={!appointments[0]}
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
                            } else {
                              e.stopPropagation();
                              handleJoinCall();
                            }
                          }}
                        >
                          {isGeneratingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Call Now"}
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
                        <div className="flex flex-row items-center justify-between flex-row-mobile-stack mb-1.5">
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
                        <motion.div
                          key={task.id}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer transition-all border ${task.done ? 'bg-primary/10 border-primary/20 opacity-70' : 'bg-white/5 border-white/10 hover:bg-white/15'}`}
                          onClick={() => {
                            setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t));
                            if (navigator.vibrate) navigator.vibrate(task.done ? 2 : 10);
                          }}
                        >
                          <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center border transition-colors ${task.done ? 'bg-primary border-primary' : 'border-white/30'}`}>
                            {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm truncate ${task.done ? 'text-white/50 line-through' : 'text-white/90 font-medium'}`}>{task.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Row 3: Community Pulse (Scrollable Cards) */}
                <div className="space-y-4">
                  <div className="flex flex-row items-center justify-between flex-row-mobile-stack">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-tertiary" />
                      <h4 className="font-bold text-white/90">Community Pulse</h4>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-tertiary font-bold hover:bg-tertiary/10" onClick={() => handleTabChange('community')}>View All Discussions →</Button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                    {(communityPosts.length > 0 ? communityPosts : [
                      { id: 1, topic: "#ThirdTrimesterSleep", mamas: 12, text: "I've found that using a C-shaped pillow helps with the back pain. Anyone else struggling with side-sleeping positions lately?", trending: true },
                      { id: 2, topic: "#BabyKickCounters", mamas: 45, text: "My little one is so active at 10 PM! Is it normal for them to have a specific 'playtime' every night?", trending: false },
                      { id: 3, topic: "#NestingMode", mamas: 8, text: "Just organized the baby clothes for the 5th time. The urge to clean everything is getting real! 🧹✨", trending: false }
                    ]).map((topic: any) => (
                      <motion.div 
                        key={topic.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          handleTabChange('community');
                          if (navigator.vibrate) navigator.vibrate(5);
                        }}
                      >
                        <Card className="min-w-[280px] md:min-w-[280px] sm:min-w-[320px] p-5 glass-card border-white/10 hover:border-tertiary/50 transition-all cursor-pointer snap-center flex flex-col group h-[180px]">
                          <div className="flex flex-row items-center justify-between flex-row-mobile-stack mb-3">
                            <span className="text-tertiary text-xs font-black uppercase tracking-wider">{topic.title || topic.topic}</span>
                            {topic.trending && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] h-5">Trending</Badge>}
                          </div>
                          <p className="text-sm text-white/80 line-clamp-3 mb-auto italic leading-relaxed">"{topic.content || topic.text}"</p>
                          <div className="flex flex-row items-center justify-between flex-row-mobile-stack mt-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {[1, 2].map(i => (
                                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-white/10 flex items-center justify-center text-[8px] shadow-sm">🤰</div>
                                ))}
                              </div>
                              <span className="text-[10px] text-white/50 font-bold">{topic.likes || topic.mamas || 0} mamas discussing</span>
                            </div>
                            <span className="text-xs text-tertiary font-bold group-hover:translate-x-1 transition-transform">Join →</span>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}


            {activeTab === "health" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Health Dashboard</h2>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <Lock className="w-3 h-3 text-white/50" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">HIPAA Compliant</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <WearableMedicationWidgets />
                  </div>
                  <div className="lg:col-span-2">
                    <Card className="p-6 glass-card border-white/10 h-full flex flex-col justify-center">
                      <div className="flex flex-row items-center justify-between flex-row-mobile-stack mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-green-400" />
                          </div>
                          <h4 className="font-bold text-lg">Apple Watch</h4>
                        </div>
                        <Button variant="outline" size="sm" className="bg-green-500/10 text-green-400 border-green-500/20 h-8 font-bold" onClick={() => setIsPremium(true)}>Connect</Button>
                      </div>
                      <div className="flex items-end justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div>
                          <p className="text-sm text-white/50 mb-1 font-medium uppercase tracking-wider">Heart Rate</p>
                          <div className="text-4xl font-black text-responsive-lg">72 <span className="text-sm font-normal text-white/40">bpm</span></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                <MoodTracker />
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex flex-row items-center justify-between flex-row-mobile-stack">
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
                        <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-white/10 transition-all group flex-wrap">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Video className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className="font-bold text-lg sm:text-xl text-white truncate">Telehealth Checkup</h4>
                              <p className="text-white/60 text-xs sm:text-sm font-medium truncate">Dr. Eliza Keith • Routine check</p>
                              <p className="text-primary text-[10px] sm:text-sm font-bold mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-md">Today, 2:00 PM</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button 
                              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl"
                              onClick={() => {
                                if (!isPremium) {
                                  triggerPaywall({
                                    featureName: "Telehealth Video Call",
                                    featureValue: "See your doctor from home",
                                    perks: ["✓ 3 video calls/month", "✓ Priority booking", "✓ Secure data storage", "✓ Direct chat with doctor"],
                                    price: 7,
                                    onSuccess: () => setIsPremium(true)
                                  });
                                } else {
                                  handleJoinCall();
                                }
                              }}
                            >
                              {isGeneratingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Call"}
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-white/20 h-11 px-4 rounded-xl hover:bg-white/5"
                              onClick={() => {
                                setReschedulingAppointment(appointments[0]);
                                setIsBookingOpen(true);
                              }}
                            >
                              Reschedule
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-white/10 transition-all group opacity-80 flex-wrap">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className="font-bold text-lg sm:text-xl text-white truncate">Detailed Ultrasound</h4>
                              <p className="text-white/60 text-xs sm:text-sm font-medium truncate">Dr. Emily Chen • Imaging Dept</p>
                              <p className="text-secondary text-[10px] sm:text-sm font-bold mt-1 bg-secondary/10 inline-block px-2 py-0.5 rounded-md">Next Week, Tue 10:00 AM</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="flex-1 sm:flex-none border-white/20 h-11 px-6 rounded-xl hover:bg-white/5">Prep Instructions</Button>
                             <Button 
                                variant="outline" 
                                className="border-white/20 text-white/50 h-11 px-4 rounded-xl hover:bg-white/5"
                                onClick={() => {
                                  setReschedulingAppointment(appointments[1] || appointments[0]);
                                  setIsBookingOpen(true);
                                }}
                              >
                                Reschedule
                              </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Side: Stats & Actions (40%) */}
                  <div className="lg:col-span-2 space-y-6">

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
                  <div className="p-5 border-b border-white/10 bg-background/50 flex flex-row items-center justify-between flex-row-mobile-stack">
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
                      <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
                        <div className="glass-card p-5 sm:p-8 border border-white/20 rounded-[32px] text-center w-full max-w-[340px] sm:max-w-sm shadow-2xl overflow-hidden">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-bounce" />
                          </div>
                          <h4 className="text-xl sm:text-2xl font-black mb-3">Dr. Nneka is here 24/7</h4>
                          <p className="text-xs sm:text-sm text-white/60 mb-6 sm:mb-8 leading-relaxed">You've used your 5 free messages for today. Unlock unlimited chat to get instant support anytime.</p>
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 h-12 sm:h-14 text-sm sm:text-lg font-black rounded-2xl shadow-lg shadow-primary/20"
                            onClick={() => triggerPaywall({
                              featureName: "Unlimited AI Chat",
                              featureValue: "Dr. Nneka is here 24/7",
                              perks: ["✓ Unlimited AI chat", "✓ Real-time risk assessment", "✓ Personalized nutrition plans", "✓ Priority support"],
                              price: 7,
                              onSuccess: () => setIsPremium(true)
                            })}
                          >
                            Unlock for $7/mo
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
                        <div className="flex flex-row items-center justify-between flex-row-mobile-stack text-sm p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
                          <span className="text-white/70">Iron intake query</span>
                          <span className="text-[10px] text-white/30 font-bold">2h ago</span>
                        </div>
                        <div className="flex flex-row items-center justify-between flex-row-mobile-stack text-sm p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
                          <span className="text-white/70">Sleeping positions</span>
                          <span className="text-[10px] text-white/30 font-bold">Yesterday</span>
                        </div>
                     </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "community" && (
              <div className="space-y-6 pb-20 md:pb-0">
                <MentorshipChat />
                
                {/* Below: Community Pulse (Full Width Scroll) */}
                <div className="space-y-6 pt-6">
                   <div className="flex flex-row items-center justify-between flex-row-mobile-stack">
                     <h4 className="font-black text-2xl flex items-center gap-3"><TrendingUp className="w-7 h-7 text-tertiary" /> Community Pulse</h4>
                     <Button variant="link" className="text-tertiary font-black uppercase tracking-widest text-xs" onClick={() => handleTabChange('community')}>View All Conversations →</Button>
                   </div>
                   <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x px-2">
                     {[
                       { id: 1, topic: "#ThirdTrimesterSleep", mamas: 12, text: "I've found that using a C-shaped pillow helps with the back pain. Anyone else struggling with side-sleeping positions lately?", trending: true },
                       { id: 2, topic: "#BabyKickCounters", mamas: 45, text: "My little one is so active at 10 PM! Is it normal for them to have a specific 'playtime' every night?", trending: false },
                       { id: 3, topic: "#NestingMode", mamas: 8, text: "Just organized the baby clothes for the 5th time. The urge to clean everything is getting real! 🧹✨", trending: false }
                     ].map(topic => (
                       <Card 
                        key={topic.id} 
                        className="min-w-[260px] sm:min-w-[320px] p-5 sm:p-6 glass-card border-white/10 hover:border-tertiary/50 transition-all cursor-pointer snap-center flex flex-col justify-between h-[200px] sm:h-[220px] group"
                        onClick={() => {
                          handleTabChange('community');
                          if (navigator.vibrate) navigator.vibrate(5);
                        }}
                      >
                         <div>
                           <div className="flex flex-row items-center justify-between flex-row-mobile-stack mb-4">
                             <span className="text-tertiary text-xs font-black uppercase tracking-wider">{topic.topic}</span>
                             {topic.trending && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] h-5">Trending</Badge>}
                           </div>
                           <p className="text-sm text-white/80 leading-relaxed italic line-clamp-3">"{topic.text}"</p>
                         </div>
                         <div className="flex flex-row items-center justify-between flex-row-mobile-stack mt-6 pt-4 border-t border-white/5">
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

            {activeTab === "hospitals" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Nearby Hospitals & Clinics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Nairobi Women's Hospital", distance: "2.4 km", status: "Open 24/7", emergency: true, phone: "+254753436729" },
                    { name: "Mama Lucy Kibaki Hospital", distance: "4.1 km", status: "Open 24/7", emergency: true, phone: "+254753436729" },
                    { name: "Pumwani Maternity Hospital", distance: "5.8 km", status: "Open 24/7", emergency: true, phone: "+254753436729" },
                    { name: "Aga Khan University Hospital", distance: "6.2 km", status: "Open 24/7", emergency: true, phone: "+254753436729" },
                  ].map((h, i) => (
                    <Card key={i} className="p-6 glass-card border-white/10 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                      {isCalling === h.name && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-primary/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-4"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 animate-pulse">
                            <Phone className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-black text-lg mb-1">Calling...</p>
                          <p className="text-white/70 text-xs mb-6">{h.name}</p>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-full px-6"
                            onClick={(e) => { e.stopPropagation(); setIsCalling(null); }}
                          >
                            End Call
                          </Button>
                        </motion.div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        {h.emergency && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Emergency</Badge>}
                      </div>
                      <h4 className="font-bold text-lg text-white mb-1">{h.name}</h4>
                      <p className="text-sm text-white/50 mb-4">{h.distance} • {h.status}</p>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-0 h-10 font-bold" 
                          onClick={(e) => { 
                            e.stopPropagation();
                            setIsCalling(h.name);
                            play(SOUNDS.CLICK);
                            setTimeout(() => {
                              window.location.href = `tel:${h.phone}`;
                            }, 1000);
                          }}
                        >
                          Call
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-white/10 hover:bg-white/5 h-10 font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/search/${encodeURIComponent(h.name)}`, '_blank');
                          }}
                        >
                          Directions
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="space-y-6 w-full pb-20">
                <h2 className="text-2xl font-bold mb-6">Settings & Privacy</h2>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <Card className="lg:col-span-3 p-6 glass-card border-white/10 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <User className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold">Account Preferences</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                          <p className="font-bold text-sm">Low Data Mode</p>
                          <p className="text-xs text-white/50">Optimized for village connectivity</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                          <p className="font-bold text-sm">SMS Alerts</p>
                          <p className="text-xs text-white/50">Get reminders via text message</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                  <Card className="lg:col-span-2 p-6 glass-card border-white/10 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <ShieldCheck className="w-6 h-6 text-green-400" />
                      <h3 className="text-xl font-bold">Data Security</h3>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm">
                      <p className="text-white/80 leading-relaxed italic">"Your health data is end-to-end encrypted and never sold to third parties."</p>
                    </div>
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 font-bold rounded-xl">
                      Download My Data
                    </Button>
                  </Card>
                </div>
              </div>
            )}
            <TabNavigator currentTabId={activeTab} onTabChange={handleTabChange} />
          </motion.div>
          </AnimatePresence>

          <Dialog open={isBookingOpen} onOpenChange={(open) => { setIsBookingOpen(open); if (!open) setReschedulingAppointment(null); }}>
            <DialogContent className="sm:max-w-[500px] glass-card border-white/10 p-0 overflow-hidden rounded-[32px]">
              <div className="p-8">
                <BookingFlow 
                  onClose={() => { setIsBookingOpen(false); setReschedulingAppointment(null); }} 
                  onSuccess={() => {
                    toast.success(reschedulingAppointment ? "Appointment rescheduled!" : "Appointment request sent!");
                  }} 
                  initialAppointment={reschedulingAppointment}
                />
              </div>
            </DialogContent>
          </Dialog>

          <VideoCallModal 
            isOpen={isVideoCallOpen} 
            onClose={() => setIsVideoCallOpen(false)} 
            roomUrl={currentRoomUrl}
            patientName="Eliza Keith"
          />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 mobile-nav-blur mobile-bottom-nav border-t border-white/10 flex items-center justify-around p-2 pb-safe">
        {[
          TABS[0], // Overview
          TABS[1], // Health
          { id: 'ai', icon: Bot, isCenter: true },
          TABS[2], // Appointments
          TABS[6]  // Hospitals
        ].map((t) => {
          const isActive = activeTab === t.id;
          if ('isCenter' in t) {
            return (
              <div key="center-action" className="relative -top-6">
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    handleTabChange('ai');
                    if (navigator.vibrate) navigator.vibrate(15);
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(255,126,179,0.5)] text-white border-4 border-background"
                >
                  <Bot className="w-8 h-8" />
                </motion.button>
              </div>
            );
          }
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                handleTabChange(t.id);
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className={`relative p-3 flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] transition-colors ${isActive ? 'text-primary' : 'text-white/40'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabMobile"
                  className="tab-bubble"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <t.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,126,179,0.6)]' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeGlowMobile"
                  className="absolute bottom-0 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Global Floating Elements */}
      <div className="fixed bottom-24 md:bottom-12 left-4 sm:left-6 md:left-8 z-50">
        <EmergencySOS />
      </div>
      <div className="fixed bottom-24 right-4 sm:right-6 md:right-8 z-50">
        <SymptomTriageBubble />
      </div>
      
      <PaywallOverlay 
        isOpen={paywallConfig.isOpen}
        onClose={() => setPaywallConfig(prev => ({ ...prev, isOpen: false }))}
        onSuccess={paywallConfig.onSuccess}
        featureName={paywallConfig.featureName}
        featureValue={paywallConfig.featureValue}
        perks={paywallConfig.perks}
        price={paywallConfig.price}
      />

      {/* Live Request Overlays */}
      {activeRequest === 'nurse' && requestProgress === 100 && (
        <div className="fixed top-8 right-8 z-[100] animate-in fade-in slide-in-from-right duration-500">
          <Card className="p-4 bg-primary border-primary shadow-2xl flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Incoming Call</p>
              <p className="font-bold">Nurse Ivy (Midwife)</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setActiveRequest('none'); stop(); }} className="hover:bg-white/10"><XCircle className="w-5 h-5" /></Button>
          </Card>
        </div>
      )}

      {activeRequest === 'ride' && requestProgress === 100 && (
        <div className="fixed top-8 right-8 z-[100] animate-in fade-in slide-in-from-right duration-500">
          <Card className="p-4 bg-tertiary border-tertiary shadow-2xl flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-70">MamaRide Found</p>
              <p className="font-bold">Driver: John • 4 mins away</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setActiveRequest('none')} className="hover:bg-white/10"><XCircle className="w-5 h-5" /></Button>
          </Card>
        </div>
      )}

      {/* MamaRide Selection Modal */}
      <Dialog open={isRideModalOpen} onOpenChange={setIsRideModalOpen}>
        <DialogContent className="glass-card border-white/10 max-w-md p-6 rounded-[32px] bg-[#0f0f1a]/95 backdrop-blur-2xl">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center">
              <Car className="w-4 h-4 text-tertiary" />
            </div>
            Request a MamaRide
          </h3>
          
          <div className="space-y-3">
            {[
              { id: 'standard', label: 'Standard Ride', sub: 'Comfortable car for checkups', eta: '4-6 mins', icon: Car, color: 'text-tertiary' },
              { id: 'ambulance', label: 'Emergency Ambulance', sub: 'Urgent medical transport', eta: '2-4 mins', icon: ShieldCheck, color: 'text-destructive' },
              { id: 'boda', label: 'Quick Boda-Boda', sub: 'Fast navigation through traffic', eta: '3 mins', iconRaw: '🏍️', color: 'text-secondary' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setIsRideModalOpen(false);
                  requestMamaRide(option.id);
                }}
                className="w-full p-4 rounded-2xl border border-white/5 bg-white/10 hover:bg-white/20 hover:border-white/20 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                    {option.iconRaw || (option.icon && <option.icon className={`w-6 h-6 ${option.color}`} />)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{option.label}</p>
                    <p className="text-[10px] text-white/50">{option.sub}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white/80">{option.eta}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Select</p>
                </div>
              </button>
            ))}
          </div>
          
          <p className="mt-6 text-[10px] text-center text-white/30 font-medium italic">
            "Every MamaRide driver is trained in basic maternal first aid."
          </p>
        </DialogContent>
      </Dialog>

      {/* Hospital Contact Modal */}
      <Dialog open={isHospitalContactOpen} onOpenChange={setIsHospitalContactOpen}>
        <DialogContent className="glass-card border-white/10 max-w-md p-6 rounded-[32px] bg-[#0f0f1a]/95 backdrop-blur-2xl">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            {isSimpleMode ? "Piga Hospitali" : "Call Hospital/Nurse"}
          </h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="w-full p-4 rounded-2xl border border-white/5 bg-white/10 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{hospital.name}</p>
                    <p className="text-[10px] text-white/50">{hospital.address || "Nairobi, Kenya"}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">Active</Badge>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={`tel:${hospital.phone || '+254700000000'}`}
                    className="flex-1"
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
                    }}
                  >
                    <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl h-10 flex items-center gap-2 font-black text-xs">
                      <Phone className="w-3 h-3" />
                      CALL NURSE
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-white/10 rounded-xl h-10 font-bold text-xs"
                    onClick={() => handleTabChange('hospitals')}
                  >
                    DIRECTIONS
                  </Button>
                </div>
              </div>
            ))}
            
            {hospitals.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm italic">Loading secure contacts...</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] text-red-200 leading-relaxed">
              <strong>SECURITY NOTICE:</strong> Call records are encrypted. If this is a life-threatening emergency, please use the red <strong>SOS button</strong> on your dashboard.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile & Security Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="glass-card border-white/10 max-w-lg p-0 rounded-[32px] overflow-hidden bg-[#0f0f1a]">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-8 flex flex-col items-center border-b border-white/5">
            <div className="relative mb-4 group">
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name}&backgroundColor=transparent`} 
                className="w-24 h-24 rounded-full border-4 border-white/10 bg-white/5 shadow-2xl group-hover:scale-105 transition-transform" 
                alt="Avatar"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-[#0f0f1a] shadow-lg">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
            <h3 className="text-xl font-black text-white">{userProfile.name}</h3>
            <p className="text-xs text-white/50 font-medium">Pregnancy Week {userProfile.pregnancy_week}</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-primary">Identity & Privacy</h4>
              
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 font-bold uppercase ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center text-lg">🛡️</div>
                    <div>
                      <p className="font-bold text-white text-sm">Community Anonymity</p>
                      <p className="text-[10px] text-white/40">Hide your real name from other mamas</p>
                    </div>
                  </div>
                  <Button 
                    variant={userProfile.is_anonymous ? "hero" : "outline"} 
                    size="sm" 
                    className="rounded-lg text-[10px] h-8 px-4"
                    onClick={() => setUserProfile(prev => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
                  >
                    {userProfile.is_anonymous ? "ENABLED" : "ENABLE"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl h-12 border-white/10 font-bold"
                onClick={() => setIsProfileModalOpen(false)}
              >
                Discard
              </Button>
              <Button 
                className="flex-1 rounded-2xl h-12 bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20"
                onClick={async () => {
                  const toastId = toast.loading("Saving secure profile...");
                  // Simulate API call to update mothers table
                  setTimeout(() => {
                    setIsProfileModalOpen(false);
                    toast.success("Profile secured successfully!", { id: toastId });
                  }, 1000);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  );
}
