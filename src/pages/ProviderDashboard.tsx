import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Calendar, Users, Clock, CheckCircle2, XCircle, 
  Plus, Video, FileText, Settings, LogOut,
  ChevronRight, CalendarDays, User, Phone, Info, Loader2,
  MessageSquare, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { VideoCallModal } from "@/components/VideoCallModal";
import { supabase } from "@/integrations/supabase/client";
import { DoctorChat } from "@/components/DoctorChat";

const PROVIDER_TABS = [
  { id: "schedule", label: "Today's Schedule", icon: Calendar },
  { id: "inbox", label: "Inbox (Chat)", icon: MessageSquare },
  { id: "availability", label: "Manage Availability", icon: Clock },
  { id: "patients", label: "My Patients", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const TabNavigator = ({ currentTabId, onTabChange }: { currentTabId: string, onTabChange: (id: string) => void }) => {
  const currentIndex = PROVIDER_TABS.findIndex(t => t.id === currentTabId);
  const prevTab = currentIndex > 0 ? PROVIDER_TABS[currentIndex - 1] : null;
  const nextTab = currentIndex < PROVIDER_TABS.length - 1 ? PROVIDER_TABS[currentIndex + 1] : null;

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

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("schedule");

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [currentRoomUrl, setCurrentRoomUrl] = useState(""); 
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      fetchSchedule();
      return;
    }

    fetchSchedule();

    const channel = supabase
      .channel('provider-appointment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        fetchSchedule();
        if (payload.eventType === 'INSERT') {
          toast.success("📅 New Appointment Booked: A patient has requested a consultation!", {
            duration: 8000,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      const storedName = localStorage.getItem("demoProfileName");
      setProviderProfile({
        full_name: storedName || "Dr. Nneka",
        specialty: "Maternal Health Specialist",
        avatar_url: ""
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('providers')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data) setProviderProfile(data);
        }
      } catch (err) {
        console.error("Error fetching provider profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const fetchSchedule = async () => {
    setIsLoading(true);
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      setSchedule([
        {
          id: 101,
          patient: "Mariam Osei",
          time: "Today, 10:00 AM",
          status: "pending",
          type: "video",
          patientDetails: {
            full_name: "Mariam Osei",
            phone: "+254 712 345678",
            due_date: "2026-08-15"
          }
        },
        {
          id: 102,
          patient: "Amina Yusuf",
          time: "Today, 11:30 AM",
          status: "confirmed",
          type: "in-person",
          patientDetails: {
            full_name: "Amina Yusuf",
            phone: "+254 722 987654",
            due_date: "2026-09-01"
          }
        },
        {
          id: 103,
          patient: "Jane Doe",
          time: "Today, 02:00 PM",
          status: "confirmed",
          type: "video",
          patientDetails: {
            full_name: "Jane Doe",
            phone: "+254 733 111222",
            due_date: "2026-10-10"
          }
        }
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          mothers (
            due_date,
            profiles:user_id (
              full_name,
              email
            )
          )
        `)
        .order('appointment_date', { ascending: false });

      if (!error && data) {
        setSchedule(data.map(apt => ({
          id: apt.id,
          patient: apt.mothers?.profiles?.full_name || "Unknown Patient",
          time: apt.appointment_date ? new Date(apt.appointment_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "TBD",
          status: apt.status,
          type: apt.appointment_type,
          patientDetails: {
            full_name: apt.mothers?.profiles?.full_name,
            phone: apt.mothers?.profiles?.email || "—",
            due_date: apt.mothers?.due_date
          }
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [availability, setAvailability] = useState([
    { day: "Monday", slots: ["09:00 - 12:00", "14:00 - 17:00"] },
    { day: "Tuesday", slots: ["09:00 - 12:00"] },
    { day: "Wednesday", slots: ["14:00 - 17:00"] },
    { day: "Thursday", slots: ["09:00 - 12:00", "14:00 - 17:00"] },
    { day: "Friday", slots: ["09:00 - 12:00"] },
  ]);

  const handleAction = async (id: number | string, action: 'Confirm' | 'Reject' | 'Reschedule' | 'Message' | 'Mark No-Show') => {
    const demoBypass = localStorage.getItem("demoBypass");
    
    if (action === 'Confirm') {
      const toastId = toast.loading("Confirming appointment and sending SMS...");
      if (demoBypass) {
        setSchedule(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
        toast.success("Appointment confirmed! SMS/WhatsApp confirmation sent.", { id: toastId });
      } else {
        const { error } = await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id);
        if (error) {
          toast.error("Failed to confirm: " + error.message, { id: toastId });
        } else {
          toast.success("Appointment confirmed successfully!", { id: toastId });
          fetchSchedule();
        }
      }
    } 
    else if (action === 'Reject') {
      const reason = window.prompt("Reason for declining this appointment:\n1. Not my specialty\n2. Fully booked that day\n3. On leave\n4. Patient needs in-person care");
      if (reason === null) return;
      
      const toastId = toast.loading("Declining appointment...");
      if (demoBypass) {
        setSchedule(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
        toast.success("Appointment declined. Offered patient replacement doctor match.", { id: toastId });
      } else {
        const { error } = await supabase.from('appointments').update({ status: 'cancelled', notes: `Declined: ${reason}` }).eq('id', id);
        if (error) {
          toast.error("Failed to decline: " + error.message, { id: toastId });
        } else {
          toast.success("Appointment declined successfully.", { id: toastId });
          fetchSchedule();
        }
      }
    }
    else if (action === 'Reschedule') {
      const newTime = window.prompt("Suggest alternative times (e.g., 'Friday 2 PM', 'Monday 10 AM'):", "Friday 2 PM");
      if (!newTime) return;
      toast.success(`Reschedule proposal sent: "${newTime}". Waiting for response.`);
      if (demoBypass) {
        setSchedule(prev => prev.map(a => a.id === id ? { ...a, time: newTime, status: 'pending' } : a));
      }
    }
    else if (action === 'Message') {
      setActiveTab('inbox');
      toast.info("Opening patient telemedicine chat.");
    }
    else if (action === 'Mark No-Show') {
      if (demoBypass) {
        setSchedule(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
        toast.success("Marked as No-Show.");
      } else {
        await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
        fetchSchedule();
      }
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-background relative overflow-x-hidden flex flex-col md:flex-row">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-full md:w-[280px] glass-card border-r border-white/10 p-6 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary animate-pulse" fill="currentColor" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Nneka Health
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: "schedule", label: "Today's Schedule", icon: Calendar },
            { id: "availability", label: "Manage Availability", icon: Clock },
            { id: "patients", label: "My Patients", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-primary/20 border-l-2 border-primary text-primary font-bold' 
                  : 'hover:bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 p-2 mb-4">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
               {providerProfile?.avatar_url ? <img src={providerProfile.avatar_url} className="w-full h-full rounded-full" /> : "👩‍⚕️"}
             </div>
             <div className="flex-1 min-w-0">
               <p className="font-bold text-white truncate">{providerProfile?.full_name || "Doctor"}</p>
               <p className="text-xs text-white/50 truncate">{providerProfile?.specialty || "Generalist"}</p>
             </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive gap-3 rounded-xl"
            onClick={async () => {
              const demoBypass = localStorage.getItem("demoBypass");
              localStorage.removeItem("demoBypass");
              if (!demoBypass) {
                try {
                  await supabase.auth.signOut();
                } catch (e) {
                  console.error("Sign out error:", e);
                }
              }
              navigate("/");
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        <header className="mb-8">
           <h2 className="text-3xl font-black text-white mb-1">Good Morning, Doctor! ✨</h2>
           <p className="text-white/60 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </header>

        {providerProfile && providerProfile.verification_status !== 'verified' && (
          <Card className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">License Verification Required</h4>
                <p className="text-xs text-white/60">Please submit your KMPDC license number to enable appointment booking.</p>
              </div>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
              onClick={() => {
                const license = window.prompt("Enter your KMPDC License Number:");
                if (license) {
                  const demoBypass = localStorage.getItem("demoBypass");
                  if (demoBypass) {
                    setProviderProfile({
                      ...providerProfile,
                      kmpdc_license: license,
                      verification_status: 'pending'
                    });
                    toast.success("License submitted! Verification is in progress (Demo Mode).");
                  } else {
                    toast.promise(
                      supabase.from('providers').update({ kmpdc_license: license, verification_status: 'pending' }).eq('id', providerProfile.id),
                      {
                        loading: 'Submitting license...',
                        success: 'License submitted! Verification is in progress.',
                        error: 'Failed to submit license.'
                      }
                    );
                  }
                }
              }}
            >
              Verify Now
            </Button>
          </Card>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >

        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Schedule List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 glass-card border-white/10 h-full">
                <div className="flex flex-row items-center justify-between flex-wrap gap-4 mb-8">
                   <h3 className="text-xl font-bold flex items-center gap-3">
                     <CalendarDays className="w-5 h-5 text-primary" />
                     Today's Appointments
                   </h3>
                   <Badge className="bg-primary/20 text-primary border-primary/30">{schedule.filter(a => a.status === 'pending').length} Pending</Badge>
                </div>

                <div className="space-y-4">
                  {schedule.map((apt) => (
                    <div 
                      key={apt.id}
                      className={`p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex items-center justify-between gap-4 ${apt.status === 'available' ? 'opacity-50 border-dashed' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/10">
                           <span className="text-xs font-bold text-white/50">{apt.time.split(' ')[1]}</span>
                           <span className="text-sm font-black text-white">{apt.time.split(' ')[0]}</span>
                        </div>
                        <div>
                          <p className={`font-bold ${apt.status === 'available' ? 'text-white/30 italic' : 'text-white'}`}>{apt.patient}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {apt.status !== 'available' && (
                              <Badge variant="outline" className={`text-[10px] h-5 ${
                                apt.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`}>
                                {apt.status}
                              </Badge>
                            )}
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{apt.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <Button 
                              size="icon" 
                              variant="glass" 
                              className="w-9 h-9 rounded-full text-green-400 hover:bg-green-400/20"
                              onClick={() => handleAction(apt.id, 'Confirm')}
                              title="Confirm"
                            >
                              <CheckCircle2 className="w-4.5 h-4.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="glass" 
                              className="w-9 h-9 rounded-full text-yellow-400 hover:bg-yellow-400/20"
                              onClick={() => handleAction(apt.id, 'Reschedule')}
                              title="Suggest Alternative Time"
                            >
                              <Clock className="w-4.5 h-4.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="glass" 
                              className="w-9 h-9 rounded-full text-blue-400 hover:bg-blue-400/20"
                              onClick={() => handleAction(apt.id, 'Message')}
                              title="Message Patient"
                            >
                              <MessageSquare className="w-4.5 h-4.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="glass" 
                              className="w-9 h-9 rounded-full text-destructive hover:bg-destructive/10"
                              onClick={() => handleAction(apt.id, 'Reject')}
                              title="Decline"
                            >
                              <XCircle className="w-4.5 h-4.5" />
                            </Button>
                          </div>
                        )}
                        {apt.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[10px] h-8 text-white/40 hover:text-destructive"
                            onClick={() => handleAction(apt.id, 'Mark No-Show')}
                          >
                            No-Show
                          </Button>
                        )}
                        {apt.status !== 'available' && (
                          <Button 
                            size="icon" 
                            variant="glass" 
                            className="w-10 h-10 rounded-full text-white/50 hover:text-white"
                            onClick={() => setSelectedPatient({ name: apt.patient, time: apt.time })}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        )}
                        {apt.status === 'available' && (
                          <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full text-primary hover:bg-primary/20">
                            <Plus className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions / Detail View Sidebar */}
            <div className="space-y-6">
              {selectedPatient ? (
                <Card className="p-6 glass-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Patient Details</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)} className="h-8 w-8 rounded-full">
                       <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">🤰</div>
                      <div>
                        <h4 className="text-xl font-black text-white">{selectedPatient.name}</h4>
                        <p className="text-sm text-primary font-bold">Week 24 • High Risk</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-[10px] text-white/40 uppercase font-black mb-1">Due Date</p>
                         <p className="text-sm font-bold text-white">Aug 15, 2026</p>
                       </div>
                       <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-[10px] text-white/40 uppercase font-black mb-1">Contact</p>
                         <p className="text-sm font-bold text-white">0712 345 ...</p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-xs font-bold text-white/60">Current Complaint</p>
                       <p className="text-sm text-white/90 italic p-3 bg-white/5 rounded-xl border border-white/5">"Frequent headaches and swollen ankles since Friday morning."</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                       <Button 
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        disabled={isGeneratingRoom}
                        onClick={async () => {
                          setIsGeneratingRoom(true);
                          const toastId = toast.loading("Initializing secure video room...");
                          
                          const demoBypass = localStorage.getItem("demoBypass");
                          if (demoBypass) {
                            setTimeout(() => {
                              setCurrentRoomUrl("https://meet.jit.si/NnekaHealthDemoConsultationRoom");
                              setIsVideoCallOpen(true);
                              toast.dismiss(toastId);
                              setIsGeneratingRoom(false);
                            }, 1000);
                            return;
                          }

                          try {
                            const { data, error } = await supabase.functions.invoke('create-video-room', {
                              body: { appointment_id: selectedPatient?.id || 'demo' }
                            });

                            if (error || !data?.url) {
                              toast.error("Video consultation is only available for confirmed appointments.");
                              toast.dismiss(toastId);
                              return;
                            }

                            setCurrentRoomUrl(data.url);
                            setIsVideoCallOpen(true);
                            toast.dismiss(toastId);
                          } catch (err) {
                            toast.error("Could not connect to consultation. Please check your internet.");
                            toast.dismiss(toastId);
                          } finally {
                            setIsGeneratingRoom(false);
                          }
                        }}
                       >
                         {isGeneratingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                         Start Video Consultation
                       </Button>
                       <Button variant="outline" className="w-full h-12 border-white/10 hover:bg-white/5 rounded-xl gap-2">
                         <FileText className="w-5 h-5" />
                         Write Progress Notes
                       </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 glass-card border-white/10 h-full flex flex-col items-center justify-center text-center py-12">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Info className="w-8 h-8 text-white/20" />
                   </div>
                   <h4 className="font-bold text-white/40">Select a patient to see details</h4>
                   <p className="text-xs text-white/20 mt-2 px-6">Click on the arrow next to an appointment to view health history and start sessions.</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="space-y-6 animate-fade-in-right">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" /> Provider Consultation Inbox
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">KMPDC Encrypted Link</span>
              </div>
            </div>
            <DoctorChat perspective="provider" />
          </div>
        )}

        {activeTab === "availability" && (
          <div className="space-y-6">
            <Card className="p-6 glass-card border-white/10">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">Weekly Availability</h3>
                    <p className="text-sm text-white/50">Set your recurring working hours</p>
                  </div>
                  <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl gap-2">
                    <Plus className="w-4 h-4" />
                    Add Time Block
                  </Button>
               </div>

               <div className="space-y-4">
                  {availability.map((day) => (
                    <div key={day.day} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                         <span className="w-24 font-black text-white/80">{day.day}</span>
                         <div className="flex flex-wrap gap-2">
                           {day.slots.map((slot, i) => (
                             <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 flex items-center gap-2">
                               {slot}
                               <button className="hover:text-destructive transition-colors"><XCircle className="w-3 h-3" /></button>
                             </Badge>
                           ))}
                         </div>
                       </div>
                       <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                         <Plus className="w-4 h-4" />
                       </Button>
                    </div>
                  ))}
               </div>

               <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                  <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Vacation & Block Outs
                  </h4>
                  <p className="text-xs text-white/60 mb-4">No block-outs scheduled for this month.</p>
                  <Button variant="outline" className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10 h-10 rounded-xl">Manage Exceptions</Button>
               </div>
            </Card>
          </div>
        )}

        {activeTab === "patients" && (
          <Card className="p-6 glass-card border-white/10">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold">My Patient Roster</h3>
               <div className="flex gap-2">
                  <Button variant="outline" className="border-white/10 h-10 rounded-xl px-4">Filter</Button>
                  <Button className="bg-primary hover:bg-primary/90 h-10 rounded-xl px-4">Search</Button>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Jane Muthoni", week: 24, status: "High Risk" },
                  { name: "Mary Ochieng", week: 12, status: "Stable" },
                  { name: "Stacy Mutheu", week: 32, status: "Stable" },
                  { name: "Emily Brian", week: 28, status: "High Risk" },
                ].map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🤰</div>
                       <div>
                         <p className="font-bold text-white">{p.name}</p>
                         <p className="text-[10px] text-white/40 uppercase font-black">Week {p.week}</p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <Badge variant="outline" className={p.status === 'High Risk' ? 'text-destructive border-destructive/20 bg-destructive/10' : 'text-green-400 border-green-400/20 bg-green-400/10'}>
                          {p.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-white/10 font-bold">View History</Button>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        )}
          </motion.div>
        </AnimatePresence>

        <TabNavigator currentTabId={activeTab} onTabChange={setActiveTab} />
      </main>

      <VideoCallModal 
        isOpen={isVideoCallOpen} 
        onClose={() => setIsVideoCallOpen(false)} 
        roomUrl={currentRoomUrl}
        patientName={selectedPatient?.name}
      />
    </div>
  );
};

export default ProviderDashboard;
