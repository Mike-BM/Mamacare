import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Lock, Heart, Calendar, Flame, Users, BookOpen, Baby, Award, Sparkles, Footprints, MessageSquare, UserPlus } from "lucide-react";
import { toast } from "sonner";

const BADGES = [
  { id: 1, name: "First Kick Logged", desc: "Recorded baby's first movement", icon: Baby, unlocked: true },
  { id: 2, name: "All Visits Complete", desc: "Attended every scheduled appointment", icon: Calendar, unlocked: true },
  { id: 3, name: "7-Day Streak", desc: "Logged your mood 7 days in a row", icon: Flame, unlocked: true },
  { id: 4, name: "Community Helper", desc: "Replied to 10 community posts", icon: Users, unlocked: true },
  { id: 5, name: "Bookworm", desc: "Read 20 weekly tips", icon: BookOpen, unlocked: false },
  { id: 6, name: "Heart of Gold", desc: "Sent 5 mentor requests", icon: Heart, unlocked: false },
  { id: 7, name: "Walker", desc: "Logged exercise for 30 days", icon: Footprints, unlocked: false },
  { id: 8, name: "Storyteller", desc: "Shared your birth story", icon: MessageSquare, unlocked: false },
  { id: 9, name: "Wisdom Keeper", desc: "Completed all trimesters", icon: Sparkles, unlocked: false },
  { id: 10, name: "Champion Mama", desc: "Reached 40 weeks", icon: Award, unlocked: false },
];

const DAILY_TASKS = [
  { id: "weight", label: "Log weight", done: true },
  { id: "tip", label: "Read weekly tip", done: true },
  { id: "community", label: "Chat in community", done: false },
  { id: "med", label: "Take medications", done: false },
];

export const AchievementsTab = () => {
  const [partnerEmail, setPartnerEmail] = useState("");
  const unlocked = BADGES.filter((b) => b.unlocked).length;
  const completedTasks = DAILY_TASKS.filter((t) => t.done).length;
  const taskPct = (completedTasks / DAILY_TASKS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Daily progress rings */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-tertiary/10 border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Daily Progress
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{completedTasks}/{DAILY_TASKS.length} tasks today</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
              <circle
                cx="40" cy="40" r="34"
                stroke="hsl(var(--primary))" strokeWidth="6" fill="none"
                strokeDasharray={`${(taskPct / 100) * 213.6} 213.6`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {Math.round(taskPct)}%
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DAILY_TASKS.map((t) => (
            <div
              key={t.id}
              className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                t.done ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${t.done ? "bg-primary" : "bg-muted-foreground"}`} />
              {t.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-6 bg-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-tertiary" /> Achievements
          </h3>
          <Badge variant="secondary">{unlocked}/{BADGES.length} unlocked</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  b.unlocked
                    ? "border-primary/40 bg-gradient-to-br from-primary/10 to-tertiary/10 hover:scale-105 cursor-pointer"
                    : "border-border bg-muted/10 opacity-50"
                }`}
                onClick={() => b.unlocked && toast.success(`🏆 ${b.name}`)}
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    b.unlocked ? "bg-gradient-to-br from-primary to-tertiary" : "bg-muted"
                  }`}
                >
                  {b.unlocked ? <Icon className="w-6 h-6 text-white" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <p className="text-xs font-semibold leading-tight">{b.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Partner mode */}
      <Card className="p-6 bg-gradient-to-br from-secondary/10 to-tertiary/10 border-secondary/30">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <UserPlus className="w-5 h-5 text-secondary" /> Partner Mode
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Invite dad or your partner to track this journey together 💕
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-secondary to-tertiary">
              Invite partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite your partner</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success(`Invitation sent to ${partnerEmail} 💌`);
                setPartnerEmail("");
              }}
              className="space-y-3"
            >
              <Input
                type="email"
                required
                placeholder="partner@email.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
              />
              <Button type="submit" className="w-full">Send invitation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};
