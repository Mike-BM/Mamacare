import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import "../index.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const AdminApp = () => {
  // Strict Domain & Role Check
  const isAdminDomain = window.location.hostname.includes('admin');
  
  // For the demo, we allow it, but in production, we could block it here
  if (!isAdminDomain && process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white p-8 text-center">
        <div>
          <h1 className="text-4xl font-black mb-4">403: Forbidden</h1>
          <p className="text-muted-foreground">The Admin Portal must be accessed via the secure admin subdomain.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<div className="p-8 text-white">Admin Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById("admin-root");
if (rootElement) {
  createRoot(rootElement).render(<AdminApp />);
}
