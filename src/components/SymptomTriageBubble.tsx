import { useState, useRef, useEffect } from "react";
import { MessageCircleHeart, Send, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type Risk = "green" | "yellow" | "red";
type Msg = { role: "bot" | "user"; text: string };

// Lightweight rule-based triage flow (mocked, no AI call required)
const RED_FLAGS = ["bleeding", "severe pain", "no movement", "blurry vision", "seizure", "fainted", "can't breathe", "cant breathe"];
const YELLOW_FLAGS = ["headache", "swelling", "dizzy", "nausea", "fever", "cramps", "back pain"];

function scoreSymptom(text: string): Risk {
  const lower = text.toLowerCase();
  if (RED_FLAGS.some((f) => lower.includes(f))) return "red";
  if (YELLOW_FLAGS.some((f) => lower.includes(f))) return "yellow";
  return "green";
}

const FOLLOW_UPS = [
  "How long have you been feeling this way?",
  "On a scale of 1-10, how intense is it?",
  "Have you noticed any other symptoms?",
];

export const SymptomTriageBubble = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [risk, setRisk] = useState<Risk>("green");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi mama 🌸 I'm here to help. What symptom are you feeling right now?" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMessages: Msg[] = [...messages, { role: "user", text: userText }];

    if (step === 0) {
      const r = scoreSymptom(userText);
      setRisk(r);
      if (r === "red") {
        newMessages.push({
          role: "bot",
          text: "⚠️ This sounds urgent. Please use the SOS button immediately or go to your nearest hospital.",
        });
      } else {
        newMessages.push({ role: "bot", text: FOLLOW_UPS[0] });
      }
    } else if (step < FOLLOW_UPS.length) {
      // escalate yellow → red if numeric pain ≥ 8
      const num = parseInt(userText, 10);
      if (!isNaN(num) && num >= 8) setRisk("red");
      newMessages.push({ role: "bot", text: FOLLOW_UPS[step] ?? "" });
    } else {
      const guidance =
        risk === "red"
          ? "Please seek emergency care now. Tap the red SOS button to alert your contacts."
          : risk === "yellow"
          ? "Rest, hydrate, and monitor closely. If symptoms worsen in 2 hours, contact your provider."
          : "This sounds mild. Stay hydrated, rest, and log it in your journal. Reach out if it persists.";
      newMessages.push({ role: "bot", text: guidance });
    }

    setMessages(newMessages);
    setInput("");
    setStep((s) => s + 1);
  };

  const escalate = () => {
    toast.error("Escalating to emergency — opening SOS");
    setOpen(false);
    // dispatch a custom event the SOS button could listen to (optional)
    window.dispatchEvent(new CustomEvent("mamacare:escalate-sos"));
  };

  const riskColor =
    risk === "red" ? "bg-destructive" : risk === "yellow" ? "bg-yellow-500" : "bg-green-500";

  return (
    <>
      {/* Floating bubble bottom-LEFT (opposite SOS) */}
      <Button
        aria-label="Open symptom triage"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-8 z-50 rounded-full w-14 h-14 shadow-[var(--shadow-glow-violet)] bg-gradient-to-br from-tertiary to-primary hover:scale-110 transition-transform"
      >
        <MessageCircleHeart className="w-6 h-6 text-white" />
      </Button>

      {open && (
        <Card className="fixed bottom-28 left-8 z-50 w-[92vw] max-w-sm h-[480px] flex flex-col bg-card/95 backdrop-blur-xl border-border shadow-[var(--shadow-elegant)] animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-tertiary/20 to-primary/20">
            <div className="flex items-center gap-2">
              <MessageCircleHeart className="w-5 h-5 text-tertiary" />
              <div>
                <p className="font-semibold text-sm">Symptom Triage</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${riskColor}`} />
                  <span className="text-xs text-muted-foreground capitalize">{risk} risk</span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef as never}>
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {risk === "red" && (
                <Button variant="destructive" size="sm" className="w-full" onClick={escalate}>
                  <AlertTriangle className="w-4 h-4 mr-1" /> Escalate to Emergency
                </Button>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe symptom..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
};
