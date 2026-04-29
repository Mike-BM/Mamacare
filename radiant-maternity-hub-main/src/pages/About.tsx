import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import maternityClinic from "@/assets/maternity-clinic.jpg";

const About = () => {
  const navigate = useNavigate();
  const timelineRef = useRef<HTMLDivElement>(null);

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

    const timelineItems = timelineRef.current?.querySelectorAll(".timeline-item");
    timelineItems?.forEach((item) => observer.observe(item));

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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aboutHero}
            alt="African mother holding newborn"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About MamaCare
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Empowering African mothers through digital health access and hospital connections.
              Every mother deserves quality care, support, and connection throughout her pregnancy journey.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-gradient-to-br from-card/80 to-card/60 border border-border/50 rounded-2xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] animate-scale-in">
              <h3 className="text-3xl font-bold mb-6 text-primary">Our Mission</h3>
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                MamaCare was born from a simple but powerful vision: to bridge the gap between 
                pregnant mothers and quality healthcare services across Africa. We believe that 
                every mother, regardless of location or circumstance, deserves access to trusted 
                medical professionals and supportive care throughout her pregnancy journey.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Through our digital platform, we connect expectant mothers with verified hospitals, 
                provide AI-powered pregnancy guidance, enable seamless appointment scheduling, and 
                create a supportive community where no mother feels alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 relative" ref={timelineRef}>
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            The MamaCare Journey
          </h3>
          
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Conception */}
            <div className="timeline-item opacity-0 relative pl-8 md:pl-12 border-l-4 border-primary/30">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary shadow-[0_0_20px_hsl(345_100%_72%/0.6)]" />
              <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-xl p-6 hover:shadow-[0_0_30px_hsl(345_100%_72%/0.3)] transition-all duration-300">
                <h4 className="text-2xl font-bold text-primary mb-3">Discovery & Connection</h4>
                <p className="text-foreground/80">
                  Mothers discover MamaCare and create their profiles, connecting with nearby hospitals 
                  and healthcare providers. The journey begins with trust and hope.
                </p>
              </div>
            </div>

            {/* Pregnancy */}
            <div className="timeline-item opacity-0 relative pl-8 md:pl-12 border-l-4 border-secondary/30">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-secondary shadow-[0_0_20px_hsl(212_73%_59%/0.6)]" />
              <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-xl p-6 hover:shadow-[0_0_30px_hsl(212_73%_59%/0.3)] transition-all duration-300">
                <h4 className="text-2xl font-bold text-secondary mb-3">Pregnancy Support</h4>
                <p className="text-foreground/80">
                  Throughout pregnancy, mothers receive AI-powered guidance, schedule regular checkups, 
                  track their baby's development, and access educational resources tailored to their needs.
                </p>
              </div>
            </div>

            {/* Birth */}
            <div className="timeline-item opacity-0 relative pl-8 md:pl-12 border-l-4 border-primary/30">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary shadow-[0_0_20px_hsl(345_100%_72%/0.6)]" />
              <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-xl p-6 hover:shadow-[0_0_30px_hsl(345_100%_72%/0.3)] transition-all duration-300">
                <h4 className="text-2xl font-bold text-primary mb-3">Birth & Emergency Care</h4>
                <p className="text-foreground/80">
                  When the time comes, mothers have direct access to their hospital, emergency SOS alerts, 
                  and real-time support. Every birth is met with preparedness and care.
                </p>
              </div>
            </div>

            {/* Postnatal Care */}
            <div className="timeline-item opacity-0 relative pl-8 md:pl-12 border-l-4 border-secondary/30">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-secondary shadow-[0_0_20px_hsl(212_73%_59%/0.6)]" />
              <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-xl p-6 hover:shadow-[0_0_30px_hsl(212_73%_59%/0.3)] transition-all duration-300">
                <h4 className="text-2xl font-bold text-secondary mb-3">Postnatal & Newborn Care</h4>
                <p className="text-foreground/80">
                  The journey continues with breastfeeding support, newborn tracking, vaccination reminders, 
                  and ongoing connection to healthcare professionals and the MamaCare community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="animate-fade-in">
                <img
                  src={maternityClinic}
                  alt="African maternity clinic with nurse and pregnant woman"
                  className="rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-border/50"
                />
              </div>
              <div className="animate-fade-in-up">
                <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Building Community
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                  MamaCare is more than a platform—it's a movement. We're building a supportive 
                  community where mothers share experiences, hospitals provide compassionate care, 
                  and technology bridges the gap.
                </p>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  Together, we're transforming maternal healthcare in Africa, one connection at a time.
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="mt-8"
                >
                  Join MamaCare Today
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

export default About;
