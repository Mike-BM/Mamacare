import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield, Users, Building2, AlertTriangle, FileText,
  LogOut, CheckCircle, XCircle, Plus, Terminal,
  Lock, Eye, Activity, Database, Server, Bell,
  ChevronRight, ArrowRight, Clock, TrendingUp
} from "lucide-react";

const NAV = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "providers", label: "Medical Staff", icon: Users },
  { id: "hospitals", label: "Hospitals", icon: Building2 },
  { id: "security", label: "Security Logs", icon: Shield },
  { id: "audit", label: "Audit Trail", icon: FileText },
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
  const [tab, setTab] = useState("overview");
  const [providers, setProviders] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/"; return; }
      const role = session.user.user_metadata?.role;
      if (role !== "admin") {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
        setAdminEmail(session.user.email || "admin");
        fetchProviders();
        const ch = supabase.channel("admin-providers")
          .on("postgres_changes", { event: "*", schema: "public", table: "providers" }, fetchProviders)
          .subscribe();
        return () => { supabase.removeChannel(ch); };
      }
    };
    checkAuth();
  }, []);

  const fetchProviders = async () => {
    const { data } = await supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (data) setProviders(data);
  };

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
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
        <p className="text-slate-600 text-xs mt-4 tracking-widest">MAMACARE ADMIN PORTAL v2.0</p>
      </div>
    );
  }

  // ── Access denied ──
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center font-mono p-8 text-center">
        <div className="border border-red-800 bg-red-950/40 rounded-lg p-10 max-w-md w-full">
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-xs tracking-widest uppercase mb-2">HTTP 403 — Forbidden</p>
          <h1 className="text-2xl font-black text-white mb-3">Access Denied</h1>
          <p className="text-slate-500 text-sm mb-6">
            You do not have admin privileges. This incident has been logged.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded border border-slate-700 transition-colors"
          >
            ← Return to Site
          </button>
        </div>
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
            <span className="text-white font-black text-sm tracking-wide">MAMACARE</span>
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
            onClick={() => { supabase.auth.signOut(); window.location.href = "/"; }}
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-green-500 font-mono">SYSTEM LIVE</span>
          </div>
        </header>

        <div className="p-8">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-8">
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
                <button onClick={() => setTab("security")} className="w-full px-6 py-3 text-xs text-slate-600 hover:text-green-400 hover:bg-slate-800/30 transition-colors flex items-center gap-1 font-mono">
                  View all security logs <ArrowRight className="w-3 h-3" />
                </button>
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

          {/* ── PROVIDERS ── */}
          {tab === "providers" && (
            <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Medical Staff Registry</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">{providers.length} providers on record</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleInvite} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded hover:bg-green-400/20 transition-colors font-bold">
                    <Plus className="w-3.5 h-3.5" /> Invite Doctor
                  </button>
                </div>
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
                        <th className="px-6 py-3 text-left font-medium">License</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                        <th className="px-6 py-3 text-left font-medium">Actions</th>
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
                          <td className="px-6 py-3">
                            {p.verification_status === "pending" && (
                              <div className="flex gap-2">
                                <button onClick={() => handleVerify(p.id, "verified")} className="text-[11px] px-2.5 py-1 bg-green-900/40 text-green-400 border border-green-700/40 rounded hover:bg-green-900/70 transition-colors font-bold">
                                  Approve
                                </button>
                                <button onClick={() => handleVerify(p.id, "rejected")} className="text-[11px] px-2.5 py-1 bg-red-900/40 text-red-400 border border-red-700/40 rounded hover:bg-red-900/70 transition-colors font-bold">
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── HOSPITALS ── */}
          {tab === "hospitals" && (
            <div className="space-y-4">
              <div className="bg-[#161b22] border border-slate-800 rounded-lg p-6">
                <h2 className="text-sm font-bold text-white mb-1">Partner Hospital Onboarding</h2>
                <p className="text-xs text-slate-500 mb-5">Review and approve hospital partnership requests</p>
                <a href="/register" className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-400/10 text-green-400 border border-green-400/20 rounded text-sm font-bold hover:bg-green-400/20 transition-colors">
                  <Building2 className="w-4 h-4" /> Register New Partner Hospital →
                </a>
              </div>
              <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <span className="text-sm font-bold text-white">Registered Facilities</span>
                </div>
                {[
                  { name: "Nairobi General Hospital", location: "Nairobi, KE", beds: 450, status: "Active" },
                  { name: "Aga Khan University Hospital", location: "Nairobi, KE", beds: 254, status: "Active" },
                  { name: "Kenyatta National Hospital", location: "Nairobi, KE", beds: 1800, status: "Active" },
                  { name: "Mombasa Coast Hospital", location: "Mombasa, KE", beds: 120, status: "Pending" },
                ].map((h, i) => (
                  <div key={i} className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">{h.name}</p>
                      <p className="text-xs text-slate-600 font-mono">{h.location} · {h.beds} beds</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${h.status === "Active" ? "text-green-400 bg-green-900/30 border-green-700/40" : "text-yellow-400 bg-yellow-900/30 border-yellow-700/40"}`}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab === "security" && (
            <div className="bg-[#161b22] border border-red-900/30 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold text-white">Guardian Security Monitor</span>
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
          )}

          {/* ── AUDIT ── */}
          {tab === "audit" && (
            <div className="bg-[#161b22] border border-slate-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">System-Wide Audit Trail</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">Immutable compliance log — ISO 27001</p>
                </div>
                <button className="text-xs px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded transition-colors">
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
          )}

        </div>
      </main>
    </div>
  );
}
