import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Register = () => {
  const [role, setRole] = useState<"mother" | "hospital" | null>(null);
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/mother-dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign-up failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
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
          data: {
            full_name: formData.name,
            role: role
          }
        }
      });

      if (error) throw error;

      toast.success("Registration successful! 🎉");
      setTimeout(() => {
        navigate(role === "mother" ? "/mother-dashboard" : "/hospital-dashboard");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during registration");
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
            MamaCare
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

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border/50"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">or</span>
                <div className="flex-grow border-t border-border/50"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-input/50 backdrop-blur-sm border-border/50 hover:bg-input/80"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
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
