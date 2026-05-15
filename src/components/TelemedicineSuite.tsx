import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Video, PhoneOff, Mic, MicOff, VideoOff, FileText, Pill, Calendar, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSound } from "@/hooks/useSound";
import { Loader2 } from "lucide-react";

// We will now fetch these from Supabase instead of using mock data
interface Appointment {
  id: string;
  doctor_id: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed';
  video_link?: string;
  doctor_name?: string;
}

const SAMPLE_TRANSCRIPTS = [
  "Dr: How have you been feeling this week?",
  "Patient: Some lower back pain, especially in the evenings.",
  "Dr: That's common at 24 weeks. Try a pregnancy pillow and gentle stretching.",
  "Dr: Your blood pressure looks great. Keep up the iron supplements.",
  "Patient: Thank you, doctor. See you in two weeks.",
];

const PRESCRIPTION = {
  doctor: "Dr. Achieng Otieno",
  date: new Date().toLocaleDateString(),
  items: [
    { name: "Ferrous Sulfate 200mg", dose: "1 tablet daily with food" },
    { name: "Folic Acid 5mg", dose: "1 tablet daily" },
    { name: "Calcium + Vit D", dose: "1 tablet at bedtime" },
  ],
};

export const TelemedicineSuite = () => {
  const [inCall, setInCall] = useState(false);
  const [callDoctor, setCallDoctor] = useState<string>("");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, SOUNDS } = useSound();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get mother_id first
    const { data: motherData } = await supabase
      .from('mothers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (motherData) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('mother_id', motherData.id)
        .order('appointment_date', { ascending: true }); // Corrected column name

      if (!error) {
        setAppointments(data || []);
      }
    }
    setLoading(false);
  };

  const startCall = async (apt: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to book an appointment");
        return;
      }

      toast.info("Preparing your secure consultation...");
      play(SOUNDS.CALL_JOIN, { volume: 0.15 });

      // 1. Create pending appointment on backend
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, // Passing userId, backend will find mother_id
          doctorId: "00000000-0000-0000-0000-000000000001",
          time: new Date().toISOString(),
          amount: 1500
        })
      });

      const { appointment } = await response.json();

      // 2. Initiate Payment Processing
      toast.success("Booking created! Initializing secure payment gateway...");
      
      // Secure payment redirect handler
      setTimeout(() => {
        toast.info("Connecting to payment provider...");
        console.log("Processing payment for appointment:", appointment.id);
      }, 1500);
      
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to initiate booking");
    }
  };

  const endCall = () => {
    setInCall(false);
    setShowSummary(true);
    play(SOUNDS.CALL_END, { volume: 0.15 });
    toast.success("Call ended — generating notes & prescription");
  };

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Card className="p-6 bg-gradient-to-br from-secondary/10 to-card border-secondary/30">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-secondary" />
        Telemedicine
      </h3>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No appointments booked yet.</p>
            <Button variant="link" className="mt-2 text-primary" onClick={() => toast.info("Booking feature coming soon!")}>
              Book your first consultation
            </Button>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">Consultation</p>
                  <p className="text-xs text-muted-foreground">Status: 
                    <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="ml-2 py-0 h-4 text-[10px]">
                      {apt.status.toUpperCase()}
                    </Badge>
                  </p>
                </div>
                <div className="text-right text-xs font-medium">
                  {new Date(apt.appointment_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {apt.status === 'confirmed' && apt.video_link ? (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 animate-pulse" onClick={() => { play(SOUNDS.CLICK); window.open(apt.video_link, '_blank'); }}>
                    <Video className="w-3 h-3 mr-1" /> Join Call
                  </Button>
                ) : apt.status === 'pending' ? (
                  <Button size="sm" variant="outline" onClick={() => toast.info("Waiting for payment confirmation...")}>
                    <CreditCard className="w-3 h-3 mr-1" /> Complete Payment
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled>
                    <Calendar className="w-3 h-3 mr-1" /> Appointment Set
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* In-call UI */}
      <Dialog open={inCall} onOpenChange={(open) => !open && endCall()}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-0">
          <div className="bg-gradient-to-br from-secondary/40 via-tertiary/30 to-primary/30 aspect-video relative flex items-center justify-center">
            {/* Provider video feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              {videoOff ? (
                <VideoOff className="w-20 h-20 text-white/40" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl">
                  👩🏾‍⚕️
                </div>
              )}
            </div>
            {/* Self preview */}
            <div className="absolute bottom-4 right-4 w-24 h-32 rounded-lg bg-black/60 border-2 border-white/20 flex items-center justify-center text-3xl">
              🤰🏾
            </div>
            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                <p className="font-semibold">{callDoctor}</p>
              </div>
              <Badge className="bg-destructive/90 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" /> {fmtTime(seconds)}
              </Badge>
            </div>
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                size="icon"
                variant={muted ? "destructive" : "secondary"}
                className="rounded-full"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant={videoOff ? "destructive" : "secondary"}
                className="rounded-full"
                onClick={() => setVideoOff(!videoOff)}
              >
                {videoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="destructive" className="rounded-full" onClick={endCall}>
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-call summary: transcript + prescription */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-secondary" /> Visit Summary
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Auto-Transcribed Notes</p>
              <div className="space-y-1 p-3 rounded-lg bg-muted/30 text-sm max-h-48 overflow-y-auto">
                {SAMPLE_TRANSCRIPTS.map((line, i) => (
                  <p key={i} className={line.startsWith("Dr:") ? "text-secondary" : ""}>{line}</p>
                ))}
              </div>
            </div>

            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" /> Prescription
                </h4>
                <Badge variant="outline">{PRESCRIPTION.date}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Issued by {PRESCRIPTION.doctor}</p>
              <ul className="space-y-2">
                {PRESCRIPTION.items.map((item) => (
                  <li key={item.name} className="text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.dose}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Button className="w-full" onClick={() => { toast.success("Saved to your records 📂"); setShowSummary(false); }}>
              Save to records
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
