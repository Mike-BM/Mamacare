import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import About from "./pages/About";
import Features from "./pages/Features";
import MotherDashboard from "./pages/MotherDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import BabaDashboard from "./pages/BabaDashboard";
import NotFound from "./pages/NotFound";
import { OfflineBadge } from "./components/OfflineBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import ProviderDashboard from "./pages/ProviderDashboard";

const queryClient = new QueryClient();

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = session.user?.user_metadata?.role || 'mother';
        if (role === 'hospital') navigate("/hospital-dashboard");
        else if (role === 'admin') window.location.href = "/admin.html";
        else navigate("/mother-dashboard");
      }
      setIsProcessing(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        const role = session.user?.user_metadata?.role || 'mother';
        toast.success(`Signed in as ${role}`);
        
        if (role === 'hospital') navigate("/hospital-dashboard");
        else if (role === 'admin') window.location.href = "/admin.html";
        else navigate("/mother-dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthRedirectHandler />
      <OfflineBadge />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/mother-dashboard/:tab?" element={<MotherDashboard />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/baba" element={<BabaDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
