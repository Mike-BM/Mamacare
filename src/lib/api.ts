import axios from 'axios';
import { supabase } from './supabase';
import { toast } from 'sonner';

// Create base instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Attach Auth Token and start loading state
api.interceptors.request.use(
  async (config) => {
    // Trigger any global loading state event here if desired
    window.dispatchEvent(new Event('api-request-start'));
    
    // Attach Supabase Session Token to every API call
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    window.dispatchEvent(new Event('api-request-end'));
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle loading states and global errors
api.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new Event('api-request-end'));
    return response;
  },
  async (error) => {
    window.dispatchEvent(new Event('api-request-end'));
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        await supabase.auth.signOut();
        window.location.href = '/'; // redirect to home
      } else if (status === 429) {
        toast.error("Too many requests! Please slow down.");
      } else if (status >= 500) {
        toast.error("Server error. We are working on fixing it.");
      } else {
        toast.error(error.response.data?.error || "An error occurred");
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    }
    
    return Promise.reject(error);
  }
);
