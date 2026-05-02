import { Card } from "@/components/ui/card";
import { Baby, Activity, Heart, Calendar, ArrowRight, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicGreeting } from "@/components/DynamicGreeting";

export default function BabaDashboard() {
  const currentWeek = 24;

  const tasks = [
    { id: 1, title: "Assemble the crib", status: "pending" },
    { id: 2, title: "Pack hospital bag", status: "pending" },
    { id: 3, title: "Read Chapter 4 of 'The Expectant Father'", status: "done" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 relative overflow-hidden">
      <div className="container mx-auto space-y-6 relative z-10">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Baby className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Baba Mode
            </h1>
          </div>
          <Button variant="outline" className="border-white/10 glass-card">
            <Share2 className="w-4 h-4 mr-2" /> Share Updates
          </Button>
        </header>

        <DynamicGreeting userName="David" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-blue-500/10 to-background relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Baby className="w-5 h-5 text-blue-400" />
                Baby Update (Week {currentWeek})
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  🥭
                </div>
                <div>
                  <p className="text-xl font-semibold mb-1">Size of a Mango</p>
                  <p className="text-sm text-white/70">Baby is practicing breathing and growing eyelashes! They can hear your voice clearly now.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-green-400" />
                Your Tasks
              </h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                    <div className={`w-4 h-4 rounded-full border ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-white/30'}`} />
                    <span className={`text-sm ${task.status === 'done' ? 'text-white/50 line-through' : 'text-white/90'}`}>{task.title}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white">Add New Task</Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 glass-card border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                Mama's Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <span className="text-sm text-white/80">Current Mood</span>
                  <span className="text-xl">😊</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <span className="text-sm text-white/80">Next Appointment</span>
                  <span className="text-sm font-semibold flex items-center gap-1 text-secondary"><Calendar className="w-4 h-4" /> Tomorrow, 2 PM</span>
                </div>
                <p className="text-xs text-white/50 text-center pt-2">Health metrics are set to read-only by Eliza</p>
              </div>
            </Card>

            <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-tertiary/10 to-background">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-tertiary" />
                How to Help Today
              </h3>
              <div className="space-y-4 text-sm text-white/80">
                <p>💡 Eliza mentioned she's having trouble sleeping. Suggest a back massage before bed.</p>
                <p>💧 Ensure she drinks at least 8 glasses of water today.</p>
                <p>🎵 Play some calming music; the baby will react to it!</p>
              </div>
              <Button className="w-full mt-6 bg-tertiary hover:bg-tertiary/90 text-white shadow-[0_0_15px_rgba(255,160,122,0.4)]">
                Message Eliza <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
