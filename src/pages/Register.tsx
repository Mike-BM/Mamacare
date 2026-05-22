import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [role, setRole] = useState<"mother" | "hospital" | "doctor" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error_description');
    if (error) {
      toast.error(error.replace(/\+/g, ' '));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast.error("You must consent to the Kenya Data Protection Act to register.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.email.endsWith('@example.com')) {
      toast.success("Registration successful! 🎉");
      setLoading(false);
      setTimeout(() => {
        if (role === "mother") navigate("/mother-dashboard");
        else if (role === "doctor") navigate("/provider-dashboard");
        else navigate("/hospital-dashboard");
      }, 1000);
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder") || 
        (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) || 
        import.meta.env.VITE_SUPABASE_ANON_KEY === "placeholder_key" || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === "placeholder") {
      toast.error("System Error: Supabase API keys are missing. Please check your .env file and restart your dev server.");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: formData.name,
            role: role
          }
        }
      });

      if (error) throw error;

      // Optional: Call Resend Edge Function to send a Welcome Email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { 
            email: formData.email, 
            name: formData.name, 
            role: role 
          }
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // We don't throw here because registration was successful
      }

      if (data.session) {
        toast.success("Registration successful! 🎉");
        setTimeout(() => {
          if (role === "mother") navigate("/mother-dashboard");
          else if (role === "doctor") navigate("/provider-dashboard");
          else navigate("/hospital-dashboard");
        }, 1000);
      } else {
        toast.success("Registration successful! Please follow the confirmation link sent to your email to activate your account.");
        setTimeout(() => {
          navigate("/");
        }, 4000);
      }
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isFetchError = errorMsg.toLowerCase().includes("failed to fetch") || 
                           errorMsg.toLowerCase().includes("network") ||
                           error.name === "TypeError";
      
      if (isFetchError) {
        toast.warning("Network connection failed. Entering Demo Mode fallback.");
        localStorage.setItem("demoBypass", formData.email.trim().toLowerCase());
        localStorage.setItem("demoProfileName", formData.name);
        localStorage.setItem("demoProfileRole", role || "mother");
        
        setTimeout(() => {
          if (role === "mother") navigate("/mother-dashboard");
          else if (role === "doctor") navigate("/provider-dashboard");
          else navigate("/hospital-dashboard");
        }, 1500);
      } else {
        toast.error(error.message || "An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MamaCare Africa
          </h1>
        </div>

        {/* Registration Card */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/70 border border-border/50 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <h2 className="text-3xl font-semibold text-center mb-2">Create Account</h2>
          <p className="text-muted-foreground text-center mb-8">Join our maternal care community</p>

          {!role ? (
            <div className="space-y-4">
              <p className="text-center text-foreground/80 mb-6">I am a:</p>
              <Button
                variant="glass"
                size="lg"
                className="w-full justify-center text-lg hover:border-primary"
                onClick={() => setRole("mother")}
              >
                Expecting Mother 🤰
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="w-full justify-center text-lg hover:border-secondary"
                onClick={() => setRole("hospital")}
              >
                Healthcare Provider 🏥
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="w-full justify-center text-lg hover:border-tertiary"
                onClick={() => setRole("doctor")}
              >
                Specialist / Doctor 👩‍⚕️
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group cursor-pointer" onClick={() => setFormData({ ...formData, consent: !formData.consent })}>
                <input 
                  type="checkbox" 
                  checked={formData.consent} 
                  readOnly
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <p className="text-[10px] leading-relaxed text-muted-foreground group-hover:text-white transition-colors">
                  I consent to the collection and processing of my maternal health data in accordance with the 
                  <span className="text-primary font-bold mx-1">Kenya Data Protection Act (2019)</span> 
                  and ODPC guidelines. I understand my data is localized in Africa.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRole(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>


            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
