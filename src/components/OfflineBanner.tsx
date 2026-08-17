import { useEffect, useState } from "react";
import { WifiOff } from "@/lib/icons";

/** Slim, non-blocking banner shown when the student loses network. */
const OfflineBanner = () => {
  // Start as "online" on both server and client so SSR HTML matches the first
  // client render; the real status is read after hydration in the effect.
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[60] bg-destructive text-destructive-foreground text-xs font-medium py-2 px-4 flex items-center justify-center gap-2"
    >
      <WifiOff className="h-3.5 w-3.5" />
      You're offline , showing your last saved data.
    </div>
  );
};

export default OfflineBanner;
