import type { PublicOpportunity } from "@/lib/opportunities.functions";

export const daysLeft = (date: string | null) => {
  if (!date) return null;
  const ms = new Date(`${date}T23:59:59`).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
};

export const deadlineText = (
  o: Pick<PublicOpportunity, "deadline_date" | "deadline">,
) => {
  const d = daysLeft(o.deadline_date);
  if (d === null)
    return o.deadline
      ? `Deadline: ${o.deadline}`
      : "Rolling / no fixed deadline";
  if (d < 0) return "Closed";
  if (d === 0) return "Closes today";
  return `${d} day${d === 1 ? "" : "s"} left`;
};

export const statusLabel: Record<string, string> = {
  verified: "Verified",
  unverified: "Not yet verified",
  expired: "Expired",
  needs_review: "Under review",
};

export const orgName = (
  o: Pick<PublicOpportunity, "organisation" | "company_name">,
) => o.organisation ?? o.company_name ?? "";
