import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import africanMother1 from "@/assets/african-mother-1.jpg";
import africanMother2 from "@/assets/african-mother-2.jpg";
import familyMoment from "@/assets/family-moment.jpg";
import maternityClinic from "@/assets/maternity-clinic.jpg";

const mediaSlides = [
  africanMother1,
  africanMother2,
  familyMoment,
  maternityClinic,
];

export const BackgroundMedia = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mediaSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background Media Carousel */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {mediaSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-20 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={slide}
              alt={`Maternal care ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
          </div>
        ))}
      </div>

      {/* Ambient Music Control */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-20 right-4 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-[var(--shadow-glow-pink)] transition-all duration-300"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      {/* Ambient Audio */}
      {!isMuted && (
        <audio src="/sounds/baby-laugh.mp3" autoPlay loop className="hidden" />
      )}
    </>
  );
};
