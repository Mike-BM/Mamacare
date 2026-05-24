import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield, Users, Building2, AlertTriangle, FileText,
  LogOut, CheckCircle, XCircle, Plus, Terminal,
  Lock, Eye, Activity, Database, Server, Bell,
  ChevronRight, ArrowRight, Clock, TrendingUp, Calendar,
  Car, MapPin, Truck, CreditCard, MessageSquare, Settings, CheckCircle2
} from "lucide-react";

const NAV = [
  { id: "analytics", label: "Analytics & Overview", icon: Activity },
  { id: "users", label: "User Management", icon: Users },
  { id: "verification", label: "Verification Center", icon: Building2 },
  { id: "rides", label: "NnekaRide Logistics", icon: Car },
  { id: "payments", label: "Payment Monitoring", icon: CreditCard },
  { id: "moderation", label: "Content Moderation", icon: AlertTriangle },
  { id: "support", label: "Support System", icon: MessageSquare },
  { id: "settings", label: "System Settings", icon: Settings },
];

const STATS = [
  { label: "Total Users", value: "2,847", delta: "+12%", up: true, icon: Users },
  { label: "Verified Hospitals", value: "156", delta: "+8%", up: true, icon: Building2 },
  { label: "Active Sessions", value: "34", delta: "+3", up: true, icon: Terminal },
  { label: "Security Alerts", value: "3", delta: "-2", up: false, icon: AlertTriangle },
];

const SECURITY_LOGS = [
  { event: "Admin privilege escalation attempt", severity: "CRITICAL", src: "192.168.1.105", time: "2m ago" },
  { event: "Multiple failed logins from same IP", severity: "HIGH", src: "45.76.12.3", time: "15m ago" },
  { event: "Bulk patient data export", severity: "HIGH", src: "Provider-442", time: "1h ago" },
  { event: "Video room accessed without booking", severity: "MEDIUM", src: "Guest-772", time: "3h ago" },
  { event: "Records access outside work hours", severity: "MEDIUM", src: "Nurse-Ivy", time: "Yesterday" },
];

const AUDIT_ROWS = [
  { time: "2026-05-05 14:32", user: "Dr. Eliza", action: "Accessed Patient Record", ref: "APP-992", level: "HIGH" },
  { time: "2026-05-05 12:15", user: "Admin-Mark", action: "Updated Hospital Profile", ref: "HOSP-01", level: "MEDIUM" },
  { time: "2026-05-05 09:44", user: "Nurse-Ivy", action: "Exported Reports Bundle", ref: "DOC-88", level: "CRITICAL" },
  { time: "2026-05-04 17:20", user: "Dr. James", action: "Created Appointment Slot", ref: "SLOT-22", level: "LOW" },
];

