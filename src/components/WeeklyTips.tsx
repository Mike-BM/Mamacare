import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, BookmarkPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const tips = [
  {
    tip: "Stay hydrated! Drink at least 8-10 glasses of water daily for optimal health.",
    emoji: "💧",
  },
  {
    tip: "Try 10 minutes of calm breathing today — it helps reduce stress and supports baby.",
    emoji: "🌿",
  },
  {
    tip: "Gentle walking for 20 minutes can improve circulation and boost your mood.",
    emoji: "🚶🏾‍♀️",
  },
  {
    tip: "Listen to your body — rest when you need it. Your body is doing incredible work!",
    emoji: "💫",
  },
  {
    tip: "Talk or sing to your baby — they can hear you and find comfort in your voice.",
    emoji: "🎵",
  },
];

export const WeeklyTips = () => {
  const [currentTip, setCurrentTip] = useState(tips[0]);

  const refreshTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
  };

  const saveTip = () => {
    toast.success("Tip saved to your journal!", {
      description: "You can view all saved tips in your Journey page.",
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Weekly Tip
        </h3>
        <Button variant="ghost" size="icon" onClick={refreshTip} className="hover:rotate-180 transition-transform duration-500">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
        <p className="text-sm text-foreground mb-2 flex items-center gap-2">
          <span className="text-2xl">{currentTip.emoji}</span>
          {currentTip.tip}
        </p>
      </div>

      <Button 
        variant="outline" 
        className="w-full hover:shadow-[var(--shadow-glow-pink)]"
        onClick={saveTip}
      >
        <BookmarkPlus className="w-4 h-4 mr-2" />
        Save to Journal
      </Button>
    </Card>
  );
};
