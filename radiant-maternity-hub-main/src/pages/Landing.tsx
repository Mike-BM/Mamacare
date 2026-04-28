import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Volume2, VolumeX } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to mother dashboard
    navigate("/mother-dashboard");
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Ambient Background Audio */}
      {isSoundOn && (
        <audio autoPlay loop className="hidden">
          <source src="/sounds/baby-laugh.mp3" type="audio/mpeg" />
        </audio>
      )}

      {/* Sound Toggle Button */}
      <button
        onClick={() => setIsSoundOn(!isSoundOn)}
        className="fixed top-6 right-6 z-50 backdrop-blur-xl bg-card/80 border border-border/50 rounded-full p-3 hover:bg-card transition-all duration-300 hover:scale-110 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        aria-label={isSoundOn ? "Mute sound" : "Unmute sound"}
      >
        {isSoundOn ? (
          <Volume2 className="w-6 h-6 text-primary" />
        ) : (
          <VolumeX className="w-6 h-6 text-muted-foreground" />
        )}
      </button>

      {/* Navigation Links */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        <Button
          variant="glass"
          onClick={() => navigate("/about")}
          className="shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        >
          About
        </Button>
        <Button
          variant="glass"
          onClick={() => navigate("/features")}
          className="shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        >
          Features
        </Button>
      </div>

      {/* Carousel Background with zoom animation */}
      {carouselSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
            index === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
        >
          <img
            src={slide.image}
            alt={`African mother and newborn - ${slide.text}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up flex items-center gap-3">
          <Heart className="w-12 h-12 text-primary animate-float" fill="currentColor" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MamaCare
          </h1>
        </div>

        {/* Glass Login Card */}
        <div className="w-full max-w-md animate-scale-in flex justify-center">
          <div className="glass-card">
            <h2 className="text-2xl font-semibold text-center mb-2">Welcome Back</h2>
            <p className="text-center mb-6">Sign in to continue your journey</p>
            
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

              <button type="submit" className="w-full glass-button">
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Register now
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Text */}
        <p className="mt-8 text-xl text-foreground/80 text-center animate-fade-in max-w-2xl">
          {carouselSlides[currentSlide].text}
        </p>

        {/* Slide Indicators */}
        <div className="mt-12 flex gap-2">
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
  );
};

export default Landing;
