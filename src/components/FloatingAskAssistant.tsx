import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import AskPanel from "@/components/AskPanel";

const FloatingAskAssistant = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-[80] md:inset-auto md:bottom-24 md:right-6 md:w-[390px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-[#F4C430] px-4 py-3 text-black">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
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
            onClick={() => setOpen(true)}
            aria-label="Open Ask GhanaPathFinder chat"
            title="Ask GhanaPathFinder"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#F4C430] text-black shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#F4C430]/30"
          >
            <MessageCircle className="h-6 w-6" strokeWidth={2.2} aria-hidden="true" />
            <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Ask GhanaPathFinder
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingAskAssistant;
