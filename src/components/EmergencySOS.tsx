import { useState, useRef, useEffect } from "react";
import { AlertCircle, MapPin, Phone, Hospital, Ambulance, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { EMERGENCY_CONTACTS } from "@/lib/offline-store";

import { HospitalMap } from "./HospitalMap";

const NEARBY_HOSPITALS = [
  { name: "City Maternity Hospital", distance: "1.2 km", beds: 3, eta: "6 min", lat: -1.280000, lng: 36.820000 },
  { name: "St. Mary's Medical Center", distance: "2.8 km", beds: 5, eta: "11 min", lat: -1.295000, lng: 36.810000 },
  { name: "Hope Women's Clinic", distance: "4.1 km", beds: 1, eta: "15 min", lat: -1.275000, lng: 36.830000 },
];

export const EmergencySOS = () => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [activated, setActivated] = useState(false);
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  
  // Mock risk level: 'green', 'yellow', 'red'
  const riskLevel = "green"; 

  const startHold = () => {
    if (showRadialMenu) return; // Don't trigger if menu is already open
    setHolding(true);
    setProgress(0);
    startedAtRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startedAtRef.current) / 2000) * 100);
      setProgress(pct);
      
      // Haptic feedback mock for supported devices
      if (pct > 0 && pct % 20 < 5 && navigator.vibrate) {
        navigator.vibrate(50);
      }

      if (pct >= 100) {
        clearHold();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Final vibration
        setShowRadialMenu(true);
      }
    }, 20);
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
    setShowRadialMenu(false);
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

  // Arc calculation for the hold ring
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <>
      <div className="fixed bottom-8 left-8 z-50 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-[72px] h-[72px]">
          
          {/* Radial Menu */}
          {showRadialMenu && (
            <>
              {/* Overlay to close menu */}
              <div className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10" onClick={() => setShowRadialMenu(false)} />
              
              {/* Menu Items */}
              <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                <Button variant="destructive" className="absolute -top-16 rounded-full w-12 h-12 shadow-[0_0_20px_rgba(231,76,60,0.5)]" onClick={() => {toast.success("Ambulance dispatched"); triggerEmergency();}}>
                  <Ambulance className="w-5 h-5" />
                </Button>
                <Button className="absolute -left-14 -top-8 rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]" onClick={() => {toast.success("Location shared"); triggerEmergency();}}>
                  <MapPin className="w-5 h-5" />
                </Button>
                <Button className="absolute -right-14 -top-8 rounded-full w-12 h-12 bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.5)]" onClick={() => {toast.success("Calling emergency contact..."); triggerEmergency();}}>
                  <Phone className="w-5 h-5" />
                </Button>
                <Button className="absolute -left-16 top-8 rounded-full w-12 h-12 bg-purple-500 hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.5)]" onClick={() => {toast.success("Finding nearest hospital..."); triggerEmergency();}}>
                  <Hospital className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="transparent"
              strokeWidth="4"
              fill="none"
            />
            {holding && (
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="#e74c3c"
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-75"
                style={{ filter: 'drop-shadow(0 0 4px rgba(231,76,60,0.8))' }}
              />
            )}
          </svg>

          {/* Main SOS Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="sos"
                  size="lg"
                  aria-label="Emergency SOS - hold 2 seconds"
                  className={`relative rounded-full w-14 h-14 shadow-[0_0_20px_rgba(231,76,60,0.3)] transition-all duration-300 select-none touch-none z-20 overflow-hidden ${holding ? 'scale-95 bg-red-600' : 'hover:scale-105 hover:bg-red-500'} ${!holding && !showRadialMenu ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}`}
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                  onTouchEnd={cancelHold}
                  onTouchCancel={cancelHold}
                  onClick={() => {
                    if (showRadialMenu) setShowRadialMenu(false);
                  }}
                >
                  {showRadialMenu ? <X className="w-8 h-8" /> : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-black text-lg tracking-widest text-white leading-none">SOS</span>
                    </div>
                  )}
                  
                  {/* Risk Indicator Dot */}
                  {!showRadialMenu && (
                    <span className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-background ${
                      riskLevel === 'green' ? 'bg-[#2ecc71]' : 
                      riskLevel === 'yellow' ? 'bg-[#f39c12]' : 'bg-[#e74c3c]'
                    }`} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-destructive border-destructive-foreground/20 text-white font-bold mb-2">
                Hold 2 seconds to share location & alert contacts
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {holding && progress < 100 && (
            <div className="absolute -top-12 whitespace-nowrap bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-destructive border border-destructive/20 animate-fade-in-up">
              Hold {2 - Math.floor(progress / 50)}s more...
            </div>
          )}
        </div>
      </div>

      <Dialog open={activated} onOpenChange={(open) => !open && setActivated(false)}>
        <DialogContent className="max-w-lg glass-card border-destructive/20 text-center p-8 sm:p-12">
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(231,76,60,0.4)]">
                <Ambulance className="w-12 h-12 text-destructive" />
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-destructive mb-4 tracking-tight">Help is coming.</h2>
              <p className="text-2xl text-white/90 font-medium">Stay calm.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-white/50 uppercase tracking-wider font-bold mb-2">Expected Arrival</p>
              <p className="text-5xl font-black text-white font-mono tracking-tighter">08:00</p>
              <p className="text-sm text-white/50 mt-2">minutes</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
              <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2"><Hospital className="w-4 h-4 text-red-400" /> Live Tracker</h3>
              {location && (
                <div className="mb-4">
                  <HospitalMap userLocation={location} hospitals={NEARBY_HOSPITALS} />
                </div>
              )}
              <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2 mt-4"><Hospital className="w-4 h-4 text-red-400" /> Nearest Hospitals</h3>
              <div className="space-y-3">
                {NEARBY_HOSPITALS.map((hospital, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-white">{hospital.name}</p>
                      <p className="text-xs text-white/60">{hospital.distance} away • ETA: {hospital.eta}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-8 w-8" onClick={() => window.open("tel:911")}>
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(231,76,60,0.3)] hover:shadow-[0_0_30px_rgba(231,76,60,0.5)] transition-all"
                onClick={() => window.open("tel:911")}
              >
                <Phone className="w-5 h-5 mr-2" /> Call Emergency Contact
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg font-medium border-white/20 hover:bg-white/10 text-white/80"
                onClick={() => setActivated(false)}
              >
                I'm safe now (Cancel)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatusRow = ({ done, label, detail }: { done: boolean; label: string; detail: string }) => (
  <div className="flex items-center gap-3 text-sm animate-fade-in-up">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-[#2ecc71]" : "bg-muted"}`}>
      {done ? <Check className="w-3 h-3 text-background" /> : <X className="w-3 h-3 text-muted-foreground" />}
    </div>
    <div className="flex-1">
      <p className="font-bold text-white/90">{label}</p>
      <p className="text-[10px] text-white/50 uppercase tracking-wider">{detail}</p>
    </div>
  </div>
);
