import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Users, AlertCircle, Bell, LogOut, Droplet, TrendingUp, Search, MapPin, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BloodDonorNetwork } from "@/components/BloodDonorNetwork";
import { toast } from "sonner";

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const appointments = [
    { id: 1, patient: "Sarah Johnson", time: "10:00 AM", status: "pending", type: "Checkup", phone: "+234 801 234 5678" },
    { id: 2, patient: "Maria Garcia", time: "11:30 AM", status: "confirmed", type: "Ultrasound", phone: "+234 802 345 6789" },
    { id: 3, patient: "Emily Chen", time: "2:00 PM", status: "pending", type: "Consultation", phone: "+234 803 456 7890" },
  ];

  const sosAlerts = [
    { id: 1, patient: "Jane Smith", severity: "high", time: "5 mins ago", location: "Lagos Central", vitals: "BP: 160/110" },
    { id: 2, patient: "Lisa Brown", severity: "medium", time: "12 mins ago", location: "Ikeja District", vitals: "BP: 140/90" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-2xl bg-black/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <Heart className="w-7 h-7 text-secondary animate-pulse" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent tracking-tight">
                MamaCare Provider
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">City Medical Center Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-white/60">System Online</span>
            </div>
            <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-white/80" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-black" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Today's Visits", value: "12", icon: Calendar, color: "text-secondary", bg: "from-secondary/10" },
            { label: "Active Mothers", value: "248", icon: Users, color: "text-primary", bg: "from-primary/10" },
            { label: "Critical Alerts", value: sosAlerts.length, icon: AlertCircle, color: "text-destructive", bg: "from-destructive/10" },
            { label: "Blood Units", value: "42", icon: Droplet, color: "text-red-500", bg: "from-red-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 backdrop-blur-md hover:border-white/20 transition-all duration-500 group animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.bg} to-transparent flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 w-fit">
            <TabsList className="bg-transparent border-0 gap-2">
              <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-secondary data-[state=active]:text-white font-bold transition-all">
                <Activity className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="donors" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
                <Droplet className="w-4 h-4 mr-2" /> Donor Network
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-accent data-[state=active]:text-white font-bold transition-all">
                <TrendingUp className="w-4 h-4 mr-2" /> Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="donors" className="animate-fade-in-up">
            <BloodDonorNetwork />
          </TabsContent>

          <TabsContent value="overview" className="animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Appointments List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 bg-white/[0.03] border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-secondary" />
                      Queue Management
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 rounded-xl">Filter</Button>
                      <Button variant="hero" size="sm" className="rounded-xl bg-secondary hover:bg-secondary/90">Add New</Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {appointments.map((apt, index) => (
                      <div
                        key={apt.id}
                        className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {apt.patient.split(' ')[0][0]}{apt.patient.split(' ')[1][0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-bold text-lg">{apt.patient}</p>
                              <Badge variant={apt.status === "confirmed" ? "default" : "secondary"} className={apt.status === "confirmed" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/10"}>
                                {apt.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/40 font-medium flex items-center gap-2">
                              <Activity className="w-3 h-3" /> {apt.type} • {apt.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/5"><Search className="w-4 h-4 text-white/60" /></Button>
                          <Button variant="outline" className="border-white/10 hover:bg-white/5 h-11 px-6 rounded-2xl font-bold">Details</Button>
                          {apt.status === "pending" && (
                            <Button className="bg-secondary hover:bg-secondary/90 text-white h-11 px-6 rounded-2xl font-bold shadow-lg shadow-secondary/20">Confirm</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar: Emergency Alerts */}
              <div className="space-y-6">
                <Card className="p-8 bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive/20 backdrop-blur-xl rounded-[32px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-destructive animate-bounce" />
                    SOS Dispatch
                  </h3>
                  <div className="space-y-4">
                    {sosAlerts.map((alert, index) => (
                      <div
                        key={alert.id}
                        className="p-5 rounded-2xl bg-black/40 border border-destructive/20 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-bold text-lg">{alert.patient}</p>
                          <Badge variant="destructive" className="bg-destructive text-white border-0 font-bold px-3 py-1 uppercase text-[10px] tracking-widest">
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-6">
                          <p className="text-xs text-white/50 flex items-center gap-2"><MapPin className="w-3 h-3 text-destructive" /> {alert.location}</p>
                          <p className="text-xs font-mono text-destructive bg-destructive/10 p-2 rounded-lg">{alert.vitals}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="w-full h-12 rounded-2xl font-black text-sm shadow-xl shadow-destructive/20 transition-transform active:scale-95"
                          onClick={() => {
                            toast.error(`Dispatching emergency team for ${alert.patient}`);
                          }}
                        >
                          Respond Now
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Patient Records Quick Search */}
                <Card className="p-8 bg-white/[0.03] border-white/5 backdrop-blur-xl rounded-[32px]">
                  <h3 className="text-xl font-black mb-6">Patient Lookup</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="text" 
                        placeholder="Search patient ID or name..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 pl-12 pr-4 text-sm font-medium focus:border-secondary outline-none transition-all"
                      />
                    </div>
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 rounded-2xl font-bold gap-2">
                      <Users className="w-4 h-4" /> All Records
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HospitalDashboard;
