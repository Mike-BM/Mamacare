import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Calendar, MessageCircle, BookOpen, Baby, AlertCircle, Menu, LogOut, 
  Map, BookHeart, Users, Bot, Wallet, Settings, Activity, TrendingUp, 
  Trophy, Music, QrCode, ShieldCheck, User, CloudOff, Download, Search, MapPin,
  Play, Video, Sparkles, Check, Plus, PhoneCall, Stethoscope, Clock, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIChat } from "@/components/AIChat";

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
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const TABS = [
  { id: "overview", label: "Overview", icon: Heart },
  { id: "ai", label: "AI Chat", icon: Bot },
  { id: "health", label: "Health", icon: Activity },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "community", label: "Community", icon: Users },
  { id: "wallet", label: "MamaFund", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

const MotherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [tierIdx, setTierIdx] = useState(2);
  
  const pregnancyWeeks = 24;
  const totalWeeks = 40;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const toggleLiteMode = () => {
    setIsLiteMode(!isLiteMode);
    document.body.classList.toggle('lite-mode');
  };

  const TIERS = [
    { price: 0, label: "Free", perks: ["Basic tracking", "Community access"] },
    { price: 3, label: "Essential", perks: ["AI assistant", "Weekly tips", "Mentor matching"] },
    { price: 7, label: "Plus", perks: ["Telemedicine credits", "Wearable sync", "Priority SOS"] },
    { price: 15, label: "Premium", perks: ["Unlimited video calls", "Insurance included", "24/7 nurse"] },
  ];
  const tier = TIERS[tierIdx];

  return (
    <div className={`min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30 ${isLiteMode ? 'lite-mode' : ''}`}>
      {!isLiteMode && <BackgroundMedia />}
      
      {/* Premium Header */}
      <header className="border-b border-white/5 backdrop-blur-2xl bg-black/40 sticky top-0 z-50">
        <div className="border-b border-white/5">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar py-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === t.id 
                      ? "bg-white/10 text-white shadow-lg shadow-white/5" 
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? 'text-primary' : ''}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <Heart className="w-5 h-5 text-primary animate-pulse" fill="currentColor" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
              MamaCare
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex border-primary/20 bg-primary/5 text-primary font-bold px-2 py-0.5 uppercase tracking-widest text-[9px]">
              Premium Member
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all w-8 h-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-4 animate-fade-in-up">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <DynamicGreeting userName="Stacy Mutheu" />
              <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
                {/* Left Column (55%) */}
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                      <Baby className="w-6 h-6 text-primary" />
                      Pregnancy Progress
                    </h3>
                    <span className="text-4xl font-black text-primary">{pregnancyWeeks} weeks</span>
                  </div>
                  <div className="space-y-6">
                    <div className="relative">
                      <Progress value={(pregnancyWeeks/totalWeeks)*100} className="h-4 bg-white/5" />
                      <div className="flex justify-between mt-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <span>Conception</span>
                        <span>{totalWeeks - pregnancyWeeks} weeks to go</span>
                        <span>Delivery</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-1">Baby Size</p>
                        <p className="text-xl font-bold">Papaya</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-black text-white/40 uppercase mb-1">Trimester</p>
                        <p className="text-xl font-bold">Second</p>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-black text-sm">
                      <BookOpen className="w-4 h-4 mr-2" /> Read Weekly Tips
                    </Button>
                  </div>
                </Card>

                {/* Right Column (40%) */}
                <AppointmentCountdown />
              </div>

              {/* Below Full Width */}
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Daily Weight", done: true, icon: TrendingUp },
                      { label: "Folic Acid", done: false, icon: Zap },
                      { label: "Blood Sugar", done: true, icon: Activity },
                      { label: "Mood Log", done: false, icon: Heart }
                    ].map((task, i) => (
                      <Card key={i} className={`p-4 rounded-2xl border transition-all ${task.done ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.03] border-white/5'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.done ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                            <task.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{task.label}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{task.done ? 'Completed' : 'Pending'}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                 </div>
                 <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Community Pulse</h4>
                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                       {[
                         "Trending: Hospital bag essentials 🎒",
                         "24 mothers started 3rd trimester today! 🎉",
                         "New Topic: Cultural birth traditions 🌍",
                         "Live: Prenatal yoga with Dr. Sarah 🧘‍♀️"
                       ].map((topic, i) => (
                         <div key={i} className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 whitespace-nowrap text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer">
                           {topic}
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
            </div>
          )}

          {/* AI CHAT TAB */}
          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6 min-h-[600px]">
              {/* Left Column (55%) */}
              <AIChat />

              {/* Right Column (40%) */}
              <div className="space-y-4">
                <Card className="p-5 bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive/20 rounded-2xl">
                   <h4 className="text-sm font-black uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" /> Risk Assessment
                   </h4>
                   <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-black/40 border border-destructive/10">
                        <p className="text-xs font-bold mb-1">Blood Pressure</p>
                        <p className="text-sm text-white/60">Slightly elevated (135/85). Monitor for headache.</p>
                      </div>
                      <Badge className="bg-destructive text-white font-bold">Priority Triage Active</Badge>
                   </div>
                </Card>
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-4">Recommended Topics</h4>
                   <div className="space-y-2">
                      {["Preeclampsia signs", "Iron-rich recipes", "Swelling relief", "Sleep positions"].map((t) => (
                        <Button key={t} variant="ghost" className="w-full justify-start hover:bg-white/5 h-10 rounded-xl text-sm font-medium">
                          {t}
                        </Button>
                      ))}
                   </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                   <Button variant="outline" className="h-16 rounded-2xl border-white/5 bg-white/[0.03] font-black text-xs uppercase tracking-widest flex flex-col gap-1">
                      <Clock className="w-4 h-4" /> History
                   </Button>
                   <Button variant="outline" className="h-16 rounded-2xl border-white/5 bg-white/[0.03] font-black text-xs uppercase tracking-widest flex flex-col gap-1">
                      <MapPin className="w-4 h-4" /> Clinics
                   </Button>
                </div>
              </div>
            </div>
          )}

          {/* HEALTH TAB */}
          {activeTab === "health" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
                <WearableMedicationWidgets />
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                         <Activity className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">Apple Watch Sync</h4>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Active Heart Rate</p>
                      </div>
                   </div>
                   <p className="text-5xl font-black text-secondary">78 <span className="text-xl font-bold opacity-40">BPM</span></p>
                </Card>
              </div>

              <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-6">Smart Scale Progress (Weight Tracking)</h4>
                 <div className="h-[200px] w-full bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white/10" />
                 </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                   <h4 className="text-xl font-black mb-4 flex items-center gap-3">
                     <Zap className="w-6 h-6 text-primary" /> Medications Checklist
                   </h4>
                   <div className="space-y-3">
                      {["Prenatal Vitamin", "Iron Supplement", "Calcium"].map((m) => (
                        <div key={m} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                           <span className="font-bold">{m}</span>
                           <Switch />
                        </div>
                      ))}
                   </div>
                </Card>
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                   <h4 className="text-xl font-black mb-4 flex items-center gap-3">
                     <BookHeart className="w-6 h-6 text-secondary" /> Health Journal
                   </h4>
                   <textarea 
                     placeholder="How are you feeling today?"
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm min-h-[140px] focus:outline-none focus:border-secondary transition-all"
                   />
                </Card>
              </div>

              <MoodTracker />
            </div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === "appointments" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                   <h3 className="text-2xl font-black mb-6">Upcoming Schedule</h3>
                   <div className="space-y-4">
                      {[
                        { date: "Dec 15, 2026", time: "10:00 AM", doctor: "Dr. Emily Chen", type: "Regular Checkup" },
                        { date: "Dec 22, 2026", time: "2:00 PM", doctor: "Dr. Jane Keith", type: "Ultrasound" }
                      ].map((apt, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                                 {apt.date.split(' ')[1].replace(',','')}
                              </div>
                              <div>
                                <p className="font-black">{apt.type}</p>
                                <p className="text-xs text-white/40">{apt.doctor} • {apt.time}</p>
                              </div>
                           </div>
                           <Button variant="outline" className="rounded-xl border-white/10 hover:bg-primary hover:text-white">Join Call</Button>
                        </div>
                      ))}
                   </div>
                </Card>

                <div className="space-y-4">
                   <TelemedicineSuite />
                   <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-4">Appointment Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="text-center">
                            <p className="text-2xl font-black">8</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Total Visits</p>
                         </div>
                         <div className="text-center">
                            <p className="text-2xl font-black">2</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Next Month</p>
                         </div>
                      </div>
                   </Card>
                </div>
              </div>

              <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                 <h4 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Past Appointments</h4>
                 <div className="opacity-40 space-y-2">
                    <p className="text-xs font-bold">Nov 20, 2026 — Blood Test (Dr. Emily Chen)</p>
                    <p className="text-xs font-bold">Oct 15, 2026 — Initial Consultation (Dr. Jane Keith)</p>
                 </div>
              </Card>
            </div>
          )}

          {/* COMMUNITY TAB */}
          {activeTab === "community" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
                <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-black">Group Chat Rooms</h3>
                     <Button className="bg-primary h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest">New Post</Button>
                   </div>
                   <div className="space-y-3">
                      {[
                        { title: "3rd Trimester Mamas", online: 31, icon: "🤰" },
                        { title: "Pregnancy Yoga", online: 12, icon: "🧘‍♀️" },
                        { title: "Nutrition Tips", online: 45, icon: "🥗" }
                      ].map((room, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <span className="text-2xl">{room.icon}</span>
                              <div>
                                 <p className="font-bold">{room.title}</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">{room.online} online</p>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><MessageCircle className="w-5 h-5" /></Button>
                        </div>
                      ))}
                   </div>
                </Card>

                <div className="space-y-4">
                   <Card className="p-6 bg-gradient-to-br from-secondary/20 to-transparent border-secondary/20 rounded-2xl h-[260px] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
                      <div>
                        <h4 className="font-black text-2xl mb-2">Mentor Matching</h4>
                        <p className="text-sm text-white/50 leading-relaxed">Connect with an experienced mom for 1-on-1 support and guidance.</p>
                      </div>
                      <Button className="w-full bg-secondary h-12 rounded-xl font-black text-sm">Find a Mentor</Button>
                   </Card>
                   <Card className="p-6 bg-white/[0.03] border-white/5 rounded-2xl text-center">
                      <QrCode className="w-12 h-12 mx-auto mb-4 text-white/20" />
                      <h4 className="font-black text-lg mb-1">Partner Mode</h4>
                      <p className="text-xs text-white/40 mb-4 uppercase tracking-widest font-black">Scan to Link Account</p>
                      <Button variant="outline" className="w-full border-white/10 rounded-xl font-bold h-11">Show QR Code</Button>
                   </Card>
                </div>
              </div>
              <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-4">Trending Community Topics</h4>
                 <div className="flex flex-wrap gap-2">
                    {["#HospitalBag", "#FirstKick", "#SleepTips", "#HealthyEating", "#BabyShower"].map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-white/5 border-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest">{tag}</Badge>
                    ))}
                 </div>
              </Card>
            </div>
          )}

          {/* MAMAFUND TAB */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
                <Card className="p-6 bg-gradient-to-br from-tertiary/10 via-card to-primary/10 border-tertiary/30 rounded-2xl">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-black flex items-center gap-3">
                       <Sparkles className="w-6 h-6 text-tertiary" /> MamaCare Plus
                     </h3>
                     <Badge className="bg-tertiary/20 text-tertiary border-tertiary/40 px-3 py-1 uppercase font-black text-[10px] tracking-widest">{tier.label}</Badge>
                   </div>
                   <div className="space-y-8">
                      <div>
                        <div className="flex items-baseline justify-between mb-4">
                          <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Pricing Plan</span>
                          <span className="text-5xl font-black text-white">${tier.price}<span className="text-lg font-bold opacity-40">/mo</span></span>
                        </div>
                        <Slider value={[tierIdx]} min={0} max={3} step={1} onValueChange={(v) => setTierIdx(v[0])} className="my-8" />
                        <div className="grid grid-cols-2 gap-4 mt-8">
                           {tier.perks.map(p => (
                             <div key={p} className="flex items-center gap-3 text-sm font-medium p-3 rounded-xl bg-white/5 border border-white/5">
                                <Check className="w-4 h-4 text-primary" /> {p}
                             </div>
                           ))}
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-tertiary to-primary h-14 rounded-2xl font-black shadow-xl shadow-tertiary/20">
                        {tier.price === 0 ? "Continue Free" : `Subscribe Now — $${tier.price}/mo`}
                      </Button>
                      <div className="flex justify-center gap-6 opacity-40">
                         <ShieldCheck className="w-6 h-6" />
                         <Users className="w-6 h-6" />
                         <Heart className="w-6 h-6" />
                      </div>
                   </div>
                </Card>

                <div className="space-y-4">
                   <Card className="p-8 bg-white/[0.03] border-white/5 rounded-2xl text-center relative overflow-hidden h-[300px] flex flex-col justify-center">
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Your Impact</p>
                      <p className="text-6xl font-black text-primary mb-2">4.2k</p>
                      <p className="text-sm font-bold text-white/60 mb-6 leading-relaxed">Mothers supported through community pooling this month.</p>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Top Sponsor</p>
                         <p className="text-sm font-black">City Health Foundation</p>
                      </div>
                   </Card>
                </div>
              </div>

              <Card className="p-6 bg-white/[0.03] border-white/5 rounded-2xl">
                 <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-8 items-center">
                    <div>
                       <h4 className="text-xl font-black mb-2 flex items-center gap-3">
                         <Wallet className="w-6 h-6 text-secondary" /> Emergency Wallet
                       </h4>
                       <p className="text-sm text-white/40 font-medium mb-6">Secured funds for delivery and emergency transport.</p>
                       <div className="flex gap-3">
                          {[5, 10, 25, 50].map(amt => (
                            <Button key={amt} variant="outline" className="flex-1 h-12 rounded-xl border-white/10 hover:bg-secondary hover:text-white font-black">+ ${amt}</Button>
                          ))}
                       </div>
                    </div>
                    <div className="flex justify-center">
                       <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * 0.7} className="text-secondary transition-all duration-1000" />
                          </svg>
                          <span className="absolute text-2xl font-black">$42</span>
                       </div>
                    </div>
                 </div>
              </Card>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.375fr_1fr] gap-6">
              <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl space-y-6">
                 <h3 className="text-2xl font-black mb-4">Account Settings</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                       <div>
                          <p className="font-black">Lite Mode</p>
                          <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Optimized for low bandwidth</p>
                       </div>
                       <Switch checked={isLiteMode} onCheckedChange={toggleLiteMode} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                       <div>
                          <p className="font-black">Push Notifications</p>
                          <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Daily tips & reminders</p>
                       </div>
                       <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                       <div>
                          <p className="font-black">Language Preference</p>
                          <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Current: English</p>
                       </div>
                       <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider outline-none">
                          <option>English</option>
                          <option>Swahili</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <Card className="p-5 bg-white/[0.03] border-white/5 rounded-2xl space-y-6">
                 <h3 className="text-2xl font-black mb-4">Privacy & Data</h3>
                 <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                       <p className="text-sm font-black flex items-center gap-2 text-primary">
                          <ShieldCheck className="w-4 h-4" /> Military-Grade Encryption
                       </p>
                       <p className="text-xs text-white/60 mt-1">Your health data is end-to-end encrypted and never shared without permission.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <Button variant="outline" className="h-20 rounded-2xl border-white/5 bg-white/[0.03] font-black text-[10px] uppercase tracking-widest flex flex-col gap-2">
                          <CloudOff className="w-5 h-5 text-secondary" /> Offline Mode
                       </Button>
                       <Button variant="outline" className="h-20 rounded-2xl border-white/5 bg-white/[0.03] font-black text-[10px] uppercase tracking-widest flex flex-col gap-2">
                          <Download className="w-5 h-5 text-tertiary" /> Export Data
                       </Button>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold">Research Opt-in</p>
                          <Switch />
                       </div>
                       <p className="text-[10px] text-white/40 leading-relaxed">Help us improve maternal health outcomes across Africa by sharing anonymized metrics.</p>
                    </div>
                 </div>
              </Card>
            </div>
          )}

          {/* AWARDS TAB */}
          {activeTab === "awards" && (
            <AchievementsTab />
          )}

        </div>
      </main>

      <div className="fixed bottom-24 md:bottom-10 left-6 z-50">
        <EmergencySOS />
      </div>
      <SymptomTriageBubble />
      <VoiceInterface />
      
      <PaywallOverlay 
        isOpen={false}
        onClose={() => {}}
        onSuccess={() => {}}
        featureName=""
        featureValue=""
        perks={[]}
        price={0}
      />
    </div>
  );
};

export default MotherDashboard;
