import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, TrendingUp, Calendar, Activity } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BabyDevelopment } from "./BabyDevelopment";
import { AppointmentCountdown } from "./AppointmentCountdown";
import { Progress } from "./ui/progress";

interface PregnancyProgressTabsProps {
  currentWeek: number;
  totalWeeks?: number;
}

// Mock data for journey progress
const journeyData = Array.from({ length: 24 }, (_, i) => ({
  week: i + 1,
  weight: 50 + (i * 0.5) + Math.random() * 2,
  babySize: Math.pow(i + 1, 1.3) * 0.5,
  energy: 60 + Math.random() * 30,
}));

// Mock data for health metrics
const healthData = [
  { metric: "Hydration", value: 85, target: 100 },
  { metric: "Nutrition", value: 78, target: 100 },
  { metric: "Exercise", value: 65, target: 100 },
  { metric: "Sleep", value: 72, target: 100 },
];

// Mock appointments data
const appointments = [
  { date: "Dec 15, 2026", time: "10:00 AM", doctor: "Dr. Emily Chen", type: "Regular Checkup", status: "upcoming" },
  { date: "Dec 22, 2026", time: "2:00 PM", doctor: "Dr. Stacy Johnson", type: "Ultrasound", status: "upcoming" },
  { date: "Nov 20, 2026", time: "11:00 AM", doctor: "Dr. Emily Chen", type: "Blood Test", status: "completed" },
];

export const PregnancyProgressTabs = ({ currentWeek, totalWeeks = 40 }: PregnancyProgressTabsProps) => {
  const progressPercent = (currentWeek / totalWeeks) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm animate-scale-in hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <Baby className="w-6 h-6 text-primary" />
          Pregnancy Progress
        </h3>
        <span className="text-3xl font-bold text-primary">{currentWeek} weeks</span>
      </div>

      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <Baby className="w-4 h-4" />
            Development
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health
          </TabsTrigger>
        </TabsList>

        {/* Journey Tab with Graphs */}
        <TabsContent value="journey" className="space-y-6">
          <div className="relative mb-6">
            <Progress 
              value={progressPercent} 
              className="h-4 mb-2 bg-gradient-to-r from-primary/20 to-secondary/20" 
            />
            <div 
              className="absolute top-0 h-4 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {totalWeeks - currentWeek} weeks to go • You're in your second trimester
          </p>

          {/* Weight & Baby Growth Chart */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Your Journey So Far</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={journeyData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBaby" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorWeight)"
                  name="Your Weight (kg)"
                />
                <Area 
                  type="monotone" 
                  dataKey="babySize" 
                  stroke="hsl(var(--secondary))" 
                  fillOpacity={1} 
                  fill="url(#colorBaby)"
                  name="Baby Size (cm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Energy Levels */}
          <div className="space-y-2 mt-6">
            <h4 className="text-lg font-semibold">Energy Levels</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={journeyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="hsl(var(--tertiary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--tertiary))' }}
                  name="Energy %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Development Tab */}
        <TabsContent value="development">
          <BabyDevelopment week={currentWeek} />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <h4 className="text-lg font-semibold mb-4">Upcoming Appointments</h4>
          {appointments.filter(apt => apt.status === "upcoming").map((apt, idx) => (
            <Card key={idx} className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{apt.date}</span>
                    <span className="text-sm text-muted-foreground">at {apt.time}</span>
                  </div>
                  <p className="text-sm font-medium">{apt.type}</p>
                  <p className="text-sm text-muted-foreground">{apt.doctor}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {apt.status}
                </span>
              </div>
            </Card>
          ))}

          <h4 className="text-lg font-semibold mb-4 mt-8">Past Appointments</h4>
          {appointments.filter(apt => apt.status === "completed").map((apt, idx) => (
            <Card key={idx} className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 opacity-60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{apt.date}</span>
                    <span className="text-sm text-muted-foreground">at {apt.time}</span>
                  </div>
                  <p className="text-sm font-medium">{apt.type}</p>
                  <p className="text-sm text-muted-foreground">{apt.doctor}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {apt.status}
                </span>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Health Metrics Tab */}
        <TabsContent value="health" className="space-y-6">
          <h4 className="text-lg font-semibold">Daily Health Metrics</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="metric" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[8, 8, 0, 0]}
                name="Current %"
              />
              <Bar 
                dataKey="target" 
                fill="hsl(var(--muted))" 
                radius={[8, 8, 0, 0]}
                name="Target %"
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-4 mt-6">
            {healthData.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <span className="text-sm text-muted-foreground">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
