import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const OfflineBadge = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 text-destructive-foreground backdrop-blur-md shadow-[var(--shadow-elegant)] animate-fade-in">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Offline Mode — actions queued</span>
    </div>
  );
};
