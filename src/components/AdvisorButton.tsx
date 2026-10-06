import { MessageCircle } from "@/lib/icons";

export const OPEN_ADVISOR_EVENT = "gpf:open-advisor";

export interface AdvisorOpenDetail {
  /** Short description of what the student is looking at, used to ground answers. */
  topic?: string;
}

export const openAdvisor = (detail: AdvisorOpenDetail = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AdvisorOpenDetail>(OPEN_ADVISOR_EVENT, { detail }));
};

const AdvisorButton = ({ topic, label = "Ask an advisor", className }: { topic?: string; label?: string; className?: string }) => (
  <button
    type="button"
    onClick={() => openAdvisor(topic ? { topic } : {})}
    className={
      className ??
      "inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
    }
  >
    <MessageCircle className="h-4 w-4 text-primary" /> {label}
  </button>
);

export default AdvisorButton;
