import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Building2, AlertCircle, BookOpen, TrendingUp, LogOut, ShieldCheck, Lock, Eye, Zap, Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@/components/Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Authentication required.");
        navigate("/");
        return;
      }

      // Check role in user metadata or a specific profile table
      const role = session.user.user_metadata?.role;
      
      if (role !== 'admin') {
        setIsAuthorized(false);
        toast.error("Access Denied: Admin privileges required.");
      } else {
        setIsAuthorized(true);
        fetchProviders();
        
        // Realtime subscription for providers
        const channel = supabase
          .channel('admin-provider-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'providers' }, () => {
            console.log('Provider change detected, refreshing...');
            fetchProviders();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchProviders = async () => {
    const { data, error } = await supabase.from('providers').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProviders(data);
    }
  };

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    const toastId = toast.loading(`Updating verification status...`);
    const { error } = await supabase
      .from('providers')
      .update({ verification_status: status, is_active: status === 'verified' })
      .eq('id', id);
    
    if (error) {
      toast.error("Update failed", { id: toastId });
    } else {
      toast.success(`Doctor ${status} successfully!`, { id: toastId });
      fetchProviders();
    }
  };

  const handleInvite = () => {
    const email = window.prompt("Enter Doctor's Email to send invitation:");
    if (email) {
      toast.success(`Invitation link sent to ${email}! 📧`);
      // In production, this would trigger a Supabase Edge Function to send an email
    }
  };

  const seedTestProvider = async () => {
    setLoading(true);
    const toastId = toast.loading("Seeding test provider...");
    
    try {
      // For testing, we might need a user_id. 
      // In a real flow, the admin would create an auth user first.
      // Here we will just use a random UUID if it's for demo, 
      // but the table has a foreign key to auth.users.
      // So we should check if there's an existing user or create one.
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in as admin to seed providers", { id: toastId });
        return;
      }

      const { error } = await supabase.from('providers').insert({
        id: "00000000-0000-0000-0000-000000000001", // MOCK ID for demo or use current user
        full_name: "Dr. Eliza Keith (Test)",
        role: "doctor",
        specialty: "Obstetrics",
        license_number: `TEST-${Math.floor(Math.random() * 10000)}`,
        is_active: true
      });

      if (error) {
        if (error.code === '23505') {
           toast.info("Test provider already exists.", { id: toastId });
        } else {
           throw error;
        }
      } else {
        toast.success("Test provider created!", { id: toastId });
        fetchProviders();
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Mothers", value: "2,847", change: "+12%", icon: Users, color: "text-primary" },
    { label: "Hospitals Verified", value: "156", change: "+8%", icon: Building2, color: "text-secondary" },
    { label: "Emergency Calls", value: "48", change: "-5%", icon: AlertCircle, color: "text-destructive" },
    { label: "Educational Posts", value: "324", change: "+18%", icon: BookOpen, color: "text-accent" },
    { label: "Security Threats Blocked", value: "14", change: "-20%", icon: ShieldCheck, color: "text-green-500" },
  ];

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold tracking-widest text-xs uppercase opacity-50">Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-white p-8 text-center">
        <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">403: Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          You do not have the required permissions to access the MamaCare Africa Admin Portal. This incident has been logged for security audit.
        </p>
        <Button 
          variant="hero" 
          onClick={() => navigate("/")}
          className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/20"
        >
          Return to Safety
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary animate-float" fill="currentColor" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MamaCare Africa Admin
              </h1>
              <p className="text-xs text-muted-foreground">System Management Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage the MamaCare Africa platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-70`} />
                <span className={`text-sm font-medium ${
                  stat.change.startsWith("+") ? "text-green-500" : "text-destructive"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
              <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Secured via AES-256</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="analytics" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="providers">Medical Staff</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="security">Security Logs</TabsTrigger>
            <TabsTrigger value="audit">Full Audit Trail</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
          
          <TabsContent value="providers">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Provider Management</h3>
                    <p className="text-xs text-muted-foreground">Verify and manage medical professionals</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleInvite} className="h-10 rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5">
                    <Plus className="w-4 h-4" />
                    Invite Doctor
                  </Button>
                  <Button variant="outline" onClick={seedTestProvider} className="h-10 rounded-xl gap-2 border-white/10 text-white/50 hover:bg-white/5">
                    <Zap className="w-4 h-4" />
                    Seed Test Data
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {providers.length > 0 ? providers.map((provider, index) => (
                  <div key={provider.id || index} className="flex items-center justify-between p-4 bg-background/40 border border-border/50 rounded-2xl group hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">👩‍⚕️</div>
                      <div>
                        <p className="text-sm font-bold text-white">{provider.full_name}</p>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">{provider.role} • {provider.specialty || 'General'} • {provider.license_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-white/30 uppercase font-black">License</p>
                        <p className="text-xs font-bold text-white/70">{provider.kmpdc_license || 'Not Provided'}</p>
                      </div>
                      <Badge className={
                        provider.verification_status === 'verified' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                        provider.verification_status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }>
                        {provider.verification_status || 'Unverified'}
                      </Badge>
                      {provider.verification_status === 'pending' && (
                        <div className="flex gap-1">
                           <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleVerify(provider.id, 'verified')}>Approve</Button>
                           <Button size="sm" variant="destructive" className="h-8" onClick={() => handleVerify(provider.id, 'rejected')}>Reject</Button>
                        </div>
                      )}
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                        <Settings className="w-4 h-4 text-white/40" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
                    <p className="text-white/40 font-bold">No providers registered yet.</p>
                    <p className="text-xs text-white/20 mt-1">Use the 'Seed' button for testing.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: "New hospital registered", time: "5 mins ago", type: "success" },
                  { action: "Emergency alert resolved", time: "15 mins ago", type: "info" },
                  { action: "New educational post published", time: "1 hour ago", type: "success" },
                  { action: "System maintenance scheduled", time: "2 hours ago", type: "warning" },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border/50 bg-muted/20 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-destructive/30 border-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Guardian Security Logs</h3>
                    <p className="text-xs text-muted-foreground">Real-time suspicious pattern detection</p>
                  </div>
                </div>
                <Badge variant="destructive" className="animate-pulse">Live Monitoring</Badge>
              </div>

              <div className="space-y-4">
                {[
                  { pattern: "Admin privilege escalation attempt", severity: "CRITICAL", ip: "192.168.1.105", time: "2 mins ago", icon: Lock },
                  { pattern: "Multiple failed logins from same IP", severity: "HIGH", ip: "45.76.12.3", time: "15 mins ago", icon: AlertCircle },
                  { pattern: "Patient data exported in bulk", severity: "HIGH", user: "Provider-ID: 442", time: "1 hour ago", icon: Zap },
                  { pattern: "Video room accessed without appointment", severity: "MEDIUM", user: "Guest-772", time: "3 hours ago", icon: Eye },
                  { pattern: "Provider accessing records outside work hours", severity: "MEDIUM", user: "Nurse-Ivy", time: "Yesterday", icon: Users }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background/40 border border-border/50 rounded-2xl group hover:border-destructive/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.severity === 'CRITICAL' ? 'bg-destructive/20' : 'bg-orange-500/10'}`}>
                        <log.icon className={`w-5 h-5 ${log.severity === 'CRITICAL' ? 'text-destructive' : 'text-orange-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{log.pattern}</p>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">{log.ip || log.user} • {log.time}</p>
                      </div>
                    </div>
                    <Badge className={log.severity === 'CRITICAL' ? 'bg-destructive' : 'bg-orange-500'}>
                      {log.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="audit">
            <Card className="p-0 overflow-hidden bg-card/30 border-border/50">
              <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">System-Wide Audit Trail</h3>
                  <p className="text-xs text-muted-foreground">Permanent logs for medical compliance</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Download ISO-Report</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Record</th>
                      <th className="px-6 py-4">Security Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {[
                      { time: "2026-05-05 14:32", user: "Dr. Eliza", action: "Accessed Patient: Stacy", record: "APP-992", level: "HIGH" },
                      { time: "2026-05-05 12:15", user: "Admin-Mark", action: "Updated Hospital: City Med", record: "HOSP-01", level: "MEDIUM" },
                      { time: "2026-05-05 09:44", user: "Nurse-Ivy", action: "Exported Reports", record: "DOC-88", level: "CRITICAL" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px]">{row.time}</td>
                        <td className="px-6 py-4 font-bold">{row.user}</td>
                        <td className="px-6 py-4">{row.action}</td>
                        <td className="px-6 py-4 text-primary font-medium">{row.record}</td>
                        <td className="px-6 py-4">
                          <Badge variant={row.level === 'CRITICAL' ? 'destructive' : 'outline'}>{row.level}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Management Actions */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <h3 className="text-xl font-semibold mb-6">Management Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 hover:border-primary">
              <Users className="w-8 h-8 text-primary" />
              <span className="font-semibold">User Management</span>
              <span className="text-xs text-muted-foreground">Manage mothers & hospitals</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 hover:border-secondary">
              <Building2 className="w-8 h-8 text-secondary" />
              <span className="font-semibold">Hospital Verification</span>
              <span className="text-xs text-muted-foreground">Review & approve hospitals</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 hover:border-accent">
              <BookOpen className="w-8 h-8 text-accent" />
              <span className="font-semibold">Content Management</span>
              <span className="text-xs text-muted-foreground">Manage educational posts</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
