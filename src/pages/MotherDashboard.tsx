import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, MessageCircle, BookOpen, Baby, AlertCircle, Menu, LogOut, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIChat } from "@/components/AIChat";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicGreeting } from "@/components/DynamicGreeting";
import { BabyDevelopment } from "@/components/BabyDevelopment";
import { AppointmentCountdown } from "@/components/AppointmentCountdown";
import { WeeklyTips } from "@/components/WeeklyTips";
import { MoodTracker } from "@/components/MoodTracker";

const MotherDashboard = () => {
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
        {/* Dynamic Greeting */}
        <DynamicGreeting userName="Sarah" />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pregnancy Progress */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm animate-scale-in hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Baby className="w-5 h-5 text-primary" />
                  Pregnancy Progress
                </h3>
                <span className="text-2xl font-bold text-primary">{pregnancyWeeks} weeks</span>
              </div>
              <div className="relative">
                <Progress 
                  value={progressPercent} 
                  className="h-4 mb-2 bg-gradient-to-r from-primary/20 to-secondary/20" 
                />
                <div 
                  className="absolute top-0 h-4 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {totalWeeks - pregnancyWeeks} weeks to go • You're in your second trimester
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4 hover:shadow-[var(--shadow-glow-pink)]"
                onClick={() => navigate("/my-journey")}
              >
                View Full Journey
              </Button>
            </Card>

            {/* Baby Development */}
            <BabyDevelopment week={pregnancyWeeks} />

            {/* Next Appointment with Countdown */}
            <AppointmentCountdown 
              date="Dec 15, 2024"
              time="10:00 AM"
              doctor="Dr. Emily Chen"
              hospital="City Medical Center"
            />

            {/* Quick Actions & AI Chat */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chat">AI Assistant</TabsTrigger>
                <TabsTrigger value="sounds">Baby Sounds</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500 cursor-pointer group"
                    onClick={() => navigate("/mama-circle")}
                  >
                    <MessageCircle className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold mb-1">MamaCircle</h4>
                    <p className="text-sm text-muted-foreground">Connect with mothers</p>
                  </Card>
                  
                  <Card 
                    className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-secondary hover:shadow-[var(--shadow-glow-blue)] transition-all duration-500 cursor-pointer group"
                    onClick={() => navigate("/my-journey")}
                  >
                    <Map className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold mb-1">My Journey</h4>
                    <p className="text-sm text-muted-foreground">Track your progress</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <AIChat />
              </TabsContent>

              <TabsContent value="sounds">
                <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
                  <h3 className="text-lg font-semibold mb-4">Baby Sounds</h3>
                  <div className="space-y-4">
                    <AudioPlayer 
                      src="/sounds/baby-cry.mp3" 
                      label="Baby Crying Sound"
                      loop
                    />
                    <AudioPlayer 
                      src="/sounds/baby-laugh.mp3" 
                      label="Baby Laughing Sound"
                      loop
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Listen to these sounds to familiarize yourself with your baby's cues
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Side Panel */}
          <div className="space-y-6">
            {/* Weekly Tips */}
            <WeeklyTips />

            {/* Mood Tracker */}
            <MoodTracker />
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
