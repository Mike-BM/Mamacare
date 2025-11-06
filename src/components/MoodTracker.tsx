import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Heart } from "lucide-react";
import { toast } from "sonner";

export const MoodTracker = () => {
  const [mood, setMood] = useState(50);

  const getMoodIcon = () => {
    if (mood < 33) return <Frown className="w-8 h-8 text-destructive" />;
    if (mood < 66) return <Meh className="w-8 h-8 text-secondary" />;
    return <Smile className="w-8 h-8 text-primary" />;
  };

  const getMoodText = () => {
    if (mood < 33) return "Feeling low";
    if (mood < 66) return "Feeling okay";
    return "Feeling great";
  };

  const saveMood = () => {
    toast.success("Mood saved!", {
      description: "Your weekly reflection has been recorded.",
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary" />
        How are you feeling this week?
      </h3>
      
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
          {getMoodIcon()}
        </div>
        
        <p className="text-lg font-medium">{getMoodText()}</p>
        
        <Slider
          value={[mood]}
          onValueChange={(value) => setMood(value[0])}
          max={100}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>Not great</span>
          <span>Amazing</span>
        </div>

        <Button onClick={saveMood} className="w-full mt-2">
          Save Reflection
        </Button>
      </div>
    </Card>
  );
};
