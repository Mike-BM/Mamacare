import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Users, AlertCircle, Bell, LogOut, Droplet, TrendingUp, CheckCircle2, MessageCircle, Settings, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BloodDonorNetwork } from "@/components/BloodDonorNetwork";
import { toast } from "sonner";
import { AmbulanceTrackerMap } from "@/components/AmbulanceTrackerMap";

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const appointments = [
    { id: 1, patient: "Eliza Keith", time: "10:00 AM", status: "pending", type: "Checkup", priority: "normal" },
    { id: 2, patient: "Stacy Mutheu", time: "11:30 AM", status: "confirmed", type: "Ultrasound", priority: "high" },
    { id: 3, patient: "Emily Brian", time: "2:00 PM", status: "pending", type: "Consultation", priority: "normal" },
  ];

  const sosAlerts = [
    { id: 1, patient: "Jane John", severity: "high", time: "5 mins ago", location: "Zone A, Floor 2", lat: -1.280000, lng: 36.820000 },
    { id: 2, patient: "Lisa Wanjiru", severity: "medium", time: "12 mins ago", location: "Emergency Ward", lat: -1.295000, lng: 36.810000 },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-secondary animate-pulse" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                City Medical Center
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Healthcare Provider Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-full transition-transform active:scale-95">
              <Bell className="w-5 h-5 text-white/80" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </Button>
            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Today's Appointments", value: "12", icon: Calendar, color: "text-secondary", delay: "0s" },
            { label: "Active Patients", value: "248", icon: Users, color: "text-primary", delay: "0.1s" },
            { label: "Emergency Alerts", value: sosAlerts.length, icon: AlertCircle, color: "text-destructive", delay: "0.2s" }
          ].map((stat, i) => (
            <Card key={i} className="p-6 glass-card border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group animate-fade-in-up" style={{ animationDelay: stat.delay }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <Calendar className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="queue" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <Users className="w-4 h-4 mr-2" /> Patient Queue
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <Heart className="w-4 h-4 mr-2" /> Resources
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <TrendingUp className="w-4 h-4 mr-2" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <MapPin className="w-4 h-4 mr-2" /> Live Map
              </TabsTrigger>
              <TabsTrigger value="donors" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">
                <Droplet className="w-4 h-4 mr-2" /> Blood Network
              </TabsTrigger>
            </TabsList>
            <div className="hidden sm:flex gap-2">
              <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold">Export Report</Button>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 rounded-xl text-xs font-bold">Add Patient</Button>
            </div>
          </div>

          <TabsContent value="donors" className="animate-fade-in focus-visible:outline-none">
            <div className="max-w-4xl mx-auto">
              <BloodDonorNetwork />
            </div>
          </TabsContent>

          <TabsContent value="map" className="animate-fade-in focus-visible:outline-none">
            <div className="max-w-6xl mx-auto">
              <Card className="p-6 glass-card border-white/10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-destructive animate-pulse" />
                  </div>
                  Live Emergency & Ambulance Tracker
                </h3>
                <AmbulanceTrackerMap hospitalLocation={{ lat: -1.286389, lng: 36.817223 }} activeAlerts={sosAlerts} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="animate-fade-in focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Appointments List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 glass-card border-white/10 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-secondary" />
                      </div>
                      Today's Schedule
                    </h3>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 font-bold px-3 py-1">3 Pending</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {appointments.map((apt, index) => (
                      <div
                        key={apt.id}
                        className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-secondary/20 bg-secondary/10 flex items-center justify-center text-base sm:text-lg shadow-inner shrink-0">
                              {apt.patient[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-base sm:text-lg text-white group-hover:text-secondary transition-colors truncate">{apt.patient}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px] h-5 bg-white/5 border-white/10">{apt.type}</Badge>
                                {apt.priority === 'high' && <Badge variant="destructive" className="text-[10px] h-5 animate-pulse">High Priority</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                            <p className="text-lg sm:text-xl font-black text-white/90">{apt.time}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest sm:mt-1">{apt.status}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-white/5 gap-4">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                             <div className="flex -space-x-2">
                               {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-background bg-white/10 flex items-center justify-center text-[8px]">🏥</div>)}
                             </div>
                             <span className="text-[10px] text-muted-foreground font-bold flex items-center shrink-0">History Available</span>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            <Button size="sm" variant="ghost" className="flex-1 sm:flex-none h-9 px-4 rounded-xl hover:bg-white/5 font-bold text-xs">Details</Button>
                            <Button size="sm" variant={apt.status === "confirmed" ? "outline" : "secondary"} className="flex-1 sm:flex-none h-9 px-6 rounded-xl font-bold text-xs shadow-lg">
                              {apt.status === "confirmed" ? "View Chart" : "Confirm"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar Panel */}
              <div className="space-y-6">
                {/* Emergency Alerts Panel */}
                <Card className="p-6 glass-card border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-all" />
                  
                  <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-destructive animate-bounce" />
                    </div>
                    Emergency Alerts
                  </h3>
                  
                  <div className="space-y-4">
                    {sosAlerts.map((alert, index) => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-2xl bg-black/40 border border-destructive/20 animate-glow-pulse shadow-2xl relative overflow-hidden"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-bold text-white">{alert.patient}</p>
                          <Badge variant="destructive" className="bg-destructive hover:bg-destructive/90 animate-pulse text-[10px] uppercase">{alert.severity}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/50 font-bold mb-4">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {alert.location}</span>
                          <span>{alert.time}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="w-full h-10 font-black rounded-xl shadow-lg shadow-destructive/20 active:scale-95 transition-transform"
                          onClick={() => {
                            const audio = new Audio('/sounds/emergency-alert.mp3');
                            audio.play().catch(() => {});
                            toast.error(`Response team dispatched to ${alert.location} for ${alert.patient}!`, {
                              icon: '🚨',
                              duration: 5000
                            });
                          }}
                        >
                          Respond Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Actions Card */}
                <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                  <h3 className="text-lg font-black mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Calendar, label: "Schedule", color: "text-secondary" },
                      { icon: Users, label: "Patients", color: "text-primary" },
                      { icon: MessageCircle, label: "Messenger", color: "text-tertiary" },
                      { icon: Settings, label: "Settings", color: "text-muted-foreground" }
                    ].map((action, i) => (
                      <button key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group active:scale-95">
                        <action.icon className={`w-6 h-6 mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/70 group-hover:text-white">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* System Status */}
                <Card className="p-5 glass-card border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-xs font-bold text-white/70">System Normal</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">v2.4.1-stable</span>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="queue" className="animate-fade-in focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Incoming', value: '14 Mothers arriving today', icon: Users, color: 'text-primary' },
                { label: 'Waiting', value: '5 Currently in waiting area', icon: Calendar, color: 'text-secondary' },
                { label: 'In Consultation', value: '3 With Doctor', icon: Heart, color: 'text-tertiary' },
                { label: 'Completed', value: '24 Seen today', icon: CheckCircle2, color: 'text-green-500' }
              ].map((item, i) => (
                <Card key={i} className="p-6 glass-card border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <h4 className="font-bold">{item.label}</h4>
                  </div>
                  <p className="text-2xl font-black">{item.value.split(' ')[0]}</p>
                  <p className="text-xs text-white/50">{item.value.substring(item.value.indexOf(' ') + 1)}</p>
                </Card>
              ))}
            </div>
            
            <Card className="p-6 glass-card border-white/10 mt-6">
              <h3 className="text-lg font-bold mb-6">Patient Queue Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                   <div className="flex items-center gap-4">
                     <Badge className="bg-orange-500/20 text-orange-400 border-none">Waiting</Badge>
                     <span className="font-bold">Mary Ochieng</span>
                     <span className="text-xs text-white/50">Dr. Smith • Routine Checkup</span>
                   </div>
                   <span className="text-xs text-white/50">15 mins wait</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="animate-fade-in focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card border-white/10">
                <h3 className="text-lg font-bold mb-6">Bed Availability</h3>
                <div className="flex justify-between items-center mb-4">
                  <span>Maternity Ward</span>
                  <span className="font-black text-green-400">12 Available</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-6">
                  <div className="bg-green-400 h-full w-[60%]"></div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span>NICU</span>
                  <span className="font-black text-orange-400">2 Available</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full w-[85%]"></div>
                </div>
              </Card>

              <Card className="p-6 glass-card border-white/10">
                <h3 className="text-lg font-bold mb-6">Staff Roster</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">👩‍⚕️</div>
                      <span>Dr. Eliza Keith</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">On Duty</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">👨‍⚕️</div>
                      <span>Dr. Sarah Johnson</span>
                    </div>
                    <Badge className="bg-white/10 text-white/50">Off Duty</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card border-white/10">
                <h3 className="text-lg font-bold mb-6">Appointment Volume</h3>
                <div className="h-48 bg-white/5 rounded-xl border border-white/10 flex items-end justify-around p-4">
                  {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="w-8 bg-primary/40 rounded-t-sm hover:bg-primary transition-all" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6 glass-card border-white/10">
                <h3 className="text-lg font-bold mb-6">Risk Factors (Community)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Gestational Diabetes</span>
                      <span>12%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full"><div className="bg-red-400 h-full w-[12%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>High Blood Pressure</span>
                      <span>8%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full"><div className="bg-orange-400 h-full w-[8%]"></div></div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Heart className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-widest">MamaCare Portal</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">© 2026 MamaCare. Empowering mothers, nurturing futures.</p>
          <div className="flex gap-6">
            <button className="text-[10px] font-bold text-muted-foreground hover:text-white transition-colors uppercase">Support</button>
            <button className="text-[10px] font-bold text-muted-foreground hover:text-white transition-colors uppercase">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HospitalDashboard;
