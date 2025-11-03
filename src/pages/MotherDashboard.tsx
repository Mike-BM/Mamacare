import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, MessageCircle, BookOpen, Baby, AlertCircle, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MotherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const pregnancyWeeks = 24;
  const totalWeeks = 40;
  const progressPercent = (pregnancyWeeks / totalWeeks) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MamaCare
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Sarah 💕</h2>
          <p className="text-muted-foreground">Let's take care of you and your little one</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pregnancy Progress */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Baby className="w-5 h-5 text-primary" />
                  Pregnancy Progress
                </h3>
                <span className="text-2xl font-bold text-primary">{pregnancyWeeks} weeks</span>
              </div>
              <Progress value={progressPercent} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {totalWeeks - pregnancyWeeks} weeks to go • You're in your second trimester
              </p>
            </Card>

            {/* Next Appointment */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-secondary" />
                Next Appointment
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">Dec 15, 2024 • 10:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">Dr. Emily Chen</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Hospital</span>
                  <span className="font-medium">City Medical Center</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Details
              </Button>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary transition-all duration-300 cursor-pointer">
                <MessageCircle className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-semibold mb-1">Chat Assistant</h4>
                <p className="text-sm text-muted-foreground">Ask health questions</p>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-secondary transition-all duration-300 cursor-pointer">
                <BookOpen className="w-8 h-8 text-secondary mb-3" />
                <h4 className="font-semibold mb-1">Health Tips</h4>
                <p className="text-sm text-muted-foreground">Weekly guidance</p>
              </Card>
            </div>
          </div>

          {/* Right Column - Side Panel */}
          <div className="space-y-6">
            {/* Baby Milestones */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
              <h3 className="text-lg font-semibold mb-4">This Week's Milestone</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium mb-1">Baby's Size</p>
                  <p className="text-xs text-muted-foreground">About the size of a papaya 🥭</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm font-medium mb-1">Development</p>
                  <p className="text-xs text-muted-foreground">Baby can hear your voice now!</p>
                </div>
              </div>
            </Card>

            {/* Weekly Tips */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Weekly Tip</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stay hydrated! Drink at least 8-10 glasses of water daily for optimal health.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary">
                Read more tips →
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating SOS Button */}
      <Button
        variant="sos"
        size="lg"
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-2xl z-50"
      >
        <AlertCircle className="w-8 h-8" />
      </Button>
    </div>
  );
};

export default MotherDashboard;
