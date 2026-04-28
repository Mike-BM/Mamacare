import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface DynamicGreetingProps {
  userName?: string;
}

const motivationalPhrases = [
  "You're doing amazing, Mama 💕",
  "Baby is growing strong 🌱",
  "Remember to hydrate 💧",
  "Every day you're creating magic ✨",
  "Your journey is beautiful 💖",
];

export const DynamicGreeting = ({ userName = "Eliza" }: DynamicGreetingProps) => {
  const [greeting, setGreeting] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  
  useEffect(() => {
    const hour = new Date().getHours();
    let currentGreeting = "";
    if (hour < 12) currentGreeting = "Good Morning";
    else if (hour < 17) currentGreeting = "Good Afternoon";
    else currentGreeting = "Good Evening";
    
    setGreeting(`${currentGreeting}, ${userName}`);
  }, [userName]);

  // Typing animation
  useEffect(() => {
    if (!greeting) return;
    let i = 0;
    setTypedText("");
    const interval = setInterval(() => {
      setTypedText(greeting.substring(0, i + 1));
      i++;
      if (i >= greeting.length) clearInterval(interval);
    }, 70); // Typing speed
    return () => clearInterval(interval);
  }, [greeting]);

  // Rotating phrase animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % motivationalPhrases.length);
    }, 4000); // Rotate every 4s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent h-10 border-r-2 border-primary animate-pulse pr-2">
          {typedText}
        </h2>
        <Sparkles className="w-6 h-6 text-primary animate-float" />
      </div>
      <div className="h-8 overflow-hidden">
        <p 
          key={phraseIndex} 
          className="text-muted-foreground text-lg animate-fade-in-up"
        >
          {motivationalPhrases[phraseIndex]}
        </p>
      </div>
    </div>
  );
};
