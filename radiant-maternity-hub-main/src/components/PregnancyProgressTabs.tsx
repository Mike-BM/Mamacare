import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PregnancyProgressTabsProps {
  currentWeek: number;
  totalWeeks?: number;
}

export const PregnancyProgressTabs = ({ currentWeek, totalWeeks = 40 }: PregnancyProgressTabsProps) => {
  const [activeTab, setActiveTab] = useState("journey");
  const progressPercent = (currentWeek / totalWeeks) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-white/10 glass-card hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-500 overflow-hidden relative">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between relative z-10">
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              👶 Week {currentWeek} of {totalWeeks}
            </h3>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary uppercase font-bold tracking-wider">
              Trimester 2
            </Badge>
          </div>
          
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 w-4 h-full bg-white/30 animate-pulse rounded-full"></div>
            </div>
            {/* Milestones markers */}
            <div className="absolute top-0 left-[30%] w-1 h-full bg-white/20"></div>
            <div className="absolute top-0 left-[65%] w-1 h-full bg-white/20"></div>
          </div>
          <div className="flex justify-between text-xs text-white/50 font-bold tracking-widest uppercase">
            <span>Start</span>
            <span>{Math.round(progressPercent)}% Completed</span>
            <span>Due Date</span>
          </div>

          <p className="text-lg md:text-xl font-medium text-white/90">
            "Your baby is the size of an ear of corn 🌽"
          </p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0 self-center md:self-end">
          {["journey", "development", "health"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                activeTab === tab 
                  ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-primary/20 scale-105" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === "development" && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in-up">
          <p className="text-sm text-white/80">Baby's lungs are forming branches of the respiratory tree. Hearing is well established, and they can hear your voice clearly now!</p>
        </div>
      )}
      {activeTab === "health" && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in-up">
          <p className="text-sm text-white/80">You might be experiencing Braxton Hicks contractions. Remember to stay hydrated and rest when you feel fatigued.</p>
        </div>
      )}
      {activeTab === "journey" && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in-up flex gap-4 overflow-x-auto hide-scrollbar pb-2">
           <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-w-[150px]">
             <span className="text-xs text-primary font-bold uppercase">Week 20</span>
             <p className="text-sm text-white/90 font-medium">Anatomy Scan ✅</p>
           </div>
           <div className="bg-primary/20 p-3 rounded-xl border border-primary/30 min-w-[150px]">
             <span className="text-xs text-primary font-bold uppercase">Week 24</span>
             <p className="text-sm text-white font-medium">Viability Milestone 📍</p>
           </div>
           <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-w-[150px] opacity-50">
             <span className="text-xs text-white/50 font-bold uppercase">Week 28</span>
             <p className="text-sm text-white/90 font-medium">Glucose Test</p>
           </div>
        </div>
      )}
    </Card>
  );
};

