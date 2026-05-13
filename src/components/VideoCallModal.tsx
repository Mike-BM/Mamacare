import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneOff, Maximize2, Minimize2, Video, VideoOff, Mic, Shield } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/useSound";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  patientName?: string;
}

const LocalCameraPreview = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user", 
            width: { ideal: 1920, min: 1280 }, 
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30 }
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Please allow camera access to start the consultation.");
        toast.error("Camera access is required for video calls.");
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/60 p-8 text-center">
        <VideoOff className="w-16 h-16 opacity-20" />
        <p className="font-bold">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="border-white/10">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover scale-x-[-1]" 
      />
      
      {/* Overlay UI for Demo */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 flex items-center gap-6">
          <Button variant="glass" size="icon" className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20"><Mic className="w-5 h-5 text-white" /></Button>
          <Button variant="glass" size="icon" className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20"><Video className="w-5 h-5 text-white" /></Button>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Status</span>
            <span className="text-xs font-bold text-green-400 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live & Secure
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-24 left-6 z-30 pointer-events-none">
        <div className="bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-primary/30 flex items-center gap-2">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export const VideoCallModal = ({ isOpen, onClose, roomUrl, patientName }: VideoCallModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { play, stop, SOUNDS } = useSound();
  const isDemo = roomUrl.includes("demo-room");

  useEffect(() => {
    if (isOpen) {
      play(SOUNDS.CALL_JOIN, { volume: 0.2 });
    }
  }, [isOpen]);

  const handleClose = () => {
    stop(); // Ensure all sounds (ringing, join, etc) are killed immediately
    play(SOUNDS.CALL_END, { volume: 0.15 });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={`glass-card border-white/10 p-0 overflow-hidden rounded-[32px] transition-all duration-500 max-w-none ${isFullScreen ? 'w-[98vw] h-[95vh]' : 'w-[90vw] max-w-5xl h-[75vh]'}`}>
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-40 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white font-bold text-sm">Consultation: {patientName || "Loading..."}</span>
            </div>
            
            <div className="flex gap-2 pointer-events-auto">
              <Button 
                variant="glass" 
                size="icon" 
                className="rounded-full w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full w-10 h-10 shadow-lg shadow-destructive/20"
                onClick={handleClose}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 relative">
            {isDemo ? (
              <LocalCameraPreview />
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/60">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-white/60 font-bold animate-pulse">Establishing Secure Video Link...</p>
                  </div>
                )}
                <iframe
                  src={roomUrl}
                  allow="camera; microphone; display-capture; autoplay; encrypted-media; fullscreen"
                  className="w-full h-full border-0"
                  onLoad={() => {
                    setIsLoading(false);
                    play(SOUNDS.SUCCESS, { volume: 0.2 });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
