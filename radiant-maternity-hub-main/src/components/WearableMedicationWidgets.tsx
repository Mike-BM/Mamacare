import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Watch, Heart, Scale, Pill, Plus, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceArea, BarChart, Bar, CartesianGrid } from "recharts";
import { toast } from "sonner";

// Mock fetal HR (bpm) over last 60 minutes
const fetalHR = Array.from({ length: 30 }, (_, i) => ({
  t: `${i * 2}m`,
  bpm: 130 + Math.round(Math.sin(i / 3) * 10 + (Math.random() * 6 - 3)),
}));

// Mock weight vs WHO recommended range (week 18-28)
const weightVsWHO = Array.from({ length: 11 }, (_, i) => {
  const week = 18 + i;
  return {
    week,
    you: 58 + i * 0.45 + Math.random() * 0.4,
    whoMin: 57 + i * 0.4,
    whoMax: 60 + i * 0.5,
  };
});

const MEDICATIONS = [
  { id: "iron", name: "Iron supplement", time: "8:00 AM" },
  { id: "folic", name: "Folic acid", time: "8:00 AM" },
  { id: "calcium", name: "Calcium + Vit D", time: "9:00 PM" },
  { id: "prenatal", name: "Prenatal multivitamin", time: "12:00 PM" },
];

export const WearableMedicationWidgets = () => {
  const [connected, setConnected] = useState(false);
  const [taken, setTaken] = useState<Record<string, boolean>>({});

  const toggleMed = (id: string, name: string) => {
    setTaken((t) => {
      const next = { ...t, [id]: !t[id] };
      if (next[id]) toast.success(`${name} logged ✓`);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Wearable */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-card border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Watch className="w-5 h-5 text-primary" /> Pregnancy Band
          </h3>
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "Connected" : "Not paired"}
          </Badge>
        </div>

        {!connected ? (
          <div className="text-center py-6">
            <Watch className="w-16 h-16 text-primary/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Connect your pregnancy band to track fetal heart rate, kicks, and contractions.
            </p>
            <Button onClick={() => { setConnected(true); toast.success("Pregnancy band connected 💕"); }}>
              <Plus className="w-4 h-4 mr-2" /> Pair device
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Heart className="w-4 h-4 text-destructive" fill="currentColor" />
              <span className="font-semibold">Fetal heart rate</span>
              <span className="text-muted-foreground ml-auto">
                avg <span className="text-primary font-bold">132 bpm</span>
              </span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={fetalHR}>
                <XAxis dataKey="t" hide />
                <YAxis domain={[110, 160]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>

      {/* Smart scale */}
      <Card className="p-6 bg-gradient-to-br from-secondary/10 to-card border-secondary/30">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-secondary" /> Smart Scale — vs WHO range
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weightVsWHO}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis domain={[55, 70]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="whoMax" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="WHO max" />
            <Bar dataKey="you" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="You" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-primary" /> You're tracking within healthy WHO guidelines.
        </p>
      </Card>

      {/* Medication reminders */}
      <Card className="p-6 bg-gradient-to-br from-tertiary/10 to-card border-tertiary/30">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-tertiary" /> Today's Medications
        </h3>
        <div className="space-y-2">
          {MEDICATIONS.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                taken[m.id]
                  ? "border-tertiary/50 bg-tertiary/10 opacity-70"
                  : "border-border bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <Checkbox
                checked={!!taken[m.id]}
                onCheckedChange={() => toggleMed(m.id, m.name)}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${taken[m.id] ? "line-through" : ""}`}>{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.time}</p>
              </div>
              {taken[m.id] && <Badge variant="outline" className="text-tertiary border-tertiary/40">Done</Badge>}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};
