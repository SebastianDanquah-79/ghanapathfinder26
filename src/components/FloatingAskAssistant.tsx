import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AskPanel from "@/components/AskPanel";

const FloatingAskAssistant = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const openChat = () => setOpen(true);

  return (
    <>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close Ask GhanaPathFinder chat"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[78] cursor-default bg-black/15 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-0"
          />
          <div className="fixed inset-x-3 bottom-20 z-[80] flex justify-end md:inset-auto md:bottom-24 md:right-6 md:w-[390px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ask GhanaPathFinder chat"
            className="max-h-[calc(100dvh-6rem)] w-full max-w-[390px] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
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
                <span className="mr-1 text-xs font-semibold">Close</span>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <AskPanel query="GhanaPathFinder general education, university, career and opportunity guidance" items={[]} />
          </div>
          </div>
        </>
      )}

      {!open && (
        <div className="fixed bottom-36 right-4 z-[79] md:bottom-24 md:right-6">
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
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingAskAssistant;
