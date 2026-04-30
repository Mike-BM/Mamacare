import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PregnancyProgressTabsProps {
  currentWeek: number;
  totalWeeks?: number;
}

export const PregnancyProgressTabs = ({ currentWeek, totalWeeks = 40 }: PregnancyProgressTabsProps) => {
  const progressPercent = (currentWeek / totalWeeks) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-white/10 glass-card hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-500 overflow-hidden relative">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            👶 Week {currentWeek} of {totalWeeks}
          </h3>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary uppercase font-bold tracking-wider">
            Trimester 2
          </Badge>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 w-4 h-full bg-white/30 animate-pulse rounded-full"></div>
            </div>
            <div className="absolute top-0 left-[30%] w-px h-full bg-white/20"></div>
            <div className="absolute top-0 left-[65%] w-px h-full bg-white/20"></div>
          </div>
          <div className="flex justify-between text-xs text-white/50 font-bold tracking-widest uppercase mt-2">
            <span>Start</span>
            <span>{Math.round(progressPercent)}% Completed</span>
            <span>Due Date</span>
          </div>
        </div>

        {/* Baby info */}
        <div className="space-y-1">
          <p className="text-lg font-medium text-white/90">
            "Your baby is the size of an ear of corn 🌽"
          </p>
          <p className="text-sm text-white/60 italic">
            Baby's lungs are developing — they can hear your voice!
          </p>
        </div>

        {/* Milestone timeline */}
        <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
          <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/10 min-w-[140px] shrink-0">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Week 20</span>
            <p className="text-sm text-white/90 font-medium mt-0.5">Anatomy Scan ✅</p>
          </div>
          <div className="bg-primary/20 px-4 py-3 rounded-xl border border-primary/30 min-w-[150px] shrink-0">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Week 24</span>
            <p className="text-sm text-white font-medium mt-0.5">Viability Milestone 📍</p>
          </div>
          <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/10 min-w-[140px] shrink-0 opacity-50">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Week 28</span>
            <p className="text-sm text-white/90 font-medium mt-0.5">Glucose Test</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button size="sm" variant="hero" className="rounded-full h-8 px-4 text-xs">
            This Week's Tips
          </Button>
          <Button size="sm" variant="glass" className="rounded-full h-8 px-4 text-xs">
            Log Symptoms
          </Button>
        </div>
      </div>
    </Card>
  );
};
