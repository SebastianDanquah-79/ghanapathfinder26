import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { createElement } from "react";

/** Subtle, grown-up celebration for meaningful actions. */
export const celebrate = (title: string, description?: string) => {
  toast.success(title, {
    description,
    icon: createElement(Sparkles, { className: "h-4 w-4 text-primary" }),
    duration: 3500,
  });
};
