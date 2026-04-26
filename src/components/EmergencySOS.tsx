import { useState, useRef, useEffect } from "react";
import { AlertCircle, MapPin, Phone, Hospital, Ambulance, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EMERGENCY_CONTACTS } from "@/lib/offline-store";

const NEARBY_HOSPITALS = [
  { name: "City Maternity Hospital", distance: "1.2 km", beds: 3, eta: "6 min" },
  { name: "St. Mary's Medical Center", distance: "2.8 km", beds: 5, eta: "11 min" },
  { name: "Hope Women's Clinic", distance: "4.1 km", beds: 1, eta: "15 min" },
];

export const EmergencySOS = () => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    startedAtRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startedAtRef.current) / 3000) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearHold();
        triggerEmergency();
      }
    }, 50);
  };

  const clearHold = () => {
    setHolding(false);
    setProgress(0);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cancelHold = () => {
    if (progress > 0 && progress < 100) {
      toast.info("SOS cancelled");
    }
    clearHold();
  };

  const triggerEmergency = () => {
    setActivated(true);
    // Capture GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: -1.286389, lng: 36.817223 }), // fallback Nairobi
        { timeout: 4000 }
      );
    } else {
      setLocation({ lat: -1.286389, lng: 36.817223 });
    }
    // Mock SMS dispatch
    setTimeout(() => {
      setSmsSent(true);
      toast.success(`SMS sent to ${EMERGENCY_CONTACTS.length} emergency contacts`);
    }, 1500);
  };

  useEffect(() => () => clearHold(), []);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2">
        {holding && (
          <div className="bg-card/95 backdrop-blur-md border border-destructive/40 rounded-xl px-4 py-2 shadow-[var(--shadow-glow-pink)] animate-fade-in">
            <p className="text-xs font-medium text-destructive mb-1">Hold to activate SOS</p>
            <Progress value={progress} className="h-1 w-32" />
          </div>
        )}
        <Button
          variant="sos"
          size="lg"
          aria-label="Emergency SOS - hold 3 seconds"
          className="rounded-full w-16 h-16 shadow-2xl animate-pulse hover:scale-110 transition-transform duration-300 select-none touch-none"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={(e) => { e.preventDefault(); startHold(); }}
          onTouchEnd={cancelHold}
          onTouchCancel={cancelHold}
        >
          <AlertCircle className="w-8 h-8" />
        </Button>
      </div>

      <Dialog open={activated} onOpenChange={(open) => !open && setActivated(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ambulance className="w-6 h-6" />
              Emergency Activated
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status checklist */}
            <div className="space-y-2 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <StatusRow done={!!location} label="GPS location captured" detail={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Locating..."} />
              <StatusRow done={smsSent} label={`SMS to ${EMERGENCY_CONTACTS.length} contacts`} detail={smsSent ? "Delivered" : "Sending..."} />
              <StatusRow done label="Ambulance dispatched" detail="ETA 8 minutes" />
            </div>

            {/* Contacts notified */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Phone className="w-4 h-4" /> Notified contacts</h4>
              <div className="space-y-1">
                {EMERGENCY_CONTACTS.map((c) => (
                  <div key={c.phone} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                    <Badge variant={smsSent ? "default" : "secondary"}>{smsSent ? "Sent" : "Sending"}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby hospitals */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Hospital className="w-4 h-4" /> Nearest hospitals</h4>
              <div className="space-y-2">
                {NEARBY_HOSPITALS.map((h) => (
                  <div key={h.name} className="p-3 rounded-lg border border-border bg-card/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{h.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {h.distance} • ETA {h.eta}
                        </p>
                      </div>
                      <Badge variant={h.beds > 2 ? "default" : "secondary"}>
                        {h.beds} bed{h.beds !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => window.open("tel:911")}
            >
              <Phone className="w-4 h-4 mr-2" /> Call Emergency Services
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatusRow = ({ done, label, detail }: { done: boolean; label: string; detail: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-primary" : "bg-muted"}`}>
      {done ? <Check className="w-3 h-3 text-primary-foreground" /> : <X className="w-3 h-3 text-muted-foreground" />}
    </div>
    <div className="flex-1">
      <p className="font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  </div>
);
