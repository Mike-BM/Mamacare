import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BabyDevelopmentProps {
  week: number;
}

const developmentData: Record<number, { size: string; icon: string; details: string[] }> = {
  24: {
    size: "Papaya",
    icon: "🥭",
    details: [
      "Baby can hear your voice and respond to sounds",
      "Taste buds are developing",
      "Brain is growing rapidly",
      "Lungs are developing breathing movements",
    ],
  },
  // Add more weeks as needed
};

export const BabyDevelopment = ({ week }: BabyDevelopmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = developmentData[week] || developmentData[24];

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-violet)] transition-all duration-500">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Baby className="w-5 h-5 text-tertiary" />
            Baby Development
          </h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-tertiary/10 to-primary/10 border border-tertiary/20 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{data.icon}</span>
            <div>
              <p className="text-sm text-muted-foreground">Your baby is about the size of</p>
              <p className="text-2xl font-bold text-tertiary">{data.size}</p>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm font-semibold text-foreground">This week's milestones:</p>
            {data.details.map((detail, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="text-tertiary text-xl">•</span>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