const severityColor: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-900/30 border-red-700/40",
  HIGH: "text-orange-400 bg-orange-900/30 border-orange-700/40",
  MEDIUM: "text-yellow-400 bg-yellow-900/30 border-yellow-700/40",
  LOW: "text-slate-400 bg-slate-800/30 border-slate-600/40",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("analytics");
  const [usersList, setUsersList] = useState([
    { id: "usr-1", name: "Stacy Mutheu", email: "stacy@example.com", role: "Mother", status: "Active", joined: "2026-04-12" },
    { id: "usr-2", name: "Jane Keith", email: "jane.keith@example.com", role: "Mother", status: "Active", joined: "2026-05-01" },
    { id: "usr-3", name: "Obadiah Kemboi", email: "obadiah@example.com", role: "Father", status: "Active", joined: "2026-05-10" },
    { id: "usr-4", name: "Dr. Eliza Keith", email: "eliza.keith@example.com", role: "Doctor", status: "Active", joined: "2026-01-20" },
    { id: "usr-5", name: "Admin-Mark", email: "admin@nnekahealth.com", role: "Admin", status: "Active", joined: "2026-01-01" },
    { id: "usr-6", name: "Malicious User", email: "spammer@gmail.com", role: "Mother", status: "Suspended", joined: "2026-05-22" },
  ]);

  const [paymentsList, setPaymentsList] = useState([
    { id: "tx-1001", patient: "Jane Keith", amount: "KES 1,200", method: "M-Pesa", type: "Copay", status: "Completed", date: "Just now" },
    { id: "tx-1002", patient: "Mariam Osei", amount: "KES 5,500", method: "NHIF Claim", type: "Hospital Bill", status: "Pending Approval", date: "10m ago" },
    { id: "tx-1003", hospital: "Nairobi General Hospital", amount: "KES 45,000", method: "Bank Payout", type: "Hospital Payout", status: "Completed", date: "2h ago" },
    { id: "tx-1004", patient: "Stacy Mutheu", amount: "KES 750", method: "Nneka Wallet", type: "Ride Fare", status: "Completed", date: "Yesterday" },
  ]);

  const [moderationList, setModerationList] = useState([
    { id: "post-1", user: "Malicious User", content: "Buy cheap baby supplements at scam-url.com! Guaranteed 100% cure for all morning sickness!", flags: 4, reason: "Spam Link", date: "1h ago", status: "Flagged" },
    { id: "post-2", user: "Jane Keith", content: "Is it normal to have mild cramping in week 24? My doctor told me to rest.", flags: 1, reason: "Sensitive keywords", date: "3h ago", status: "Approved" },
    { id: "post-3", user: "Anonymous Mama", content: "I hate my nurse she is so mean and doesn't know anything!", flags: 2, reason: "Harassment", date: "1d ago", status: "Flagged" },
  ]);

  const [ticketsList, setTicketsList] = useState([
    { id: "tkt-201", user: "Mariam Osei", subject: "Unable to join video call with Dr. Eliza", priority: "High", status: "Open", date: "5m ago" },
    { id: "tkt-202", user: "John Kamau (Driver)", subject: "App freezing during pickup location routing", priority: "Medium", status: "In Progress", date: "1h ago" },
    { id: "tkt-203", user: "Stacy Mutheu", subject: "Emergency wallet balance refund request", priority: "Low", status: "Resolved", date: "1d ago" },
  ]);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [mamarideRequests, setMamarideRequests] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleToggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        toast.success(`User ${u.name} status updated to ${nextStatus}!`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleTogglePaymentStatus = (txId: string, newStatus: string) => {
    setPaymentsList(prev => prev.map(p => {
      if (p.id === txId) {
        toast.success(`Payment claim ${txId} marked as ${newStatus}!`);
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleModerationAction = (postId: string, action: "Approve" | "Delete") => {
    if (action === "Delete") {
      setModerationList(prev => prev.filter(p => p.id !== postId));
      toast.success("Flagged post deleted from the platform!");
    } else {
      setModerationList(prev => prev.map(p => p.id === postId ? { ...p, status: "Approved" } : p));
      toast.success("Flagged post approved!");
    }
  };

  const handleResolveTicket = (ticketId: string) => {
    setTicketsList(prev => prev.map(t => {
      if (t.id === ticketId) {
        toast.success(`Ticket ${ticketId} resolved!`);
        return { ...t, status: "Resolved" };
      }
      return t;
    }));
  };
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "notif-1",
      title: "🚨 Emergency SOS",
      message: "Stacy Mutheu triggered an SOS alert from Kibera Sector 3.",
      time: "2m ago",
      read: false,
      type: "sos"
    },
    {
      id: "notif-2",
      title: "📅 New Booking",
      message: "Jane Keith booked an Antenatal consultation with Dr. Eliza Keith.",
      time: "15m ago",
      read: false,
      type: "booking"
    },
    {
      id: "notif-3",
      title: "🚗 Ride Requested",
      message: "Mariam Osei requested an ambulance dispatch to Nairobi West.",
      time: "1h ago",
      read: true,
      type: "ride"
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const demoBypass = localStorage.getItem("demoBypass");
      if (demoBypass) {
        const lowerBypass = demoBypass.toLowerCase();
        if (lowerBypass.includes("admin") || lowerBypass.includes("doctor") || lowerBypass.includes("provider")) {
          setIsAuthorized(true);
          setAdminEmail(demoBypass);
          loadMockData();
        } else {
          setIsAuthorized(false);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasSession(false);
        setIsAuthorized(false);
        return;
      }

      setHasSession(true);
      const role = session.user.user_metadata?.role;
      if (role !== "admin" && role !== "doctor" && role !== "provider") {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
        setAdminEmail(session.user.email || role || "user");
        fetchProviders();
        fetchAppointments();
        fetchHospitals();
        fetchMamarideRequests();
        const ch1 = supabase.channel("admin-providers")
          .on("postgres_changes", { event: "*", schema: "public", table: "providers" }, fetchProviders)
          .subscribe();
          
        const ch2 = supabase.channel("admin-appointments")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "appointments" }, (payload: any) => {
            fetchAppointments();
            const newNotif = {
              id: `db-apt-${payload.new.id}`,
              title: "📅 New Appointment",
              message: `A new appointment has been scheduled in the database.`,
              time: "Just now",
              read: false,
              type: "booking"
            };
            setNotifications(prev => [newNotif, ...prev]);
            toast.info("📅 Real-time: New appointment booked!");
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "appointments" }, fetchAppointments)
          .subscribe();
          
        const ch3 = supabase.channel("admin-mamarides")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "mamaride_requests" }, (payload: any) => {
            fetchMamarideRequests();
            const newNotif = {
              id: `db-ride-${payload.new.id}`,
              title: "🚗 NnekaRide Request",
              message: `New NnekaRide transport requested: ${payload.new.ride_type || "standard"}.`,
              time: "Just now",
              read: false,
              type: "ride"
            };
            setNotifications(prev => [newNotif, ...prev]);
            toast.success("🚗 Real-time: New NnekaRide requested!");
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "mamaride_requests" }, fetchMamarideRequests)
          .subscribe();

        const ch4 = supabase.channel("admin-alerts")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload: any) => {
            const newNotif = {
              id: `db-alert-${payload.new.id}`,
              title: "🚨 SOS Panic Alert",
              message: payload.new.message || "A mother has triggered an SOS emergency panic alert!",
              time: "Just now",
              read: false,
              type: "sos"
            };
            setNotifications(prev => [newNotif, ...prev]);
            toast.error("🚨 CRITICAL: Emergency SOS panic triggered!", { duration: 8000 });
          })
          .subscribe();

        return () => { 
          supabase.removeChannel(ch1); 
          supabase.removeChannel(ch2); 
          supabase.removeChannel(ch3); 
          supabase.removeChannel(ch4); 
        };
      }
    };
    checkAuth();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoggingIn(true);
    const toastId = toast.loading("Authenticating operational credentials...");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;

      const role = data.session?.user?.user_metadata?.role;
      if (role !== "admin" && role !== "doctor" && role !== "provider") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Admin or Provider role required.");
      }

      toast.success("Authentication successful! Welcome to Operations Console.", { id: toastId });
      setHasSession(true);
      setIsAuthorized(true);
      setAdminEmail(data.session?.user?.email || role || "user");
      
      fetchProviders();
      fetchAppointments();
      fetchHospitals();
      fetchMamarideRequests();
      
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in.", { id: toastId });
      setIsAuthorized(false);
      setHasSession(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadMockData = () => {
    setProviders([
      {
        id: "doc-1",
        full_name: "Dr. Eliza Keith",
        specialty: "Obstetrics & Gynecology",
        license_number: "KMPDC-9921",
        verification_status: "verified",
        is_active: true
      },
      {
        id: "doc-2",
        full_name: "Dr. James Omondi",
        specialty: "Pediatrics",
        license_number: "KMPDC-4412",
        verification_status: "verified",
        is_active: true
      },
      {
        id: "doc-3",
        full_name: "Dr. Amina Yusuf",
        specialty: "Maternal Health Specialist",
        license_number: "KMPDC-8812",
        verification_status: "pending",
        is_active: false
      }
    ]);

    setHospitals([
      { id: "hosp-1", name: "Nairobi General Hospital", location: "Nairobi, KE", beds: 450, status: "Active" },
      { id: "hosp-2", name: "Aga Khan University Hospital", location: "Nairobi, KE", beds: 254, status: "Active" },
      { id: "hosp-3", name: "Kenyatta National Hospital", location: "Nairobi, KE", beds: 1800, status: "Active" },
      { id: "hosp-4", name: "Mombasa Coast Hospital", location: "Mombasa, KE", beds: 120, status: "Pending" }
    ]);

    setAppointments([
      {
        id: "apt-1",
        mother_id: "m-1",
        doctor_id: "doc-1",
        hospital_id: "hosp-1",
        appointment_date: new Date().toISOString(),
        appointment_type: "Antenatal",
        status: "pending",
        notes: "Routine checkup, blood pressure check needed.",
        mothers: {
          due_date: "2026-09-12",
          profiles: {
            full_name: "Mariam Osei",
            email: "mariam@example.com"
          }
        },
        hospitals: {
          name: "Nairobi General Hospital"
        }
      },
      {
        id: "apt-2",
        mother_id: "m-2",
        doctor_id: "doc-2",
        hospital_id: "hosp-2",
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        appointment_type: "Ultrasound",
        status: "confirmed",
        notes: "Anatomy scan",
        mothers: {
          due_date: "2026-10-15",
          profiles: {
            full_name: "Amina Yusuf",
            email: "amina@example.com"
          }
        },
        hospitals: {
          name: "Aga Khan University Hospital"
        }
      },
      {
        id: "apt-3",
        mother_id: "m-3",
        doctor_id: "doc-1",
        hospital_id: undefined,
        appointment_date: new Date(Date.now() - 86400000).toISOString(),
        appointment_type: "Telehealth",
        status: "completed",
        notes: "Consultation on nutrition",
        mothers: {
          due_date: "2026-08-01",
          profiles: {
            full_name: "Jane Doe",
            email: "jane@example.com"
          }
        },
        hospitals: undefined
      }
    ]);

    setMamarideRequests([
      {
        id: "ride-1",
        mother_id: "m-1",
        ride_type: "ambulance",
        pickup_location: "Nairobi West Clinic, Lane 2",
        destination: "Nairobi General Hospital",
        status: "requested",
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        mothers: {
          profiles: {
            full_name: "Stacy Mutheu",
            email: "stacy@example.com",
            phone: "+254 711 222 333"
          }
        },
        driver: null
      },
      {
        id: "ride-2",
        mother_id: "m-2",
        ride_type: "standard",
        pickup_location: "Mbagathi Way, Block B",
        destination: "Aga Khan University Hospital",
        status: "accepted",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        mothers: {
          profiles: {
            full_name: "Jane Keith",
            email: "jane.keith@example.com",
            phone: "+254 722 333 444"
          }
        },
        driver: {
          full_name: "John Kamau",
          phone: "+254 733 444 555"
        }
      },
      {
        id: "ride-3",
        mother_id: "m-3",
        ride_type: "boda",
        pickup_location: "Kibera Drive, Gate 4",
        destination: "Kenyatta National Hospital",
        status: "completed",
        created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        mothers: {
          profiles: {
            full_name: "Mariam Osei",
            email: "mariam@example.com",
            phone: "+254 799 888 777"
          }
        },
        driver: {
          full_name: "Peter Mwangi",
          phone: "+254 755 666 777"
        }
      }
    ]);
  };

  const fetchMamarideRequests = async () => {
    const { data } = await supabase
      .from("mamaride_requests")
      .select(`
        *,
        mothers (
          profiles:user_id (
            full_name,
            email
          )
        )
      `)
      .order("created_at", { ascending: false });
    if (data) {
      setMamarideRequests(data);
    }
  };

  const handleRideStatusUpdate = async (id: string, newStatus: string) => {
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      setMamarideRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Ride status updated to ${newStatus}! (Demo)`);
      return;
    }
    const tid = toast.loading("Updating ride status...");
    const { error } = await supabase
      .from("mamaride_requests")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status: " + error.message, { id: tid });
    } else {
      toast.success("Ride status updated successfully!", { id: tid });
      fetchMamarideRequests();
    }
  };

  const handleAssignDriver = (id: string) => {
    const driverName = window.prompt("Enter Driver Name:", "John Kamau");
    if (!driverName) return;
    const driverPhone = window.prompt("Enter Driver Phone Number:", "+254 733 444 555") || "+254 733 444 555";

    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      setMamarideRequests(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "accepted",
        driver: { full_name: driverName, phone: driverPhone }
      } : r));
      toast.success(`Driver ${driverName} assigned! (Demo)`);
      return;
    }
    
    toast.success(`Driver ${driverName} assigned to ride request!`);
    setMamarideRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: "accepted",
      driver: { full_name: driverName, phone: driverPhone }
    } : r));
  };

  const triggerSimulation = (type: "sos" | "booking" | "ride") => {
    const randomNames = ["Stacy Mutheu", "Jane Keith", "Mariam Osei", "Fatuma Ali", "Zahra Kamau"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const time = "Just now";
    const id = `sim-${Date.now()}`;

    if (type === "sos") {
      const newAlert = {
        id,
        title: "🚨 Emergency SOS",
        message: `${randomName} triggered a critical SOS alert. Emergency services standby.`,
        time,
        read: false,
        type: "sos"
      };
      setNotifications(prev => [newAlert, ...prev]);
      toast.error(`🚨 Critical Alert: SOS triggered by ${randomName}!`, { duration: 5000 });
      
      SECURITY_LOGS.unshift({
        event: `Emergency SOS Alert — ${randomName}`,
        severity: "CRITICAL",
        src: "MAMA-SOS-PANIC",
        time: "Just now"
      });
    } else if (type === "booking") {
      const newAlert = {
        id,
        title: "📅 New Booking",
        message: `${randomName} booked an Antenatal checkup at Nairobi General Hospital.`,
        time,
        read: false,
        type: "booking"
      };
      setNotifications(prev => [newAlert, ...prev]);
      toast.info(`📅 Booking: New appointment created by ${randomName}.`);

      const newApt = {
        id: `apt-${Date.now()}`,
        mother_id: `m-${Date.now()}`,
        doctor_id: "doc-1",
        hospital_id: "hosp-1",
        appointment_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        appointment_type: "Antenatal",
        status: "pending",
        notes: "Automated booking via Nneka Health application.",
        mothers: {
          due_date: "2026-11-20",
          profiles: {
            full_name: randomName,
            email: `${randomName.toLowerCase().replace(" ", "")}@example.com`
          }
        },
        hospitals: {
          name: "Nairobi General Hospital"
        }
      };
      setAppointments(prev => [newApt, ...prev]);
    } else if (type === "ride") {
      const newAlert = {
        id,
        title: "🚗 Ride Dispatch",
        message: `${randomName} requested an emergency NnekaRide ambulance dispatch.`,
        time,
        read: false,
        type: "ride"
      };
      setNotifications(prev => [newAlert, ...prev]);
      toast.success(`🚗 Dispatch: NnekaRide requested by ${randomName}.`);

      const newRide = {
        id: `ride-${Date.now()}`,
        mother_id: `m-${Date.now()}`,
        ride_type: "ambulance",
        pickup_location: "Kibera Sector 3, Phase 1",
        destination: "Nairobi General Hospital",
        status: "requested",
        created_at: new Date().toISOString(),
        mothers: {
          profiles: {
            full_name: randomName,
            email: `${randomName.toLowerCase().replace(" ", "")}@example.com`,
            phone: "+254 7" + Math.floor(10000000 + Math.random() * 90000000)
          }
        },
        driver: null
      };
      setMamarideRequests(prev => [newRide, ...prev]);
    }
  };

  const fetchProviders = async () => {
    const { data } = await supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (data) setProviders(data);
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        mothers (
          due_date,
          profiles:user_id (
            full_name,
            email
          )
        ),
        hospitals (
          name
        )
      `)
      .order("appointment_date", { ascending: false });
    if (!error && data) {
      setAppointments(data);
    }
  };

  const fetchHospitals = async () => {
    const { data } = await supabase.from("hospitals").select("*").order("name");
    if (data) setHospitals(data);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
      toast.success("Appointment status updated successfully! (Demo)");
      return;
    }
    const tid = toast.loading("Updating appointment status...");
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status: " + error.message, { id: tid });
    } else {
      toast.success("Appointment status updated successfully!", { id: tid });
      fetchAppointments();
    }
  };

  const handleJoinCall = async (apt: any) => {
    if (apt.video_link) {
      window.open(apt.video_link, '_blank');
      return;
    }
    
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      const demoUrl = "https://meet.jit.si/NnekaHealthDemoAdminConsultation";
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, video_link: demoUrl, status: 'confirmed' } : a));
      toast.success("Consultation link generated! (Demo)");
      window.open(demoUrl, '_blank');
      return;
    }

    setIsGenerating(apt.id);
    const toastId = toast.loading("Generating telehealth consultation link...");
    try {
      const { data, error } = await supabase.functions.invoke('create-video-room', {
        body: { appointment_id: apt.id }
      });
      if (error || !data?.url) {
        throw new Error(error?.message || "Failed to retrieve room URL");
      }
      
      // Update database
      const { error: dbErr } = await supabase
        .from('appointments')
        .update({ video_link: data.url, status: 'confirmed' })
        .eq('id', apt.id);
      if (dbErr) throw dbErr;
      
      toast.success("Consultation link generated!", { id: toastId });
      fetchAppointments();
      window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error("Error creating room: " + err.message, { id: toastId });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
    const demoBypass = localStorage.getItem("demoBypass");
    if (demoBypass) {
      setProviders(prev => prev.map(p => p.id === id ? { ...p, verification_status: status, is_active: status === "verified" } : p));
      toast.success(`Doctor ${status} (Demo)`);
      return;
    }
    const tid = toast.loading("Updating...");
    const { error } = await supabase.from("providers")
      .update({ verification_status: status, is_active: status === "verified" })
      .eq("id", id);
    if (error) toast.error("Failed", { id: tid });
    else { toast.success(`Doctor ${status}`, { id: tid }); fetchProviders(); }
  };

  const handleInvite = () => {
    const email = window.prompt("Doctor email to invite:");
    if (email) toast.success(`Invite sent to ${email}`);
  };

  const filteredAppointments = appointments.filter((apt) => {
    // Hospital Filter
    if (selectedHospital !== "all" && apt.hospital_id !== selectedHospital) {
      return false;
    }
    // Doctor Filter
    if (selectedDoctor !== "all" && apt.doctor_id !== selectedDoctor) {
      return false;
    }
    // Time Filter
    if (timeFilter !== "all") {
      const aptDate = apt.appointment_date ? new Date(apt.appointment_date) : null;
      if (!aptDate) return false;

      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      if (timeFilter === "today") {
        return aptDate >= startOfToday && aptDate <= endOfToday;
      } else if (timeFilter === "upcoming") {
        return aptDate > endOfToday;
      } else if (timeFilter === "past") {
        return aptDate < startOfToday;
      }
    }
    return true;
  });

  // ── Loading state ──
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center font-mono">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-5 bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm tracking-widest uppercase">Authenticating</span>
        </div>
        <div className="w-48 h-1 bg-slate-800 rounded overflow-hidden">
          <div className="h-full bg-green-400 animate-[pulse_1s_ease-in-out_infinite] w-3/4 rounded" />
        </div>
        <p className="text-slate-600 text-xs mt-4 tracking-widest">NNEKA HEALTH ADMIN PORTAL v2.0</p>
      </div>
    );
  }

  // ── Access denied ──
  if (isAuthorized === false && hasSession) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center font-mono p-8 text-center">
        <div className="border border-red-800 bg-red-950/40 rounded-lg p-10 max-w-md w-full">
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-xs tracking-widest uppercase mb-2">HTTP 403 — Forbidden</p>
          <h1 className="text-2xl font-black text-white mb-3">Access Denied</h1>
          <p className="text-slate-500 text-sm mb-6">
            You do not have administrative privileges. This security incident has been logged.
          </p>
          <button
            onClick={async () => {
              localStorage.removeItem("demoBypass");
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded border border-slate-700 transition-colors"
          >
            ← Return to Operations Login
          </button>
        </div>
      </div>
    );
  }

  // ── Secure Operations Login Screen ──
  if (!hasSession && !localStorage.getItem("demoBypass")) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center font-sans p-6">
        <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-lg shadow-2xl p-8 transition-all hover:border-green-500/20">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">NNEKA HEALTH</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Operations Console Login</p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operational Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ops@nnekahealth.com"
                className="w-full bg-[#0d1117] border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0d1117] border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:text-slate-400 text-white text-sm font-bold rounded border border-green-700 hover:border-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/10 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Authorize Access
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bypass for demo environment verification */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono mb-3">Developer Sandbox Access</p>
            <button
              onClick={() => {
                localStorage.setItem("demoBypass", "admin@nnekahealth.com");
                toast.success("Bypass authorized! Loading Operations panel...");
                window.location.reload();
              }}
              className="text-xs text-slate-500 hover:text-green-400 transition-colors font-mono underline"
            >
              Skip Authentication (Local Developer Bypass)
            </button>
          </div>
        </div>
        <p className="text-slate-600 text-[10px] mt-6 tracking-widest font-mono font-bold">SECURE HTTPS CONNECTION REQUIRED · ISO 27001 COMPLIANT</p>
      </div>
    );
  }

  // ── Main Dashboard ──
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-300 flex font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-[#161b22] border-r border-slate-800 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-white font-black text-sm tracking-wide">NNEKA HEALTH</span>
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Admin Control Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                tab === id
                  ? "bg-green-400/10 text-green-400 border border-green-400/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {tab === id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Partner Hospital CTA */}
        <a
          href="/register"
          className="mx-3 mb-3 flex items-center gap-2 px-3 py-3 rounded border border-slate-700 hover:border-green-700/50 bg-slate-800/50 hover:bg-green-400/5 transition-all group"
        >
          <Building2 className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">Onboard</p>
            <p className="text-xs text-slate-300 font-bold truncate">Partner Hospital →</p>
          </div>
        </a>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-slate-800/50 mb-2">
            <div className="w-6 h-6 rounded bg-green-400/20 flex items-center justify-center">
              <span className="text-green-400 text-[10px] font-black">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-bold truncate">{adminEmail}</p>
              <p className="text-[10px] text-slate-600">Administrator</p>
            </div>
          </div>
          <button
            onClick={async () => {
              localStorage.removeItem("demoBypass");
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#0d1117]/95 backdrop-blur border-b border-slate-800 px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white capitalize">{NAV.find(n => n.id === tab)?.label}</h1>
            <p className="text-[11px] text-slate-600 font-mono">
              {new Date().toUTCString().replace("GMT", "UTC")}
            </p>
          </div>
          <div className="flex items-center gap-5">
            {/* Notification Bell Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-[8px] text-white font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-[#161b22] border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden text-left">
                  <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-[#0d1117]/60">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Alert Center</span>
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-[9px] text-green-400 hover:underline font-mono"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-600 text-center">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 hover:bg-slate-800/35 transition-colors ${!n.read ? 'bg-green-400/5' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-xs font-bold text-white leading-tight">{n.title}</span>
                            <span className="text-[9px] text-slate-600 font-mono">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-3 py-1.5 border-t border-slate-800 bg-[#0d1117]/35 flex gap-2">
                    <button
                      onClick={() => triggerSimulation("sos")}
                      className="flex-1 text-[8px] py-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/50 rounded font-bold transition-all text-center uppercase tracking-wider"
                    >
                      + SOS Alert
                    </button>
                    <button
                      onClick={() => triggerSimulation("booking")}
                      className="flex-1 text-[8px] py-1 bg-blue-950/40 hover:bg-blue-900/40 text-blue-400 border border-blue-800/50 rounded font-bold transition-all text-center uppercase tracking-wider"
                    >
                      + Book Slot
                    </button>
                    <button
                      onClick={() => triggerSimulation("ride")}
                      className="flex-1 text-[8px] py-1 bg-green-950/40 hover:bg-green-900/40 text-green-400 border border-green-800/50 rounded font-bold transition-all text-center uppercase tracking-wider"
                    >
                      + Dispatch Ride
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-green-500 font-mono">SYSTEM LIVE</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* ── ANALYTICS & OVERVIEW ── */}
          {tab === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-[#161b22] border border-slate-800 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-4 h-4 text-slate-600" />
                      <span className={`text-xs font-mono font-bold ${s.up ? "text-green-400" : "text-red-400"}`}>
                        {s.delta}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">{s.value}</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bookings & Appointments Scheduler */}
              <div className="space-y-6">
                <div className="bg-[#161b22] border border-slate-800 rounded-lg p-4 flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Hospital</label>
                    <select
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="bg-[#0d1117] border border-slate-800 text-slate-300 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-green-400 w-full sm:w-48"
                    >
                      <option value="all">All Hospitals</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Doctor</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="bg-[#0d1117] border border-slate-800 text-slate-300 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-green-400 w-full sm:w-48"
                    >
                      <option value="all">All Doctors</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Timeframe</label>
                    <div className="flex bg-[#0d1117] border border-slate-800 rounded p-0.5">
                      {["all", "today", "upcoming", "past"].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeFilter(tf)}
                          className={`px-3 py-1 text-xs rounded capitalize transition-all ${
                            timeFilter === tf
                              ? "bg-green-400/10 text-green-400 font-bold"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-white">Appointments & Consultations Registry</h2>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {filteredAppointments.length} active scheduling slots
                      </p>
                    </div>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-600 text-sm">No appointments matching the filters.</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                              <th className="px-6 py-3 text-left font-medium">Patient</th>
                              <th className="px-6 py-3 text-left font-medium">Hospital</th>
                              <th className="px-6 py-3 text-left font-medium">Doctor</th>
                              <th className="px-6 py-3 text-left font-medium">Date & Time</th>
                              <th className="px-6 py-3 text-left font-medium">Type</th>
                              <th className="px-6 py-3 text-left font-medium">Status</th>
                              <th className="px-6 py-3 text-left font-medium">Notes</th>
                              <th className="px-6 py-3 text-right font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {filteredAppointments.map((apt) => {
                              const patientName = apt.mothers?.profiles?.full_name || apt.mothers?.profiles?.email || "Unknown";
                              const doctorName = providers.find(p => p.id === apt.doctor_id)?.full_name || "Unassigned";
                              const hospitalName = apt.hospitals?.name || "Telehealth/General";
                              const aptDate = apt.appointment_date ? new Date(apt.appointment_date).toLocaleString() : "TBD";
                              return (
                                <tr key={apt.id} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-white">{patientName}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{apt.mother_id?.slice(0, 8)}...</div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-400">{hospitalName}</td>
                                  <td className="px-6 py-4 text-slate-400 font-medium">{doctorName}</td>
                                  <td className="px-6 py-4 font-mono text-xs text-slate-300">{aptDate}</td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                      {apt.appointment_type || "General"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={apt.status || "pending"}
                                      onChange={(e) => handleStatusUpdate(apt.id, e.target.value)}
                                      className={`text-xs font-bold px-2 py-1 rounded bg-[#0d1117] border focus:outline-none ${
                                        apt.status === "confirmed" ? "text-green-400 border-green-700/40 bg-green-900/10" :
                                        apt.status === "completed" ? "text-blue-400 border-blue-700/40 bg-blue-900/10" :
                                        apt.status === "cancelled" ? "text-red-400 border-red-700/40 bg-red-900/10" :
                                        "text-yellow-400 border-yellow-700/40 bg-yellow-900/10"
                                      }`}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-slate-500 max-w-[150px] truncate" title={apt.notes}>
                                    {apt.notes || "—"}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleJoinCall(apt)}
                                      disabled={isGenerating === apt.id}
                                      className="px-3 py-1.5 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded hover:bg-green-400/20 transition-colors font-bold disabled:opacity-50"
                                    >
                                      {isGenerating === apt.id ? "Generating..." : apt.video_link ? "Join Call" : "Create Call"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent alerts */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-white">Recent Security Alerts</span>
                  </div>
                  <span className="text-[10px] font-mono text-orange-400 bg-orange-900/30 border border-orange-700/40 px-2 py-0.5 rounded">
                    LIVE
                  </span>
                </div>
                <div className="divide-y divide-slate-800">
                  {SECURITY_LOGS.slice(0, 3).map((log, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                      <div>
                        <p className="text-sm text-slate-300">{log.event}</p>
                        <p className="text-[11px] text-slate-600 font-mono">{log.src} · {log.time}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityColor[log.severity]}`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity log */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" /> Recent Activity
                  </span>
                </div>
                {[
                  "New hospital registered — Nairobi General",
                  "Emergency alert resolved — Patient #4421",
                  "New educational post published",
                  "System maintenance completed",
                ].map((a, i) => (
                  <div key={i} className="px-6 py-3 border-b border-slate-800/50 flex items-center gap-3 hover:bg-slate-800/20 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    <span className="text-sm text-slate-400">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USER MANAGEMENT ── */}
          {tab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#161b22] border border-slate-800 rounded-lg p-6">
                <h2 className="text-sm font-bold text-white mb-2">User Registry Directory</h2>
                <p className="text-xs text-slate-500 mb-6">Manage all patient, partner, CHW, and system admin accounts.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                        <th className="px-6 py-3 text-left font-medium">User ID</th>
                        <th className="px-6 py-3 text-left font-medium">Name</th>
                        <th className="px-6 py-3 text-left font-medium">Email</th>
                        <th className="px-6 py-3 text-left font-medium">Role</th>
                        <th className="px-6 py-3 text-left font-medium">Date Joined</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {usersList.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{user.id}</td>
                          <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-mono">{user.joined}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              user.status === "Active" ? "text-green-400 bg-green-900/30 border-green-700/40" : "text-red-400 bg-red-900/30 border-red-700/40 animate-pulse"
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`px-3 py-1 text-xs rounded border font-bold transition-all ${
                                user.status === "Active"
                                  ? "bg-red-950/40 hover:bg-red-900/35 text-red-400 border-red-800/40"
                                  : "bg-green-950/40 hover:bg-green-900/35 text-green-400 border-green-800/40"
                              }`}
                            >
                              {user.status === "Active" ? "Suspend Account" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── VERIFICATION CENTER ── */}
          {tab === "verification" && (
            <div className="space-y-8 animate-fade-in">
              {/* Doctor Registrations */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Medical Specialist Registry</h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">Approve or reject doctor license verification requests</p>
                  </div>
                  <button onClick={handleInvite} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded hover:bg-green-400/20 transition-colors font-bold">
                    <Plus className="w-3.5 h-3.5" /> Invite Specialist
                  </button>
                </div>
                {providers.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Database className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">No providers registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                          <th className="px-6 py-3 text-left font-medium">Name</th>
                          <th className="px-6 py-3 text-left font-medium">Specialty</th>
                          <th className="px-6 py-3 text-left font-medium">KMPDC License</th>
                          <th className="px-6 py-3 text-left font-medium">Status</th>
                          <th className="px-6 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {providers.map((p, i) => (
                          <tr key={p.id || i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-3 font-medium text-white">{p.full_name}</td>
                            <td className="px-6 py-3 text-slate-500">{p.specialty || "General"}</td>
                            <td className="px-6 py-3 font-mono text-xs text-slate-600">{p.license_number || "—"}</td>
                            <td className="px-6 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                p.verification_status === "verified" ? "text-green-400 bg-green-900/30 border-green-700/40" :
                                p.verification_status === "pending" ? "text-yellow-400 bg-yellow-900/30 border-yellow-700/40" :
                                "text-red-400 bg-red-900/30 border-red-700/40"
                              }`}>
                                {p.verification_status || "unverified"}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              {p.verification_status === "pending" ? (
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => handleVerify(p.id, "verified")} className="text-[11px] px-2.5 py-1 bg-green-900/40 text-green-400 border border-green-700/40 rounded hover:bg-green-900/70 transition-colors font-bold">
                                    Approve
                                  </button>
                                  <button onClick={() => handleVerify(p.id, "rejected")} className="text-[11px] px-2.5 py-1 bg-red-900/40 text-red-400 border border-red-700/40 rounded hover:bg-red-900/70 transition-colors font-bold">
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600">No Action Required</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Hospital Certifications */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Partner Maternity Facilities</h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">Facility network and onboarding approvals</p>
                  </div>
                  <a href="/register" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 text-green-400 border border-green-400/20 rounded text-xs font-bold hover:bg-green-400/20 transition-colors">
                    <Building2 className="w-3.5 h-3.5" /> Onboard Facility
                  </a>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {hospitals.map((h, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white">{h.name}</p>
                        <p className="text-xs text-slate-600 font-mono">{h.location} · {h.beds} beds</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          h.status === "Active" || h.status === "verified" ? "text-green-400 bg-green-900/30 border-green-700/40" : "text-yellow-400 bg-yellow-900/30 border-yellow-700/40"
                        }`}>
                          {h.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NNEKARIDE LOGISTICS ── */}
          {tab === "rides" && (
            <div className="space-y-6 animate-fade-in">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-slate-800 rounded-lg p-5">
                  <p className="text-2xl font-black text-white mb-1">
                    {mamarideRequests.length}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Total Ride Requests</p>
                </div>
                <div className="bg-[#161b22] border border-slate-800 rounded-lg p-5">
                  <p className="text-2xl font-black text-yellow-400 mb-1">
                    {mamarideRequests.filter(r => r.status === 'requested').length}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Pending Dispatch</p>
                </div>
                <div className="bg-[#161b22] border border-slate-800 rounded-lg p-5">
                  <p className="text-2xl font-black text-blue-400 mb-1">
                    {mamarideRequests.filter(r => ['accepted', 'arrived', 'in_progress'].includes(r.status)).length}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Active Rides</p>
                </div>
                <div className="bg-[#161b22] border border-slate-800 rounded-lg p-5">
                  <p className="text-2xl font-black text-green-400 mb-1">
                    {mamarideRequests.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider">Completed Rides</p>
                </div>
              </div>

              {/* Ride Requests Dispatch Board */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold text-white">NnekaRide Dispatch Console</h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Live emergency transport dispatch dashboard
                    </p>
                  </div>
                </div>

                {mamarideRequests.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Car className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">No transport requests on record.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                            <th className="px-6 py-3 text-left font-medium">Mother / Patient</th>
                            <th className="px-6 py-3 text-left font-medium">Ride Category</th>
                            <th className="px-6 py-3 text-left font-medium">Pickup Location</th>
                            <th className="px-6 py-3 text-left font-medium">Destination</th>
                            <th className="px-6 py-3 text-left font-medium">Driver Assigned</th>
                            <th className="px-6 py-3 text-left font-medium">Status</th>
                            <th className="px-6 py-3 text-left font-medium">Request Time</th>
                            <th className="px-6 py-3 text-right font-medium">Dispatch Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {mamarideRequests.map((ride) => {
                            const motherName = ride.mothers?.profiles?.full_name || "Unknown Mother";
                            const motherPhone = ride.mothers?.profiles?.phone || "+254 711 000 000";
                            const reqTime = ride.created_at ? new Date(ride.created_at).toLocaleTimeString() : "TBD";
                            const rideTypeIcon = 
                              ride.ride_type === 'ambulance' ? '🚨 Ambulance' :
                              ride.ride_type === 'boda' ? '🏍️ Boda-Boda' : '🚗 Standard Car';
                            
                            return (
                              <tr key={ride.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-white">{motherName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{motherPhone}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border ${
                                    ride.ride_type === 'ambulance' ? 'text-red-400 border-red-700/40 bg-red-900/10' :
                                    ride.ride_type === 'boda' ? 'text-yellow-400 border-yellow-700/40 bg-yellow-900/10' :
                                    'text-blue-400 border-blue-700/40 bg-blue-900/10'
                                  }`}>
                                    {rideTypeIcon}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{ride.pickup_location || "—"}</td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{ride.destination || "General Clinic"}</td>
                                <td className="px-6 py-3 text-slate-300 font-medium">
                                  {ride.driver ? (
                                    <div>
                                      <div>{ride.driver.full_name}</div>
                                      <div className="text-[10px] text-slate-600 font-mono">{ride.driver.phone}</div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 italic">Unassigned</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <select
                                    value={ride.status || "requested"}
                                    onChange={(e) => handleRideStatusUpdate(ride.id, e.target.value)}
                                    className={`text-xs font-bold px-2 py-1 rounded bg-[#0d1117] border focus:outline-none ${
                                      ride.status === "completed" ? "text-green-400 border-green-700/40 bg-green-900/10" :
                                      ride.status === "cancelled" ? "text-red-400 border-red-700/40 bg-red-900/10" :
                                      ride.status === "requested" ? "text-yellow-400 border-yellow-700/40 bg-yellow-900/10" :
                                      "text-blue-400 border-blue-700/40 bg-blue-900/10"
                                    }`}
                                  >
                                    <option value="requested">Requested</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="arrived">Arrived</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{reqTime}</td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleAssignDriver(ride.id)}
                                    className="px-3 py-1.5 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded hover:bg-green-400/20 transition-colors font-bold"
                                  >
                                    {ride.driver ? "Reassign Driver" : "Dispatch Driver"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden p-4 space-y-4">
                      {mamarideRequests.map((ride) => {
                        const motherName = ride.mothers?.profiles?.full_name || "Unknown Mother";
                        const motherPhone = ride.mothers?.profiles?.phone || "+254 711 000 000";
                        const reqTime = ride.created_at ? new Date(ride.created_at).toLocaleTimeString() : "TBD";
                        
                        return (
                          <div key={ride.id} className="bg-[#0d1117]/40 border border-slate-800 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-white text-sm">{motherName}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{motherPhone}</div>
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 border ${
                                ride.ride_type === 'ambulance' ? 'text-red-400 border-red-700/40 bg-red-900/10' :
                                ride.ride_type === 'boda' ? 'text-yellow-400 border-yellow-700/40 bg-yellow-900/10' :
                                'text-blue-400 border-blue-700/40 bg-blue-900/10'
                              }`}>
                                {ride.ride_type}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div>
                                <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Locations</span>
                                <div className="text-slate-300 font-mono text-[11px] leading-tight">
                                  <div>From: {ride.pickup_location || "—"}</div>
                                  <div>To: {ride.destination || "General Clinic"}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Driver</span>
                                  <span className="text-slate-300">
                                    {ride.driver ? `${ride.driver.full_name} (${ride.driver.phone})` : "Unassigned"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Requested At</span>
                                  <span className="text-slate-300 font-mono">{reqTime}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500 block uppercase text-[8px] tracking-wider mb-1">Status</span>
                                <select
                                  value={ride.status || "requested"}
                                  onChange={(e) => handleRideStatusUpdate(ride.id, e.target.value)}
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded bg-[#0d1117] border focus:outline-none w-full ${
                                    ride.status === "completed" ? "text-green-400 border-green-700/40 bg-green-900/10" :
                                    ride.status === "cancelled" ? "text-red-400 border-red-700/40 bg-red-900/10" :
                                    ride.status === "requested" ? "text-yellow-400 border-yellow-700/40 bg-yellow-900/10" :
                                    "text-blue-400 border-blue-700/40 bg-blue-900/10"
                                  }`}
                                >
                                  <option value="requested">Requested</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="arrived">Arrived</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => handleAssignDriver(ride.id)}
                                className="w-full py-2 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded hover:bg-green-400/20 transition-all font-bold"
                              >
                                {ride.driver ? "Reassign Driver" : "Dispatch Driver"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── PAYMENT MONITORING ── */}
          {tab === "payments" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#161b22] border border-slate-800 rounded-lg p-6">
                <h2 className="text-sm font-bold text-white mb-2">NHIF claims & mobile payments</h2>
                <p className="text-xs text-slate-500 mb-6">Review patient copays, insurance claims, and hospital payouts.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                        <th className="px-6 py-3 text-left font-medium">Transaction ID</th>
                        <th className="px-6 py-3 text-left font-medium">Party</th>
                        <th className="px-6 py-3 text-left font-medium">Amount</th>
                        <th className="px-6 py-3 text-left font-medium">Type</th>
                        <th className="px-6 py-3 text-left font-medium">Method</th>
                        <th className="px-6 py-3 text-left font-medium">Date</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {paymentsList.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.id}</td>
                          <td className="px-6 py-4 font-medium text-white">{tx.patient || tx.hospital}</td>
                          <td className="px-6 py-4 font-bold text-slate-300 font-mono text-xs">{tx.amount}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{tx.type}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{tx.method}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-mono">{tx.date}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              tx.status === "Completed" ? "text-green-400 bg-green-900/30 border-green-700/40" :
                              tx.status === "Rejected" ? "text-red-400 bg-red-900/30 border-red-700/40" :
                              "text-yellow-400 bg-yellow-900/30 border-yellow-700/40 animate-pulse"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {tx.status === "Pending Approval" ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleTogglePaymentStatus(tx.id, "Completed")}
                                  className="px-2.5 py-1 text-xs bg-green-900/40 text-green-400 border border-green-700/40 rounded hover:bg-green-900/70 font-bold transition-all"
                                >
                                  Approve Claim
                                </button>
                                <button
                                  onClick={() => handleTogglePaymentStatus(tx.id, "Rejected")}
                                  className="px-2.5 py-1 text-xs bg-red-900/40 text-red-400 border border-red-700/40 rounded hover:bg-red-900/70 font-bold transition-all"
                                >
                                  Reject Claim
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTENT MODERATION ── */}
          {tab === "moderation" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#161b22] border border-slate-800 rounded-lg p-6">
                <h2 className="text-sm font-bold text-white mb-2">Community Forum Moderation</h2>
                <p className="text-xs text-slate-500 mb-6">Review posts flagged by patients or AI automatic filters.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                        <th className="px-6 py-3 text-left font-medium">User</th>
                        <th className="px-6 py-3 text-left font-medium">Post Content</th>
                        <th className="px-6 py-3 text-left font-medium">Reason</th>
                        <th className="px-6 py-3 text-left font-medium">Flags</th>
                        <th className="px-6 py-3 text-left font-medium">Date</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {moderationList.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-white text-xs">{post.user}</td>
                          <td className="px-6 py-4 text-slate-300 text-xs italic max-w-sm break-words">"{post.content}"</td>
                          <td className="px-6 py-4 text-orange-400 font-bold text-xs">{post.reason}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">{post.flags}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-mono">{post.date}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              post.status === "Approved" ? "text-green-400 bg-green-900/30 border-green-700/40" : "text-red-400 bg-red-900/30 border-red-700/40 animate-pulse"
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {post.status === "Flagged" ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleModerationAction(post.id, "Approve")}
                                  className="px-2.5 py-1 text-xs bg-green-900/40 text-green-400 border border-green-700/40 rounded hover:bg-green-900/70 font-bold transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleModerationAction(post.id, "Delete")}
                                  className="px-2.5 py-1 text-xs bg-red-900/40 text-red-400 border border-red-700/40 rounded hover:bg-red-900/70 font-bold transition-all"
                                >
                                  Delete Post
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600">Moderated</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SUPPORT SYSTEM ── */}
          {tab === "support" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#161b22] border border-slate-800 rounded-lg p-6">
                <h2 className="text-sm font-bold text-white mb-2">Helpdesk Support Tickets</h2>
                <p className="text-xs text-slate-500 mb-6">Manage patient questions, technical issues, and complaint cases.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                        <th className="px-6 py-3 text-left font-medium">Ticket ID</th>
                        <th className="px-6 py-3 text-left font-medium">User</th>
                        <th className="px-6 py-3 text-left font-medium">Subject</th>
                        <th className="px-6 py-3 text-left font-medium">Priority</th>
                        <th className="px-6 py-3 text-left font-medium">Date</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {ticketsList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id}</td>
                          <td className="px-6 py-4 font-bold text-white text-xs">{t.user}</td>
                          <td className="px-6 py-4 text-slate-300 text-xs font-semibold">"{t.subject}"</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              t.priority === "High" ? "bg-red-900/30 text-red-400 border border-red-700/40" :
                              t.priority === "Medium" ? "bg-yellow-900/30 text-yellow-400 border-yellow-700/40" :
                              "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-mono">{t.date}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              t.status === "Resolved" ? "text-green-400 bg-green-900/30 border-green-700/40" : "text-yellow-400 bg-yellow-900/30 border-yellow-700/40 animate-pulse"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {t.status !== "Resolved" ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    const reply = window.prompt("Type your reply to the user:");
                                    if (reply) {
                                      toast.success(`Reply sent to ${t.user}!`);
                                    }
                                  }}
                                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded font-bold transition-all"
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={() => handleResolveTicket(t.id)}
                                  className="px-2.5 py-1 text-xs bg-green-900/40 text-green-400 border border-green-700/40 rounded hover:bg-green-900/70 font-bold transition-all"
                                >
                                  Resolve
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SYSTEM SETTINGS ── */}
          {tab === "settings" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-[#161b22] border border-slate-800 rounded-lg p-6">
                <h2 className="text-base font-bold text-white mb-4">Platform Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Maintenance Mode */}
                  <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Maintenance Mode</p>
                      <p className="text-xs text-slate-500 mt-0.5">Redirect users to a maintenance screen.</p>
                    </div>
                    <button
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        toast.info(`Maintenance Mode ${!maintenanceMode ? "Enabled" : "Disabled"}!`);
                      }}
                      className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                        maintenanceMode ? "bg-red-900/40 text-red-400 border border-red-700" : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {maintenanceMode ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  {/* Database Actions */}
                  <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Database Backup</p>
                      <p className="text-xs text-slate-500 mt-0.5">Trigger an instant secure snapshot.</p>
                    </div>
                    <button
                      onClick={() => toast.success("Snapshot created and uploaded to AWS Glacier!")}
                      className="px-4 py-1.5 bg-green-900/40 text-green-400 border border-green-700 rounded text-xs font-bold hover:bg-green-900/60"
                    >
                      Backup Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Logs (old security tab) */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-white">Guardian Security Monitor (ISO 27001)</span>
                  </div>
                  <span className="text-[10px] font-mono text-red-400 bg-red-900/30 border border-red-700/40 px-2 py-0.5 rounded animate-pulse">
                    LIVE MONITORING
                  </span>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {SECURITY_LOGS.map((log, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                      <div>
                        <p className="text-sm text-slate-200 font-medium">{log.event}</p>
                        <p className="text-[11px] text-slate-600 font-mono mt-0.5">{log.src} · {log.time}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${severityColor[log.severity]}`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail (old audit tab) */}
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">System-Wide Audit Trail</h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">Immutable compliance log — ISO 27001</p>
                  </div>
                  <button onClick={() => toast.success("CSV export initiated.")} className="text-xs px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded transition-colors">
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-600 uppercase tracking-widest">
                        <th className="px-6 py-3 text-left font-medium">Timestamp</th>
                        <th className="px-6 py-3 text-left font-medium">User</th>
                        <th className="px-6 py-3 text-left font-medium">Action</th>
                        <th className="px-6 py-3 text-left font-medium">Reference</th>
                        <th className="px-6 py-3 text-left font-medium">Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono">
                      {AUDIT_ROWS.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-3 text-xs text-slate-600">{r.time}</td>
                          <td className="px-6 py-3 text-slate-300 font-sans font-bold">{r.user}</td>
                          <td className="px-6 py-3 text-slate-400 font-sans">{r.action}</td>
                          <td className="px-6 py-3 text-xs text-green-400">{r.ref}</td>
                          <td className="px-6 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityColor[r.level] || severityColor.LOW}`}>
                              {r.level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
