import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PhoneOff, Maximize2, Minimize2 } from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  patientName?: string;
}

export const VideoCallModal = ({ isOpen, onClose, roomUrl, patientName }: VideoCallModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`glass-card border-white/10 p-0 overflow-hidden rounded-[32px] transition-all duration-500 ${isFullScreen ? 'max-w-[95vw] h-[90vh]' : 'max-w-4xl h-[70vh]'}`}>
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white font-bold text-sm">Live Call: {patientName || "Consultation"}</span>
            </div>
            
            <div className="flex gap-2 pointer-events-auto">
              <Button 
                variant="glass" 
                size="icon" 
                className="rounded-full w-10 h-10 border-white/10"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full w-10 h-10 shadow-lg shadow-destructive/20"
                onClick={onClose}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Iframe for Daily.co Prebuilt UI */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/60">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-white/60 font-bold animate-pulse">Initializing Secure Connection...</p>
              </div>
            )}
            <iframe
              src={roomUrl}
              allow="camera; microphone; display-capture; autoplay; encrypted-media; fullscreen"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Controls Footer Overlay (Optional if using Daily Prebuilt) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
             <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-3xl border border-white/10 flex items-center gap-6 pointer-events-auto">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Secure MamaCare Link</p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
