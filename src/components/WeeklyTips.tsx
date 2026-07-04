import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, BookmarkPlus, RefreshCw, Droplet, Sprout, Footprints, Sparkles, Music } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AudioPlayer } from "./AudioPlayer";

const tips = [
  {
    tip: "Stay hydrated! Drink at least 8-10 glasses of water daily for optimal health.",
    icon: <Droplet className="w-5 h-5 text-primary" />,
  },
  {
    tip: "Try 10 minutes of calm breathing today — it helps reduce stress and supports baby.",
    icon: <Sprout className="w-5 h-5 text-primary" />,
  },
  {
    tip: "Gentle walking for 20 minutes can improve circulation and boost your mood.",
    icon: <Footprints className="w-5 h-5 text-primary" />,
  },
  {
    tip: "Listen to your body — rest when you need it. Your body is doing incredible work!",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
  },
  {
    tip: "Talk or sing to your baby — they can hear you and find comfort in your voice.",
    icon: <Music className="w-5 h-5 text-primary" />,
  },
];

export const WeeklyTips = () => {
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const navigate = useNavigate();

  const refreshTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
  };

  const saveTip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please sign in to save tips");
      return;
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: "Health Tip",
      content: currentTip.tip,
      mood: "grateful",
      tags: ["health tip", "wellness"],
      entry_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      toast.error("Failed to save tip");
      return;
    }

    toast.success("Tip saved to your journal!", {
      description: "View it in your Journal page.",
      action: {
        label: "View Health Tab",
        onClick: () => navigate("/mother-dashboard/health"),
      },
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
        <div className="text-sm text-foreground mb-2 flex items-start gap-3">
          <div className="shrink-0 p-1.5 bg-primary/10 rounded-lg">
            {currentTip.icon}
          </div>
          <p className="flex-1 self-center">{currentTip.tip}</p>
        </div>
        <div className="mt-4">
          <AudioPlayer text={currentTip.tip} title="Listen to this tip" />
        </div>
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
