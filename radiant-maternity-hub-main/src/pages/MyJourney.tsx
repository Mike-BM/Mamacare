import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, TrendingUp, Droplet, Apple, Moon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyJourney = () => {
  const navigate = useNavigate();
  const pregnancyWeeks = 24;
  const totalWeeks = 40;

  // Mock data for trackers
  const hydrationProgress = 75;
  const nutritionProgress = 85;
  const restProgress = 60;

  const milestones = [
    { week: 24, title: "Baby can hear sounds", completed: true },
    { week: 28, title: "Baby's eyes open", completed: false },
    { week: 32, title: "Baby starts dreaming", completed: false },
    { week: 36, title: "Baby moves into position", completed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Journey
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Pregnancy Timeline */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Pregnancy Timeline
          </h2>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Week {pregnancyWeeks} of {totalWeeks}</span>
              <span className="text-sm font-semibold text-primary">{Math.round((pregnancyWeeks / totalWeeks) * 100)}%</span>
            </div>
            <Progress 
              value={(pregnancyWeeks / totalWeeks) * 100} 
              className="h-4 bg-gradient-to-r from-primary/20 to-secondary/20"
            />
          </div>

          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  milestone.completed
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {milestone.completed ? "✓" : milestone.week}
                  </div>
                  <div>
                    <p className="font-medium">Week {milestone.week}</p>
                    <p className="text-sm text-muted-foreground">{milestone.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Health Trackers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-blue)] transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-secondary/20">
                <Droplet className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold">Hydration</h3>
            </div>
            <Progress value={hydrationProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{hydrationProgress}% of daily goal</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Apple className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Nutrition</h3>
            </div>
            <Progress value={nutritionProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{nutritionProgress}% of daily goal</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-violet)] transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-tertiary/20">
                <Moon className="w-6 h-6 text-tertiary" />
              </div>
              <h3 className="font-semibold">Rest</h3>
            </div>
            <Progress value={restProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{restProgress}% of daily goal</p>
          </Card>
        </div>

        {/* Growth Chart */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-secondary" />
            Baby Growth Chart
          </h2>
          <div className="h-64 flex items-end justify-around gap-2">
            {[12, 16, 20, 24, 28, 32, 36, 40].map((week) => {
              const height = (week / 40) * 100;
              const isCurrent = week === pregnancyWeeks;
              return (
                <div key={week} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isCurrent
                        ? "bg-gradient-to-t from-primary to-secondary shadow-[var(--shadow-glow-pink)]"
                        : week < pregnancyWeeks
                        ? "bg-primary/50"
                        : "bg-muted/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">{week}w</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyJourney;
