import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Volume2, VolumeX, Building2, ShieldCheck, Users, Eye, EyeOff, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
    text: "MamaCare Africa — your pregnancy companion.",
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

  useEffect(() => {
    // Check for OAuth errors in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error_description');
    if (error) {
      toast.error(error.replace(/\+/g, ' '));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
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
          <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl" />
          <img src={slide.image} alt={`African mother and newborn - ${slide.text}`} className="absolute inset-0 w-full h-full object-contain sm:object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 sm:bg-black/20" />
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-24 pb-20 overflow-y-auto">
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 w-full mb-20 pt-10">
            <div className="flex-1 text-center lg:text-left animate-fade-in-up">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 flex items-center justify-center lg:justify-start gap-3">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-float" fill="currentColor" />
                <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent tracking-tighter">MamaCare Africa</h1>
              </motion.div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">Safe Motherhood, <br/> <span className="text-secondary">Just a Tap Away.</span></h2>
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">Join thousands of mothers across Africa who trust MamaCare Africa for 24/7 AI-powered triage, instant hospital bookings, and emergency MamaRide logistics.</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">KMPDC Verified</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">Instant SOS</span>
                </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-md">
              <div className="glass-card border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><Badge className="bg-primary/20 text-primary border-none">v2.4 Production</Badge></div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Welcome Back</h2>
                <p className="text-sm text-white/50 mb-6 font-medium">Continue your healthcare journey</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass-input focus:ring-2 ring-primary/50 transition-all" required /></div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Secure Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass-input focus:ring-2 ring-primary/50 transition-all pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <button type="submit" className="w-full glass-button bg-primary hover:bg-primary/80 text-white font-black h-12 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all" disabled={loading}>{loading ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD"}</button>
                  <div className="relative flex items-center py-2"><div className="flex-grow border-t border-white/10"></div><span className="flex-shrink-0 mx-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">or connect via</span><div className="flex-grow border-t border-white/10"></div></div>
                  <button type="button" onClick={handleGoogleLogin} className="w-full glass-button flex items-center justify-center gap-3 active:scale-95 transition-transform bg-white/5 hover:bg-white/10 border-white/10">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google Account
                  </button>
                </form>
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center">
                  <p className="text-white/50 text-sm mb-4">Don't have an account yet?</p>
                  <Button variant="link" onClick={() => navigate("/register")} className="text-secondary font-black hover:text-secondary/80 p-0 h-auto text-lg tracking-tight">Join MamaCare Africa Today →</Button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { title: "AI Triage (Dr. Nneka)", desc: "Get instant medical guidance powered by Gemini AI, tailored for maternal health in Africa.", icon: Zap, color: "bg-yellow-500/20 text-yellow-400" },
              { title: "MamaRide Logistics", desc: "Integrated emergency transport system connecting you to the nearest hospital in minutes.", icon: Building2, color: "bg-blue-500/20 text-blue-400" },
              { title: "KMPDC Network", desc: "Access a verified network of thousands of doctors and licensed maternity clinics.", icon: ShieldCheck, color: "bg-green-500/20 text-green-400" }
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl hover:border-white/30 transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}><feature.icon className="w-8 h-8" /></div>
                <h3 className="text-xl font-black text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="w-full p-8 sm:p-16 bg-gradient-to-br from-primary/20 via-background to-background border border-white/10 rounded-[3rem] text-center mb-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto relative z-10">
              <Badge className="mb-6 bg-white/10 text-white border-none py-1 px-4">Our Mission</Badge>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-8 tracking-tighter">Revolutionizing Maternal Healthcare</h2>
              <p className="text-lg text-white/70 leading-relaxed mb-10">MamaCare Africa was founded with a single goal: to eliminate preventable maternal deaths in Africa through technology. By bridging the gap between rural mothers and urban medical excellence, we ensure that no mother travels this journey alone.</p>
              <div className="flex justify-center gap-8">
                <div><p className="text-4xl font-black text-primary">120K+</p><p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-2">Lives Impacted</p></div>
                <div className="w-px h-12 bg-white/10" />
                <div><p className="text-4xl font-black text-secondary">98%</p><p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-2">Successful Triage</p></div>
              </div>
            </motion.div>
          </div>

          <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/10">
            <div className="flex items-center gap-2"><Heart className="w-6 h-6 text-primary" fill="currentColor" /><span className="font-bold text-white/80">MamaCare Africa © 2026</span></div>
            <div className="flex gap-8">
              <button className="text-xs font-bold text-white/40 hover:text-white transition-colors">Privacy Policy</button>
              <button className="text-xs font-bold text-white/40 hover:text-white transition-colors">Security Audit</button>
              <button className="text-xs font-bold text-white/40 hover:text-white transition-colors">KMPDC License</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Landing;
