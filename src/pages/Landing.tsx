import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Volume2, VolumeX, Building2, ShieldCheck, Users, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import africanMother1 from "@/assets/african-mother-1.jpg";
import africanMother2 from "@/assets/african-mother-2.jpg";
import africanBaby1 from "@/assets/african-baby-1.jpg";
import maternityClinic from "@/assets/maternity-clinic.jpg";
import familyMoment from "@/assets/family-moment.jpg";

const carouselSlides = [
  {
    image: africanMother1,
    text: "Every life begins with care.",
  },
  {
    image: africanMother2,
    text: "Connecting mothers to trusted hospitals.",
  },
  {
    image: africanBaby1,
    text: "MamaCare — your pregnancy companion.",
  },
  {
    image: maternityClinic,
    text: "Professional care, compassionate hearts.",
  },
  {
    image: familyMoment,
    text: "Together, we nurture new beginnings.",
  },
];

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      toast.error(error.message || "Google sign-in failed.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder") || 
          (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) || 
          import.meta.env.VITE_SUPABASE_ANON_KEY === "placeholder_key" || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === "placeholder") {
        toast.error("System Error: Supabase API keys are missing. Please check your .env file and restart your dev server.");
        return;
      }

      // Test credentials bypass
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === "test@test.com" && password === "password") {
        toast.success("Welcome back (Test Mode)! 👋");
        navigate("/mother-dashboard");
        return;
      }
      if (cleanEmail === "hospital@test.com" && password === "password") {
        toast.success("Welcome back, Provider (Test Mode)! 👋");
        navigate("/hospital-dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const role = data.user?.user_metadata?.role || 'mother';
      
      toast.success("Welcome back! 👋");
      
      if (role === 'hospital') navigate("/hospital-dashboard");
      else if (role === 'admin') window.location.href = "/admin.html";
      else navigate("/mother-dashboard");
      
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] relative overflow-x-hidden">
      {/* Ambient Background Audio */}
      {isSoundOn && (
        <audio autoPlay loop className="hidden">
          <source src="/sounds/baby-laugh.mp3" type="audio/mpeg" />
        </audio>
      )}

      {/* Top Controls */}
      <div className="fixed top-0 left-0 right-0 p-4 sm:p-6 z-50 flex justify-between items-center gap-2 pointer-events-none">
        {/* Navigation Links */}
        <div className="flex gap-2 sm:gap-3 flex-wrap pointer-events-auto">
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate("/about")}
            className="shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-xs sm:text-sm min-h-[44px] min-w-[44px] px-4"
          >
            About
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate("/features")}
            className="shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-xs sm:text-sm min-h-[44px] min-w-[44px] px-4"
          >
            Features
          </Button>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={() => setIsSoundOn(!isSoundOn)}
          className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shrink-0 pointer-events-auto"
          aria-label={isSoundOn ? "Mute sound" : "Unmute sound"}
        >
          {isSoundOn ? (
            <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Carousel Background with zoom animation */}
      {carouselSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out bg-background ${
            index === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
        >
          {/* Blurred background to fill screen */}
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl"
          />
          {/* Main image fully visible on mobile, cover on desktop */}
          <img
            src={slide.image}
            alt={`African mother and newborn - ${slide.text}`}
            className="absolute inset-0 w-full h-full object-contain sm:object-cover"
            loading="lazy"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/20" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-24 pb-10 overflow-y-auto">
        <div className="flex flex-col items-center w-full my-auto">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3"
          >
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-float" fill="currentColor" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MamaCare
            </h1>
          </motion.div>

          {/* Glass Login Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md flex justify-center"
          >
            <div className="glass-card">
              <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">Welcome Back</h2>
              <p className="text-sm sm:text-base text-center mb-6">Sign in to continue your journey</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input active:scale-[0.99] transition-transform"
                    required
                  />
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input active:scale-[0.99] transition-transform pr-10"
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

                <button type="submit" className="w-full glass-button active:scale-95 transition-transform" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-white/40 text-xs">or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full glass-button flex items-center justify-center gap-2 active:scale-95 transition-transform bg-white/5 hover:bg-white/10"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 text-center">Quick Access Dashboards</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Mother", icon: Heart, path: "/mother-dashboard", color: "text-primary" },
                    { label: "Hospital", icon: Building2, path: "/hospital-dashboard", color: "text-secondary" },
                    { label: "Baba", icon: Users, path: "/baba", color: "text-tertiary" },
                  ].map((dash, i) => (
                    <motion.div
                      key={dash.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <Button 
                        variant="glass" 
                        size="sm" 
                        onClick={() => navigate(dash.path)}
                        className="flex items-center gap-2 h-11 w-full text-[10px] font-bold active:scale-95 transition-transform"
                      >
                        <dash.icon className={`w-3 h-3 ${dash.color}`} /> {dash.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Motivational Text */}
          <p className="mt-8 text-base sm:text-xl text-foreground/80 text-center animate-fade-in max-w-2xl px-4">
            {carouselSlides[currentSlide].text}
          </p>

          {/* Slide Indicators */}
          <div className="mt-8 sm:mt-12 flex gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-8 shadow-[0_0_10px_hsl(345_100%_72%/0.6)]"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
