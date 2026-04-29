import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Calendar, Hospital, Bot, Baby, Shield, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    description: "Book and manage prenatal checkups with trusted hospitals seamlessly. Get reminders and never miss an important visit.",
    color: "primary",
  },
  {
    icon: Hospital,
    title: "Hospital Connection",
    description: "Connect with verified maternity hospitals and healthcare providers in your area. Build trust with your care team.",
    color: "secondary",
  },
  {
    icon: Bot,
    title: "AI Pregnancy Assistant",
    description: "Get instant answers to pregnancy questions, personalized health tips, and weekly development updates for you and your baby.",
    color: "primary",
  },
  {
    icon: Baby,
    title: "Newborn Tracking",
    description: "Monitor your baby's growth, feeding schedule, vaccination timeline, and developmental milestones all in one place.",
    color: "secondary",
  },
  {
    icon: Shield,
    title: "Emergency SOS",
    description: "One-tap emergency alerts to your hospital during critical moments. Fast response when every second counts.",
    color: "primary",
  },
  {
    icon: MessageCircle,
    title: "Breastfeeding Support",
    description: "Access expert guidance, tips, and a supportive community for breastfeeding mothers. You're never alone.",
    color: "secondary",
  },
];

const Features = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureCards = featuresRef.current?.querySelectorAll(".feature-card");
    featureCards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MamaCare
            </h1>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Features
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Everything you need for a supported, connected, and empowered pregnancy journey.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 relative" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isPrimary = feature.color === "primary";
              
              return (
                <div
                  key={index}
                  className="feature-card opacity-0 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-full backdrop-blur-xl bg-gradient-to-br from-card/80 to-card/60 border border-border/50 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                      isPrimary 
                        ? "from-primary/20 to-primary/5" 
                        : "from-secondary/20 to-secondary/5"
                    } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${
                        isPrimary ? "text-primary" : "text-secondary"
                      }`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-foreground/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="backdrop-blur-xl bg-gradient-to-br from-card/80 to-card/60 border border-border/50 rounded-2xl p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] animate-scale-in">
              <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ready to Start Your Journey?
              </h3>
              <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
                Join thousands of mothers who trust MamaCare for their pregnancy journey. 
                Connect with hospitals, access expert guidance, and never feel alone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => navigate("/register")}
                >
                  Get Started Now
                </Button>
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => navigate("/about")}
                >
                  Learn More About Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 MamaCare. Empowering mothers, nurturing futures.</p>
        </div>
      </footer>
    </div>
  );
};

export default Features;
