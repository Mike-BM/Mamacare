import { useState, useRef, useEffect } from "react";
import { MessageCircleHeart, Send, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Risk = "low" | "medium" | "high" | "emergency";
type Msg = { role: "bot" | "user"; text: string };

export const SymptomTriageBubble = () => {
  const [open, setOpen] = useState(false);
  const [risk, setRisk] = useState<Risk>("low");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi mama 🌸 I'm here to help. What symptom are you feeling right now?" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    const newMessages: Msg[] = [...messages, { role: "user", text: userText }];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      let userId = '00000000-0000-0000-0000-000000000000';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) userId = session.user.id;
      } catch (e) {
        console.error("Auth fetch failed", e);
      }
      
      const response = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: userText,
          userId
        }),
      });

      if (!response.ok) throw new Error('Failed to get triage response');
      const data = await response.json();
      
      setRisk(data.riskLevel || 'low');
      setMessages(prev => [...prev, { role: "bot", text: data.message }]);
      
      if (data.riskLevel === 'emergency') {
        toast.error("Emergency risk detected. Please seek immediate help.", {
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Triage error:', error);
      setMessages(prev => [...prev, { role: "bot", text: "I'm having trouble connecting right now. If your symptoms are severe, please seek emergency care immediately." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const escalate = () => {
    toast.error("Escalating to emergency — opening SOS");
    setOpen(false);
    window.dispatchEvent(new CustomEvent("mamacare:escalate-sos"));
  };

  const riskColor =
    risk === "emergency" ? "bg-red-600 animate-pulse" : 
    risk === "high" ? "bg-orange-500" :
    risk === "medium" ? "bg-yellow-500" : "bg-green-500";

  return (
    <>
      {/* Floating bubble bottom-RIGHT */}
      <Button
        aria-label="Open symptom triage"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 rounded-full w-14 h-14 shadow-[var(--shadow-glow-violet)] bg-gradient-to-br from-tertiary to-primary hover:scale-110 transition-transform"
      >
        <MessageCircleHeart className="w-6 h-6 text-white" />
      </Button>

      {open && (
        <Card className="fixed bottom-44 right-4 md:bottom-28 md:right-8 z-50 w-[92vw] max-w-sm h-[480px] flex flex-col bg-card/95 backdrop-blur-xl border-border shadow-[var(--shadow-elegant)] animate-fade-in">
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
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-primary">Assessing...</span>
                  </div>
                </div>
              )}
              {risk === "emergency" && (
                <Button variant="destructive" size="sm" className="w-full mt-2 animate-pulse" onClick={escalate}>
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
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
};
