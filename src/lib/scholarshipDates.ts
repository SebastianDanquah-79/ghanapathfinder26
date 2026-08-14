const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Turns free-text scholarship deadlines ("Usually announced August – October each year")
 * into a concrete estimated date for reminders. Uses the LAST month mentioned
 * (the closing month) and the next occurrence of it.
 */
export const estimateDeadlineDate = (text: string): Date | null => {
  const lower = text.toLowerCase();
  const found: number[] = [];
  MONTHS.forEach((m, i) => {
    if (lower.includes(m)) found.push(i);
  });
  if (!found.length) return null;

  const month = found[found.length - 1];
  if (month === undefined) return null;
  const now = new Date();
  const year = month < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
  // Assume end of the closing month
  return new Date(year, month + 1, 0);
};

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

export const urgencyLabel = (days: number) => {
  if (days < 0) return { text: "Closed / reopens soon", tone: "text-muted-foreground" };
  if (days <= 14) return { text: `${days} days left`, tone: "text-destructive" };
  if (days <= 45) return { text: `${days} days left`, tone: "text-ghana-gold" };
  return { text: `${days} days left`, tone: "text-muted-foreground" };
};
