import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AskPanel from "@/components/AskPanel";

const FloatingAskAssistant = () => {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    if (open) return;

    const interval = window.setInterval(() => {
      setShowPrompt(true);
      window.setTimeout(() => setShowPrompt(false), 4200);
    }, 7600);

    const firstHide = window.setTimeout(() => setShowPrompt(false), 4200);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(firstHide);
    };
  }, [open]);

  const openChat = () => {
    setShowPrompt(false);
    setOpen(true);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-[80] md:inset-auto md:bottom-24 md:right-6 md:w-[390px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-[#F4C430] px-4 py-3 text-black">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/10 p-1">
                  <img
                    src="/app-icon-512.png"
                    alt=""
                    className="h-full w-full object-contain"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">Ask GhanaPathFinder</p>
                  <p className="text-[11px] leading-tight text-black/70">Your guide to universities, careers and opportunities</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-2 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/30"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <AskPanel query="GhanaPathFinder general education, university, career and opportunity guidance" items={[]} />
          </div>
        </div>
      )}

      {!open && (
        <div className="fixed bottom-20 right-4 z-[79] md:bottom-6 md:right-6">
          <button
            type="button"
            onClick={openChat}
            aria-label="Open Ask GhanaPathFinder chat"
            title="Speak to GhanaPathFinder"
            className="group relative flex h-14 w-14 items-center justify-center overflow-visible rounded-full bg-[#F4C430] text-black shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#F4C430]/30"
          >
            <img
              src="/app-icon-512.png"
              alt=""
              className="h-9 w-9 object-contain"
              aria-hidden="true"
            />

            {showPrompt && (
              <span className="pointer-events-none absolute bottom-1/2 right-[calc(100%+12px)] w-max max-w-[230px] translate-y-1/2 animate-in fade-in slide-in-from-right-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-xs font-medium leading-5 text-foreground shadow-lg duration-300">
                <span className="block">I&apos;m an AI agent.</span>
                <span className="block font-semibold">Speak to GhanaPathFinder.</span>
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingAskAssistant;
