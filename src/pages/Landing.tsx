import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Volume2, VolumeX, Building2, ShieldCheck, Users } from "lucide-react";
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
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
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
      else if (role === 'admin') navigate("/admin-dashboard");
      else navigate("/mother-dashboard");
      
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
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
            className="shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-xs sm:text-sm h-8 sm:h-10"
          >
            About
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate("/features")}
            className="shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-xs sm:text-sm h-8 sm:h-10"
          >
            Features
          </Button>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={() => setIsSoundOn(!isSoundOn)}
          className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-full p-2 sm:p-3 hover:bg-card transition-all duration-300 hover:scale-110 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shrink-0 pointer-events-auto"
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
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/20" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-24 pb-10 overflow-y-auto">
        <div className="flex flex-col items-center w-full my-auto">
          {/* Logo */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up flex items-center gap-2 sm:gap-3">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-float" fill="currentColor" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MamaCare
            </h1>
          </div>

          {/* Glass Login Card */}
          <div className="w-full max-w-md animate-scale-in flex justify-center">
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
                    className="w-full glass-input"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>

                <button type="submit" className="w-full glass-button" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 text-center">Quick Access Dashboards</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={() => navigate("/mother-dashboard")}
                    className="flex items-center gap-2 h-10 text-[10px] font-bold"
                  >
                    <Heart className="w-3 h-3 text-primary" /> Mother
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={() => navigate("/hospital-dashboard")}
                    className="flex items-center gap-2 h-10 text-[10px] font-bold"
                  >
                    <Building2 className="w-3 h-3 text-secondary" /> Hospital
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={() => navigate("/admin-dashboard")}
                    className="flex items-center gap-2 h-10 text-[10px] font-bold"
                  >
                    <ShieldCheck className="w-3 h-3 text-accent" /> Admin
                  </Button>
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={() => navigate("/baba")}
                    className="flex items-center gap-2 h-10 text-[10px] font-bold"
                  >
                    <Users className="w-3 h-3 text-tertiary" /> Baba
                  </Button>
                </div>
              </div>
            </div>
          </div>

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
