import { useState, useEffect } from "react";
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
                ? "opacity-40 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={slide}
              alt={`Maternal care ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/90" />
          </div>
        ))}
      </div>
    </>
  );
};
