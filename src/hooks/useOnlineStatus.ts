import { useEffect, useState } from "react";
import { actionQueue } from "@/lib/offline-store";
import { toast } from "sonner";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const queued = actionQueue.list();
      if (queued.length > 0) {
        toast.success(`Back online — syncing ${queued.length} action(s)...`);
        // Simulate sync (in real app, replay each action against backend)
        setTimeout(() => {
          actionQueue.clear();
          toast.success("All offline actions synced ✓");
        }, 1200);
      } else {
        toast.success("Back online");
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline — actions will be queued");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
