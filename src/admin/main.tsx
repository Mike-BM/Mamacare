import { createRoot } from "react-dom/client";
import { Lock } from "lucide-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import "../index.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const AdminApp = () => {
  // Security is handled inside the AdminDashboard component via Supabase role checks
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById("admin-root");
if (rootElement) {
  createRoot(rootElement).render(<AdminApp />);
}
