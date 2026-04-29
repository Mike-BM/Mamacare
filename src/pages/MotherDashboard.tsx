import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Calendar, MessageCircle, BookOpen, Baby, AlertCircle, Menu, LogOut, 
  Map, BookHeart, Users, Bot, Wallet, Settings, Activity, TrendingUp, 
  Trophy, Music, QrCode, ShieldCheck, User, CloudOff, Download, Search, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIChat } from "@/components/AIChat";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicGreeting } from "@/components/DynamicGreeting";
import { BabyDevelopment } from "@/components/BabyDevelopment";
import { AppointmentCountdown } from "@/components/AppointmentCountdown";
import { WeeklyTips } from "@/components/WeeklyTips";
import { MoodTracker } from "@/components/MoodTracker";
import { BackgroundMedia } from "@/components/BackgroundMedia";
import { PregnancyProgressTabs } from "@/components/PregnancyProgressTabs";
import { EmergencySOS } from "@/components/EmergencySOS";
import { SymptomTriageBubble } from "@/components/SymptomTriageBubble";
import { FinancialLayer } from "@/components/FinancialLayer";
import { TelemedicineSuite } from "@/components/TelemedicineSuite";
import { WearableMedicationWidgets } from "@/components/WearableMedicationWidgets";
import { AchievementsTab } from "@/components/AchievementsTab";
import { VoiceInterface } from "@/components/VoiceInterface";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { Switch } from "@/components/ui/switch";

const TABS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "ai", label: "AI", icon: Bot },
  { id: "health", label: "Health", icon: Activity },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "sounds", label: "Sounds", icon: Music },
  { id: "community", label: "Community", icon: Users },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

function Home(props: any) {
  return <Heart {...props} />;
}

const MotherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [paywallConfig, setPaywallConfig] = useState({
    isOpen: false,
    featureName: "",
    featureValue: "",
    perks: [] as string[],
    price: 0,
    onSuccess: () => {}
  });

  const pregnancyWeeks = 24;
  const totalWeeks = 40;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const triggerPaywall = (config: any) => {
    setPaywallConfig({ ...config, isOpen: true });
  };

  const toggleLiteMode = () => {
    setIsLiteMode(!isLiteMode);
    document.body.classList.toggle('lite-mode');
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30 ${isLiteMode ? 'lite-mode' : ''}`}>
      {/* Background Media */}
      {!isLiteMode && <BackgroundMedia />}
      
      {/* Top Header */}
      <header className="border-b border-white/5 backdrop-blur-2xl bg-black/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <Heart className="w-6 h-6 text-primary animate-pulse" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
              MamaCare
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex border-primary/20 bg-primary/5 text-primary font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
              Premium Member
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Minimalist Top Tab Bar (Matching Screenshot) */}
        <div className="container mx-auto px-4 md:px-8 pb-1">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar py-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === t.id 
                    ? "bg-white/10 text-white shadow-lg shadow-white/5" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-primary' : ''}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
          
          {activeTab === "overview" && (
            <div className="space-y-8">
              <DynamicGreeting userName="Sarah" />
              <PregnancyProgressTabs currentWeek={pregnancyWeeks} totalWeeks={totalWeeks} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card 
                      className="p-8 bg-white/[0.03] border-white/5 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(255,126,179,0.15)] transition-all duration-500 cursor-pointer group rounded-[32px] overflow-hidden relative"
                      onClick={() => handleTabChange("community")}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                      <MessageCircle className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xl font-black mb-2">MamaCircle</h4>
                      <p className="text-sm text-white/40 font-medium">Connect with 2.4k+ mothers in your trimester</p>
                    </Card>
                    
                    <Card 
                      className="p-8 bg-white/[0.03] border-white/5 hover:border-secondary/50 hover:shadow-[0_0_40px_rgba(78,205,196,0.15)] transition-all duration-500 cursor-pointer group rounded-[32px] overflow-hidden relative"
                      onClick={() => handleTabChange("health")}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                      <Activity className="w-10 h-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xl font-black mb-2">My Journey</h4>
                      <p className="text-sm text-white/40 font-medium">Daily health logs & symptom tracking</p>
                    </Card>
                  </div>
                  <BabyDevelopment />
                </div>
                
                <div className="space-y-8">
                  <AppointmentCountdown />
                  <WeeklyTips />
                  <MoodTracker />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[600px]">
              <div className="lg:col-span-3">
                <AIChat />
              </div>
              <div className="lg:col-span-2 space-y-8">
                <TelemedicineSuite />
                <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px]">
                  <h4 className="font-black text-xl mb-4">AI Triage Context</h4>
                  <p className="text-sm text-white/50 leading-relaxed">Dr. Nneka is analyzing your recent symptoms (mild swelling, morning nausea) alongside your 24-week profile.</p>
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Low Risk</Badge>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "health" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WearableMedicationWidgets />
                <TelemedicineSuite />
              </div>
            </div>
          )}

          {activeTab === "awards" && (
            <AchievementsTab />
          )}

          {activeTab === "sounds" && (
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="p-10 bg-white/[0.03] border-white/5 rounded-[40px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Womb Sounds</h3>
                    <p className="text-sm text-white/40 font-medium">Soothing audio for you and baby</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <AudioPlayer 
                    src="/sounds/baby-cry.mp3" 
                    label="Calming Womb Simulation"
                    loop
                  />
                  <AudioPlayer 
                    src="/sounds/baby-laugh.mp3" 
                    label="Giggle Therapy (Sarah's Favorite)"
                    loop
                  />
                </div>
              </Card>
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                  <Card className="p-10 bg-white/[0.03] border-white/5 rounded-[40px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" /> Group Chat Rooms
                      </h3>
                      <Button className="bg-primary hover:bg-primary/90 text-white font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">+ New Post</Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { id: 1, title: "3rd Trimester Mamas", lastMsg: "Eliza J: Does anyone else feel like...", online: 31, icon: "🤰", isNew: true },
                        { id: 2, title: "Pregnancy Yoga", lastMsg: "Instructor: Class starts in 10 mins!", online: 12, icon: "🧘‍♀️", isNew: false }
                      ].map((group) => (
                        <div key={group.id} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">{group.icon}</div>
                            <div>
                              <h4 className="font-black text-lg">{group.title}</h4>
                              <p className="text-sm text-white/40 mt-1">{group.lastMsg}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{group.online} online</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                   <Card className="p-10 bg-gradient-to-br from-secondary/10 to-transparent border-white/5 rounded-[40px] h-[300px] flex flex-col justify-between">
                     <div>
                       <h4 className="font-black text-2xl mb-3">Mentor Matching</h4>
                       <p className="text-sm text-white/40 leading-relaxed">Connect with an experienced mom for 1-on-1 support.</p>
                     </div>
                     <Button className="w-full bg-secondary h-14 rounded-2xl font-black">Find a Mentor</Button>
                   </Card>
                   <Card className="p-10 bg-white/[0.03] border-white/5 rounded-[40px] text-center">
                     <QrCode className="w-12 h-12 mx-auto mb-4 text-white/20" />
                     <h4 className="font-black text-xl mb-2">Partner Mode</h4>
                     <p className="text-sm text-white/40 mb-6">Invite your partner to track the journey.</p>
                     <Button variant="outline" className="w-full border-white/10 rounded-2xl font-bold">Show QR Code</Button>
                   </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <FinancialLayer />
          )}

          {activeTab === "settings" && (
            <div className="max-w-4xl space-y-8">
              <h2 className="text-3xl font-black mb-8">Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px] space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <User className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Profile & Preferences</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">Lite Mode</p>
                        <p className="text-xs text-white/40">Optimize for older devices</p>
                      </div>
                      <Switch checked={isLiteMode} onCheckedChange={toggleLiteMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">Language</p>
                      </div>
                      <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none font-bold">
                        <option>English</option>
                        <option>Swahili</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[32px] space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold">Privacy & Data</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-sm font-bold flex items-center gap-2"><CloudOff className="w-4 h-4 text-primary" /> Offline Sync</p>
                      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Active for 30 days</p>
                    </div>
                    <Button variant="outline" className="w-full border-white/10 rounded-2xl font-bold py-6">
                      <Download className="w-4 h-4 mr-2" /> Export My Data
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Nav (Sync with Top Nav) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around p-3 pb-safe">
        {TABS.slice(0, 5).map((t, index) => {
          if (index === 2) {
            return (
              <div key="center-ai" className="relative -top-5">
                <button 
                  onClick={() => handleTabChange('ai')}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/40 text-white transform transition active:scale-90"
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
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? 'text-primary' : 'text-white/30'}`}
            >
              <t.icon className="w-6 h-6" />
            </button>
          );
        })}
      </nav>

      {/* Global Elements */}
      <div className="fixed bottom-24 md:bottom-10 left-6 z-50">
        <EmergencySOS />
      </div>
      <SymptomTriageBubble />
      <VoiceInterface />
      
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
};

export default MotherDashboard;
