import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface DynamicGreetingProps {
  userName?: string;
}

const motivationalPhrases = [
  "You're doing amazing, Mama 💕",
  "Your strength inspires us all 🌟",
  "Every day you're creating magic ✨",
  "You and baby are thriving together 🌸",
  "Your journey is beautiful 💖",
];

export const DynamicGreeting = ({ userName = "Stacy Mutheu" }: DynamicGreetingProps) => {
  const [greeting, setGreeting] = useState("");
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    setPhrase(randomPhrase);
  }, []);

  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
          {greeting}, {userName}
        </h2>
        <Sparkles className="w-6 h-6 text-primary animate-float" />
      </div>
      <p className="text-muted-foreground text-lg flex items-center gap-2">
        {phrase}
      </p>
    </div>
  );
};
